const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'certifast-dev-secret';

function adminAuthMiddleware(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

	if (!token) {
		return res.status(401).json({ ok: false, message: 'Missing admin token' });
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		if (!payload.adminId) {
			return res.status(401).json({ ok: false, message: 'Invalid admin token' });
		}

		req.admin = {
			adminId: payload.adminId,
			role: payload.role,
		};
		return next();
	} catch (error) {
		return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
	}
}

module.exports = adminAuthMiddleware;
