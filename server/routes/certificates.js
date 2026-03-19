const express = require("express");
const router = express.Router();
const { getTemplates } = require("../controllers/templateController");

// Public route — no auth needed to view cert types
router.get("/templates", getTemplates);

module.exports = router;
