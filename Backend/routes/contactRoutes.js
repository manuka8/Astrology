const express = require('express');
const router = express.Router();
const { submitContact, getContacts, updateContactStatus } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', submitContact);
router.get('/', protect, admin, getContacts);
router.put('/:id', protect, admin, updateContactStatus);

module.exports = router;
