const pool = require('../config/db');

const createWalkInRequest = async (req, res) => {
	const {
		template_id = null,
		walkin_name,
		walkin_address,
		purpose = null,
		status = 'pending',
		remarks = null,
	} = req.body || {};

	if (!walkin_name || !walkin_address) {
		return res.status(400).json({ ok: false, message: 'walkin_name and walkin_address are required' });
	}

	try {
		const { rows } = await pool.query(
			`INSERT INTO requests (template_id, source, walkin_name, walkin_address, purpose, status, remarks)
			 VALUES ($1, 'walk-in', $2, $3, $4, $5, $6)
			 RETURNING request_id, template_id, source, walkin_name, walkin_address, purpose, status, remarks, requested_at`,
			[template_id, walkin_name, walkin_address, purpose, status, remarks]
		);

		return res.status(201).json({ ok: true, message: 'Walk-in request created', data: rows[0] });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Failed to create walk-in request', error: error.message });
	}
};

const getWalkInRequests = async (req, res) => {
	try {
		const { rows } = await pool.query(
			`SELECT request_id, template_id, source, walkin_name, walkin_address, purpose, status, remarks, requested_at, released_at
			 FROM requests
			 WHERE source = 'walk-in'
			 ORDER BY requested_at DESC, request_id DESC`
		);

		return res.status(200).json({ ok: true, count: rows.length, data: rows });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Failed to fetch walk-in requests', error: error.message });
	}
};

module.exports = {
	createWalkInRequest,
	getWalkInRequests,
};
