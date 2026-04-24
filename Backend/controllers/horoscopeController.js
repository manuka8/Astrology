const db = require('../config/db');

// @desc    Create a new horoscope
// @route   POST /api/horoscopes
// @access  Private
const createHoroscope = async (req, res) => {
    const { sign, prediction, type, date } = req.body;
    try {
        await db.execute(
            'INSERT INTO horoscopes (sign, prediction, type, date) VALUES (?, ?, ?, ?)',
            [sign, prediction, type || 'daily', date || new Date().toISOString().split('T')[0]]
        );
        res.status(201).json({ message: 'Horoscope created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all horoscopes
// @route   GET /api/horoscopes
// @access  Public
const getHoroscopes = async (req, res) => {
    try {
        const [horoscopes] = await db.execute('SELECT * FROM horoscopes ORDER BY date DESC');
        res.json(horoscopes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createHoroscope, getHoroscopes };
