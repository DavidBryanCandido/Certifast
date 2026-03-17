const express = require('express');

const { registerResident, loginResident } = require('../controllers/residentAuthController');

const router = express.Router();

router.post('/register', registerResident);
router.post('/login', loginResident);

module.exports = router;
