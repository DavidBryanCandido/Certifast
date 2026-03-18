const express = require("express");
const router = express.Router();
const {
    residentRegister,
    residentLogin,
    adminLogin,
} = require("../controllers/authController");

router.post("/resident/register", residentRegister);
router.post("/resident/login", residentLogin);
router.post("/admin/login", adminLogin);

module.exports = router;
