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

function getPeriodFilter(period) {
    switch (period) {
        case "week":
            return `AND requested_at >= NOW() - INTERVAL '7 days'`;
        case "month":
            return `AND DATE_TRUNC('month', requested_at) = DATE_TRUNC('month', NOW())`;
        case "year":
            return `AND DATE_TRUNC('year', requested_at) = DATE_TRUNC('year', NOW())`;
        case "all":
        default:
            return "";
    }
}

exports.getOverview = async (req, res) => {
    try {
        const period = req.query.period || "month";
        const periodFilter = getPeriodFilter(period);

        // 1. Stats
        const statsQuery = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'released' ${periodFilter}) AS "issuedThisPeriod",
                COUNT(*) FILTER (WHERE status = 'released') AS "totalAllTime",
                COUNT(*) FILTER (WHERE status IN ('pending', 'approved', 'ready')) AS pending,
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
                COUNT(*) FILTER (WHERE status IN ('pending', 'approved', 'ready')) AS pending,
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
                    WHEN COUNT(*) FILTER (WHERE status IN ('pending','approved','ready')) > 0
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

        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "report_export",
            targetTable: "reports",
            targetId: null,
            description,
            ipAddress: req.ip,
        });

        return res.json({ message: "Export logged successfully" });
    } catch (err) {
        console.error("logExport error:", err);
        return res.status(500).json({ message: "Failed to log export." });
    }
};
