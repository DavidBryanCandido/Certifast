const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/authMiddleware");
const { getOverview } = require("../controllers/reportsController");

router.get("/overview", adminAuth, getOverview);

module.exports = router;
