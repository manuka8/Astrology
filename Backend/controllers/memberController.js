const db = require('../database');

const ZODIAC = [
    { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
];

const getZodiac = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    for (const z of ZODIAC) {
        const [sm, sd] = z.start;
        const [em, ed] = z.end;
        if ((m === sm && day >= sd) || (m === em && day <= ed)) return z.sign;
    }
    return null;
};

const getPlanLimits = async (userId) => {
    const user = await db.getAsync('SELECT membership_plan, membership_expiry FROM users WHERE id=?', [userId]);
    const plan = await db.getAsync('SELECT * FROM membership_plans WHERE name=? AND is_active=1', [
        user.membership_plan.charAt(0).toUpperCase() + user.membership_plan.slice(1)
    ]);
    return plan || { max_members: 3 };
};

const getMembers = async (req, res) => {
    try {
        const members = await db.allAsync(
            'SELECT * FROM family_members WHERE user_id=? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(members);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getMember = async (req, res) => {
    try {
        const member = await db.getAsync(
            'SELECT * FROM family_members WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]
        );
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.json(member);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const createMember = async (req, res) => {
    try {
        const { name, gender, date_of_birth, time_of_birth, birth_place, relationship } = req.body;
        if (!name) return res.status(400).json({ message: 'Member name is required' });

        const plan = await getPlanLimits(req.user.id);
        if (plan.max_members !== -1) {
            const count = await db.getAsync(
                'SELECT COUNT(*) as cnt FROM family_members WHERE user_id=?',
                [req.user.id]
            );
            if (count.cnt >= plan.max_members)
                return res.status(403).json({ message: `Your plan allows max ${plan.max_members} family members. Please upgrade.` });
        }

        const zodiac_sign = getZodiac(date_of_birth);
        const profile_photo = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        const result = await db.runAsync(
            `INSERT INTO family_members (user_id,name,gender,date_of_birth,time_of_birth,birth_place,relationship,profile_photo,zodiac_sign)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [req.user.id, name, gender, date_of_birth, time_of_birth, birth_place, relationship, profile_photo, zodiac_sign]
        );
        const member = await db.getAsync('SELECT * FROM family_members WHERE id=?', [result.lastID]);
        res.status(201).json(member);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateMember = async (req, res) => {
    try {
        const existing = await db.getAsync(
            'SELECT id FROM family_members WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]
        );
        if (!existing) return res.status(404).json({ message: 'Member not found' });

        const { name, gender, date_of_birth, time_of_birth, birth_place, relationship } = req.body;
        const profile_photo = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;
        const zodiac_sign = date_of_birth ? getZodiac(date_of_birth) : undefined;

        const sets = [];
        const vals = [];
        if (name) { sets.push('name=?'); vals.push(name); }
        if (gender) { sets.push('gender=?'); vals.push(gender); }
        if (date_of_birth) { sets.push('date_of_birth=?'); vals.push(date_of_birth); }
        if (time_of_birth) { sets.push('time_of_birth=?'); vals.push(time_of_birth); }
        if (birth_place) { sets.push('birth_place=?'); vals.push(birth_place); }
        if (relationship) { sets.push('relationship=?'); vals.push(relationship); }
        if (profile_photo) { sets.push('profile_photo=?'); vals.push(profile_photo); }
        if (zodiac_sign) { sets.push('zodiac_sign=?'); vals.push(zodiac_sign); }
        sets.push("updated_at=datetime('now')");
        vals.push(req.params.id);

        await db.runAsync(`UPDATE family_members SET ${sets.join(',')} WHERE id=?`, vals);
        const member = await db.getAsync('SELECT * FROM family_members WHERE id=?', [req.params.id]);
        res.json(member);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const deleteMember = async (req, res) => {
    try {
        const existing = await db.getAsync(
            'SELECT id FROM family_members WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]
        );
        if (!existing) return res.status(404).json({ message: 'Member not found' });
        await db.runAsync('DELETE FROM family_members WHERE id=?', [req.params.id]);
        res.json({ message: 'Member deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const uploadHoroscope = async (req, res) => {
    try {
        const member = await db.getAsync(
            'SELECT id FROM family_members WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]
        );
        if (!member) return res.status(404).json({ message: 'Member not found' });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const pdf_path = `/uploads/horoscopes/${req.file.filename}`;
        await db.runAsync('UPDATE family_members SET horoscope_pdf=? WHERE id=?', [pdf_path, req.params.id]);
        res.json({ message: 'Horoscope PDF uploaded', path: pdf_path });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getMembers, getMember, createMember, updateMember, deleteMember, uploadHoroscope };
