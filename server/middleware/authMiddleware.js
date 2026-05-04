// certifast/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const pool = require("../db/pool");

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// For residents only
async function residentAuth(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        const result = await pool.query(
            "SELECT resident_id FROM residents WHERE email = $1",
            [user.email],
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: "Resident not found" });
        }

        req.resident = { id: result.rows[0].resident_id, email: user.email };
        next();
    } catch {
        return res.status(403).json({ message: "Invalid token" });
    }
}

// For any logged-in admin_accounts user (admin or staff)
function adminAuth(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== "admin")
            return res.status(403).json({ message: "Access denied" });
        req.admin = decoded;
        next();
    } catch {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

// For admin role only — blocks staff
// Used for: logs, manage accounts, settings
function adminOnlyAuth(req, res, next) {
    adminAuth(req, res, () => {
        if (req.admin.role !== "admin") {
            return res.status(403).json({ message: "Admin access only" });
        }
        next();
    });
}

module.exports = { residentAuth, adminAuth, adminOnlyAuth };
