const pool = require("../db/pool");

// GET /api/certificates/templates
async function getTemplates(req, res) {
    try {
        const result = await pool.query(
            `SELECT template_id, name, has_fee, description
       FROM certificate_templates
       WHERE is_active = true
       ORDER BY name ASC`,
        );
        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getTemplates error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { getTemplates };
