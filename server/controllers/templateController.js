//
const pool = require("../db/pool");

// GET /api/certificates/templates
async function getTemplates(req, res) {
    try {
        const result = await pool.query(
            `SELECT template_id, name, template_key, has_fee, description, required_fields
       FROM certificate_templates
       WHERE is_active = true
       ORDER BY COALESCE(display_order, 0), name ASC`,
        );
        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getTemplates error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { getTemplates };
