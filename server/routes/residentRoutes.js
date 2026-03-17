const express = require('express');

const { getResidents, getResidentById } = require('../controllers/residentController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.get('/', adminAuthMiddleware, getResidents);
router.get('/:id', adminAuthMiddleware, getResidentById);

module.exports = router;
