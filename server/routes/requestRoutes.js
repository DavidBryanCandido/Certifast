const express = require('express');

const {
	getAllRequests,
	getRequestById,
	createRequest,
} = require('../controllers/requestController');

const router = express.Router();

router.get('/', getAllRequests);
router.get('/:id', getRequestById);
router.post('/', createRequest);

module.exports = router;
