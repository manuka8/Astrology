const jwt = require('jsonwebtoken');
const db = require('../database');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'astro_secret_key');
            const user = await db.getAsync(
                'SELECT id, name, email, role, custom_role_id, membership_plan, membership_expiry, is_active FROM users WHERE id = ?',
                [decoded.id]
            );
            if (!user || !user.is_active) {
                return res.status(401).json({ message: 'Account suspended or not found' });
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Requires admin or super_admin role
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// Requires expert role
const isExpert = (req, res, next) => {
    if (req.user && req.user.role === 'expert') {
        next();
    } else {
        res.status(403).json({ message: 'Expert access required' });
    }
};

// Requires super_admin role only
const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ message: 'Super admin access required' });
    }
};

// Permission-based middleware factory
// super_admin and admin bypass permission checks
// Users with custom_role_id must have the permission assigned to their role
const hasPermission = (permissionName) => async (req, res, next) => {
    const { role, custom_role_id } = req.user;

    if (role === 'super_admin') return next();
    if (role === 'admin' && permissionName !== 'roles.manage') return next();

    if (custom_role_id) {
        const perm = await db.getAsync(
            `SELECT rp.permission_id FROM role_permissions rp
             JOIN permissions p ON p.id = rp.permission_id
             WHERE rp.role_id = ? AND p.name = ?`,
            [custom_role_id, permissionName]
        );
        if (perm) return next();
    }

    return res.status(403).json({ message: 'Permission denied' });
};

module.exports = { protect, admin, superAdmin, isExpert, hasPermission };
