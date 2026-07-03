// certifast/routes/reports.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/authMiddleware");
const {
	getOverview,
	getRecentExports,
	generateReport,
	logExport,
} = require("../controllers/reportsController");

router.get("/overview", adminAuth, getOverview);
router.get("/exports", adminAuth, getRecentExports);
router.post("/generate", adminAuth, generateReport);
router.post("/exports", adminAuth, logExport);

module.exports = router;
