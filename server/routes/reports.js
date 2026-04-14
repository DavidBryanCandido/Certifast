// certifast/routes/reports.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/authMiddleware");
const {
	getOverview,
	getRecentExports,
	logExport,
} = require("../controllers/reportsController");

router.get("/overview", adminAuth, getOverview);
router.get("/exports", adminAuth, getRecentExports);
router.post("/exports", adminAuth, logExport);

module.exports = router;
