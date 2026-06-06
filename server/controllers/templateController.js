//
const pool = require("../db/pool");

function queryActiveTemplates(includeFeeAmount = true) {
    const feeAmountSelect = includeFeeAmount
        ? "fee_amount"
        : "NULL::numeric(10, 2) AS fee_amount";

    return pool.query(
        `SELECT template_id, name, template_key, has_fee, ${feeAmountSelect}, description, required_fields
       FROM certificate_templates
       WHERE is_active = true
       ORDER BY COALESCE(display_order, 0), name ASC`,
    );
}

// GET /api/certificates/templates
async function getTemplates(req, res) {
    try {
        let result;
        try {
            result = await queryActiveTemplates(true);
        } catch (err) {
            if (err.code !== "42703" || !/fee_amount/i.test(err.message || "")) {
                throw err;
            }
            result = await queryActiveTemplates(false);
        }
        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getTemplates error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { getTemplates };
