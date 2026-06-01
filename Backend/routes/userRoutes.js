const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser, resetUserPassword, getStats } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/stats', getStats);
router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetUserPassword);

module.exports = router;
