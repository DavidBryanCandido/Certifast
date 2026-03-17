const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'certifast-dev-secret';

function residentAuthMiddleware(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

	if (!token) {
		return res.status(401).json({ ok: false, message: 'Missing resident token' });
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		if (!payload.residentId) {
			return res.status(401).json({ ok: false, message: 'Invalid resident token' });
		}

		req.resident = {
			residentId: payload.residentId,
		};
		return next();
	} catch (error) {
		return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
	}
}

module.exports = residentAuthMiddleware;
