const db = require('../database');

const COMPATIBILITY = {
    Aries:       { Aries: 75, Taurus: 60, Gemini: 85, Cancer: 55, Leo: 95, Virgo: 50, Libra: 80, Scorpio: 65, Sagittarius: 90, Capricorn: 55, Aquarius: 75, Pisces: 60 },
    Taurus:      { Aries: 60, Taurus: 85, Gemini: 55, Cancer: 90, Leo: 65, Virgo: 95, Libra: 75, Scorpio: 85, Sagittarius: 50, Capricorn: 90, Aquarius: 55, Pisces: 80 },
    Gemini:      { Aries: 85, Taurus: 55, Gemini: 75, Cancer: 60, Leo: 80, Virgo: 65, Libra: 95, Scorpio: 55, Sagittarius: 85, Capricorn: 50, Aquarius: 90, Pisces: 65 },
    Cancer:      { Aries: 55, Taurus: 90, Gemini: 60, Cancer: 80, Leo: 65, Virgo: 85, Libra: 60, Scorpio: 95, Sagittarius: 50, Capricorn: 75, Aquarius: 50, Pisces: 90 },
    Leo:         { Aries: 95, Taurus: 65, Gemini: 80, Cancer: 65, Leo: 80, Virgo: 60, Libra: 85, Scorpio: 65, Sagittarius: 95, Capricorn: 55, Aquarius: 75, Pisces: 60 },
    Virgo:       { Aries: 50, Taurus: 95, Gemini: 65, Cancer: 85, Leo: 60, Virgo: 70, Libra: 65, Scorpio: 85, Sagittarius: 55, Capricorn: 90, Aquarius: 55, Pisces: 75 },
    Libra:       { Aries: 80, Taurus: 75, Gemini: 95, Cancer: 60, Leo: 85, Virgo: 65, Libra: 75, Scorpio: 65, Sagittarius: 85, Capricorn: 60, Aquarius: 95, Pisces: 65 },
    Scorpio:     { Aries: 65, Taurus: 85, Gemini: 55, Cancer: 95, Leo: 65, Virgo: 85, Libra: 65, Scorpio: 80, Sagittarius: 60, Capricorn: 85, Aquarius: 55, Pisces: 90 },
    Sagittarius: { Aries: 90, Taurus: 50, Gemini: 85, Cancer: 50, Leo: 95, Virgo: 55, Libra: 85, Scorpio: 60, Sagittarius: 80, Capricorn: 55, Aquarius: 85, Pisces: 60 },
    Capricorn:   { Aries: 55, Taurus: 90, Gemini: 50, Cancer: 75, Leo: 55, Virgo: 90, Libra: 60, Scorpio: 85, Sagittarius: 55, Capricorn: 85, Aquarius: 65, Pisces: 80 },
    Aquarius:    { Aries: 75, Taurus: 55, Gemini: 90, Cancer: 50, Leo: 75, Virgo: 55, Libra: 95, Scorpio: 55, Sagittarius: 85, Capricorn: 65, Aquarius: 80, Pisces: 65 },
    Pisces:      { Aries: 60, Taurus: 80, Gemini: 65, Cancer: 90, Leo: 60, Virgo: 75, Libra: 65, Scorpio: 90, Sagittarius: 60, Capricorn: 80, Aquarius: 65, Pisces: 85 },
};

const generateReport = (sign1, sign2, type, score) => {
    const strengths = score >= 80
        ? ['Strong emotional bond', 'Mutual understanding', 'Shared values', 'Natural harmony']
        : score >= 60
        ? ['Compatible communication styles', 'Complementary strengths', 'Growth potential']
        : ['Requires effort to connect', 'Different perspectives', 'Opportunity to learn'];

    const weaknesses = score >= 80
        ? ['May become too comfortable', 'Risk of codependency']
        : score >= 60
        ? ['Occasional misunderstandings', 'Differing priorities', 'Need compromise']
        : ['Fundamental value differences', 'Communication challenges', 'Requires patience'];

    const actions = score >= 80
        ? ['Nurture the connection regularly', 'Maintain open communication', 'Plan shared activities']
        : score >= 60
        ? ['Focus on shared goals', 'Practice active listening', 'Celebrate differences']
        : ['Seek professional guidance', 'Build trust slowly', 'Respect boundaries'];

    const report = `
## ${type.charAt(0).toUpperCase() + type.slice(1)} Compatibility Report

**${sign1} ↔ ${sign2}** — Compatibility Score: **${score}%**

### Overview
${score >= 80 ? 'This is an excellent cosmic match! The celestial energies align beautifully between these two signs.' :
  score >= 60 ? 'This is a good compatibility with potential for a meaningful relationship if both partners are committed.' :
  'This pairing requires conscious effort and understanding. With patience, meaningful connections can still be formed.'}

### Strengths
${strengths.map(s => `- ${s}`).join('\n')}

### Weaknesses
${weaknesses.map(w => `- ${w}`).join('\n')}

### Recommended Actions
${actions.map(a => `- ${a}`).join('\n')}

### Celestial Analysis
The planets governing ${sign1} and ${sign2} create ${score >= 80 ? 'harmonious' : score >= 60 ? 'balanced' : 'challenging'} aspects.
In the realm of ${type}, the cosmic energies suggest ${score >= 75 ? 'a natural flow of energy' : 'a learning journey'}.
    `.trim();

    return { strengths, weaknesses, recommended_actions: actions, detailed_report: report };
};

const getMatches = async (req, res) => {
    try {
        const matches = await db.allAsync(
            `SELECT hm.*, fm1.name as member1_name, fm1.zodiac_sign as sign1,
             fm2.name as member2_name, fm2.zodiac_sign as sign2
             FROM horoscope_matches hm
             JOIN family_members fm1 ON hm.member1_id = fm1.id
             JOIN family_members fm2 ON hm.member2_id = fm2.id
             WHERE hm.user_id=? ORDER BY hm.created_at DESC`,
            [req.user.id]
        );
        res.json(matches);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const createMatch = async (req, res) => {
    try {
        const { member1_id, member2_id, match_type } = req.body;
        if (!member1_id || !member2_id) return res.status(400).json({ message: 'Both member IDs required' });
        if (member1_id === member2_id) return res.status(400).json({ message: 'Cannot match a member with themselves' });

        const user = await db.getAsync('SELECT membership_plan FROM users WHERE id=?', [req.user.id]);
        const plan = await db.getAsync('SELECT * FROM membership_plans WHERE name=?', [
            user.membership_plan.charAt(0).toUpperCase() + user.membership_plan.slice(1)
        ]);

        if (plan && plan.max_matching !== -1) {
            const now = new Date();
            const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const usage = await db.getAsync('SELECT * FROM prediction_usage WHERE user_id=?', [req.user.id]);
            if (usage && usage.month === monthKey && usage.matching_count >= plan.max_matching) {
                return res.status(403).json({ message: `Matching limit reached (${plan.max_matching}/month). Please upgrade your plan.` });
            }
        }

        const m1 = await db.getAsync('SELECT * FROM family_members WHERE id=? AND user_id=?', [member1_id, req.user.id]);
        const m2 = await db.getAsync('SELECT * FROM family_members WHERE id=? AND user_id=?', [member2_id, req.user.id]);
        if (!m1 || !m2) return res.status(404).json({ message: 'One or both members not found' });

        const sign1 = m1.zodiac_sign || 'Aries';
        const sign2 = m2.zodiac_sign || 'Aries';
        const score = COMPATIBILITY[sign1]?.[sign2] ?? 70;
        const { strengths, weaknesses, recommended_actions, detailed_report } = generateReport(sign1, sign2, match_type || 'marriage', score);

        const result = await db.runAsync(
            `INSERT INTO horoscope_matches (user_id,member1_id,member2_id,match_type,compatibility_score,strengths,weaknesses,recommended_actions,detailed_report)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [req.user.id, member1_id, member2_id, match_type || 'marriage', score,
             JSON.stringify(strengths), JSON.stringify(weaknesses), JSON.stringify(recommended_actions), detailed_report]
        );

        // Update usage
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const existing = await db.getAsync('SELECT id,month FROM prediction_usage WHERE user_id=?', [req.user.id]);
        if (!existing) {
            await db.runAsync('INSERT INTO prediction_usage (user_id,month,matching_count) VALUES (?,?,1)', [req.user.id, monthKey]);
        } else if (existing.month !== monthKey) {
            await db.runAsync('UPDATE prediction_usage SET month=?,matching_count=1 WHERE user_id=?', [monthKey, req.user.id]);
        } else {
            await db.runAsync('UPDATE prediction_usage SET matching_count=matching_count+1 WHERE user_id=?', [req.user.id]);
        }

        const match = await db.getAsync('SELECT * FROM horoscope_matches WHERE id=?', [result.lastID]);
        res.status(201).json({ ...match, member1_name: m1.name, member2_name: m2.name, sign1, sign2 });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const deleteMatch = async (req, res) => {
    try {
        const m = await db.getAsync('SELECT id FROM horoscope_matches WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        if (!m) return res.status(404).json({ message: 'Match not found' });
        await db.runAsync('DELETE FROM horoscope_matches WHERE id=?', [req.params.id]);
        res.json({ message: 'Match deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getMatches, createMatch, deleteMatch };
