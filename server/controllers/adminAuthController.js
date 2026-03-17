const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'certifast-dev-secret';

const loginAdmin = async (req, res) => {
	const { username, password } = req.body || {};

	if (!username || !password) {
		return res.status(400).json({ ok: false, message: 'Username and password are required' });
	}

	try {
		const { rows } = await pool.query(
			`SELECT admin_id, full_name, username, password_hash, role, is_active
			 FROM admin_accounts
			 WHERE username = $1
			 LIMIT 1`,
			[username]
		);

		if (rows.length === 0) {
			return res.status(401).json({ ok: false, message: 'Invalid credentials' });
		}

		const admin = rows[0];
		if (!admin.is_active) {
			return res.status(403).json({ ok: false, message: 'Account is inactive' });
		}

		const isMatch = await bcrypt.compare(password, admin.password_hash);
		if (!isMatch) {
			return res.status(401).json({ ok: false, message: 'Invalid credentials' });
		}

		const token = jwt.sign(
			{ adminId: admin.admin_id, role: admin.role, actorType: 'admin' },
			JWT_SECRET,
			{ expiresIn: '8h' }
		);

		return res.status(200).json({
			ok: true,
			token,
			data: {
				admin_id: admin.admin_id,
				full_name: admin.full_name,
				username: admin.username,
				role: admin.role,
			},
		});
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Admin login failed', error: error.message });
	}
};

module.exports = {
	loginAdmin,
};
