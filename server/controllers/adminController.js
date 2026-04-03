// certifast/controllers/adminController.js
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

function makeWalkInDocId(certificateId) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `WI-${y}${m}${d}-${String(certificateId).padStart(6, "0")}`;
}

function getPeriodStart(periodRaw) {
    const period = String(periodRaw || "month").toLowerCase();
    const now = new Date();

    if (period === "all") return null;

    if (period === "week") {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    if (period === "year") {
        const d = new Date(now.getFullYear(), 0, 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function mapAuditType(actionType, targetTable) {
    const act = String(actionType || "").toLowerCase();
    const table = String(targetTable || "").toLowerCase();

    if (act.includes("login")) return "login";
    if (act.includes("logout")) return "logout";
    if (act.includes("walk")) return "walkin";
    if (act.includes("qr")) return "qrscan";
    if (act.includes("setting") || table === "system_settings")
        return "settings";
    if (act.includes("request") || table === "requests") return "request";
    return "request";
}

function ensureSuperadmin(req, res) {
    if (req.admin?.role !== "superadmin") {
        res.status(403).json({ message: "Superadmin access only" });
        return false;
    }
    return true;
}

function ensureAdminOrSuperadmin(req, res) {
    if (req.admin?.role !== "admin" && req.admin?.role !== "superadmin") {
        res.status(403).json({ message: "Admin access only" });
        return false;
    }
    return true;
}

async function createAuditLog({
    actorId,
    actorName,
    actorRole,
    actionType,
    targetTable,
    targetId,
    description,
    ipAddress,
}) {
    try {
        await pool.query(
            `INSERT INTO audit_logs (
                actor_id,
                actor_name,
                actor_role,
                action_type,
                target_table,
                target_id,
                description,
                ip_address,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
                actorId || null,
                actorName || null,
                actorRole || null,
                actionType,
                targetTable || null,
                targetId || null,
                description || null,
                ipAddress || null,
            ],
        );
    } catch (err) {
        console.error("createAuditLog error:", err);
    }
}

// Helper to create notifications for residents
async function createNotification({
    residentId,
    type,
    title,
    message,
    requestId = null,
}) {
    try {
        await pool.query(
            `INSERT INTO notifications (resident_id, type, title, message, request_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [residentId, type, title, message, requestId],
        );
    } catch (err) {
        console.error("createNotification error:", err);
        // Don't fail the main operation if notification creation fails
    }
}

async function getDashboardStats(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*)::int FROM requests) AS total_requests,
                (SELECT COUNT(*)::int FROM requests WHERE status = 'pending') AS pending,
                (SELECT COUNT(*)::int FROM requests WHERE status = 'released') AS released,
                (SELECT COUNT(*)::int FROM requests WHERE status = 'ready') AS ready,
                (SELECT COUNT(*)::int FROM residents WHERE status = 'active') AS residents,
                (
                    SELECT COUNT(*)::int
                    FROM issued_certificates
                    WHERE request_id IS NULL
                       OR COALESCE(source, '') ILIKE 'walk%'
                ) AS walk_in_issued`,
        );

        const row = result.rows[0] || {};
        return res.json({
            stats: {
                totalRequests: row.total_requests || 0,
                pending: row.pending || 0,
                released: row.released || 0,
                ready: row.ready || 0,
                residents: row.residents || 0,
                walkIn: row.walk_in_issued || 0,
            },
        });
    } catch (err) {
        console.error("getDashboardStats error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getRecentRequests(req, res) {
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const limit =
        Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 25) : 5;

    try {
        const result = await pool.query(
            `SELECT
                r.request_id,
                r.cert_type,
                r.purpose,
                r.rejection_reason,
                r.requested_at,
                r.status,
                COALESCE(res.full_name, 'Unknown Resident') AS resident_name,
                res.email AS resident_email,
                res.contact_number AS resident_contact,
                res.address_house AS resident_address_house,
                res.address_street AS resident_address_street,
                res.civil_status AS resident_civil,
                res.nationality AS resident_nationality,
                COALESCE(ct.has_fee, false) AS has_fee
             FROM requests r
             LEFT JOIN residents res
               ON res.resident_id = r.resident_id
             LEFT JOIN certificate_templates ct
               ON ct.name = r.cert_type
             ORDER BY r.requested_at DESC NULLS LAST, r.request_id DESC
             LIMIT $1`,
            [limit],
        );

        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getRecentRequests error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function approveRequest(req, res) {
    const requestId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(requestId) || requestId <= 0) {
        return res.status(400).json({ message: "Invalid request ID" });
    }

    try {
        const result = await pool.query(
            `UPDATE requests
             SET status = 'approved',
                 processed_by = $2,
                 processed_at = NOW(),
                 rejection_reason = NULL
             WHERE request_id = $1
               AND status = 'pending'
             RETURNING request_id, resident_id, status, processed_at`,
            [requestId, req.admin.id],
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Request cannot be approved in its current status",
            });
        }

        // Create notification for resident
        const request = result.rows[0];
        await createNotification({
            residentId: request.resident_id,
            type: "request_update",
            title: "Request Approved",
            message:
                "Your certificate request has been approved and is now being processed.",
            requestId: request.request_id,
        });

        return res.json({
            message: "Request approved successfully",
            request: result.rows[0],
        });
    } catch (err) {
        console.error("approveRequest error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function rejectRequest(req, res) {
    const requestId = Number.parseInt(req.params.id, 10);
    const reason = req.body?.reason ? String(req.body.reason).trim() : "";

    if (!Number.isFinite(requestId) || requestId <= 0) {
        return res.status(400).json({ message: "Invalid request ID" });
    }

    if (!reason) {
        return res
            .status(400)
            .json({ message: "Rejection reason is required" });
    }

    try {
        const result = await pool.query(
            `UPDATE requests
             SET status = 'rejected',
                 rejection_reason = $3,
                 processed_by = $2,
                 processed_at = NOW()
             WHERE request_id = $1
               AND status IN ('pending', 'approved')
             RETURNING request_id, resident_id, status, rejection_reason, processed_at`,
            [requestId, req.admin.id, reason],
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Request cannot be rejected in its current status",
            });
        }

        // Create notification for resident
        const request = result.rows[0];
        await createNotification({
            residentId: request.resident_id,
            type: "request_update",
            title: "Request Denied",
            message: `Your certificate request has been denied. Reason: ${reason}`,
            requestId: request.request_id,
        });

        return res.json({
            message: "Request rejected successfully",
            request: result.rows[0],
        });
    } catch (err) {
        console.error("rejectRequest error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getCertificateTemplates(req, res) {
    try {
        const result = await pool.query(
            `SELECT name, has_fee, description
             FROM certificate_templates
             WHERE is_active = TRUE
             ORDER BY name ASC`,
        );

        return res.json({
            data: result.rows.map((row) => ({
                name: row.name,
                hasFee: Boolean(row.has_fee),
                desc: row.description || "",
            })),
        });
    } catch (err) {
        console.error("getCertificateTemplates error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function issueWalkIn(req, res) {
    const { certType, residentName, address, purpose } = req.body;

    if (!certType || !String(certType).trim()) {
        return res
            .status(400)
            .json({ message: "Certificate type is required" });
    }
    if (!residentName || !String(residentName).trim()) {
        return res.status(400).json({ message: "Resident name is required" });
    }
    if (!address || !String(address).trim()) {
        return res.status(400).json({ message: "Address is required" });
    }
    if (!purpose || !String(purpose).trim()) {
        return res.status(400).json({ message: "Purpose is required" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const insertResult = await client.query(
            `INSERT INTO issued_certificates (
                request_id,
                doc_id,
                cert_type,
                resident_name,
                address,
                purpose,
                issued_by,
                issued_at,
                source,
                qr_code_data
            )
            VALUES (
                NULL,
                'PENDING',
                $1,
                $2,
                $3,
                $4,
                $5,
                NOW(),
                'walkin',
                $6
            )
            RETURNING certificate_id, issued_at`,
            [
                String(certType).trim(),
                String(residentName).trim(),
                String(address).trim(),
                String(purpose).trim(),
                req.admin.id,
                `walkin:${String(certType).trim()}:${String(residentName).trim()}`,
            ],
        );

        const certificateId = insertResult.rows[0].certificate_id;
        const issuedAt = insertResult.rows[0].issued_at;
        const docId = makeWalkInDocId(certificateId);

        await client.query(
            `UPDATE issued_certificates
             SET doc_id = $2
             WHERE certificate_id = $1`,
            [certificateId, docId],
        );

        await client.query("COMMIT");

        return res.status(201).json({
            id: `#WI-${String(certificateId).padStart(3, "0")}`,
            docId,
            issuedAt,
            entry: {
                id: `#WI-${String(certificateId).padStart(3, "0")}`,
                name: String(residentName).trim(),
                type: String(certType).trim(),
                purpose: String(purpose).trim(),
                issuedBy: req.admin.username || "Staff",
                time: new Date(issuedAt).toLocaleTimeString("en-PH", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("issueWalkIn error:", err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
}

async function getTodayWalkIn(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                ic.certificate_id,
                ic.doc_id,
                ic.resident_name,
                ic.cert_type,
                ic.purpose,
                COALESCE(a.full_name, a.username, 'Staff') AS issued_by_name,
                ic.issued_at
             FROM issued_certificates ic
             LEFT JOIN admin_accounts a
               ON a.admin_id = ic.issued_by
             WHERE (ic.source = 'walkin' OR ic.request_id IS NULL)
               AND DATE(ic.issued_at) = CURRENT_DATE
             ORDER BY ic.issued_at DESC, ic.certificate_id DESC`,
        );

        return res.json({
            data: result.rows.map((row) => ({
                id: `#WI-${String(row.certificate_id).padStart(3, "0")}`,
                docId: row.doc_id,
                name: row.resident_name,
                type: row.cert_type,
                purpose: row.purpose,
                issuedBy: row.issued_by_name,
                time: new Date(row.issued_at).toLocaleTimeString("en-PH", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                issuedAt: row.issued_at,
            })),
        });
    } catch (err) {
        console.error("getTodayWalkIn error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getResidentStats(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*)::int FROM residents) AS total,
                (SELECT COUNT(*)::int FROM residents WHERE status = 'active') AS active,
                (
                    SELECT COUNT(*)::int
                    FROM residents
                    WHERE created_at >= date_trunc('month', CURRENT_DATE)
                ) AS new_this_month,
                (SELECT COUNT(*)::int FROM requests) AS total_requests`,
        );

        const row = result.rows[0] || {};
        return res.json({
            stats: {
                total: row.total || 0,
                active: row.active || 0,
                newThisMonth: row.new_this_month || 0,
                totalRequests: row.total_requests || 0,
            },
        });
    } catch (err) {
        console.error("getResidentStats error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getResidents(req, res) {
    const search = String(req.query.search || "").trim();
    const statusRaw = String(req.query.status || "")
        .trim()
        .toLowerCase();
    const sortRaw = String(req.query.sort || "name")
        .trim()
        .toLowerCase();
    const pageRaw = Number.parseInt(req.query.page, 10);
    const limitRaw = Number.parseInt(req.query.limit, 10);

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit =
        Number.isFinite(limitRaw) && limitRaw > 0
            ? Math.min(limitRaw, 100)
            : 10;
    const offset = (page - 1) * limit;

    const where = [];
    const args = [];

    if (search) {
        args.push(`%${search}%`);
        const idx = args.length;
        where.push(`(
            res.full_name ILIKE $${idx}
            OR COALESCE(res.address_house, '') ILIKE $${idx}
            OR COALESCE(res.address_street, '') ILIKE $${idx}
            OR ('#RES-' || LPAD(res.resident_id::text, 4, '0')) ILIKE $${idx}
        )`);
    }

    if (statusRaw === "active" || statusRaw === "inactive") {
        args.push(statusRaw);
        where.push(`LOWER(COALESCE(res.status, 'active')) = $${args.length}`);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const orderBy =
        sortRaw === "date"
            ? "res.created_at DESC, res.resident_id DESC"
            : sortRaw === "requests"
              ? "request_count DESC, res.full_name ASC"
              : "res.full_name ASC";

    try {
        const countResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM residents res
             ${whereSql}`,
            args,
        );

        const total = countResult.rows[0]?.total || 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const pageArgs = [...args, limit, offset];
        const result = await pool.query(
            `SELECT
                res.resident_id,
                res.full_name,
                res.email,
                res.contact_number,
                res.address_house,
                res.address_street,
                res.date_of_birth,
                res.civil_status,
                res.status,
                res.created_at,
                COALESCE(req.request_count, 0)::int AS request_count
             FROM residents res
             LEFT JOIN (
                SELECT resident_id, COUNT(*)::int AS request_count
                FROM requests
                GROUP BY resident_id
             ) req
               ON req.resident_id = res.resident_id
             ${whereSql}
             ORDER BY ${orderBy}
             LIMIT $${args.length + 1}
             OFFSET $${args.length + 2}`,
            pageArgs,
        );

        return res.json({
            data: result.rows,
            total,
            page,
            totalPages,
        });
    } catch (err) {
        console.error("getResidents error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getResidentById(req, res) {
    const residentId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(residentId) || residentId <= 0) {
        return res.status(400).json({ message: "Invalid resident ID" });
    }

    try {
        const result = await pool.query(
            `SELECT
                res.resident_id,
                res.full_name,
                res.email,
                res.contact_number,
                res.address_house,
                res.address_street,
                res.date_of_birth,
                res.civil_status,
                res.status,
                res.created_at,
                COALESCE(req.request_count, 0)::int AS request_count
             FROM residents res
             LEFT JOIN (
                SELECT resident_id, COUNT(*)::int AS request_count
                FROM requests
                GROUP BY resident_id
             ) req
               ON req.resident_id = res.resident_id
             WHERE res.resident_id = $1
             LIMIT 1`,
            [residentId],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Resident not found" });
        }

        return res.json({ data: result.rows[0] });
    } catch (err) {
        console.error("getResidentById error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getResidentRequests(req, res) {
    const residentId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(residentId) || residentId <= 0) {
        return res.status(400).json({ message: "Invalid resident ID" });
    }

    try {
        const result = await pool.query(
            `SELECT
                request_id,
                cert_type,
                status,
                requested_at,
                rejection_reason
             FROM requests
             WHERE resident_id = $1
             ORDER BY requested_at DESC NULLS LAST, request_id DESC`,
            [residentId],
        );

        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getResidentRequests error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getReportsOverview(req, res) {
    const periodRaw = String(req.query.period || "month").toLowerCase();
    const periodStart = getPeriodStart(periodRaw);

    try {
        const statsWhere = periodStart ? "AND released_at >= $1" : "";
        const statsArgs = periodStart ? [periodStart] : [];
        const statsResult = await pool.query(
            `SELECT
                (
                    SELECT COUNT(*)::int
                    FROM requests
                    WHERE status = 'released' ${statsWhere}
                ) AS issued_this_period,
                (
                    SELECT COUNT(*)::int
                    FROM requests
                    WHERE status = 'released'
                ) AS total_issued_all_time,
                (
                    SELECT COUNT(*)::int
                    FROM requests
                    WHERE status = 'pending'
                ) AS pending,
                (
                    SELECT COUNT(*)::int
                    FROM requests r
                    LEFT JOIN certificate_templates ct ON ct.name = r.cert_type
                    WHERE r.status = 'released'
                    ${periodStart ? "AND r.released_at >= $1" : ""}
                    AND COALESCE(ct.has_fee, false) = true
                ) AS fees_this_period`,
            statsArgs,
        );

        const certWhere = periodStart ? "WHERE r.requested_at >= $1" : "";
        const certArgs = periodStart ? [periodStart] : [];
        const certResult = await pool.query(
            `SELECT
                r.cert_type AS label,
                COUNT(*)::int AS count
             FROM requests r
             ${certWhere}
             GROUP BY r.cert_type
             ORDER BY count DESC, label ASC`,
            certArgs,
        );

        const statusWhere = periodStart ? "AND r.requested_at >= $1" : "";
        const statusArgs = periodStart ? [periodStart] : [];
        const statusResult = await pool.query(
            `SELECT
                COALESCE(SUM(CASE WHEN r.status = 'released' THEN 1 ELSE 0 END), 0)::int AS released,
                COALESCE(SUM(CASE WHEN r.status IN ('pending', 'approved', 'ready') THEN 1 ELSE 0 END), 0)::int AS pending,
                COALESCE(SUM(CASE WHEN r.status = 'rejected' THEN 1 ELSE 0 END), 0)::int AS rejected
             FROM requests r
             WHERE 1 = 1 ${statusWhere}`,
            statusArgs,
        );

        const trendResult = await pool.query(
            `WITH months AS (
                SELECT date_trunc('month', CURRENT_DATE) - (interval '1 month' * gs.i) AS month_start
                FROM generate_series(11, 0, -1) AS gs(i)
            )
            SELECT
                to_char(m.month_start, 'Mon') AS month,
                COALESCE(req.requests, 0)::int AS requests,
                COALESCE(rel.released, 0)::int AS released
            FROM months m
            LEFT JOIN (
                SELECT date_trunc('month', requested_at) AS mth, COUNT(*)::int AS requests
                FROM requests
                GROUP BY 1
            ) req
              ON req.mth = m.month_start
            LEFT JOIN (
                SELECT date_trunc('month', released_at) AS mth, COUNT(*)::int AS released
                FROM requests
                WHERE status = 'released' AND released_at IS NOT NULL
                GROUP BY 1
            ) rel
              ON rel.mth = m.month_start
            ORDER BY m.month_start ASC`,
        );

        const dailyResult = await pool.query(
            `WITH days AS (
                SELECT generate_series(
                    CURRENT_DATE - interval '6 day',
                    CURRENT_DATE,
                    interval '1 day'
                )::date AS day
            )
            SELECT
                d.day,
                COALESCE(COUNT(r.request_id), 0)::int AS count,
                COALESCE(SUM(CASE WHEN r.status IN ('pending', 'approved', 'ready') THEN 1 ELSE 0 END), 0)::int AS pending_count
            FROM days d
            LEFT JOIN requests r
              ON DATE(r.requested_at) = d.day
            GROUP BY d.day
            ORDER BY d.day DESC`,
        );

        const statusRow = statusResult.rows[0] || {};
        const statsRow = statsResult.rows[0] || {};

        const certPalette = [
            "#0e2554",
            "#1a7a4a",
            "#b86800",
            "#1a4a8a",
            "#6a3db8",
            "#b02020",
        ];

        return res.json({
            data: {
                period: periodRaw,
                stats: {
                    issuedThisPeriod: statsRow.issued_this_period || 0,
                    totalAllTime: statsRow.total_issued_all_time || 0,
                    feesThisPeriod: statsRow.fees_this_period || 0,
                    pending: statsRow.pending || 0,
                },
                byCertType: certResult.rows.map((row, index) => ({
                    label: row.label,
                    count: row.count,
                    color: certPalette[index % certPalette.length],
                })),
                statusBreakdown: {
                    released: statusRow.released || 0,
                    pending: statusRow.pending || 0,
                    rejected: statusRow.rejected || 0,
                },
                monthlyTrend: trendResult.rows,
                daily: dailyResult.rows.map((row) => ({
                    date: new Date(row.day).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }),
                    count: row.count,
                    status: row.pending_count > 0 ? "pending" : "released",
                })),
            },
        });
    } catch (err) {
        console.error("getReportsOverview error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getManageRequests(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                r.request_id,
                r.cert_type,
                r.purpose,
                r.status,
                r.rejection_reason,
                r.requested_at,
                r.processed_at,
                r.released_at,
                COALESCE(res.full_name, 'Unknown Resident') AS resident_name,
                res.email AS resident_email,
                res.contact_number AS resident_contact,
                res.civil_status AS resident_civil,
                res.address_house AS resident_address_house,
                res.address_street AS resident_address_street,
                COALESCE(ct.has_fee, false) AS has_fee
             FROM requests r
             LEFT JOIN residents res
               ON res.resident_id = r.resident_id
             LEFT JOIN certificate_templates ct
               ON ct.name = r.cert_type
             ORDER BY r.requested_at DESC NULLS LAST, r.request_id DESC`,
        );

        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getManageRequests error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function markRequestReady(req, res) {
    const requestId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(requestId) || requestId <= 0) {
        return res.status(400).json({ message: "Invalid request ID" });
    }

    try {
        const result = await pool.query(
            `UPDATE requests
             SET status = 'ready',
                 processed_by = $2,
                 processed_at = NOW()
             WHERE request_id = $1
               AND status = 'approved'
             RETURNING request_id, resident_id, status, processed_at`,
            [requestId, req.admin.id],
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Request cannot be marked ready in its current status",
            });
        }

        // Create notification for resident
        const request = result.rows[0];
        await createNotification({
            residentId: request.resident_id,
            type: "request_update",
            title: "Certificate Ready for Pickup",
            message:
                "Your certificate is ready for pickup at the barangay office.",
            requestId: request.request_id,
        });

        return res.json({
            message: "Request marked ready for pickup",
            request: result.rows[0],
        });
    } catch (err) {
        console.error("markRequestReady error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function releaseRequest(req, res) {
    const requestId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(requestId) || requestId <= 0) {
        return res.status(400).json({ message: "Invalid request ID" });
    }

    try {
        const result = await pool.query(
            `UPDATE requests
             SET status = 'released',
                 released_by = $2,
                 released_at = NOW()
             WHERE request_id = $1
               AND status = 'ready'
             RETURNING request_id, resident_id, status, released_at`,
            [requestId, req.admin.id],
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Request cannot be released in its current status",
            });
        }

        // Create notification for resident
        const request = result.rows[0];
        await createNotification({
            residentId: request.resident_id,
            type: "request_update",
            title: "Certificate Released",
            message:
                "Your certificate has been successfully released and is now available.",
            requestId: request.request_id,
        });

        return res.json({
            message: "Request released successfully",
            request: result.rows[0],
        });
    } catch (err) {
        console.error("releaseRequest error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getAuditStats(req, res) {
    if (!ensureSuperadmin(req, res)) return;

    try {
        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*)::int FROM audit_logs) AS total,
                (
                    SELECT COUNT(*)::int
                    FROM audit_logs
                    WHERE DATE(created_at) = CURRENT_DATE
                ) AS today,
                (
                    SELECT COUNT(*)::int
                    FROM admin_accounts
                    WHERE status = 'active'
                      AND last_login IS NOT NULL
                      AND last_login >= NOW() - interval '1 day'
                ) AS active_sessions,
                (
                    SELECT COUNT(*)::int
                    FROM audit_logs
                    WHERE action_type ILIKE '%setting%'
                      AND created_at >= date_trunc('month', CURRENT_DATE)
                ) AS settings_changes`,
        );

        const row = result.rows[0] || {};
        return res.json({
            stats: {
                total: row.total || 0,
                today: row.today || 0,
                activeSessions: row.active_sessions || 0,
                settingsChanges: row.settings_changes || 0,
            },
        });
    } catch (err) {
        console.error("getAuditStats error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getAuditLogs(req, res) {
    if (!ensureSuperadmin(req, res)) return;

    const search = String(req.query.search || "").trim();
    const type = String(req.query.type || "")
        .trim()
        .toLowerCase();
    const actor = String(req.query.actor || "").trim();
    const date = String(req.query.date || "")
        .trim()
        .toLowerCase();
    const pageRaw = Number.parseInt(req.query.page, 10);
    const limitRaw = Number.parseInt(req.query.limit, 10);

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit =
        Number.isFinite(limitRaw) && limitRaw > 0
            ? Math.min(limitRaw, 100)
            : 10;
    const offset = (page - 1) * limit;

    const where = [];
    const args = [];

    if (search) {
        args.push(`%${search}%`);
        const idx = args.length;
        where.push(`(
            COALESCE(al.actor_name, '') ILIKE $${idx}
            OR COALESCE(al.description, '') ILIKE $${idx}
            OR COALESCE(al.action_type, '') ILIKE $${idx}
            OR ('LOG-' || LPAD(al.log_id::text, 4, '0')) ILIKE $${idx}
        )`);
    }

    if (actor) {
        args.push(actor);
        where.push(`COALESCE(al.actor_name, '') = $${args.length}`);
    }

    if (date === "today") {
        where.push("DATE(al.created_at) = CURRENT_DATE");
    } else if (date === "week") {
        where.push("al.created_at >= NOW() - interval '7 day'");
    } else if (date === "month") {
        where.push("al.created_at >= date_trunc('month', CURRENT_DATE)");
    }

    if (type) {
        if (type === "login") {
            where.push("LOWER(COALESCE(al.action_type, '')) LIKE '%login%'");
        } else if (type === "logout") {
            where.push("LOWER(COALESCE(al.action_type, '')) LIKE '%logout%'");
        } else if (type === "walkin") {
            where.push("LOWER(COALESCE(al.action_type, '')) LIKE '%walk%'");
        } else if (type === "qrscan") {
            where.push("LOWER(COALESCE(al.action_type, '')) LIKE '%qr%'");
        } else if (type === "settings") {
            where.push("LOWER(COALESCE(al.action_type, '')) LIKE '%setting%'");
        } else if (type === "request") {
            where.push(
                "(LOWER(COALESCE(al.action_type, '')) LIKE '%request%' OR COALESCE(al.target_table, '') = 'requests')",
            );
        }
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    try {
        const countResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM audit_logs al
             ${whereSql}`,
            args,
        );

        const total = countResult.rows[0]?.total || 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const dataArgs = [...args, limit, offset];
        const result = await pool.query(
            `SELECT
                al.log_id,
                al.created_at,
                al.action_type,
                al.target_table,
                al.target_id,
                al.actor_name,
                al.actor_role,
                al.description,
                al.ip_address
             FROM audit_logs al
             ${whereSql}
             ORDER BY al.created_at DESC, al.log_id DESC
             LIMIT $${args.length + 1}
             OFFSET $${args.length + 2}`,
            dataArgs,
        );

        const actorsResult = await pool.query(
            `SELECT DISTINCT actor_name
             FROM audit_logs
             WHERE actor_name IS NOT NULL
               AND actor_name <> ''
             ORDER BY actor_name ASC`,
        );

        return res.json({
            data: result.rows.map((row) => ({
                ...row,
                type: mapAuditType(row.action_type, row.target_table),
            })),
            actors: actorsResult.rows.map((row) => row.actor_name),
            total,
            page,
            totalPages,
        });
    } catch (err) {
        console.error("getAuditLogs error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getAuditLogById(req, res) {
    if (!ensureSuperadmin(req, res)) return;

    const logId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(logId) || logId <= 0) {
        return res.status(400).json({ message: "Invalid log ID" });
    }

    try {
        const result = await pool.query(
            `SELECT
                al.log_id,
                al.created_at,
                al.action_type,
                al.target_table,
                al.target_id,
                al.actor_name,
                al.actor_role,
                al.description,
                al.ip_address
             FROM audit_logs al
             WHERE al.log_id = $1
             LIMIT 1`,
            [logId],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Log not found" });
        }

        const row = result.rows[0];
        return res.json({
            data: {
                ...row,
                type: mapAuditType(row.action_type, row.target_table),
            },
        });
    } catch (err) {
        console.error("getAuditLogById error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getAccounts(req, res) {
    if (!ensureAdminOrSuperadmin(req, res)) return;

    try {
        const result = await pool.query(
            `SELECT
                admin_id,
                full_name,
                username,
                role,
                status,
                created_at,
                last_login
             FROM admin_accounts
             ORDER BY created_at DESC, admin_id DESC`,
        );

        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getAccounts error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function createAccount(req, res) {
    if (!ensureAdminOrSuperadmin(req, res)) return;

    const fullName = String(req.body?.full_name || "").trim();
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");
    const roleRaw = String(req.body?.role || "staff")
        .trim()
        .toLowerCase();
    const role = roleRaw === "admin" ? "admin" : "staff";

    if (!fullName || !username || !password) {
        return res
            .status(400)
            .json({ message: "full_name, username and password are required" });
    }
    if (password.length < 8) {
        return res
            .status(400)
            .json({ message: "Password must be at least 8 characters" });
    }

    try {
        const existing = await pool.query(
            `SELECT admin_id FROM admin_accounts WHERE LOWER(username) = LOWER($1) LIMIT 1`,
            [username],
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Username already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO admin_accounts (
                full_name,
                username,
                password_hash,
                role,
                status,
                created_at
            ) VALUES ($1, $2, $3, $4, 'active', NOW())
            RETURNING admin_id, full_name, username, role, status, created_at, last_login`,
            [fullName, username, passwordHash, role],
        );

        const created = result.rows[0];
        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "account_create",
            targetTable: "admin_accounts",
            targetId: created.admin_id,
            description: `Created admin account ${created.username}`,
            ipAddress: req.ip,
        });

        return res.status(201).json({
            message: "Account created successfully",
            data: created,
        });
    } catch (err) {
        console.error("createAccount error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function updateAccount(req, res) {
    if (!ensureAdminOrSuperadmin(req, res)) return;

    const accountId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(accountId) || accountId <= 0) {
        return res.status(400).json({ message: "Invalid account ID" });
    }

    const fullName = String(req.body?.full_name || "").trim();
    const username = String(req.body?.username || "").trim();
    const roleRaw = String(req.body?.role || "staff")
        .trim()
        .toLowerCase();
    const statusRaw = String(req.body?.status || "active")
        .trim()
        .toLowerCase();

    if (!fullName || !username) {
        return res
            .status(400)
            .json({ message: "full_name and username are required" });
    }

    const role =
        roleRaw === "admin"
            ? "admin"
            : roleRaw === "superadmin"
              ? "superadmin"
              : "staff";
    const status = statusRaw === "inactive" ? "inactive" : "active";

    try {
        const existing = await pool.query(
            `SELECT admin_id FROM admin_accounts WHERE LOWER(username) = LOWER($1) AND admin_id <> $2 LIMIT 1`,
            [username, accountId],
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Username already exists" });
        }

        const result = await pool.query(
            `UPDATE admin_accounts
             SET full_name = $2,
                 username = $3,
                 role = $4,
                 status = $5
             WHERE admin_id = $1
             RETURNING admin_id, full_name, username, role, status, created_at, last_login`,
            [accountId, fullName, username, role, status],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        const updated = result.rows[0];
        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "account_update",
            targetTable: "admin_accounts",
            targetId: updated.admin_id,
            description: `Updated account ${updated.username} (${updated.status})`,
            ipAddress: req.ip,
        });

        return res.json({
            message: "Account updated successfully",
            data: updated,
        });
    } catch (err) {
        console.error("updateAccount error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function resetAccountPassword(req, res) {
    if (!ensureAdminOrSuperadmin(req, res)) return;

    const accountId = Number.parseInt(req.params.id, 10);
    const newPassword = String(req.body?.new_password || "");

    if (!Number.isFinite(accountId) || accountId <= 0) {
        return res.status(400).json({ message: "Invalid account ID" });
    }
    if (!newPassword || newPassword.length < 8) {
        return res
            .status(400)
            .json({ message: "New password must be at least 8 characters" });
    }

    try {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            `UPDATE admin_accounts
             SET password_hash = $2
             WHERE admin_id = $1
             RETURNING admin_id, username`,
            [accountId, passwordHash],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        const updated = result.rows[0];
        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "account_password_reset",
            targetTable: "admin_accounts",
            targetId: updated.admin_id,
            description: `Reset password for ${updated.username}`,
            ipAddress: req.ip,
        });

        return res.json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("resetAccountPassword error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function deactivateAccount(req, res) {
    if (!ensureAdminOrSuperadmin(req, res)) return;

    const accountId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(accountId) || accountId <= 0) {
        return res.status(400).json({ message: "Invalid account ID" });
    }

    if (accountId === req.admin.id) {
        return res
            .status(400)
            .json({ message: "You cannot deactivate your own account" });
    }

    try {
        const result = await pool.query(
            `UPDATE admin_accounts
             SET status = 'inactive'
             WHERE admin_id = $1
             RETURNING admin_id, username`,
            [accountId],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Account not found" });
        }

        const updated = result.rows[0];
        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "account_deactivate",
            targetTable: "admin_accounts",
            targetId: updated.admin_id,
            description: `Deactivated account ${updated.username}`,
            ipAddress: req.ip,
        });

        return res.json({ message: "Account deactivated successfully" });
    } catch (err) {
        console.error("deactivateAccount error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getDashboardStats,
    getRecentRequests,
    approveRequest,
    rejectRequest,
    getCertificateTemplates,
    issueWalkIn,
    getTodayWalkIn,
    getResidentStats,
    getResidents,
    getResidentById,
    getResidentRequests,
    getReportsOverview,
    getAuditStats,
    getAuditLogs,
    getAuditLogById,
    getAccounts,
    createAccount,
    updateAccount,
    resetAccountPassword,
    deactivateAccount,
    getManageRequests,
    markRequestReady,
    releaseRequest,
};
