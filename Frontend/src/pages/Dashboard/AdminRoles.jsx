import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    KeyRound, Plus, Trash2, Edit2, Shield, Users, Check,
    X, Search, ChevronDown, ChevronUp, Save, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
    getRolesApi, createRoleApi, updateRoleApi, deleteRoleApi,
    getPermissionsApi, getRolePermissionsApi, setRolePermissionsApi,
    getUsersWithRolesApi, assignUserRoleApi,
} from '../../services/api';

const MODULE_LABELS = {
    dashboard: 'Dashboard',
    users: 'Users',
    plans: 'Plans',
    horoscopes: 'Horoscopes',
    notifications: 'Notifications',
    articles: 'Articles',
    contacts: 'Contacts',
    roles: 'Roles',
};

const ACTION_COLORS = {
    read: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    create: 'bg-green-500/20 text-green-400 border-green-500/30',
    edit: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    delete: 'bg-red-500/20 text-red-400 border-red-500/30',
    send: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    manage: 'bg-gold/20 text-gold border-gold/30',
    view: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function AdminRoles() {
    const [tab, setTab] = useState('roles');
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [userTotal, setUserTotal] = useState(0);
    const [userSearch, setUserSearch] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Role create/edit modal
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState({ name: '', display_name: '', description: '' });

    // Permission editing
    const [expandedRole, setExpandedRole] = useState(null);
    const [rolePerms, setRolePerms] = useState({}); // { roleId: Set of permissionIds }
    const [savingPerms, setSavingPerms] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (tab === 'users') fetchUsers();
    }, [tab, userSearch, userPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([getRolesApi(), getPermissionsApi()]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (e) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await getUsersWithRolesApi({ search: userSearch, page: userPage, limit: 15 });
            setUsers(res.data.users);
            setUserTotal(res.data.total);
        } catch (e) {}
    };

    const loadRolePermissions = async (roleId) => {
        if (rolePerms[roleId]) return;
        try {
            const res = await getRolePermissionsApi(roleId);
            setRolePerms(prev => ({
                ...prev,
                [roleId]: new Set(res.data.permissions.map(p => p.id)),
            }));
        } catch (e) {}
    };

    const toggleExpand = async (roleId) => {
        if (expandedRole === roleId) {
            setExpandedRole(null);
        } else {
            setExpandedRole(roleId);
            await loadRolePermissions(roleId);
        }
    };

    const togglePermission = (roleId, permId) => {
        setRolePerms(prev => {
            const current = new Set(prev[roleId] || []);
            if (current.has(permId)) current.delete(permId);
            else current.add(permId);
            return { ...prev, [roleId]: current };
        });
    };

    const savePermissions = async (roleId) => {
        setSavingPerms(roleId);
        try {
            const ids = Array.from(rolePerms[roleId] || []);
            await setRolePermissionsApi(roleId, { permission_ids: ids });
            await fetchData();
        } catch (e) {
            setError('Failed to save permissions');
        } finally {
            setSavingPerms(null);
        }
    };

    const openCreateRole = () => {
        setEditingRole(null);
        setRoleForm({ name: '', display_name: '', description: '' });
        setShowRoleModal(true);
    };

    const openEditRole = (role) => {
        setEditingRole(role);
        setRoleForm({ name: role.name, display_name: role.display_name, description: role.description || '' });
        setShowRoleModal(true);
    };

    const submitRole = async () => {
        try {
            if (editingRole) {
                await updateRoleApi(editingRole.id, { display_name: roleForm.display_name, description: roleForm.description });
            } else {
                await createRoleApi(roleForm);
            }
            setShowRoleModal(false);
            await fetchData();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to save role');
        }
    };

    const handleDeleteRole = async (role) => {
        if (!confirm(`Delete role "${role.display_name}"? Users assigned to this role will lose their permissions.`)) return;
        try {
            await deleteRoleApi(role.id);
            await fetchData();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to delete role');
        }
    };

    const handleAssignRole = async (userId, roleId) => {
        try {
            await assignUserRoleApi(userId, { custom_role_id: roleId || null });
            await fetchUsers();
        } catch (e) {
            setError('Failed to assign role');
        }
    };

    // Group permissions by module
    const groupedPerms = permissions.reduce((acc, p) => {
        if (!acc[p.module]) acc[p.module] = [];
        acc[p.module].push(p);
        return acc;
    }, {});

    const totalPages = Math.ceil(userTotal / 15);

    return (
        <DashboardLayout isAdmin>
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                        <KeyRound size={20} className="text-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-outfit text-white">Role Management</h1>
                        <p className="text-white/50 text-sm">Manage roles, permissions, and user access</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
                        <AlertCircle size={16} />
                        <span className="text-sm">{error}</span>
                        <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
                    {[
                        { key: 'roles', label: 'Roles & Permissions', icon: Shield },
                        { key: 'users', label: 'Assign Users', icon: Users },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${tab === t.key ? 'bg-gold/20 text-gold border border-gold/30' : 'text-white/60 hover:text-white'}`}>
                            <t.icon size={15} />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Roles & Permissions Tab */}
                {tab === 'roles' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={openCreateRole}
                                className="flex items-center gap-2 bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold px-4 py-2 rounded-xl text-sm font-medium transition-all">
                                <Plus size={16} />
                                New Role
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                            </div>
                        ) : (
                            roles.map(role => (
                                <motion.div key={role.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Shield size={18} className="text-gold" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">{role.display_name}</h3>
                                                {role.is_system === 1 && (
                                                    <span className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full">System</span>
                                                )}
                                            </div>
                                            <p className="text-white/50 text-sm truncate">{role.description || role.name}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-white/50">
                                            <span className="flex items-center gap-1"><KeyRound size={13} /> {role.permission_count}</span>
                                            <span className="flex items-center gap-1"><Users size={13} /> {role.user_count}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEditRole(role)}
                                                className="p-2 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-all">
                                                <Edit2 size={15} />
                                            </button>
                                            {!role.is_system && (
                                                <button onClick={() => handleDeleteRole(role)}
                                                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                            <button onClick={() => toggleExpand(role.id)}
                                                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                                {expandedRole === role.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Permission Editor */}
                                    {expandedRole === role.id && (
                                        <div className="border-t border-white/10 p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-medium text-white/70">Permissions</h4>
                                                <button onClick={() => savePermissions(role.id)}
                                                    disabled={savingPerms === role.id}
                                                    className="flex items-center gap-1.5 bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50">
                                                    {savingPerms === role.id ? (
                                                        <div className="w-3 h-3 border border-gold/50 border-t-gold rounded-full animate-spin" />
                                                    ) : <Save size={12} />}
                                                    Save
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {Object.entries(groupedPerms).map(([module, perms]) => (
                                                    <div key={module}>
                                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                                                            {MODULE_LABELS[module] || module}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {perms.map(perm => {
                                                                const active = rolePerms[role.id]?.has(perm.id);
                                                                return (
                                                                    <button key={perm.id}
                                                                        onClick={() => togglePermission(role.id, perm.id)}
                                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                                                                            ${active ? ACTION_COLORS[perm.action] || 'bg-gold/20 text-gold border-gold/30'
                                                                                : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'}`}>
                                                                        {active ? <Check size={11} /> : <Plus size={11} />}
                                                                        {perm.action}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Assign Users Tab */}
                {tab === 'users' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                value={userSearch}
                                onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                                placeholder="Search users by name or email..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50"
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                                        <th className="text-left px-4 py-3">User</th>
                                        <th className="text-left px-4 py-3">Base Role</th>
                                        <th className="text-left px-4 py-3">Assigned Role</th>
                                        <th className="text-left px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-white">{u.name}</p>
                                                <p className="text-white/40 text-xs">{u.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full border capitalize
                                                    ${u.role === 'super_admin' ? 'bg-gold/20 text-gold border-gold/30'
                                                    : u.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                    : 'bg-white/10 text-white/50 border-white/10'}`}>
                                                    {u.role === 'super_admin' ? 'Super Admin' : u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {u.custom_role_name
                                                    ? <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-full">{u.custom_role_name}</span>
                                                    : <span className="text-xs text-white/30">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(u.role === 'admin' || u.role === 'super_admin') ? (
                                                    <span className="text-xs text-white/30">Full access</span>
                                                ) : (
                                                    <select
                                                        value={u.custom_role_id || ''}
                                                        onChange={e => handleAssignRole(u.id, e.target.value ? Number(e.target.value) : null)}
                                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-gold/50">
                                                        <option value="">No custom role</option>
                                                        {roles.map(r => (
                                                            <option key={r.id} value={r.id}>{r.display_name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center text-white/30">No users found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30 text-sm transition-all">
                                    Prev
                                </button>
                                <span className="text-white/50 text-sm">{userPage} / {totalPages}</span>
                                <button onClick={() => setUserPage(p => Math.min(totalPages, p + 1))} disabled={userPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30 text-sm transition-all">
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Role Create/Edit Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-mystic-dark border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-white">
                                {editingRole ? 'Edit Role' : 'Create Role'}
                            </h2>
                            <button onClick={() => setShowRoleModal(false)} className="text-white/40 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {!editingRole && (
                                <div>
                                    <label className="block text-xs text-white/50 mb-1.5">Role Name (slug)</label>
                                    <input value={roleForm.name} onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. content_manager"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-white/50 mb-1.5">Display Name</label>
                                <input value={roleForm.display_name} onChange={e => setRoleForm(f => ({ ...f, display_name: e.target.value }))}
                                    placeholder="e.g. Content Manager"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50" />
                            </div>
                            <div>
                                <label className="block text-xs text-white/50 mb-1.5">Description</label>
                                <textarea value={roleForm.description} onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="What can this role do?"
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 resize-none" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRoleModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
                                Cancel
                            </button>
                            <button onClick={submitRole}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold text-sm font-medium transition-all">
                                {editingRole ? 'Save Changes' : 'Create Role'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
