const db = require('../database');

const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ message: 'name, email, message required' });
        await db.runAsync(
            'INSERT INTO contacts (name,email,subject,message) VALUES (?,?,?,?)',
            [name, email, subject || 'General Inquiry', message]
        );
        res.json({ message: 'Message sent successfully! We will get back to you soon.' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getContacts = async (req, res) => {
    try {
        const contacts = await db.allAsync('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(contacts);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await db.runAsync('UPDATE contacts SET status=? WHERE id=?', [status, req.params.id]);
        res.json({ message: 'Status updated' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { submitContact, getContacts, updateContactStatus };
