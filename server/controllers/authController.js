// certifast/controllers/authController.js
const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const { createAuditLog } = require("../utils/logger");
const { sendPasswordChangedEmail } = require("../utils/mailer");
const { isSupabaseConnectivityError } = require("../utils/supabaseAuthError");
const {
    ADDRESS_MAPPING_SETUP_MESSAGE,
    isAddressMappingMissingError,
    resolvePurokStreetPair,
} = require("../utils/addressLookup");

// Supabase client — optional at startup so the server can still boot without it.
const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
    supabaseUrl && supabaseServiceRoleKey
        ? createClient(supabaseUrl, supabaseServiceRoleKey)
        : null;

function createPublicAuthClient() {
    const anonKey = process.env.SUPABASE_ANON_KEY;
    return supabaseUrl && anonKey
        ? createClient(supabaseUrl, anonKey, {
              auth: {
                  autoRefreshToken: false,
                  persistSession: false,
                  detectSessionInUrl: false,
              },
          })
        : null;
}

async function sendPasswordChangedEmailAfterUpdate(
    residentEmail,
    residentName,
    changedBy,
) {
    try {
        if (!residentEmail) return;
        await sendPasswordChangedEmail(residentEmail, residentName, changedBy);
    } catch (err) {
        console.error(
            "sendPasswordChangedEmailAfterUpdate error:",
            err.message || err,
        );
    }
}

function parseBoolean(value) {
    return value === true || String(value).toLowerCase() === "true";
}

function calculateAge(dateString) {
    if (!dateString) return null;
    const birth = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age;
}

/** Legacy columns address_house / address_street — mirror structured fields for older reports/UI. */
function legacyAddressFields({ house_no, addressPair }) {
    const address_house = (house_no || "").trim() || null;
    const parts = [];
    if (addressPair?.purok_name) parts.push(addressPair.purok_name);
    if (addressPair?.street_name) parts.push(addressPair.street_name);

    return {
        address_house,
        address_street: parts.length ? parts.join(", ") : null,
    };
}

// POST /api/auth/resident/register
// body: { first_name, middle_name, last_name, full_name, email, password,
//         contact_number, date_of_birth, house_number, purok_id, street_id,
//         address_house, address_street, id_type }
async function residentRegister(req, res) {
    return res.status(410).json({
        message:
            "Direct resident registration endpoint is disabled. Please register through Supabase email verification.",
    });
}

// POST /api/auth/resident/login
// Called after Supabase email verification
async function completeResidentRegistration(req, res) {
    const {
        supabase_uid,
        email,
        first_name,
        middle_name,
        last_name,
        contact_number,
        house_no,
        purok_id,
        street_id,
        date_of_birth,
        civil_status,
        nationality,
        id_type,
        id_image_path,
        is_renter,
        residency_proof_path,
        residency_proof_file_name,
        residency_proof_mime_type,
        residency_proof_file_size,
        agreed_to_terms,
    } = req.body;

    if (!supabase_uid || !email || !first_name || !last_name) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (!parseBoolean(agreed_to_terms)) {
        return res.status(400).json({
            message: "Terms and Conditions agreement is required.",
        });
    }
    const applicantAge = calculateAge(date_of_birth);
    if (applicantAge === null) {
        return res.status(400).json({ message: "Date of birth is required." });
    }
    if (applicantAge < 18) {
        return res
            .status(400)
            .json({
                message:
                    "Applicant must be at least 18 years old. A parent or legal guardian can create an account and request certificates for a minor.",
            });
    }
    if (!supabase) {
        return res.status(500).json({
            message:
                "Supabase is not configured on the server. Please set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
        });
    }

    try {
        const existing = await pool.query(
            "SELECT resident_id FROM residents WHERE email = $1",
            [email],
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Already registered" });
        }

        const full_name = [first_name, middle_name, last_name]
            .map((s) => (s || "").trim())
            .filter(Boolean)
            .join(" ");

        const expectedImagePath = new RegExp(
            `^resident-ids/${supabase_uid}\\.(jpg|jpeg|png|webp)$`,
        );
        const normalizedIdImagePath =
            typeof id_image_path === "string" &&
            expectedImagePath.test(id_image_path)
                ? id_image_path
                : null;
        const { data: idUrlData } = normalizedIdImagePath
            ? supabase.storage
                  .from("certifast-uploads")
                  .getPublicUrl(normalizedIdImagePath)
            : { data: null };
        const id_image_url = idUrlData?.publicUrl || null;
        const renterFlag = parseBoolean(is_renter);
        const expectedProofPath = new RegExp(
            `^resident-proofs/${supabase_uid}\\.(jpg|jpeg|png|webp|pdf)$`,
        );
        const normalizedResidencyProofPath =
            typeof residency_proof_path === "string" &&
            expectedProofPath.test(residency_proof_path)
                ? residency_proof_path
                : null;

        if (renterFlag && !normalizedResidencyProofPath) {
            return res.status(400).json({
                message:
                    "Proof of current East Tapinac residence is required when the ID address is different.",
            });
        }

        const { data: proofUrlData } = normalizedResidencyProofPath
            ? supabase.storage
                  .from("certifast-uploads")
                  .getPublicUrl(normalizedResidencyProofPath)
            : { data: null };
        const residency_proof_url = proofUrlData?.publicUrl || null;
        const proofFileSizeNumber = Number(residency_proof_file_size);
        const normalizedProofFileSize =
            Number.isFinite(proofFileSizeNumber) && proofFileSizeNumber > 0
                ? Math.round(proofFileSizeNumber)
                : null;

        const middleNorm =
            middle_name != null && String(middle_name).trim() !== ""
                ? String(middle_name).trim()
                : null;

        const addressPair = await resolvePurokStreetPair(pool, {
            purokId: purok_id,
            streetId: street_id,
        });
        if (!addressPair.ok) {
            return res
                .status(addressPair.status)
                .json({ message: addressPair.message });
        }

        const { address_house, address_street } = legacyAddressFields({
            house_no,
            addressPair: addressPair.address,
        });

        const result = await pool.query(
            `INSERT INTO residents (
                full_name, first_name, middle_name, last_name,
                email, password_hash,
                contact_number, address_house, address_street,
                date_of_birth, house_number,
                purok_id, street_id, street_other,
                id_type, id_image_url, civil_status, nationality, status,
                is_renter, residency_proof_url, residency_proof_file_name,
                residency_proof_mime_type, residency_proof_file_size,
                agreed_to_terms, terms_agreed_at
            ) VALUES (
                $1, $2, $3, $4,
                $5, $6,
                $7, $8, $9,
                $10, $11,
                $12, $13, $14,
                $15, $16, $17, $18, 'pending_verification',
                $19, $20, $21, $22, $23, TRUE, NOW()
            ) RETURNING resident_id, full_name, email, status`,
            [
                full_name,
                first_name,
                middleNorm,
                last_name,
                email,
                supabase_uid,
                contact_number || null,
                address_house,
                address_street,
                date_of_birth || null,
                house_no || null,
                addressPair.address.purok_id,
                addressPair.address.street_id,
                null,
                id_type || null,
                id_image_url,
                civil_status || null,
                nationality || "Filipino",
                renterFlag,
                residency_proof_url,
                residency_proof_file_name || null,
                residency_proof_mime_type || null,
                normalizedProofFileSize,
            ],
        );

        return res.status(201).json({
            message: "Registration complete",
            resident: result.rows[0],
        });
    } catch (err) {
        console.error("completeResidentRegistration error:", err);
        if (isAddressMappingMissingError(err)) {
            return res.status(503).json({
                message: ADDRESS_MAPPING_SETUP_MESSAGE,
            });
        }
        if (err.code === "42703") {
            return res.status(503).json({
                message:
                    "Resident proof columns are missing. Run database/resident_registration_residency_proofs.sql in Supabase, then try again.",
            });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

// Verifies Supabase token and checks resident status
async function residentLoginWithSupabase(req, res) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    if (!supabase) {
        return res.status(500).json({
            message:
                "Supabase is not configured on the server. Please set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
        });
    }

    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);
        if (error || !user) {
            if (isSupabaseConnectivityError(error)) {
                console.error("Supabase resident login verification failed:", error);
                return res.status(503).json({
                    message:
                        "The server could not verify your login with Supabase. Please restart the API server and try again.",
                });
            }
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const result = await pool.query("SELECT * FROM residents WHERE email = $1", [
            user.email,
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Account not found. Please complete registration.",
            });
        }

        const resident = result.rows[0];
        if (resident.status === "pending_verification") {
            return res.status(403).json({
                code: "pending_verification",
                message:
                    "Your account verification is still in progress. Please wait for the barangay office to finish reviewing your registration.",
            });
        }
        if (resident.status !== "active") {
            const rejectionComment =
                String(resident.rejection_comment || "").trim() || null;
            return res.status(403).json({
                code: rejectionComment ? "rejected" : "inactive",
                message: rejectionComment
                    ? "Your resident account registration was not activated."
                    : "Your account is not active. Please contact the barangay office.",
                rejection_comment: rejectionComment,
            });
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

        return res.json({
            token,
            resident: {
                id: resident.resident_id,
                full_name: resident.full_name,
                email: resident.email,
            },
        });
    } catch (err) {
        console.error("residentLoginWithSupabase error:", err);
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
            "SELECT password_hash, email, full_name FROM residents WHERE resident_id = $1",
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

        await sendPasswordChangedEmailAfterUpdate(
            resident.email,
            resident.full_name,
            "resident",
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
// body: { email, password }
async function adminLogin(req, res) {
    const loginIdentifier = String(
        req.body?.email || req.body?.username || "",
    )
        .trim()
        .toLowerCase();
    const password = String(req.body?.password || "");

    if (!loginIdentifier || !password) {
        return res
            .status(400)
            .json({ message: "Email and password are required" });
    }

    try {
        const result = await pool.query(
            `SELECT *
             FROM admin_accounts
             WHERE status = $2
               AND (LOWER(email) = $1 OR LOWER(username) = $1)
             ORDER BY CASE WHEN LOWER(email) = $1 THEN 0 ELSE 1 END
             LIMIT 1`,
            [loginIdentifier, "active"],
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const admin = result.rows[0];

        if (admin.supabase_auth_id) {
            const publicAuth = createPublicAuthClient();
            if (!publicAuth) {
                return res.status(503).json({
                    message:
                        "Supabase Auth is not fully configured on the server.",
                });
            }

            const { data: authData, error: authError } =
                await publicAuth.auth.signInWithPassword({
                    email: admin.email,
                    password,
                });

            if (authError) {
                const authMessage = String(authError.message || "");
                if (/email not confirmed|email.*confirm/i.test(authMessage)) {
                    return res.status(403).json({
                        message:
                            "Please verify your email before signing in. Check your inbox for the Supabase confirmation link.",
                    });
                }
                return res.status(401).json({ message: "Invalid credentials" });
            }

            if (
                !authData?.user?.id ||
                authData.user.id !== admin.supabase_auth_id
            ) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            // Legacy accounts created before Supabase email verification remain
            // usable so the existing superadmin is not locked out.
            const match = await bcrypt.compare(password, admin.password_hash);
            if (!match) {
                return res
                    .status(401)
                    .json({ message: "Invalid credentials" });
            }
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
                email: admin.email,
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
                email: admin.email,
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
        const [puroks, streets, streetMappings] = await Promise.all([
            pool.query(
                "SELECT purok_id, name FROM puroks WHERE is_active = true ORDER BY sort_order",
            ),
            pool.query(
                "SELECT street_id, name FROM streets WHERE is_active = true ORDER BY sort_order",
            ),
            pool.query(
                `SELECT ps.purok_id,
                        p.name AS purok_name,
                        ps.street_id,
                        s.name AS street_name
                 FROM purok_streets ps
                 JOIN puroks p ON p.purok_id = ps.purok_id
                 JOIN streets s ON s.street_id = ps.street_id
                 WHERE ps.is_active = TRUE
                   AND p.is_active = TRUE
                   AND s.is_active = TRUE
                 ORDER BY p.sort_order, ps.sort_order, s.sort_order, s.name`,
            ),
        ]);

        return res.json({
            puroks: puroks.rows,
            streets: streets.rows,
            streetMappings: streetMappings.rows,
        });
    } catch (err) {
        console.error("getAddressOptions error:", err);
        if (isAddressMappingMissingError(err)) {
            return res.status(503).json({
                message: ADDRESS_MAPPING_SETUP_MESSAGE,
            });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    residentRegister,
    residentLoginWithSupabase,
    completeResidentRegistration,
    residentChangePassword,
    adminLogin,
    getAddressOptions,
};
