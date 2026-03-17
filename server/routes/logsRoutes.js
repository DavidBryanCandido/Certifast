const express = require('express');

const { getLogs, createLog } = require('../controllers/logsController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.get('/', adminAuthMiddleware, getLogs);
router.post('/', adminAuthMiddleware, createLog);

module.exports = router;
