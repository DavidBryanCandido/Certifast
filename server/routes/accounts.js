const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/authMiddleware");
const {
    getAccounts,
    createAccount,
    updateAccount,
    resetAccountPassword,
    deactivateAccount,
} = require("../controllers/adminController");

router.get("/", adminAuth, getAccounts);
router.post("/", adminAuth, createAccount);
router.put("/:id", adminAuth, updateAccount);
router.put("/:id/password", adminAuth, resetAccountPassword);
router.delete("/:id", adminAuth, deactivateAccount);

module.exports = router;
