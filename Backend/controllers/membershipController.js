const db = require('../database');

const getPlans = async (req, res) => {
    try {
        const plans = await db.allAsync('SELECT * FROM membership_plans WHERE is_active=1 ORDER BY price ASC');
        res.json(plans.map(p => ({ ...p, features: JSON.parse(p.features || '[]') })));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getAllPlans = async (req, res) => {
    try {
        const plans = await db.allAsync('SELECT * FROM membership_plans ORDER BY price ASC');
        res.json(plans.map(p => ({ ...p, features: JSON.parse(p.features || '[]') })));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const createPlan = async (req, res) => {
    try {
        const { name, price, duration_months, max_members, max_matching, max_predictions, features } = req.body;
        if (!name || price === undefined || !duration_months) return res.status(400).json({ message: 'name, price, duration_months required' });
        const result = await db.runAsync(
            `INSERT INTO membership_plans (name,price,duration_months,max_members,max_matching,max_predictions,features)
             VALUES (?,?,?,?,?,?,?)`,
            [name, price, duration_months, max_members || 3, max_matching || 1, max_predictions || 3,
             JSON.stringify(features || [])]
        );
        const plan = await db.getAsync('SELECT * FROM membership_plans WHERE id=?', [result.lastID]);
        res.status(201).json({ ...plan, features: JSON.parse(plan.features || '[]') });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updatePlan = async (req, res) => {
    try {
        const { name, price, duration_months, max_members, max_matching, max_predictions, features, is_active } = req.body;
        const sets = [];
        const vals = [];
        if (name !== undefined) { sets.push('name=?'); vals.push(name); }
        if (price !== undefined) { sets.push('price=?'); vals.push(price); }
        if (duration_months !== undefined) { sets.push('duration_months=?'); vals.push(duration_months); }
        if (max_members !== undefined) { sets.push('max_members=?'); vals.push(max_members); }
        if (max_matching !== undefined) { sets.push('max_matching=?'); vals.push(max_matching); }
        if (max_predictions !== undefined) { sets.push('max_predictions=?'); vals.push(max_predictions); }
        if (features !== undefined) { sets.push('features=?'); vals.push(JSON.stringify(features)); }
        if (is_active !== undefined) { sets.push('is_active=?'); vals.push(is_active); }
        vals.push(req.params.id);
        await db.runAsync(`UPDATE membership_plans SET ${sets.join(',')} WHERE id=?`, vals);
        const plan = await db.getAsync('SELECT * FROM membership_plans WHERE id=?', [req.params.id]);
        res.json({ ...plan, features: JSON.parse(plan.features || '[]') });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const deletePlan = async (req, res) => {
    try {
        await db.runAsync('DELETE FROM membership_plans WHERE id=?', [req.params.id]);
        res.json({ message: 'Plan deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const subscribe = async (req, res) => {
    try {
        const { plan_id, payment_method, transaction_id } = req.body;
        if (!plan_id) return res.status(400).json({ message: 'plan_id required' });

        const plan = await db.getAsync('SELECT * FROM membership_plans WHERE id=? AND is_active=1', [plan_id]);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const invoice = `INV-${Date.now()}-${req.user.id}`;
        const starts_at = new Date().toISOString();
        const expires_at = new Date();
        expires_at.setMonth(expires_at.getMonth() + plan.duration_months);

        const result = await db.runAsync(
            `INSERT INTO subscriptions (user_id,plan_id,amount,currency,payment_method,transaction_id,status,starts_at,expires_at,invoice_number)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [req.user.id, plan_id, plan.price, 'LKR', payment_method || 'card', transaction_id || `TXN${Date.now()}`,
             'completed', starts_at, expires_at.toISOString(), invoice]
        );

        await db.runAsync(
            'UPDATE users SET membership_plan=?, membership_expiry=? WHERE id=?',
            [plan.name.toLowerCase(), expires_at.toISOString(), req.user.id]
        );

        await db.runAsync(
            `INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`,
            [req.user.id, 'Subscription Activated', `Your ${plan.name} plan is now active until ${expires_at.toLocaleDateString()}.`, 'success']
        );

        const subscription = await db.getAsync('SELECT * FROM subscriptions WHERE id=?', [result.lastID]);
        res.status(201).json({ ...subscription, plan_name: plan.name, invoice_number: invoice });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getSubscriptions = async (req, res) => {
    try {
        const subs = await db.allAsync(
            `SELECT s.*, mp.name as plan_name FROM subscriptions s
             JOIN membership_plans mp ON s.plan_id = mp.id
             WHERE s.user_id=? ORDER BY s.created_at DESC`,
            [req.user.id]
        );
        res.json(subs);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getAllSubscriptions = async (req, res) => {
    try {
        const subs = await db.allAsync(
            `SELECT s.*, mp.name as plan_name, u.name as user_name, u.email as user_email
             FROM subscriptions s
             JOIN membership_plans mp ON s.plan_id = mp.id
             JOIN users u ON s.user_id = u.id
             ORDER BY s.created_at DESC LIMIT 100`
        );
        res.json(subs);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getPlans, getAllPlans, createPlan, updatePlan, deletePlan, subscribe, getSubscriptions, getAllSubscriptions };
