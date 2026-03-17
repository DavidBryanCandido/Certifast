const pool = require('../config/db');

const getAccounts = async (req, res) => {
	try {
		const { rows } = await pool.query(
			`SELECT admin_id, full_name, username, role, is_active, created_by, created_at
			 FROM admin_accounts
			 ORDER BY created_at DESC, admin_id DESC`
		);

		return res.status(200).json({ ok: true, count: rows.length, data: rows });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Failed to fetch accounts', error: error.message });
	}
};

module.exports = {
	getAccounts,
};
