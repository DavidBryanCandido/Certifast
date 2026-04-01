// certifast/routes/auth.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
    residentRegister,
    residentLogin,
    adminLogin,
    getAddressOptions,
} = require("../controllers/authController");

// multer — memory storage, 5 MB limit, images only
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        cb(null, allowed.includes(file.mimetype));
    },
});

router.post("/resident/register", upload.single("id_image"), residentRegister);
router.post("/resident/login", residentLogin);
router.post("/admin/login", adminLogin);
router.get("/address-options", getAddressOptions);

module.exports = router;
