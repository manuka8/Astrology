const express = require('express');
const { getUsers, updateUserRole, updateProfile } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, admin, getUsers);
router.route('/profile').put(protect, updateProfile);
router.route('/:id/role').put(protect, admin, updateUserRole);

module.exports = router;
