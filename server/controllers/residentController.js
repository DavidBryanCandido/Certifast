const pool = require('../config/db');

const getResidents = async (req, res) => {
	try {
		const { rows } = await pool.query(
			`SELECT resident_id, full_name, email, address, contact_number, is_verified, created_at
			 FROM residents
			 ORDER BY created_at DESC, resident_id DESC`
		);

		return res.status(200).json({ ok: true, count: rows.length, data: rows });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Failed to fetch residents', error: error.message });
	}
};

const getResidentById = async (req, res) => {
	const residentId = Number(req.params.id);
	if (!Number.isInteger(residentId) || residentId <= 0) {
		return res.status(400).json({ ok: false, message: 'Invalid resident id' });
	}

	try {
		const { rows } = await pool.query(
			`SELECT resident_id, full_name, email, address, contact_number, is_verified, created_at
			 FROM residents
			 WHERE resident_id = $1
			 LIMIT 1`,
			[residentId]
		);

		if (rows.length === 0) {
			return res.status(404).json({ ok: false, message: 'Resident not found' });
		}

		return res.status(200).json({ ok: true, data: rows[0] });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Failed to fetch resident', error: error.message });
	}
};

module.exports = {
	getResidents,
	getResidentById,
};
