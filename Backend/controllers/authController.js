const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'astro_secret_key';

const signToken = (user) =>
    jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
    try {
        const { name, email, password, mobile, country } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email and password are required' });

        const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const hash = await bcrypt.hash(password, 10);
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 3);

        const result = await db.runAsync(
            `INSERT INTO users (name, email, password, mobile, country, membership_plan, membership_expiry, email_verified)
             VALUES (?, ?, ?, ?, ?, 'free', ?, 1)`,
            [name, email, hash, mobile || null, country || null, expiry.toISOString()]
        );

        const user = await db.getAsync(
            'SELECT id, name, email, role, membership_plan, membership_expiry FROM users WHERE id = ?',
            [result.lastID]
        );
        res.status(201).json({ message: 'Registration successful', token: signToken(user), user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        if (!user.is_active) return res.status(401).json({ message: 'Account suspended. Contact support.' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const { password: _, ...safeUser } = user;
        res.json({ token: signToken(user), user: safeUser });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await db.getAsync(
            'SELECT id,name,email,mobile,country,profile_photo,role,membership_plan,membership_expiry,created_at FROM users WHERE id=?',
            [req.user.id]
        );
        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, mobile, country } = req.body;
        const profile_photo = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

        const sets = [];
        const vals = [];
        if (name) { sets.push('name=?'); vals.push(name); }
        if (mobile !== undefined) { sets.push('mobile=?'); vals.push(mobile); }
        if (country !== undefined) { sets.push('country=?'); vals.push(country); }
        if (profile_photo) { sets.push('profile_photo=?'); vals.push(profile_photo); }
        sets.push("updated_at=datetime('now')");
        vals.push(req.user.id);

        await db.runAsync(`UPDATE users SET ${sets.join(',')} WHERE id=?`, vals);
        const user = await db.getAsync(
            'SELECT id,name,email,mobile,country,profile_photo,role,membership_plan,membership_expiry FROM users WHERE id=?',
            [req.user.id]
        );
        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const user = await db.getAsync('SELECT * FROM users WHERE id=?', [req.user.id]);
        const match = await bcrypt.compare(current_password, user.password);
        if (!match) return res.status(400).json({ message: 'Current password incorrect' });

        const hash = await bcrypt.hash(new_password, 10);
        await db.runAsync('UPDATE users SET password=? WHERE id=?', [hash, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db.getAsync('SELECT id FROM users WHERE email=?', [email]);
        if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

        const token = Math.random().toString(36).slice(2) + Date.now();
        const expiry = new Date(Date.now() + 3600000).toISOString();
        await db.runAsync('UPDATE users SET reset_token=?, reset_token_expiry=? WHERE id=?', [token, expiry, user.id]);
        res.json({ message: 'Password reset token generated', token });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;
        const user = await db.getAsync(
            "SELECT id FROM users WHERE reset_token=? AND reset_token_expiry > datetime('now')",
            [token]
        );
        if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

        const hash = await bcrypt.hash(new_password, 10);
        await db.runAsync('UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?', [hash, user.id]);
        res.json({ message: 'Password reset successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
