const express = require('express');

const { createWalkInRequest, getWalkInRequests } = require('../controllers/walkInController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.get('/', adminAuthMiddleware, getWalkInRequests);
router.post('/', adminAuthMiddleware, createWalkInRequest);

module.exports = router;
