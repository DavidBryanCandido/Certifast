const express = require("express");
const router = express.Router();

const { residentAuth } = require("../middleware/authMiddleware");
const {
    getResidentProfile,
    updateResidentProfile,
    getResidentRequests,
    createResidentRequest,
} = require("../controllers/residentController");

router.get("/requests", residentAuth, getResidentRequests);
router.post("/requests", residentAuth, createResidentRequest);

router.get("/profile", residentAuth, getResidentProfile);
router.put("/profile", residentAuth, updateResidentProfile);

module.exports = router;
