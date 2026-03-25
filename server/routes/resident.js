const express = require("express");
const router = express.Router();
const { residentChangePassword } = require("../controllers/authController");
const {
    getProfile,
    updateProfile,
    createRequest,
    getMyRequests,
    getNotifications,
    getUnreadCount,
    markRead,
    markAllRead,
} = require("../controllers/residentController");
const { residentAuth } = require("../middleware/authMiddleware");

router.get("/profile", residentAuth, getProfile);
router.put("/profile", residentAuth, updateProfile);
router.get("/requests", residentAuth, getMyRequests);
router.post("/requests", residentAuth, createRequest);
router.put("/change-password", residentAuth, residentChangePassword);

router.get("/notifications", residentAuth, getNotifications);
router.get("/notifications/unread-count", residentAuth, getUnreadCount);
router.put("/notifications/:id/read", residentAuth, markRead);
router.put("/notifications/read-all", residentAuth, markAllRead);

module.exports = router;
