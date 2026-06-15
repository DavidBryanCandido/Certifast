//
const pool = require("../db/pool");

function queryActiveTemplates({
    includeFeeAmount = true,
    includeProofRequirements = true,
    includeResidentGuidance = true,
} = {}) {
    const feeAmountSelect = includeFeeAmount
        ? "fee_amount"
        : "NULL::numeric(10, 2) AS fee_amount";
    const proofRequirementsSelect = includeProofRequirements
        ? "proof_requirements"
        : "'[]'::jsonb AS proof_requirements";
    const residentGuidanceSelect = includeResidentGuidance
        ? "resident_guidance"
        : "'{}'::jsonb AS resident_guidance";

    return pool.query(
        `SELECT template_id, name, template_key, has_fee, ${feeAmountSelect}, description, required_fields,
                ${proofRequirementsSelect}, ${residentGuidanceSelect}
       FROM certificate_templates
       WHERE is_active = true
       ORDER BY COALESCE(display_order, 0), name ASC`,
    );
}

function disableMissingColumn(flags, message = "") {
    const lower = String(message).toLowerCase();
    if (lower.includes("fee_amount")) flags.includeFeeAmount = false;
    if (lower.includes("proof_requirements")) flags.includeProofRequirements = false;
    if (lower.includes("resident_guidance")) flags.includeResidentGuidance = false;
}

// GET /api/certificates/templates
async function getTemplates(req, res) {
    try {
        let result;
        const flags = {
            includeFeeAmount: true,
            includeProofRequirements: true,
            includeResidentGuidance: true,
        };

        for (let attempt = 0; attempt < 4; attempt += 1) {
            try {
                result = await queryActiveTemplates(flags);
                break;
            } catch (err) {
                if (err.code !== "42703") throw err;
                const before = JSON.stringify(flags);
                disableMissingColumn(flags, err.message);
                if (JSON.stringify(flags) === before) throw err;
            }
        }

        if (!result) result = await queryActiveTemplates(flags);

        return res.json({ data: result.rows });
    } catch (err) {
        console.error("getTemplates error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { getTemplates };
