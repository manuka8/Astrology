const express = require('express');
const router = express.Router();
const { getNotifications, markRead, sendBroadcast } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getNotifications);
router.put('/:id/read', markRead);
router.post('/broadcast', admin, sendBroadcast);

module.exports = router;
