const express = require("express");
const router = express.Router();
const { residentChangePassword } = require("../controllers/authController");
const {
    getProfile,
    updateProfile,
    createRequest,
    getMyRequests,
} = require("../controllers/residentController");
const { residentAuth } = require("../middleware/authMiddleware");

router.get("/profile", residentAuth, getProfile);
router.put("/profile", residentAuth, updateProfile);
router.get("/requests", residentAuth, getMyRequests);
router.post("/requests", residentAuth, createRequest);
router.put("/change-password", residentAuth, residentChangePassword);

module.exports = router;
