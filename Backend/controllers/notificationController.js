const db = require('../database');

const getNotifications = async (req, res) => {
    try {
        const notes = await db.allAsync(
            'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        const unread = await db.getAsync('SELECT COUNT(*) as cnt FROM notifications WHERE user_id=? AND is_read=0', [req.user.id]);
        res.json({ notifications: notes, unread_count: unread.cnt });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const markRead = async (req, res) => {
    try {
        if (req.params.id === 'all') {
            await db.runAsync('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
        } else {
            await db.runAsync('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        }
        res.json({ message: 'Marked as read' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const sendBroadcast = async (req, res) => {
    try {
        const { title, message, type, user_ids } = req.body;
        if (!title || !message) return res.status(400).json({ message: 'title and message required' });

        let targets;
        if (user_ids && user_ids.length > 0) {
            targets = user_ids.map(id => ({ id }));
        } else {
            targets = await db.allAsync("SELECT id FROM users WHERE role='user' AND is_active=1");
        }

        for (const u of targets) {
            await db.runAsync(
                'INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)',
                [u.id, title, message, type || 'info']
            );
        }
        res.json({ message: `Notification sent to ${targets.length} users` });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getNotifications, markRead, sendBroadcast };
