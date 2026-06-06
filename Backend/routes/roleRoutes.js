const express = require('express');
const router = express.Router();
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');
const {
    getRoles, createRole, updateRole, deleteRole,
    getPermissions, getRolePermissions, setRolePermissions,
    assignUserRole, getUsersWithRoles,
} = require('../controllers/roleController');

router.use(protect);

// Static paths first (must precede /:id to avoid param capture)
router.get('/permissions', admin, getPermissions);
router.get('/users/list', superAdmin, getUsersWithRoles);
router.put('/assign-user/:userId', superAdmin, assignUserRole);

// Role CRUD
router.get('/', admin, getRoles);
router.post('/', superAdmin, createRole);
router.put('/:id', superAdmin, updateRole);
router.delete('/:id', superAdmin, deleteRole);
router.get('/:id/permissions', admin, getRolePermissions);
router.put('/:id/permissions', admin, setRolePermissions);

module.exports = router;
