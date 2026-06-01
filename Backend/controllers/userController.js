const db = require('../database');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
        const { search, plan, role, page = 1, limit = 20 } = req.query;
        let sql = 'SELECT id,name,email,mobile,country,role,membership_plan,membership_expiry,is_active,created_at FROM users WHERE 1=1';
        const params = [];
        if (search) { sql += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        if (plan) { sql += ' AND membership_plan=?'; params.push(plan); }
        if (role) { sql += ' AND role=?'; params.push(role); }
        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        const users = await db.allAsync(sql, params);
        const total = await db.getAsync('SELECT COUNT(*) as cnt FROM users');
        res.json({ users, total: total.cnt, page: parseInt(page), limit: parseInt(limit) });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await db.getAsync(
            'SELECT id,name,email,mobile,country,profile_photo,role,membership_plan,membership_expiry,is_active,created_at FROM users WHERE id=?',
            [req.params.id]
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, role, membership_plan, mobile, country } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });
        const existing = await db.getAsync('SELECT id FROM users WHERE email=?', [email]);
        if (existing) return res.status(400).json({ message: 'Email already exists' });
        const hash = await bcrypt.hash(password, 10);
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        const result = await db.runAsync(
            `INSERT INTO users (name,email,password,mobile,country,role,membership_plan,membership_expiry,email_verified,is_active)
             VALUES (?,?,?,?,?,?,?,?,1,1)`,
            [name, email, hash, mobile || null, country || null, role || 'user', membership_plan || 'free', expiry.toISOString()]
        );
        const user = await db.getAsync('SELECT id,name,email,role,membership_plan FROM users WHERE id=?', [result.lastID]);
        res.status(201).json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, mobile, country, role, membership_plan, is_active } = req.body;
        const sets = [];
        const vals = [];
        if (name !== undefined) { sets.push('name=?'); vals.push(name); }
        if (email !== undefined) { sets.push('email=?'); vals.push(email); }
        if (mobile !== undefined) { sets.push('mobile=?'); vals.push(mobile); }
        if (country !== undefined) { sets.push('country=?'); vals.push(country); }
        if (role !== undefined) { sets.push('role=?'); vals.push(role); }
        if (membership_plan !== undefined) {
            sets.push('membership_plan=?'); vals.push(membership_plan);
            const plan = await db.getAsync('SELECT duration_months FROM membership_plans WHERE name=?', [
                membership_plan.charAt(0).toUpperCase() + membership_plan.slice(1)
            ]);
            if (plan) {
                const expiry = new Date();
                expiry.setMonth(expiry.getMonth() + plan.duration_months);
                sets.push('membership_expiry=?'); vals.push(expiry.toISOString());
            }
        }
        if (is_active !== undefined) { sets.push('is_active=?'); vals.push(is_active); }
        sets.push("updated_at=datetime('now')");
        vals.push(req.params.id);
        await db.runAsync(`UPDATE users SET ${sets.join(',')} WHERE id=?`, vals);
        const user = await db.getAsync('SELECT id,name,email,mobile,country,role,membership_plan,membership_expiry,is_active FROM users WHERE id=?', [req.params.id]);
        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
        await db.runAsync('DELETE FROM users WHERE id=?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const { new_password } = req.body;
        if (!new_password) return res.status(400).json({ message: 'new_password required' });
        const hash = await bcrypt.hash(new_password, 10);
        await db.runAsync('UPDATE users SET password=? WHERE id=?', [hash, req.params.id]);
        res.json({ message: 'Password reset successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getStats = async (req, res) => {
    try {
        const totalUsers = await db.getAsync("SELECT COUNT(*) as cnt FROM users WHERE role='user'");
        const activeUsers = await db.getAsync("SELECT COUNT(*) as cnt FROM users WHERE role='user' AND is_active=1");
        const premiumUsers = await db.getAsync("SELECT COUNT(*) as cnt FROM users WHERE membership_plan IN ('premium','platinum')");
        const freeUsers = await db.getAsync("SELECT COUNT(*) as cnt FROM users WHERE membership_plan='free'");
        const totalPredictions = await db.getAsync('SELECT COUNT(*) as cnt FROM predictions');
        const totalMatches = await db.getAsync('SELECT COUNT(*) as cnt FROM horoscope_matches');
        const totalMembers = await db.getAsync('SELECT COUNT(*) as cnt FROM family_members');
        const totalRevenue = await db.getAsync("SELECT COALESCE(SUM(amount),0) as total FROM subscriptions WHERE status='completed'");
        const recentUsers = await db.allAsync(
            "SELECT id,name,email,membership_plan,created_at FROM users WHERE role='user' ORDER BY created_at DESC LIMIT 5"
        );
        const planDistribution = await db.allAsync(
            "SELECT membership_plan, COUNT(*) as count FROM users WHERE role='user' GROUP BY membership_plan"
        );
        res.json({
            totalUsers: totalUsers.cnt,
            activeUsers: activeUsers.cnt,
            premiumUsers: premiumUsers.cnt,
            freeUsers: freeUsers.cnt,
            totalPredictions: totalPredictions.cnt,
            totalMatches: totalMatches.cnt,
            totalMembers: totalMembers.cnt,
            totalRevenue: totalRevenue.total,
            recentUsers,
            planDistribution,
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, resetUserPassword, getStats };
