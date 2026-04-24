const db = require('../config/db');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    const { role } = req.body;
    try {
        await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    const { name, email, dob } = req.body;
    try {
        await db.execute(
            'UPDATE users SET name = ?, email = ?, dob = ? WHERE id = ?',
            [name, email, dob, req.user.id]
        );
        const [updatedUser] = await db.execute('SELECT id, name, email, role, dob FROM users WHERE id = ?', [req.user.id]);
        res.json(updatedUser[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUsers, updateUserRole, updateProfile };
