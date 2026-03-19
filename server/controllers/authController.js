const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /api/auth/resident/register
// body: { full_name, email, password, address, contact_number }
async function residentRegister(req, res) {
    const { full_name, email, password, address, contact_number } = req.body;

    if (!full_name || !email || !password) {
        return res
            .status(400)
            .json({ message: "full_name, email and password are required" });
    }

    try {
        // Check if email already exists
        const existing = await pool.query(
            "SELECT resident_id FROM residents WHERE email = $1",
            [email],
        );
        if (existing.rows.length > 0) {
            return res
                .status(409)
                .json({ message: "Email already registered" });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO residents (full_name, email, password_hash, address_street, contact_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING resident_id, full_name, email`,
            [full_name, email, password_hash, address, contact_number],
        );

        return res.status(201).json({
            message: "Account created successfully",
            resident: result.rows[0],
        });
    } catch (err) {
        console.error("residentRegister error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// POST /api/auth/resident/login
// body: { email, password }
async function residentLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Email and password are required" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM residents WHERE email = $1 AND status = $2",
            [email, "active"],
        );

        if (result.rows.length === 0) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        const resident = result.rows[0];
        const match = await bcrypt.compare(password, resident.password_hash);

        if (!match) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            {
                id: resident.resident_id,
                email: resident.email,
                type: "resident",
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_RESIDENT_EXPIRES },
        );

        return res.json({
            token,
            resident: {
                id: resident.resident_id,
                full_name: resident.full_name,
                email: resident.email,
            },
        });
    } catch (err) {
        console.error("residentLogin error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// PUT /api/resident/change-password
// body: { current_password, new_password }
async function residentChangePassword(req, res) {
    const resident_id = req.resident.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res
            .status(400)
            .json({
                message: "Current password and new password are required",
            });
    }
    if (new_password.length < 8) {
        return res
            .status(400)
            .json({ message: "New password must be at least 8 characters" });
    }

    try {
        const result = await pool.query(
            "SELECT password_hash FROM residents WHERE resident_id = $1",
            [resident_id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Resident not found" });
        }

        const resident = result.rows[0];
        const match = await bcrypt.compare(
            current_password,
            resident.password_hash,
        );
        if (!match) {
            return res
                .status(401)
                .json({ message: "Current password is incorrect" });
        }

        const newHash = await bcrypt.hash(new_password, 10);
        await pool.query(
            "UPDATE residents SET password_hash = $1 WHERE resident_id = $2",
            [newHash, resident_id],
        );

        return res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("residentChangePassword error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// POST /api/auth/admin/login
// body: { username, password }
async function adminLogin(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM admin_accounts WHERE username = $1 AND status = $2",
            [username, "active"],
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const admin = result.rows[0];
        const match = await bcrypt.compare(password, admin.password_hash);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Update last_login
        await pool.query(
            "UPDATE admin_accounts SET last_login = now() WHERE admin_id = $1",
            [admin.admin_id],
        );

        const token = jwt.sign(
            {
                id: admin.admin_id,
                username: admin.username,
                role: admin.role,
                type: "admin",
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ADMIN_EXPIRES },
        );

        return res.json({
            token,
            admin: {
                id: admin.admin_id,
                name: admin.full_name,
                role: admin.role,
            },
        });
    } catch (err) {
        console.error("adminLogin error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    residentRegister,
    residentLogin,
    residentChangePassword,
    adminLogin,
};
