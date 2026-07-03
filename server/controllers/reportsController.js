// certifast/controllers/reportsController.js
const pool = require("../db/pool");
const { createAuditLog } = require("../utils/logger");

const CERT_COLORS = {
    "Barangay Clearance": "#0e2554",
    "Certificate of Residency": "#1a7a4a",
    "Certificate of Indigency": "#b86800",
    "Business Permit": "#1a4a8a",
    "Good Moral Certificate": "#6a3db8",
    "Certificate of Live Birth (Endorsement)": "#b02020",
    "Certificate of Cohabitation": "#2a7a8a",
    "Certificate of No Business": "#7a4a2a",
    "Certificate of Guardianship": "#4a2a7a",
    "Barangay Business Clearance (Renewal)": "#2a4a7a",
};

const REPORT_LABELS = {
    requests_summary: "Requests Summary",
    resident_records: "Resident Records",
    walkin_log: "Walk-in Issuance Log",
    cert_breakdown: "Certificate Breakdown",
    turnover_handover: "Turnover Handover",
};

const VALID_PERIODS = new Set(["week", "month", "year", "all"]);
const PERIOD_LABELS = {
    week: "This Week",
    month: "This Month",
    year: "This Year",
    all: "All Time",
};

function normalizePeriod(period) {
    const normalized = String(period || "month").trim().toLowerCase();
    return VALID_PERIODS.has(normalized) ? normalized : "month";
}

function getPeriodFilter(period, column = "requested_at") {
    switch (period) {
        case "week":
            return `AND ${column} >= NOW() - INTERVAL '7 days'`;
        case "month":
            return `AND DATE_TRUNC('month', ${column}) = DATE_TRUNC('month', NOW())`;
        case "year":
            return `AND DATE_TRUNC('year', ${column}) = DATE_TRUNC('year', NOW())`;
        case "all":
        default:
            return "";
    }
}

function makeReportPayload(type, period, columns, rows, extra = {}) {
    return {
        type,
        label: REPORT_LABELS[type] || type,
        period,
        periodLabel: PERIOD_LABELS[period] || period,
        generatedAt: new Date().toISOString(),
        columns,
        rows,
        ...extra,
    };
}

function isMissingPersonnelSchemaError(err) {
    return (
        err?.code === "42P01" ||
        err?.code === "42703" ||
        /barangay_terms|barangay_personnel|barangay_positions|barangay_personnel_assignments/i.test(
            err?.message || "",
        )
    );
}

exports.getOverview = async (req, res) => {
    try {
        const period = normalizePeriod(req.query.period);
        const periodFilter = getPeriodFilter(period);

        // 1. Stats
        const statsQuery = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'released' ${periodFilter}) AS "issuedThisPeriod",
                COUNT(*) FILTER (WHERE status = 'released') AS "totalAllTime",
                COUNT(*) FILTER (WHERE status IN ('pending', 'approved', 'ready', 'needs_correction')) AS pending,
                COUNT(*) FILTER (WHERE status = 'released' AND t.has_fee = true ${periodFilter}) AS "feesThisPeriod"
            FROM requests r
            LEFT JOIN certificate_templates t ON r.template_id = t.template_id
        `);

        // 2. By cert type (for selected period)
        const certTypeQuery = await pool.query(`
            SELECT
                cert_type AS label,
                COUNT(*) AS count
            FROM requests
            WHERE 1=1 ${periodFilter}
            GROUP BY cert_type
            ORDER BY count DESC
        `);

        const byCertType = certTypeQuery.rows.map((row) => ({
            label: row.label,
            count: Number(row.count),
            color: CERT_COLORS[row.label] || "#0e2554",
        }));

        // 3. Status breakdown (all time)
        const statusQuery = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'released') AS released,
                COUNT(*) FILTER (WHERE status IN ('pending', 'approved', 'ready', 'needs_correction')) AS pending,
                COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
            FROM requests
        `);

        // 4. Monthly trend (last 12 months)
        const monthlyQuery = await pool.query(`
            SELECT
                TO_CHAR(DATE_TRUNC('month', requested_at), 'Mon') AS month,
                DATE_TRUNC('month', requested_at) AS month_date,
                COUNT(*) AS requests,
                COUNT(*) FILTER (WHERE status = 'released') AS released
            FROM requests
            WHERE requested_at >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', requested_at)
            ORDER BY month_date ASC
        `);

        // 5. Daily — last 7 days
        const dailyQuery = await pool.query(`
            SELECT
                TO_CHAR(DATE_TRUNC('day', requested_at), 'Mon DD, YYYY') AS date,
                COUNT(*) AS count,
                CASE
                    WHEN COUNT(*) FILTER (WHERE status IN ('pending','approved','ready','needs_correction')) > 0
                    THEN 'pending'
                    ELSE 'released'
                END AS status
            FROM requests
            WHERE requested_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE_TRUNC('day', requested_at)
            ORDER BY DATE_TRUNC('day', requested_at) DESC
        `);

        const s = statsQuery.rows[0];
        const st = statusQuery.rows[0];

        return res.json({
            data: {
                stats: {
                    issuedThisPeriod: Number(s.issuedThisPeriod || 0),
                    totalAllTime: Number(s.totalAllTime || 0),
                    feesThisPeriod: Number(s.feesThisPeriod || 0),
                    pending: Number(s.pending || 0),
                },
                byCertType,
                statusBreakdown: {
                    released: Number(st.released || 0),
                    pending: Number(st.pending || 0),
                    rejected: Number(st.rejected || 0),
                },
                monthlyTrend: monthlyQuery.rows.map((r) => ({
                    month: r.month,
                    requests: Number(r.requests),
                    released: Number(r.released),
                })),
                daily: dailyQuery.rows.map((r) => ({
                    date: r.date,
                    count: Number(r.count),
                    status: r.status,
                })),
            },
        });
    } catch (err) {
        console.error("Reports error:", err);
        return res.status(500).json({ message: "Failed to load reports." });
    }
};

async function buildRequestsSummaryReport(period) {
    const result = await pool.query(`
        SELECT
            r.request_id,
            COALESCE(res.full_name, 'Walk-in / unknown') AS resident_name,
            r.cert_type,
            COALESCE(r.purpose, '') AS purpose,
            COALESCE(r.source, 'online') AS source,
            COALESCE(r.status, '') AS status,
            TO_CHAR(r.requested_at, 'YYYY-MM-DD HH24:MI') AS requested_at,
            COALESCE(processed.full_name, processed.username, '') AS processed_by,
            COALESCE(TO_CHAR(r.processed_at, 'YYYY-MM-DD HH24:MI'), '') AS processed_at,
            COALESCE(released.full_name, released.username, '') AS released_by,
            COALESCE(TO_CHAR(r.released_at, 'YYYY-MM-DD HH24:MI'), '') AS released_at
        FROM requests r
        LEFT JOIN residents res
          ON res.resident_id = r.resident_id
        LEFT JOIN admin_accounts processed
          ON processed.admin_id = r.processed_by
        LEFT JOIN admin_accounts released
          ON released.admin_id = r.released_by
        WHERE 1=1 ${getPeriodFilter(period, "r.requested_at")}
        ORDER BY r.requested_at DESC NULLS LAST, r.request_id DESC
        LIMIT 5000
    `);

    return makeReportPayload(
        "requests_summary",
        period,
        [
            { key: "request_id", label: "Request ID" },
            { key: "resident_name", label: "Resident" },
            { key: "cert_type", label: "Certificate / Permit" },
            { key: "purpose", label: "Purpose" },
            { key: "source", label: "Source" },
            { key: "status", label: "Status" },
            { key: "requested_at", label: "Requested" },
            { key: "processed_by", label: "Processed By" },
            { key: "processed_at", label: "Processed At" },
            { key: "released_by", label: "Released By" },
            { key: "released_at", label: "Released At" },
        ],
        result.rows,
    );
}

async function buildResidentRecordsReport(period) {
    const result = await pool.query(`
        SELECT
            res.resident_id,
            res.full_name,
            res.email,
            COALESCE(res.contact_number, '') AS contact_number,
            NULLIF(
                CONCAT_WS(
                    ', ',
                    NULLIF(res.address_house, ''),
                    NULLIF(res.address_street, ''),
                    NULLIF(to_jsonb(res)->>'address_city', ''),
                    NULLIF(to_jsonb(res)->>'address_province', '')
                ),
                ''
            ) AS address,
            COALESCE(res.status, '') AS status,
            TO_CHAR(res.created_at, 'YYYY-MM-DD HH24:MI') AS registered_at,
            COALESCE(TO_CHAR(res.verified_at, 'YYYY-MM-DD HH24:MI'), '') AS verified_at,
            COALESCE(req.request_count, 0)::int AS request_count
        FROM residents res
        LEFT JOIN LATERAL (
            SELECT COUNT(*)::int AS request_count
            FROM requests req
            WHERE req.resident_id = res.resident_id
        ) req ON TRUE
        WHERE 1=1 ${getPeriodFilter(period, "res.created_at")}
        ORDER BY res.created_at DESC NULLS LAST, res.resident_id DESC
        LIMIT 5000
    `);

    return makeReportPayload(
        "resident_records",
        period,
        [
            { key: "resident_id", label: "Resident ID" },
            { key: "full_name", label: "Resident" },
            { key: "email", label: "Email" },
            { key: "contact_number", label: "Contact" },
            { key: "address", label: "Address" },
            { key: "status", label: "Status" },
            { key: "registered_at", label: "Registered" },
            { key: "verified_at", label: "Verified" },
            { key: "request_count", label: "Requests" },
        ],
        result.rows,
    );
}

async function buildWalkInLogReport(period) {
    const result = await pool.query(`
        SELECT
            ic.certificate_id,
            ic.doc_id,
            ic.resident_name,
            ic.cert_type,
            COALESCE(ic.purpose, '') AS purpose,
            COALESCE(ic.address, '') AS address,
            COALESCE(a.full_name, a.username, 'Staff') AS issued_by,
            TO_CHAR(ic.issued_at, 'YYYY-MM-DD HH24:MI') AS issued_at
        FROM issued_certificates ic
        LEFT JOIN admin_accounts a
          ON a.admin_id = ic.issued_by
        WHERE (ic.source = 'walkin' OR ic.request_id IS NULL)
          ${getPeriodFilter(period, "ic.issued_at")}
        ORDER BY ic.issued_at DESC NULLS LAST, ic.certificate_id DESC
        LIMIT 5000
    `);

    return makeReportPayload(
        "walkin_log",
        period,
        [
            { key: "certificate_id", label: "Certificate ID" },
            { key: "doc_id", label: "Document ID" },
            { key: "resident_name", label: "Resident" },
            { key: "cert_type", label: "Certificate / Permit" },
            { key: "purpose", label: "Purpose" },
            { key: "address", label: "Address" },
            { key: "issued_by", label: "Issued By" },
            { key: "issued_at", label: "Issued At" },
        ],
        result.rows,
    );
}

async function buildCertificateBreakdownReport(period) {
    const result = await pool.query(`
        SELECT
            r.cert_type,
            COUNT(*)::int AS request_count,
            COUNT(*) FILTER (WHERE r.status = 'released')::int AS released_count,
            COUNT(*) FILTER (
                WHERE r.status IN ('pending', 'approved', 'ready', 'needs_correction')
            )::int AS pending_count,
            COUNT(*) FILTER (WHERE r.status = 'rejected')::int AS rejected_count
        FROM requests r
        WHERE 1=1 ${getPeriodFilter(period, "r.requested_at")}
        GROUP BY r.cert_type
        ORDER BY request_count DESC, r.cert_type
    `);

    return makeReportPayload(
        "cert_breakdown",
        period,
        [
            { key: "cert_type", label: "Certificate / Permit" },
            { key: "request_count", label: "Requests" },
            { key: "released_count", label: "Released" },
            { key: "pending_count", label: "Pending" },
            { key: "rejected_count", label: "Rejected" },
        ],
        result.rows,
    );
}

async function safePersonnelSections() {
    try {
        const [termResult, rosterResult, groupResult] = await Promise.all([
            pool.query(`
                SELECT term_name, starts_on, ends_on, notes
                FROM barangay_terms
                WHERE is_active = true
                LIMIT 1
            `),
            pool.query(`
                SELECT
                    COUNT(*)::int AS active_personnel,
                    COUNT(*) FILTER (WHERE position.position_code = 'punong_barangay')::int AS punong_barangay,
                    COUNT(*) FILTER (WHERE position.position_code = 'barangay_kagawad')::int AS kagawads,
                    COUNT(*) FILTER (WHERE position.is_signatory_eligible = true)::int AS signatory_eligible
                FROM barangay_personnel_assignments assignment
                JOIN barangay_positions position
                  ON position.position_id = assignment.position_id
                JOIN barangay_terms term
                  ON term.term_id = assignment.term_id
                WHERE term.is_active = true
                  AND assignment.is_active = true
                  AND (assignment.starts_on IS NULL OR assignment.starts_on <= CURRENT_DATE)
                  AND (assignment.ends_on IS NULL OR assignment.ends_on >= CURRENT_DATE)
            `),
            pool.query(`
                SELECT
                    position.position_group,
                    COUNT(*)::int AS active_count
                FROM barangay_personnel_assignments assignment
                JOIN barangay_positions position
                  ON position.position_id = assignment.position_id
                JOIN barangay_terms term
                  ON term.term_id = assignment.term_id
                WHERE term.is_active = true
                  AND assignment.is_active = true
                  AND (assignment.starts_on IS NULL OR assignment.starts_on <= CURRENT_DATE)
                  AND (assignment.ends_on IS NULL OR assignment.ends_on >= CURRENT_DATE)
                GROUP BY position.position_group
                ORDER BY position.position_group
            `),
        ]);

        const activeTerm = termResult.rows[0] || {};
        const roster = rosterResult.rows[0] || {};
        return [
            {
                title: "Active Administration Term",
                columns: [
                    { key: "field", label: "Field" },
                    { key: "value", label: "Value" },
                ],
                rows: [
                    {
                        field: "Term",
                        value: activeTerm.term_name || "No active term",
                    },
                    {
                        field: "Starts On",
                        value: activeTerm.starts_on || "",
                    },
                    {
                        field: "Ends On",
                        value: activeTerm.ends_on || "",
                    },
                    {
                        field: "Notes",
                        value: activeTerm.notes || "",
                    },
                ],
            },
            {
                title: "Roster Readiness",
                columns: [
                    { key: "field", label: "Field" },
                    { key: "value", label: "Value" },
                ],
                rows: [
                    {
                        field: "Active personnel",
                        value: Number(roster.active_personnel || 0),
                    },
                    {
                        field: "Active Punong Barangay",
                        value: Number(roster.punong_barangay || 0),
                    },
                    {
                        field: "Active Kagawads",
                        value: Number(roster.kagawads || 0),
                    },
                    {
                        field: "Signatory-eligible officials",
                        value: Number(roster.signatory_eligible || 0),
                    },
                ],
            },
            {
                title: "Roster by Group",
                columns: [
                    { key: "position_group", label: "Group" },
                    { key: "active_count", label: "Active Count" },
                ],
                rows: groupResult.rows,
            },
        ];
    } catch (err) {
        if (!isMissingPersonnelSchemaError(err)) throw err;
        return [
            {
                title: "Personnel Readiness",
                columns: [
                    { key: "field", label: "Field" },
                    { key: "value", label: "Value" },
                ],
                rows: [
                    {
                        field: "Personnel setup",
                        value: "Run database/barangay_personnel_management.sql in Supabase first.",
                    },
                ],
            },
        ];
    }
}

async function buildTurnoverHandoverReport(period) {
    const [
        personnelSections,
        accountsResult,
        requestInventoryResult,
        totalsResult,
        auditResult,
    ] = await Promise.all([
        safePersonnelSections(),
        pool.query(`
            SELECT
                role,
                status,
                COUNT(*)::int AS account_count,
                COUNT(*) FILTER (
                    WHERE to_jsonb(admin_accounts)->>'supabase_auth_id' IS NULL
                )::int AS legacy_count,
                COUNT(*) FILTER (
                    WHERE to_jsonb(admin_accounts)->>'supabase_auth_id' IS NOT NULL
                )::int AS auth_linked_count
            FROM admin_accounts
            GROUP BY role, status
            ORDER BY role, status
        `),
        pool.query(`
            SELECT
                status,
                COUNT(*)::int AS request_count
            FROM requests
            WHERE status IN ('pending', 'approved', 'ready', 'needs_correction')
            GROUP BY status
            ORDER BY status
        `),
        pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE r.status = 'released')::int AS released_online_requests,
                COUNT(*) FILTER (
                    WHERE r.status IN ('pending', 'approved', 'ready', 'needs_correction')
                )::int AS pending_online_requests,
                (
                    SELECT COUNT(*)::int
                    FROM issued_certificates ic
                    WHERE ic.source = 'walkin' OR ic.request_id IS NULL
                ) AS walkin_certificates
            FROM requests r
        `),
        pool.query(`
            SELECT
                TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
                COALESCE(actor_name, 'System') AS actor_name,
                action_type,
                COALESCE(target_table, '') AS target_table,
                COALESCE(description, '') AS description
            FROM audit_logs
            WHERE 1=1 ${getPeriodFilter(period, "created_at")}
            ORDER BY created_at DESC, log_id DESC
            LIMIT 30
        `),
    ]);

    const totals = totalsResult.rows[0] || {};
    return makeReportPayload("turnover_handover", period, [], [], {
        sections: [
            ...personnelSections,
            {
                title: "Admin Access Summary",
                columns: [
                    { key: "role", label: "Role" },
                    { key: "status", label: "Status" },
                    { key: "account_count", label: "Accounts" },
                    { key: "legacy_count", label: "Legacy" },
                    { key: "auth_linked_count", label: "Auth Linked" },
                ],
                rows: accountsResult.rows,
            },
            {
                title: "Pending Request Inventory",
                columns: [
                    { key: "status", label: "Status" },
                    { key: "request_count", label: "Requests" },
                ],
                rows: requestInventoryResult.rows,
            },
            {
                title: "Released and Issued Totals",
                columns: [
                    { key: "field", label: "Field" },
                    { key: "value", label: "Value" },
                ],
                rows: [
                    {
                        field: "Released online requests",
                        value: Number(totals.released_online_requests || 0),
                    },
                    {
                        field: "Pending online requests",
                        value: Number(totals.pending_online_requests || 0),
                    },
                    {
                        field: "Walk-in certificates",
                        value: Number(totals.walkin_certificates || 0),
                    },
                ],
            },
            {
                title: "Recent Audit Activity",
                columns: [
                    { key: "created_at", label: "Date" },
                    { key: "actor_name", label: "Actor" },
                    { key: "action_type", label: "Action" },
                    { key: "target_table", label: "Target" },
                    { key: "description", label: "Description" },
                ],
                rows: auditResult.rows,
            },
        ],
    });
}

async function buildReport(type, period) {
    switch (type) {
        case "requests_summary":
            return buildRequestsSummaryReport(period);
        case "resident_records":
            return buildResidentRecordsReport(period);
        case "walkin_log":
            return buildWalkInLogReport(period);
        case "cert_breakdown":
            return buildCertificateBreakdownReport(period);
        case "turnover_handover":
            return buildTurnoverHandoverReport(period);
        default:
            return null;
    }
}

exports.generateReport = async (req, res) => {
    const type = String(req.body?.type || "").trim().toLowerCase();
    const period = normalizePeriod(req.body?.period);
    const format = String(req.body?.format || "Data").trim() || "Data";

    if (!REPORT_LABELS[type]) {
        return res.status(400).json({ message: "Invalid report type" });
    }

    try {
        const data = await buildReport(type, period);
        if (!data) {
            return res.status(400).json({ message: "Invalid report type" });
        }

        const logged = await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "report_export",
            targetTable: "reports",
            targetId: null,
            description: JSON.stringify({
                type: data.label,
                format,
                period: PERIOD_LABELS[period] || period,
            }),
            ipAddress: req.ip,
        });

        return res.json({ data, logged });
    } catch (err) {
        console.error("generateReport error:", err);
        return res.status(500).json({ message: "Failed to generate report." });
    }
};

exports.getRecentExports = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                log_id,
                actor_name,
                description,
                created_at
             FROM audit_logs
             WHERE action_type = 'report_export'
               AND target_table = 'reports'
             ORDER BY created_at DESC, log_id DESC
             LIMIT 20`,
        );

        const data = result.rows.map((row) => {
            let payload = {};
            try {
                payload = JSON.parse(row.description || "{}");
            } catch {
                payload = {};
            }

            return {
                id: `EXP-${String(row.log_id).padStart(3, "0")}`,
                type: payload.type || "Report Export",
                period: payload.period || "—",
                format: payload.format || "CSV",
                by: row.actor_name || "Admin",
                generatedAt: new Date(row.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
        });

        return res.json({ data });
    } catch (err) {
        console.error("getRecentExports error:", err);
        return res.status(500).json({ message: "Failed to load recent exports." });
    }
};

exports.logExport = async (req, res) => {
    const type = String(req.body?.type || "").trim();
    const format = String(req.body?.format || "").trim().toUpperCase();
    const period = String(req.body?.period || "").trim();

    if (!type || !format || !period) {
        return res.status(400).json({
            message: "type, format, and period are required",
        });
    }

    try {
        const description = JSON.stringify({ type, format, period });

        const logged = await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "report_export",
            targetTable: "reports",
            targetId: null,
            description,
            ipAddress: req.ip,
        });

        if (!logged) {
            return res.status(500).json({ message: "Failed to log export." });
        }

        return res.json({ message: "Export logged successfully" });
    } catch (err) {
        console.error("logExport error:", err);
        return res.status(500).json({ message: "Failed to log export." });
    }
};
