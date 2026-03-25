const pool = require("../db/pool");

// GET /api/resident/profile
async function getProfile(req, res) {
    const resident_id = req.resident.id;
    try {
        const result = await pool.query(
            `SELECT r.resident_id, r.full_name, r.first_name, r.middle_name, r.last_name,
              r.email, r.contact_number,
              r.address_house, r.address_street,
              r.house_number, r.purok_id, r.street_id, r.street_other,
              r.date_of_birth, r.civil_status, r.nationality,
              r.status, r.created_at,
              p.name AS purok_name,
              s.name AS street_name
             FROM residents r
             LEFT JOIN puroks  p ON p.purok_id  = r.purok_id
             LEFT JOIN streets s ON s.street_id = r.street_id
             WHERE r.resident_id = $1`,
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
// body: { date_of_birth, civil_status, contact_number, house_number, purok_id, street_id, street_other }
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
                 address_street = $9
             WHERE resident_id  = $10`,
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
                resident_id,
            ],
        );

        // Re-fetch with joins so the response includes purok_name and street_name
        const joined = await pool.query(
            `SELECT r.resident_id, r.full_name, r.first_name, r.middle_name, r.last_name,
              r.email, r.contact_number,
              r.address_house, r.address_street,
              r.house_number, r.purok_id, r.street_id, r.street_other,
              r.date_of_birth, r.civil_status, r.nationality,
              r.status, r.created_at,
              p.name AS purok_name,
              s.name AS street_name
             FROM residents r
             LEFT JOIN puroks  p ON p.purok_id  = r.purok_id
             LEFT JOIN streets s ON s.street_id = r.street_id
             WHERE r.resident_id = $1`,
            [resident_id],
        );

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
    getNotifications,
    getUnreadCount,
    markRead,
    markAllRead,
};
