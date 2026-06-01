const db = require('../database');

const DAILY_TEMPLATES = {
    love: [
        'Venus shines favorably on your relationships today. Open your heart to meaningful connections.',
        'The moon\'s position suggests a day of emotional clarity in love matters. Express your feelings openly.',
        'A chance encounter may spark a new romantic interest. Stay open to unexpected connections.',
        'Your existing relationships deepen today as mutual understanding grows between you and your partner.',
    ],
    career: [
        'Jupiter\'s influence brings professional opportunities. Take initiative on pending projects.',
        'A challenging day at work, but your determination will see you through. Focus on priorities.',
        'Collaboration is key today. Your colleagues will prove invaluable in achieving your goals.',
        'New career prospects emerge on the horizon. Your skills are being noticed by the right people.',
    ],
    finance: [
        'Mercury favors financial planning today. Review your budget and consider long-term investments.',
        'Avoid impulsive purchases today. The stars suggest patience before major financial decisions.',
        'An unexpected financial opportunity may present itself. Evaluate carefully before acting.',
        'Your financial acumen is sharp today. Trust your instincts when it comes to money matters.',
    ],
    health: [
        'Prioritize rest and hydration today. Your body needs recovery time to maintain peak performance.',
        'Physical activity will boost your energy and mood significantly today. Even a short walk helps.',
        'Pay attention to your mental health today. Meditation or quiet reflection will be beneficial.',
        'Your vitality is high today. Channel this energy into activities that nourish your wellbeing.',
    ],
    education: [
        'Mercury enhances your learning capacity today. Tackle complex subjects with renewed focus.',
        'A great day for studying and absorbing new information. Your memory retention is excellent.',
        'Seek guidance from mentors or teachers today. Their wisdom will accelerate your progress.',
        'Creative thinking flourishes today. Approach academic challenges from new angles.',
    ],
};

const MONTHLY_TEMPLATES = {
    overview: [
        'This month brings transformative energy and opportunities for personal growth.',
        'A period of consolidation and reflection. Use this time to strengthen your foundations.',
        'Dynamic energies this month push you toward new experiences and challenges.',
    ],
    opportunities: ['Career advancement', 'New relationships', 'Financial gains', 'Educational pursuits', 'Travel opportunities'],
    challenges: ['Communication barriers', 'Financial pressures', 'Health concerns', 'Relationship tensions', 'Work-life balance'],
    lucky_dates: () => {
        const dates = [];
        while (dates.length < 5) {
            const d = Math.floor(Math.random() * 28) + 1;
            if (!dates.includes(d)) dates.push(d);
        }
        return dates.sort((a, b) => a - b).map(String);
    },
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateDaily = (zodiac) => ({
    love: pick(DAILY_TEMPLATES.love),
    career: pick(DAILY_TEMPLATES.career),
    finance: pick(DAILY_TEMPLATES.finance),
    health: pick(DAILY_TEMPLATES.health),
    education: pick(DAILY_TEMPLATES.education),
    ai_summary: `Today the cosmic energies for ${zodiac || 'you'} are ${pick(['highly favorable', 'moderately positive', 'mixed', 'challenging but rewarding'])}. Focus on ${pick(['inner wisdom', 'social connections', 'practical matters', 'creative endeavors'])} and embrace the day\'s opportunities.`,
});

const generateMonthly = (zodiac, month) => ({
    overview: pick(MONTHLY_TEMPLATES.overview),
    opportunities: MONTHLY_TEMPLATES.opportunities.sort(() => 0.5 - Math.random()).slice(0, 3),
    challenges: MONTHLY_TEMPLATES.challenges.sort(() => 0.5 - Math.random()).slice(0, 2),
    lucky_dates: MONTHLY_TEMPLATES.lucky_dates(),
    important_events: [`${zodiac || 'Your sign'} experiences a powerful new moon early in the month`, 'Mid-month brings clarity on long-standing issues', 'End of month favors completion of major projects'],
    ai_summary: `${month} holds ${pick(['abundant', 'significant', 'transformative', 'steady'])} energy for ${zodiac || 'you'}. The planetary alignments support ${pick(['career growth', 'relationship healing', 'financial planning', 'personal development'])} this month.`,
});

const generateYearly = (zodiac, year) => ({
    year_summary: `${year} is a ${pick(['pivotal', 'transformative', 'expansive', 'grounding'])} year for ${zodiac || 'you'}.`,
    career: `Professional growth accelerates as Jupiter transits your career sector. Expect ${pick(['promotions', 'new opportunities', 'skill development', 'recognition'])} by mid-year.`,
    finance: `Financial stability improves through ${pick(['disciplined saving', 'smart investments', 'new income streams', 'debt reduction'])}. Saturn\'s influence brings long-term prosperity.`,
    love: `Relationships ${pick(['deepen significantly', 'undergo positive transformation', 'bring new connections', 'reach new levels of commitment'])} this year.`,
    health: `Focus on ${pick(['preventive care', 'mental wellness', 'physical fitness', 'dietary habits'])} this year. Regular check-ups are advisable around ${pick(['spring', 'summer', 'autumn', 'winter'])}.`,
    personal_growth: `A year of ${pick(['profound self-discovery', 'spiritual awakening', 'intellectual expansion', 'emotional maturity'])}. Embrace changes as they lead to your highest potential.`,
    ai_summary: `${year} promises to be a ${pick(['remarkable', 'challenging yet rewarding', 'transformative', 'breakthrough'])} year for ${zodiac || 'you'}. The grand planetary cycles align to support your evolution.`,
});

const checkLimits = async (userId, type) => {
    const user = await db.getAsync('SELECT membership_plan FROM users WHERE id=?', [userId]);
    const plan = await db.getAsync('SELECT * FROM membership_plans WHERE name=?', [
        user.membership_plan.charAt(0).toUpperCase() + user.membership_plan.slice(1)
    ]);

    if (!plan || plan.max_predictions === -1) return true;

    if (type === 'monthly' || type === 'yearly') {
        const premiumPlans = ['premium', 'platinum'];
        if (!premiumPlans.includes(user.membership_plan)) {
            return { error: `${type.charAt(0).toUpperCase() + type.slice(1)} predictions require Premium or Platinum plan.` };
        }
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const usage = await db.getAsync('SELECT * FROM prediction_usage WHERE user_id=?', [userId]);

    const countField = `${type}_count`;
    const currentCount = (usage && usage.month === monthKey) ? (usage[countField] || 0) : 0;

    if (currentCount >= plan.max_predictions) {
        return { error: `Monthly ${type} prediction limit (${plan.max_predictions}) reached. Please upgrade your plan.` };
    }
    return true;
};

const updateUsage = async (userId, type) => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const field = `${type}_count`;
    const existing = await db.getAsync('SELECT id,month FROM prediction_usage WHERE user_id=?', [userId]);
    if (!existing) {
        await db.runAsync(`INSERT INTO prediction_usage (user_id,month,${field}) VALUES (?,?,1)`, [userId, monthKey]);
    } else if (existing.month !== monthKey) {
        await db.runAsync(`UPDATE prediction_usage SET month=?,daily_count=0,monthly_count=0,yearly_count=0,${field}=1 WHERE user_id=?`, [monthKey, userId]);
    } else {
        await db.runAsync(`UPDATE prediction_usage SET ${field}=${field}+1 WHERE user_id=?`, [userId]);
    }
};

const getPredictions = async (req, res) => {
    try {
        const { type } = req.query;
        let sql = 'SELECT * FROM predictions WHERE user_id=?';
        const params = [req.user.id];
        if (type) { sql += ' AND prediction_type=?'; params.push(type); }
        sql += ' ORDER BY created_at DESC';
        const rows = await db.allAsync(sql, params);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const generatePrediction = async (req, res) => {
    try {
        const { member_id, prediction_type, period_date } = req.body;
        if (!prediction_type) return res.status(400).json({ message: 'prediction_type required (daily/monthly/yearly)' });

        const allowed = ['daily', 'monthly', 'yearly'];
        if (!allowed.includes(prediction_type)) return res.status(400).json({ message: 'Invalid prediction_type' });

        const limitCheck = await checkLimits(req.user.id, prediction_type);
        if (limitCheck !== true) return res.status(403).json({ message: limitCheck.error });

        let zodiac = null;
        if (member_id) {
            const member = await db.getAsync('SELECT zodiac_sign FROM family_members WHERE id=? AND user_id=?', [member_id, req.user.id]);
            if (member) zodiac = member.zodiac_sign;
        }

        const today = new Date().toISOString().split('T')[0];
        const period = period_date || today;

        let data;
        let period_label;
        if (prediction_type === 'daily') {
            data = generateDaily(zodiac);
            period_label = period;
        } else if (prediction_type === 'monthly') {
            const d = new Date(period);
            period_label = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
            data = generateMonthly(zodiac, period_label);
        } else {
            period_label = new Date(period).getFullYear().toString();
            data = generateYearly(zodiac, period_label);
        }

        const result = await db.runAsync(
            `INSERT INTO predictions (user_id,member_id,prediction_type,period,period_date,
             love,career,finance,health,education,overview,opportunities,challenges,lucky_dates,important_events,year_summary,ai_summary)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                req.user.id, member_id || null, prediction_type, period_label, period,
                data.love || null, data.career || null, data.finance || null,
                data.health || null, data.education || null, data.overview || null,
                data.opportunities ? JSON.stringify(data.opportunities) : null,
                data.challenges ? JSON.stringify(data.challenges) : null,
                data.lucky_dates ? JSON.stringify(data.lucky_dates) : null,
                data.important_events ? JSON.stringify(data.important_events) : null,
                data.year_summary || null, data.ai_summary || null,
            ]
        );

        await updateUsage(req.user.id, prediction_type);

        const prediction = await db.getAsync('SELECT * FROM predictions WHERE id=?', [result.lastID]);
        res.status(201).json(prediction);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getUsage = async (req, res) => {
    try {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const usage = await db.getAsync('SELECT * FROM prediction_usage WHERE user_id=?', [req.user.id]);
        const user = await db.getAsync('SELECT membership_plan FROM users WHERE id=?', [req.user.id]);
        const plan = await db.getAsync('SELECT * FROM membership_plans WHERE name=?', [
            user.membership_plan.charAt(0).toUpperCase() + user.membership_plan.slice(1)
        ]);

        const currentUsage = (usage && usage.month === monthKey) ? usage : { daily_count: 0, monthly_count: 0, yearly_count: 0, matching_count: 0 };
        res.json({
            usage: currentUsage,
            limits: plan || {},
            plan: user.membership_plan,
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getPredictions, generatePrediction, getUsage };
