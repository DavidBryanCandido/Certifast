// certifast/routes/admin.js
const express = require("express");
const router = express.Router();

const { adminAuth } = require("../middleware/authMiddleware");
const {
    getDashboardStats,
    getRecentRequests,
    approveRequest,
    rejectRequest,
    getCertificateTemplates,
    issueWalkIn,
    getTodayWalkIn,
    getResidentStats,
    getResidents,
    getResidentById,
    getResidentRequests,
    getReportsOverview,
    getAuditStats,
    getAuditLogs,
    getAuditLogById,
    getAccounts,
    createAccount,
    updateAccount,
    resetAccountPassword,
    deactivateAccount,
    getManageRequests,
    markRequestReady,
    releaseRequest,
} = require("../controllers/adminController");

router.get("/dashboard/stats", adminAuth, getDashboardStats);
router.get("/dashboard/recent-requests", adminAuth, getRecentRequests);
router.get("/residents/stats", adminAuth, getResidentStats);
router.get("/residents", adminAuth, getResidents);
router.get("/residents/:id/requests", adminAuth, getResidentRequests);
router.get("/residents/:id", adminAuth, getResidentById);
router.get("/reports/overview", adminAuth, getReportsOverview);
router.get("/logs/stats", adminAuth, getAuditStats);
router.get("/logs/:id", adminAuth, getAuditLogById);
router.get("/logs", adminAuth, getAuditLogs);
router.get("/accounts", adminAuth, getAccounts);
router.post("/accounts", adminAuth, createAccount);
router.put("/accounts/:id", adminAuth, updateAccount);
router.put("/accounts/:id/password", adminAuth, resetAccountPassword);
router.delete("/accounts/:id", adminAuth, deactivateAccount);
router.get("/requests", adminAuth, getManageRequests);
router.post("/requests/:id/approve", adminAuth, approveRequest);
router.post("/requests/:id/reject", adminAuth, rejectRequest);
router.post("/requests/:id/mark-ready", adminAuth, markRequestReady);
router.post("/requests/:id/release", adminAuth, releaseRequest);
router.get("/certificates/templates", adminAuth, getCertificateTemplates);
router.post("/walkin/issue", adminAuth, issueWalkIn);
router.get("/walkin/today", adminAuth, getTodayWalkIn);

module.exports = router;
