const pool = require("../db/pool");

const ALLOWED_CIVIL_STATUSES = [
    "Single",
    "Married",
    "Widowed",
    "Separated",
    "Annulled",
];

function formatResidentProfile(row) {
    return {
        resident_id: row.resident_id,
        full_name: row.full_name,
        email: row.email,
        date_of_birth: row.date_of_birth,
        civil_status: row.civil_status,
        contact_number: row.contact_number,
        address_house: row.address_house,
        address_street: row.address_street,
        registered_at: row.created_at,
        status: row.status
            ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
            : "",
        nationality: "Filipino",
    };
}

function formatResidentRequest(row) {
    return {
        request_id: row.request_id,
        type: row.cert_type,
        cert_type: row.cert_type,
        purpose: row.purpose,
        extra_fields: row.extra_fields,
        notes: row.notes,
        source: row.source,
        status: row.status,
        rejection_reason: row.rejection_reason,
        requested_at: row.requested_at,
        released_at: row.released_at,
    };
}

async function getResidentRequests(req, res) {
    try {
        const result = await pool.query(
            `SELECT request_id, cert_type, purpose, extra_fields, notes, source,
                    status, rejection_reason, requested_at, released_at
             FROM requests
             WHERE resident_id = $1
             ORDER BY requested_at DESC`,
            [req.resident.id],
        );

        return res.json({ data: result.rows.map(formatResidentRequest) });
    } catch (err) {
        console.error("getResidentRequests error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function createResidentRequest(req, res) {
    const { certType, purpose, extraFields, notes, source } = req.body;

    if (!certType || !String(certType).trim()) {
        return res.status(400).json({ message: "Certificate type is required" });
    }

    if (!purpose || !String(purpose).trim()) {
        return res.status(400).json({ message: "Purpose is required" });
    }

    const normalizedExtraFields =
        extraFields && typeof extraFields === "object" && !Array.isArray(extraFields)
            ? extraFields
            : {};

    const normalizedSource =
        source && String(source).trim() ? String(source).trim() : "resident";

    try {
        const result = await pool.query(
            `INSERT INTO requests (
                resident_id,
                cert_type,
                purpose,
                extra_fields,
                notes,
                source,
                status,
                requested_at
            )
            VALUES ($1, $2, $3, $4::jsonb, $5, $6, 'pending', NOW())
            RETURNING request_id, cert_type, purpose, extra_fields, notes,
                      source, status, requested_at, released_at`,
            [
                req.resident.id,
                String(certType).trim(),
                String(purpose).trim(),
                JSON.stringify(normalizedExtraFields),
                notes ? String(notes).trim() : null,
                normalizedSource,
            ],
        );

        return res.status(201).json({
            message: "Request submitted successfully",
            request: formatResidentRequest(result.rows[0]),
        });
    } catch (err) {
        console.error("createResidentRequest error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getResidentProfile(req, res) {
    try {
        const result = await pool.query(
            `SELECT resident_id, full_name, email, date_of_birth, civil_status,
                    contact_number, address_house, address_street, created_at, status
             FROM residents
             WHERE resident_id = $1`,
            [req.resident.id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Resident profile not found" });
        }

        return res.json({ profile: formatResidentProfile(result.rows[0]) });
    } catch (err) {
        console.error("getResidentProfile error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function updateResidentProfile(req, res) {
    const {
        date_of_birth,
        civil_status,
        contact_number,
        address_house,
        address_street,
    } = req.body;

    if (!contact_number || !String(contact_number).trim()) {
        return res.status(400).json({ message: "Contact number is required" });
    }

    if (!address_street || !String(address_street).trim()) {
        return res.status(400).json({ message: "Street address is required" });
    }

    if (civil_status && !ALLOWED_CIVIL_STATUSES.includes(civil_status)) {
        return res.status(400).json({
            message: `Civil status must be one of: ${ALLOWED_CIVIL_STATUSES.join(", ")}`,
        });
    }

    try {
        const result = await pool.query(
            `UPDATE residents
             SET date_of_birth = $1,
                 civil_status = $2,
                 contact_number = $3,
                 address_house = $4,
                 address_street = $5
             WHERE resident_id = $6
             RETURNING resident_id, full_name, email, date_of_birth, civil_status,
                       contact_number, address_house, address_street, created_at, status`,
            [
                date_of_birth || null,
                civil_status || null,
                String(contact_number).trim(),
                address_house ? String(address_house).trim() : null,
                String(address_street).trim(),
                req.resident.id,
            ],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Resident profile not found" });
        }

        return res.json({
            message: "Profile updated successfully",
            profile: formatResidentProfile(result.rows[0]),
        });
    } catch (err) {
        console.error("updateResidentProfile error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getResidentProfile,
    updateResidentProfile,
    getResidentRequests,
    createResidentRequest,
};
