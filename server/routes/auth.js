// certifast/routes/auth.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
    residentRegister,
    residentLoginWithSupabase,
    completeResidentRegistration,
    adminLogin,
    getAddressOptions,
} = require("../controllers/authController");

// multer — memory storage, 2 MB limit, images only
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        cb(null, allowed.includes(file.mimetype));
    },
});

router.post("/resident/register", upload.single("id_image"), residentRegister);
router.post("/resident/complete-registration", completeResidentRegistration);
router.post("/resident/login", residentLoginWithSupabase);
router.post("/admin/login", adminLogin);
router.get("/address-options", getAddressOptions);

const PUBLIC_BRANDING_KEYS = [
    "brgy_name",
    "brgy_city",
    "brgy_address",
    "brgy_contact",
    "brgy_email",
    "brgy_logo_url",
    "city_logo_url",
    "office_schedule_line_1_label",
    "office_schedule_line_1_time",
    "office_schedule_line_2_label",
    "office_schedule_line_2_time",
    "office_schedule_line_3_label",
    "office_schedule_line_3_time",
    "system_theme",
];

// Public endpoint for resident-facing branding details
router.get("/public-branding", async (req, res) => {
    try {
        const pool = require("../db/pool");
        const result = await pool.query(
            `SELECT setting_key, setting_value
             FROM barangay_settings
             WHERE setting_key = ANY($1::text[])`,
            [PUBLIC_BRANDING_KEYS],
        );
        const data = {};
        result.rows.forEach((row) => {
            data[row.setting_key] = row.setting_value;
        });

        return res.json({
            logo_url: data.brgy_logo_url || null,
            data,
        });
    } catch {
        return res.json({ logo_url: null, data: {} });
    }
});

module.exports = router;
