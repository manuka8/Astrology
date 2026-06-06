const db = require('../database');

// GET /api/roles
const getRoles = async (req, res) => {
    try {
        const roles = await db.allAsync(`
            SELECT r.*, COUNT(DISTINCT rp.permission_id) as permission_count,
                   COUNT(DISTINCT u.id) as user_count
            FROM roles r
            LEFT JOIN role_permissions rp ON rp.role_id = r.id
            LEFT JOIN users u ON u.custom_role_id = r.id
            GROUP BY r.id
            ORDER BY r.is_system DESC, r.created_at ASC
        `);
        res.json(roles);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// POST /api/roles
const createRole = async (req, res) => {
    try {
        const { name, display_name, description } = req.body;
        if (!name || !display_name) return res.status(400).json({ message: 'name and display_name are required' });

        const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const exists = await db.getAsync('SELECT id FROM roles WHERE name=?', [slug]);
        if (exists) return res.status(400).json({ message: 'Role with this name already exists' });

        const result = await db.runAsync(
            'INSERT INTO roles (name, display_name, description, is_system) VALUES (?,?,?,0)',
            [slug, display_name, description || null]
        );
        const role = await db.getAsync('SELECT * FROM roles WHERE id=?', [result.lastID]);
        res.status(201).json(role);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// PUT /api/roles/:id
const updateRole = async (req, res) => {
    try {
        const { display_name, description } = req.body;
        const role = await db.getAsync('SELECT * FROM roles WHERE id=?', [req.params.id]);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        await db.runAsync(
            'UPDATE roles SET display_name=?, description=? WHERE id=?',
            [display_name || role.display_name, description !== undefined ? description : role.description, role.id]
        );
        const updated = await db.getAsync('SELECT * FROM roles WHERE id=?', [role.id]);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// DELETE /api/roles/:id
const deleteRole = async (req, res) => {
    try {
        const role = await db.getAsync('SELECT * FROM roles WHERE id=?', [req.params.id]);
        if (!role) return res.status(404).json({ message: 'Role not found' });
        if (role.is_system) return res.status(400).json({ message: 'Cannot delete system roles' });

        await db.runAsync('UPDATE users SET custom_role_id=NULL WHERE custom_role_id=?', [role.id]);
        await db.runAsync('DELETE FROM roles WHERE id=?', [role.id]);
        res.json({ message: 'Role deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// GET /api/permissions
const getPermissions = async (req, res) => {
    try {
        const permissions = await db.allAsync('SELECT * FROM permissions ORDER BY module, action');
        res.json(permissions);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// GET /api/roles/:id/permissions
const getRolePermissions = async (req, res) => {
    try {
        const role = await db.getAsync('SELECT * FROM roles WHERE id=?', [req.params.id]);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        const permissions = await db.allAsync(
            `SELECT p.* FROM permissions p
             JOIN role_permissions rp ON rp.permission_id = p.id
             WHERE rp.role_id = ?`,
            [role.id]
        );
        res.json({ role, permissions });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// PUT /api/roles/:id/permissions
const setRolePermissions = async (req, res) => {
    try {
        const { permission_ids } = req.body;
        const role = await db.getAsync('SELECT * FROM roles WHERE id=?', [req.params.id]);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        await db.runAsync('DELETE FROM role_permissions WHERE role_id=?', [role.id]);
        if (Array.isArray(permission_ids) && permission_ids.length > 0) {
            for (const pid of permission_ids) {
                await db.runAsync('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)', [role.id, pid]);
            }
        }
        res.json({ message: 'Permissions updated' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// PUT /api/roles/assign-user/:userId
const assignUserRole = async (req, res) => {
    try {
        const { custom_role_id } = req.body;
        const user = await db.getAsync('SELECT id, role FROM users WHERE id=?', [req.params.userId]);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (custom_role_id) {
            const role = await db.getAsync('SELECT id FROM roles WHERE id=?', [custom_role_id]);
            if (!role) return res.status(404).json({ message: 'Role not found' });
        }

        await db.runAsync('UPDATE users SET custom_role_id=? WHERE id=?', [custom_role_id || null, user.id]);
        res.json({ message: 'User role updated' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// GET /api/roles/users  — list users with their roles for the management UI
const getUsersWithRoles = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const like = `%${search}%`;

        const users = await db.allAsync(
            `SELECT u.id, u.name, u.email, u.role, u.custom_role_id, u.is_active,
                    r.display_name as custom_role_name
             FROM users u
             LEFT JOIN roles r ON r.id = u.custom_role_id
             WHERE (u.name LIKE ? OR u.email LIKE ?)
             ORDER BY u.created_at DESC
             LIMIT ? OFFSET ?`,
            [like, like, Number(limit), Number(offset)]
        );

        const total = await db.getAsync(
            'SELECT COUNT(*) as count FROM users WHERE (name LIKE ? OR email LIKE ?)',
            [like, like]
        );

        res.json({ users, total: total.count });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getRoles, createRole, updateRole, deleteRole, getPermissions, getRolePermissions, setRolePermissions, assignUserRole, getUsersWithRoles };
