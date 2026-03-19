const pool = require("../db/pool");

// GET /api/resident/profile
async function getProfile(req, res) {
    const resident_id = req.resident.id;
    try {
        const result = await pool.query(
            `SELECT resident_id, full_name, email, contact_number,
              address_house, address_street, date_of_birth,
              civil_status, status, created_at
       FROM residents WHERE resident_id = $1`,
            [resident_id],
        );
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
// body: { date_of_birth, civil_status, contact_number, address_house, address_street }
async function updateProfile(req, res) {
    const resident_id = req.resident.id;
    const {
        date_of_birth,
        civil_status,
        contact_number,
        address_house,
        address_street,
    } = req.body;
    try {
        const result = await pool.query(
            `UPDATE residents
       SET date_of_birth = $1, civil_status = $2,
           contact_number = $3, address_house = $4, address_street = $5
       WHERE resident_id = $6
       RETURNING resident_id, full_name, email, contact_number,
                 address_house, address_street, date_of_birth, civil_status, status`,
            [
                date_of_birth,
                civil_status,
                contact_number,
                address_house,
                address_street,
                resident_id,
            ],
        );
        return res.json({
            message: "Profile updated",
            data: result.rows[0],
            profile: result.rows[0],
        });
    } catch (err) {
        console.error("updateProfile error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// POST /api/resident/requests
// body: { certType, purpose, extraFields, notes, source }
async function createRequest(req, res) {
    const resident_id = req.resident.id;
    const { certType, purpose, extraFields, notes, source } = req.body;

    if (!certType || !purpose) {
        return res
            .status(400)
            .json({ message: "Certificate type and purpose are required" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO requests
        (resident_id, cert_type, purpose, extra_fields, notes, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING request_id, cert_type, status, requested_at`,
            [
                resident_id,
                certType,
                purpose,
                JSON.stringify(extraFields || {}),
                notes || "",
                source || "resident",
            ],
        );
        return res.status(201).json({ request: result.rows[0] });
    } catch (err) {
        console.error("createRequest error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// GET /api/resident/requests
async function getMyRequests(req, res) {
    const resident_id = req.resident.id;
    try {
        const result = await pool.query(
            `SELECT request_id, cert_type, purpose, status,
              rejection_reason, requested_at, released_at
       FROM requests
       WHERE resident_id = $1
       ORDER BY requested_at DESC`,
            [resident_id],
        );
        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getMyRequests error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { getProfile, updateProfile, createRequest, getMyRequests };
