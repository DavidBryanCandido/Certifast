const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'certifast-dev-secret';

const registerResident = async (req, res) => {
	const { full_name, email, password, address = null, contact_number = null } = req.body || {};

	if (!full_name || !email || !password) {
		return res.status(400).json({ ok: false, message: 'Full name, email, and password are required' });
	}

	try {
		const existing = await pool.query('SELECT resident_id FROM residents WHERE email = $1 LIMIT 1', [email]);
		if (existing.rows.length > 0) {
			return res.status(409).json({ ok: false, message: 'Email is already registered' });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const { rows } = await pool.query(
			`INSERT INTO residents (full_name, email, password_hash, address, contact_number)
			 VALUES ($1, $2, $3, $4, $5)
			 RETURNING resident_id, full_name, email, address, contact_number, is_verified, created_at`,
			[full_name, email, passwordHash, address, contact_number]
		);

		return res.status(201).json({ ok: true, message: 'Resident registered', data: rows[0] });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Resident registration failed', error: error.message });
	}
};

const loginResident = async (req, res) => {
	const { email, password } = req.body || {};

	if (!email || !password) {
		return res.status(400).json({ ok: false, message: 'Email and password are required' });
	}

	try {
		const { rows } = await pool.query(
			`SELECT resident_id, full_name, email, password_hash, address, is_verified
			 FROM residents
			 WHERE email = $1
			 LIMIT 1`,
			[email]
		);

		if (rows.length === 0) {
			return res.status(401).json({ ok: false, message: 'Invalid credentials' });
		}

		const resident = rows[0];
		const isMatch = await bcrypt.compare(password, resident.password_hash);
		if (!isMatch) {
			return res.status(401).json({ ok: false, message: 'Invalid credentials' });
		}

		const token = jwt.sign(
			{ residentId: resident.resident_id, actorType: 'resident' },
			JWT_SECRET,
			{ expiresIn: '8h' }
		);

		return res.status(200).json({
			ok: true,
			token,
			data: {
				resident_id: resident.resident_id,
				full_name: resident.full_name,
				email: resident.email,
				address: resident.address,
				is_verified: resident.is_verified,
			},
		});
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Resident login failed', error: error.message });
	}
};

module.exports = {
	registerResident,
	loginResident,
};
