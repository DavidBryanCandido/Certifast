const express = require('express');

const { getAccounts } = require('../controllers/accountController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const superAdminMiddleware = require('../middleware/superAdminMiddleware');

const router = express.Router();

router.get('/', adminAuthMiddleware, superAdminMiddleware, getAccounts);

module.exports = router;
