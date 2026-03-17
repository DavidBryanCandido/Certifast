const pool = require('../config/db');

const getAllRequests = async (req, res) => {
	try {
		const { rows } = await pool.query(
			`SELECT
				request_id,
				resident_id,
				template_id,
				processed_by,
				request_code,
				purpose,
				source,
				walkin_name,
				walkin_address,
				status,
				remarks,
				requested_at,
				released_at
			FROM requests
			ORDER BY requested_at DESC, request_id DESC`
		);

		return res.status(200).json({
			ok: true,
			count: rows.length,
			data: rows,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Failed to fetch requests',
			error: error.message,
		});
	}
};

const getRequestById = async (req, res) => {
	const requestId = Number(req.params.id);

	if (!Number.isInteger(requestId) || requestId <= 0) {
		return res.status(400).json({
			ok: false,
			message: 'Invalid request id',
		});
	}

	try {
		const { rows } = await pool.query(
			`SELECT
				request_id,
				resident_id,
				template_id,
				processed_by,
				request_code,
				purpose,
				source,
				walkin_name,
				walkin_address,
				status,
				remarks,
				requested_at,
				released_at
			FROM requests
			WHERE request_id = $1
			LIMIT 1`,
			[requestId]
		);

		if (rows.length === 0) {
			return res.status(404).json({
				ok: false,
				message: 'Request not found',
			});
		}

		return res.status(200).json({
			ok: true,
			data: rows[0],
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Failed to fetch request',
			error: error.message,
		});
	}
};

const createRequest = async (req, res) => {
	const {
		resident_id = null,
		template_id = null,
		processed_by = null,
		request_code = null,
		purpose = null,
		source = null,
		walkin_name = null,
		walkin_address = null,
		status = 'pending',
		remarks = null,
		released_at = null,
	} = req.body || {};

	try {
		const { rows } = await pool.query(
			`INSERT INTO requests (
				resident_id,
				template_id,
				processed_by,
				request_code,
				purpose,
				source,
				walkin_name,
				walkin_address,
				status,
				remarks,
				released_at
			)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
			RETURNING
				request_id,
				resident_id,
				template_id,
				processed_by,
				request_code,
				purpose,
				source,
				walkin_name,
				walkin_address,
				status,
				remarks,
				requested_at,
				released_at`,
			[
				resident_id,
				template_id,
				processed_by,
				request_code,
				purpose,
				source,
				walkin_name,
				walkin_address,
				status,
				remarks,
				released_at,
			]
		);

		return res.status(201).json({
			ok: true,
			message: 'Request created successfully',
			data: rows[0],
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Failed to create request',
			error: error.message,
		});
	}
};

module.exports = {
	getAllRequests,
	getRequestById,
	createRequest,
};
