// certifast/controllers/residentController.js
const pool = require("../db/pool");
const { createAuditLog } = require("../utils/logger");

function cleanText(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text || null;
}

function cleanInteger(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function cleanObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function cleanStringList(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => cleanText(item))
        .filter(Boolean);
}

function cleanBusinessProof(value) {
    const proof = cleanObject(value);
    const normalized = {
        fileName: cleanText(proof.fileName),
        filePath: cleanText(proof.filePath),
        fileUrl: cleanText(proof.fileUrl),
        mimeType: cleanText(proof.mimeType),
        fileSize: cleanInteger(proof.fileSize) || 0,
        uploadedAt: cleanText(proof.uploadedAt),
    };

    if (!normalized.fileName && !normalized.filePath && !normalized.fileUrl) {
        return null;
    }

    return normalized;
}

function cleanProfileDetails(value) {
    const details = cleanObject(value);
    const businessProof = cleanBusinessProof(details.businessProof);

    const normalized = {
        fatherName: cleanText(details.fatherName),
        motherName: cleanText(details.motherName),
        legalSpouseName: cleanText(details.legalSpouseName),
        currentPartnerName: cleanText(details.currentPartnerName),
        childrenNames: cleanStringList(details.childrenNames),
        businessName: cleanText(details.businessName),
        businessType: cleanText(details.businessType),
        businessArea: cleanText(details.businessArea),
        businessAddress: cleanText(details.businessAddress),
        businessOwnerName: cleanText(details.businessOwnerName),
        businessOwnerAddress: cleanText(details.businessOwnerAddress),
        businessPermitNo: cleanText(details.businessPermitNo),
        monthlyIncome: cleanText(details.monthlyIncome),
        incomeStartYear: cleanText(details.incomeStartYear),
        businessProof,
    };

    return Object.fromEntries(
        Object.entries(normalized).filter(([, fieldValue]) => {
            if (Array.isArray(fieldValue)) return fieldValue.length > 0;
            if (
                fieldValue &&
                typeof fieldValue === "object" &&
                !Array.isArray(fieldValue)
            ) {
                return Object.values(fieldValue).some(Boolean);
            }
            return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
        }),
    );
}

function normalizeRequestAttachments(value) {
    if (!Array.isArray(value)) return [];
    return value
        .filter(Boolean)
        .slice(0, 8)
        .map((file) => ({
            proofKey: String(file.proofKey || file.proof_key || "proof").slice(
                0,
                80,
            ),
            label: String(file.label || "Supporting proof").slice(0, 160),
            fileName: String(
                file.fileName || file.file_name || file.name || "uploaded-file",
            ).slice(0, 255),
            filePath: String(file.filePath || file.file_path || "").slice(
                0,
                500,
            ),
            fileUrl: String(file.fileUrl || file.file_url || "").slice(0, 1000),
            mimeType: String(file.mimeType || file.mime_type || "").slice(
                0,
                120,
            ),
            fileSize: Math.max(
                0,
                Number(file.fileSize || file.file_size || file.size || 0),
            ),
        }))
        .filter((file) => file.filePath || file.fileUrl);
}

async function insertRequestAttachments(
    client,
    requestId,
    residentId,
    attachments,
) {
    if (!attachments.length) return;

    const values = [];
    const params = [];
    attachments.forEach((file, index) => {
        const offset = index * 9;
        values.push(
            `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`,
        );
        params.push(
            requestId,
            residentId,
            file.proofKey,
            file.label,
            file.fileName,
            file.filePath,
            file.fileUrl,
            file.mimeType,
            file.fileSize,
        );
    });

    await client.query(
        `INSERT INTO request_attachments
            (request_id, resident_id, proof_key, label, file_name, file_path, file_url, mime_type, file_size)
         VALUES ${values.join(", ")}`,
        params,
    );
}

async function appendResidentRequestAttachments(rows = []) {
    const ids = rows
        .map((row) => Number.parseInt(row.request_id, 10))
        .filter((id) => Number.isFinite(id) && id > 0);
    if (!ids.length) return rows;

    try {
        const result = await pool.query(
            `SELECT request_attachment_id, request_id, proof_key, label,
                    file_name, file_path, file_url, mime_type, file_size, uploaded_at
             FROM request_attachments
             WHERE request_id = ANY($1::int[])
             ORDER BY uploaded_at ASC, request_attachment_id ASC`,
            [ids],
        );
        const grouped = new Map();
        result.rows.forEach((attachment) => {
            if (!grouped.has(attachment.request_id)) {
                grouped.set(attachment.request_id, []);
            }
            grouped.get(attachment.request_id).push(attachment);
        });
        return rows.map((row) => ({
            ...row,
            attachments: grouped.get(row.request_id) || [],
        }));
    } catch (err) {
        if (
            err?.code === "42P01" ||
            /request_attachments/i.test(err?.message || "")
        ) {
            return rows.map((row) => ({ ...row, attachments: [] }));
        }
        throw err;
    }
}

async function appendCorrectionHistory(rows = []) {
    const ids = rows
        .map((row) => Number.parseInt(row.request_id, 10))
        .filter((id) => Number.isFinite(id) && id > 0);
    if (!ids.length) return rows;

    try {
        const result = await pool.query(
            `SELECT correction_history_id, request_id, revision_number,
                    event_type, message, actor_type, actor_id, actor_name,
                    request_snapshot, created_at
             FROM request_correction_history
             WHERE request_id = ANY($1::int[])
             ORDER BY created_at ASC, correction_history_id ASC`,
            [ids],
        );
        const grouped = new Map();
        result.rows.forEach((event) => {
            if (!grouped.has(event.request_id)) grouped.set(event.request_id, []);
            grouped.get(event.request_id).push(event);
        });
        return rows.map((row) => ({
            ...row,
            correction_history: grouped.get(row.request_id) || [],
        }));
    } catch (err) {
        if (
            err?.code === "42P01" ||
            /request_correction_history/i.test(err?.message || "")
        ) {
            return rows.map((row) => ({ ...row, correction_history: [] }));
        }
        throw err;
    }
}

const PROFILE_SELECT = `SELECT r.resident_id, r.full_name, r.first_name, r.middle_name, r.last_name,
              r.email, r.contact_number,
              r.address_house, r.address_street,
              to_jsonb(r)->>'address_city' AS address_city,
              to_jsonb(r)->>'address_province' AS address_province,
              r.house_number, r.purok_id, r.street_id, r.street_other,
              r.date_of_birth, r.civil_status, r.nationality, r.gender,
              r.place_of_birth, r.occupation, r.years_of_residency,
              COALESCE(r.profile_details, '{}'::jsonb) AS profile_details,
              r.status, r.created_at,
              p.name AS purok_name,
              s.name AS street_name
             FROM residents r
             LEFT JOIN puroks  p ON p.purok_id  = r.purok_id
             LEFT JOIN streets s ON s.street_id = r.street_id
             WHERE r.resident_id = $1`;

// GET /api/resident/profile
async function getProfile(req, res) {
    const resident_id = req.resident.id;
    try {
        const result = await pool.query(PROFILE_SELECT, [resident_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Resident not found" });
        }
        return res.json({ data: result.rows[0], profile: result.rows[0] });
    } catch (err) {
        console.error("getProfile error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// PUT /api/resident/profile
// body: { date_of_birth, civil_status, contact_number, house_number, purok_id, street_id, street_other, gender, place_of_birth, occupation, years_of_residency, profile_details }
async function updateProfile(req, res) {
    const resident_id = req.resident.id;
    const {
        date_of_birth,
        civil_status,
        contact_number,
        house_number,
        purok_id,
        street_id,
        street_other,
        gender,
        place_of_birth,
        occupation,
        years_of_residency,
        profile_details,
    } = req.body;

    try {
        // Resolve purok name for address_house rebuild
        let purokName = "";
        if (purok_id && Number(purok_id) > 0) {
            const purokRes = await pool.query(
                "SELECT name FROM puroks WHERE purok_id = $1",
                [Number(purok_id)],
            );
            purokName = purokRes.rows[0]?.name || "";
        }

        // Resolve street name for address_street rebuild
        let streetName = "";
        if (street_id && street_id !== "other" && Number(street_id) > 0) {
            const streetRes = await pool.query(
                "SELECT name FROM streets WHERE street_id = $1",
                [Number(street_id)],
            );
            streetName = streetRes.rows[0]?.name || "";
        } else if (street_id === "other" && street_other) {
            streetName = street_other.trim();
        }

        // Rebuild combined address columns
        const address_house = [house_number, purokName]
            .filter(Boolean)
            .join(", ");

        const address_street = streetName
            ? `${streetName}, Barangay East Tapinac, Olongapo City`
            : "Barangay East Tapinac, Olongapo City";

        const resolvedStreetId =
            street_id && street_id !== "other" && Number(street_id) > 0
                ? Number(street_id)
                : null;

        const resolvedPurokId =
            purok_id && Number(purok_id) > 0 ? Number(purok_id) : null;

        const sanitizedProfileDetails = cleanProfileDetails(profile_details);

        await pool.query(
            `UPDATE residents
             SET date_of_birth  = $1,
                  civil_status   = $2,
                  contact_number = $3,
                  house_number   = $4,
                  purok_id       = $5,
                  street_id      = $6,
                  street_other   = $7,
                  address_house  = $8,
                  address_street = $9,
                  gender = $10,
                  place_of_birth = $11,
                  occupation = $12,
                  years_of_residency = $13,
                  profile_details = $14::jsonb
             WHERE resident_id  = $15`,
            [
                date_of_birth || null,
                civil_status || null,
                contact_number,
                house_number || null,
                resolvedPurokId,
                resolvedStreetId,
                street_id === "other" ? street_other || null : null,
                address_house,
                address_street,
                cleanText(gender),
                cleanText(place_of_birth),
                cleanText(occupation),
                cleanInteger(years_of_residency),
                JSON.stringify(sanitizedProfileDetails),
                resident_id,
            ],
        );

        await createAuditLog({
            actorId: resident_id,
            actorName:
                req.resident?.full_name || req.resident?.email || "Resident",
            actorRole: "resident",
            actionType: "profile",
            targetTable: "residents",
            targetId: resident_id,
            description: `Resident updated their profile information`,
            ipAddress: req.ip,
        });

        // Re-fetch with joins so the response includes purok_name and street_name
        const joined = await pool.query(PROFILE_SELECT, [resident_id]);

        return res.json({
            message: "Profile updated",
            data: joined.rows[0],
            profile: joined.rows[0],
        });
    } catch (err) {
        console.error("updateProfile error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// POST /api/resident/requests
// body: { certType, purpose, extraFields, attachments, notes, source }
async function createRequest(req, res) {
    const resident_id = req.resident.id;
    const {
        certType,
        purpose,
        extraFields,
        attachments,
        notes,
        source,
        templateId,
    } = req.body;

    if (!certType || !purpose) {
        return res
            .status(400)
            .json({ message: "Certificate type and purpose are required" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const parsedTemplateId = Number.parseInt(templateId, 10);
        const resolvedTemplateId =
            Number.isFinite(parsedTemplateId) && parsedTemplateId > 0
                ? parsedTemplateId
                : null;

        const result = await client.query(
            `INSERT INTO requests
        (resident_id, template_id, cert_type, purpose, extra_fields, notes, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING request_id, cert_type, status, requested_at`,
            [
                resident_id,
                resolvedTemplateId,
                certType,
                purpose,
                JSON.stringify(extraFields || {}),
                notes || "",
                source || "resident",
            ],
        );

        const requestId = result.rows[0].request_id;
        const proofFiles = normalizeRequestAttachments(
            Array.isArray(attachments)
                ? attachments
                : Array.isArray(extraFields?.proofAttachments)
                  ? extraFields.proofAttachments
                  : [],
        );

        await insertRequestAttachments(
            client,
            requestId,
            resident_id,
            proofFiles,
        );

        await client.query("COMMIT");

        await createAuditLog({
            actorId: resident_id,
            actorName:
                req.resident?.full_name || req.resident?.email || "Resident",
            actorRole: "resident",
            actionType: "request",
            targetTable: "requests",
            targetId: result.rows[0].request_id,
            description: `Resident requested ${certType} certificate`,
            ipAddress: req.ip,
        });

        return res.status(201).json({ request: result.rows[0] });
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("createRequest error:", err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
}

// GET /api/resident/requests
async function getMyRequests(req, res) {
    const resident_id = req.resident.id;
    try {
        const result = await pool.query(
            `SELECT r.request_id, r.template_id, r.cert_type, r.purpose,
                    r.extra_fields, r.notes, r.source, r.status,
                    r.rejection_reason, r.requested_at, r.processed_at,
                    r.released_at,
                    COALESCE((to_jsonb(r)->>'revision_count')::int, 0) AS revision_count,
                    to_jsonb(r)->>'last_resubmitted_at' AS last_resubmitted_at,
                    ct.template_key
             FROM requests r
             LEFT JOIN certificate_templates ct ON ct.template_id = r.template_id
             WHERE r.resident_id = $1
             ORDER BY r.requested_at DESC`,
            [resident_id],
        );
        const rowsWithAttachments =
            await appendResidentRequestAttachments(result.rows);
        const rows = await appendCorrectionHistory(rowsWithAttachments);
        return res.json({ data: rows });
    } catch (err) {
        console.error("getMyRequests error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getMyRequest(req, res) {
    const residentId = req.resident.id;
    const requestId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(requestId) || requestId <= 0) {
        return res.status(400).json({ message: "Invalid request ID" });
    }

    try {
        const result = await pool.query(
            `SELECT r.request_id, r.template_id, r.cert_type, r.purpose,
                    r.extra_fields, r.notes, r.source, r.status,
                    r.rejection_reason, r.requested_at, r.processed_at,
                    r.released_at,
                    COALESCE((to_jsonb(r)->>'revision_count')::int, 0) AS revision_count,
                    to_jsonb(r)->>'last_resubmitted_at' AS last_resubmitted_at,
                    ct.template_key
             FROM requests r
             LEFT JOIN certificate_templates ct ON ct.template_id = r.template_id
             WHERE r.request_id = $1 AND r.resident_id = $2
             LIMIT 1`,
            [requestId, residentId],
        );
        if (!result.rows.length) {
            return res.status(404).json({ message: "Request not found" });
        }
        const rowsWithAttachments =
            await appendResidentRequestAttachments(result.rows);
        const [request] = await appendCorrectionHistory(rowsWithAttachments);
        return res.json({ request });
    } catch (err) {
        console.error("getMyRequest error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function resubmitRequest(req, res) {
    const residentId = req.resident.id;
    const requestId = Number.parseInt(req.params.id, 10);
    const purpose = cleanText(req.body?.purpose);
    const notes = cleanText(req.body?.notes) || "";
    const extraFields = cleanObject(
        req.body?.extraFields || req.body?.extra_fields,
    );
    const attachments = normalizeRequestAttachments(
        Array.isArray(req.body?.attachments)
            ? req.body.attachments
            : extraFields.proofAttachments,
    );

    if (!Number.isFinite(requestId) || requestId <= 0) {
        return res.status(400).json({ message: "Invalid request ID" });
    }
    if (!purpose) {
        return res.status(400).json({ message: "Purpose is required" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const currentResult = await client.query(
            `SELECT request_id, cert_type, status
             FROM requests
             WHERE request_id = $1 AND resident_id = $2
             FOR UPDATE`,
            [requestId, residentId],
        );
        const current = currentResult.rows[0];
        if (!current) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Request not found" });
        }
        if (String(current.status).toLowerCase() !== "needs_correction") {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message:
                    "Only requests returned for correction can be resubmitted.",
            });
        }

        const allowedExisting = await client.query(
            `SELECT file_path
             FROM request_attachments
             WHERE request_id = $1 AND resident_id = $2`,
            [requestId, residentId],
        );
        const existingPaths = new Set(
            allowedExisting.rows.map((row) => String(row.file_path || "")),
        );
        const uploadPrefix = `request-proofs/${req.resident.supabase_uid}/`;
        const safeAttachments = attachments.filter(
            (file) =>
                existingPaths.has(file.filePath) ||
                file.filePath.startsWith(uploadPrefix),
        );
        const nextExtraFields = {
            ...extraFields,
            proofAttachments: safeAttachments,
        };

        const result = await client.query(
            `UPDATE requests
             SET purpose = $3,
                 extra_fields = $4::jsonb,
                 notes = $5,
                 status = 'pending',
                 rejection_reason = NULL,
                 processed_by = NULL,
                 processed_at = NULL,
                 signatory_snapshot = '{}'::jsonb,
                 revision_count = COALESCE(revision_count, 0) + 1,
                 last_resubmitted_at = NOW()
             WHERE request_id = $1 AND resident_id = $2
             RETURNING request_id, cert_type, status, requested_at,
                       revision_count, last_resubmitted_at`,
            [
                requestId,
                residentId,
                purpose,
                JSON.stringify(nextExtraFields),
                notes,
            ],
        );

        await client.query(
            "DELETE FROM request_attachments WHERE request_id = $1 AND resident_id = $2",
            [requestId, residentId],
        );
        await insertRequestAttachments(
            client,
            requestId,
            residentId,
            safeAttachments,
        );
        const updated = result.rows[0];
        await client.query(
            `INSERT INTO request_correction_history (
                request_id, revision_number, event_type, message,
                actor_type, actor_id, actor_name, request_snapshot
             ) VALUES ($1, $2, 'resident_resubmitted', $3, 'resident', $4, $5, $6::jsonb)`,
            [
                requestId,
                updated.revision_count,
                "Resident corrected and resubmitted the request.",
                residentId,
                req.resident?.full_name || req.resident?.email || "Resident",
                JSON.stringify({
                    certType: current.cert_type,
                    purpose,
                    extraFields: nextExtraFields,
                    notes,
                    attachments: safeAttachments,
                    status: updated.status,
                }),
            ],
        );
        await client.query("COMMIT");

        await createAuditLog({
            actorId: residentId,
            actorName:
                req.resident?.full_name || req.resident?.email || "Resident",
            actorRole: "resident",
            actionType: "request",
            targetTable: "requests",
            targetId: requestId,
            description: `Resident corrected and resubmitted request #${requestId} for ${current.cert_type}`,
            ipAddress: req.ip,
        });

        return res.json({
            message: "Request corrected and resubmitted for review",
            request: updated,
        });
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("resubmitRequest error:", err);
        if (
            err?.code === "42703" &&
            /revision_count|last_resubmitted_at|request_correction_history/i.test(
                err?.message || "",
            )
        ) {
            return res.status(503).json({
                message:
                    "Request correction is not initialized. Run database/request_correction_resubmission.sql first.",
            });
        }
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
}

// GET /api/resident/notifications?limit=20
async function getNotifications(req, res) {
    const resident_id = req.resident.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50); // max 50

    try {
        const result = await pool.query(
            `SELECT notification_id, type, title, message, request_id, is_read, created_at
             FROM notifications
             WHERE resident_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [resident_id, limit],
        );
        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getNotifications error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// GET /api/resident/notifications/unread-count
async function getUnreadCount(req, res) {
    const resident_id = req.resident.id;

    try {
        const result = await pool.query(
            "SELECT COUNT(*) as count FROM notifications WHERE resident_id = $1 AND is_read = false",
            [resident_id],
        );
        return res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error("getUnreadCount error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// PUT /api/resident/notifications/:id/read
async function markRead(req, res) {
    const resident_id = req.resident.id;
    const notification_id = req.params.id;

    try {
        const result = await pool.query(
            "UPDATE notifications SET is_read = true WHERE notification_id = $1 AND resident_id = $2 RETURNING notification_id",
            [notification_id, resident_id],
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }
        return res.json({ success: true });
    } catch (err) {
        console.error("markRead error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// PUT /api/resident/notifications/read-all
async function markAllRead(req, res) {
    const resident_id = req.resident.id;

    try {
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE resident_id = $1 AND is_read = false",
            [resident_id],
        );
        return res.json({ success: true });
    } catch (err) {
        console.error("markAllRead error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    createRequest,
    getMyRequests,
    getMyRequest,
    resubmitRequest,
    getNotifications,
    getUnreadCount,
    markRead,
    markAllRead,
};
