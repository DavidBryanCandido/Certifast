function superAdminMiddleware(req, res, next) {
	if (!req.admin || req.admin.role !== 'superadmin') {
		return res.status(403).json({ ok: false, message: 'Superadmin access required' });
	}

	return next();
}

module.exports = superAdminMiddleware;
