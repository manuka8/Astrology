const jwt = require('jsonwebtoken');
const db = require('../database');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'astro_secret_key');
            const user = await db.getAsync('SELECT id, name, email, role, membership_plan, membership_expiry, is_active FROM users WHERE id = ?', [decoded.id]);
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

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

module.exports = { protect, admin };
