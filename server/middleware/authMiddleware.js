// certifast/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// For residents only
function residentAuth(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== "resident")
            return res.status(403).json({ message: "Access denied" });
        req.resident = decoded;
        next();
    } catch {
        return res.status(403).json({ message: "Invalid or expired token" });
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
