const pool = require("../db/pool");

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

module.exports = { createAuditLog };
