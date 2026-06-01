const db = require('../database');

const getHoroscopes = async (req, res) => {
    try {
        const rows = await db.allAsync(
            `SELECT h.*, fm.name as member_name FROM horoscopes h
             JOIN family_members fm ON h.member_id = fm.id
             WHERE h.user_id=? ORDER BY h.created_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getHoroscope = async (req, res) => {
    try {
        const h = await db.getAsync(
            'SELECT * FROM horoscopes WHERE id=? AND user_id=?',
            [req.params.id, req.user.id]
        );
        if (!h) return res.status(404).json({ message: 'Horoscope not found' });
        res.json(h);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const createHoroscope = async (req, res) => {
    try {
        const { member_id, name, gender, birth_date, birth_time, birth_place, zodiac_sign } = req.body;
        if (!member_id) return res.status(400).json({ message: 'member_id is required' });

        const member = await db.getAsync(
            'SELECT id FROM family_members WHERE id=? AND user_id=?',
            [member_id, req.user.id]
        );
        if (!member) return res.status(404).json({ message: 'Family member not found' });

        const horoscope_pdf = req.file ? `/uploads/horoscopes/${req.file.filename}` : null;

        const existing = await db.getAsync('SELECT id FROM horoscopes WHERE member_id=?', [member_id]);
        if (existing) {
            await db.runAsync(
                `UPDATE horoscopes SET name=?,gender=?,birth_date=?,birth_time=?,birth_place=?,zodiac_sign=?,
                 horoscope_pdf=COALESCE(?,horoscope_pdf),updated_at=datetime('now') WHERE member_id=?`,
                [name, gender, birth_date, birth_time, birth_place, zodiac_sign, horoscope_pdf, member_id]
            );
            const updated = await db.getAsync('SELECT * FROM horoscopes WHERE member_id=?', [member_id]);
            return res.json(updated);
        }

        const result = await db.runAsync(
            `INSERT INTO horoscopes (member_id,user_id,name,gender,birth_date,birth_time,birth_place,zodiac_sign,horoscope_pdf)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [member_id, req.user.id, name, gender, birth_date, birth_time, birth_place, zodiac_sign, horoscope_pdf]
        );
        const created = await db.getAsync('SELECT * FROM horoscopes WHERE id=?', [result.lastID]);
        res.status(201).json(created);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateHoroscope = async (req, res) => {
    try {
        const h = await db.getAsync('SELECT * FROM horoscopes WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        if (!h) return res.status(404).json({ message: 'Horoscope not found' });

        const { name, gender, birth_date, birth_time, birth_place, zodiac_sign } = req.body;
        const horoscope_pdf = req.file ? `/uploads/horoscopes/${req.file.filename}` : undefined;

        const sets = [];
        const vals = [];
        if (name) { sets.push('name=?'); vals.push(name); }
        if (gender) { sets.push('gender=?'); vals.push(gender); }
        if (birth_date) { sets.push('birth_date=?'); vals.push(birth_date); }
        if (birth_time) { sets.push('birth_time=?'); vals.push(birth_time); }
        if (birth_place) { sets.push('birth_place=?'); vals.push(birth_place); }
        if (zodiac_sign) { sets.push('zodiac_sign=?'); vals.push(zodiac_sign); }
        if (horoscope_pdf) { sets.push('horoscope_pdf=?'); vals.push(horoscope_pdf); }
        sets.push("updated_at=datetime('now')");
        vals.push(req.params.id);

        await db.runAsync(`UPDATE horoscopes SET ${sets.join(',')} WHERE id=?`, vals);
        const updated = await db.getAsync('SELECT * FROM horoscopes WHERE id=?', [req.params.id]);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const deleteHoroscope = async (req, res) => {
    try {
        const h = await db.getAsync('SELECT id FROM horoscopes WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        if (!h) return res.status(404).json({ message: 'Not found' });
        await db.runAsync('DELETE FROM horoscopes WHERE id=?', [req.params.id]);
        res.json({ message: 'Horoscope deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getHoroscopes, getHoroscope, createHoroscope, updateHoroscope, deleteHoroscope };
