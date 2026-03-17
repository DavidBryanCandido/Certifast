const pool = require('../config/db');

const getLogs = async (req, res) => {
	try {
		const { rows } = await pool.query(
			`SELECT log_id, actor_type, actor_id, action, target_table, target_id, description, ip_address, created_at
			 FROM activity_logs
			 ORDER BY created_at DESC, log_id DESC
			 LIMIT 300`
		);

		return res.status(200).json({ ok: true, count: rows.length, data: rows });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Failed to fetch logs', error: error.message });
	}
};

const createLog = async (req, res) => {
	const {
		actor_type = 'system',
		actor_id = null,
		action,
		target_table = null,
		target_id = null,
		description = null,
		ip_address = null,
	} = req.body || {};

	if (!action) {
		return res.status(400).json({ ok: false, message: 'Action is required' });
	}

	try {
		const { rows } = await pool.query(
			`INSERT INTO activity_logs (actor_type, actor_id, action, target_table, target_id, description, ip_address)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING log_id, actor_type, actor_id, action, target_table, target_id, description, ip_address, created_at`,
			[actor_type, actor_id, action, target_table, target_id, description, ip_address]
		);

		return res.status(201).json({ ok: true, message: 'Log created', data: rows[0] });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Failed to create log', error: error.message });
	}
};

module.exports = {
	getLogs,
	createLog,
};
