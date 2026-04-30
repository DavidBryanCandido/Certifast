// certifast/controllers/authController.js
const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const { createAuditLog } = require("../utils/logger");

// Supabase client — optional at startup so the server can still boot without it.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
    supabaseUrl && supabaseServiceRoleKey
        ? createClient(supabaseUrl, supabaseServiceRoleKey)
        : null;

// POST /api/auth/resident/register
// body: { first_name, middle_name, last_name, full_name, email, password,
//         contact_number, date_of_birth, house_number, purok_id, street_id,
//         street_other, address_house, address_street, id_type }
async function residentRegister(req, res) {
    const {
        first_name,
        middle_name,
        last_name,
        email,
        password,
        contact_number,
        date_of_birth,
        house_number,
        purok_id,
        street_id,
        street_other,
        address_house,
        address_street,
        id_type,
        civil_status,
        nationality,
    } = req.body;

    // Compose full_name from parts
    const full_name =
        [first_name, middle_name, last_name]
            .map((s) => (s || "").trim())
            .filter(Boolean)
            .join(" ") || req.body.full_name;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            message: "first_name, last_name, email and password are required",
        });
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

        // ── Upload ID image to Supabase Storage if provided ──
        let id_image_url = null;
        if (req.file) {
            if (!supabase) {
                console.warn(
                    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing; skipping ID image upload.",
                );
            } else {
            const ext =
                req.file.mimetype === "image/png"
                    ? "png"
                    : req.file.mimetype === "image/webp"
                      ? "webp"
                      : "jpg";
            const filename = `resident-ids/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("certifast-uploads")
                .upload(filename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (uploadError) {
                console.error("Supabase upload error:", uploadError.message);
                // Don't fail registration — just proceed without the image URL
            } else {
                const { data: urlData } = supabase.storage
                    .from("certifast-uploads")
                    .getPublicUrl(filename);
                id_image_url = urlData.publicUrl;
            }
            }
        }

        const result = await pool.query(
            `INSERT INTO residents (
                full_name, first_name, middle_name, last_name,
                email, password_hash, contact_number, date_of_birth,
                house_number, purok_id, street_id, street_other,
                address_house, address_street,
                id_type, id_image_url, civil_status, nationality, status
            ) VALUES (
                $1,  $2,  $3,  $4,
                $5,  $6,  $7,  $8,
                $9,  $10, $11, $12,
                $13, $14,
                $15, $16, $17, $18, 'pending_verification'
            )
            RETURNING resident_id, full_name, first_name, last_name, email, status`,
            [
                full_name,
                first_name,
                middle_name || null,
                last_name,
                email,
                password_hash,
                contact_number || null,
                date_of_birth || null,
                house_number || null,
                purok_id && Number(purok_id) > 0 ? Number(purok_id) : null,
                street_id && Number(street_id) > 0 ? Number(street_id) : null,
                street_other || null,
                address_house || null,
                address_street || null,
                id_type || null,
                id_image_url,
                civil_status || null,
                nationality || "Filipino",
            ],
        );

        return res.status(201).json({
            message:
                "Account created successfully. Your registration is under review. Please come back in 1–3 business days.",
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
        // Check if account exists at all (any status)
        const result = await pool.query(
            "SELECT * FROM residents WHERE email = $1",
            [email],
        );

        if (result.rows.length === 0) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        const resident = result.rows[0];

        // Block pending_verification accounts with a clear message
        if (resident.status === "pending_verification") {
            return res.status(403).json({
                message:
                    "Your account is still under review. Please come back in 1–3 business days once the barangay has verified your ID.",
            });
        }

        // Block inactive accounts
        if (resident.status === "inactive") {
            return res.status(403).json({
                message:
                    "Your account has been deactivated. Please contact the barangay office.",
            });
        }

        if (resident.status !== "active") {
            return res.status(403).json({
                message:
                    "Your account is not active. Please contact the barangay office.",
            });
        }

        const match = await bcrypt.compare(password, resident.password_hash);

        if (!match) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        await createAuditLog({
            actorId: resident.resident_id,
            actorName: resident.full_name,
            actorRole: "resident",
            actionType: "login",
            targetTable: "residents",
            targetId: resident.resident_id,
            description: `Successful login to CertiFast resident portal`,
            ipAddress: req.ip,
        });

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
        return res.status(400).json({
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

        await createAuditLog({
            actorId: resident_id,
            actorName:
                req.resident?.full_name || req.resident?.email || "Resident",
            actorRole: "resident",
            actionType: "password",
            targetTable: "residents",
            targetId: resident_id,
            description: `Resident changed their password`,
            ipAddress: req.ip,
        });

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

        await createAuditLog({
            actorId: admin.admin_id,
            actorName: admin.username,
            actorRole: admin.role,
            actionType: "login",
            targetTable: "admin_accounts",
            targetId: admin.admin_id,
            description: `Successful login to CertiFast admin panel`,
            ipAddress: req.ip,
        });

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
                username: admin.username,
                role: admin.role,
            },
        });
    } catch (err) {
        console.error("adminLogin error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

// GET /api/address-options
// → { puroks: [{purok_id, name},...], streets: [{street_id, name},...] }
async function getAddressOptions(req, res) {
    try {
        const puroks = await pool.query(
            "SELECT purok_id, name FROM puroks WHERE is_active = true ORDER BY sort_order",
        );
        const streets = await pool.query(
            "SELECT street_id, name FROM streets WHERE is_active = true ORDER BY sort_order",
        );

        return res.json({
            puroks: puroks.rows,
            streets: streets.rows,
        });
    } catch (err) {
        console.error("getAddressOptions error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    residentRegister,
    residentLogin,
    residentChangePassword,
    adminLogin,
    getAddressOptions,
};
