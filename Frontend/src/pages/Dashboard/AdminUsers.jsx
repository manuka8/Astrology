import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, ShieldOff, X, Save, Key } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getUsersApi, updateUserApi, deleteUserApi, createUserApi, resetUserPasswordApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };

const PLANS = ['free', 'premium', 'platinum'];

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [data, setData] = useState({ users: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('edit');
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const load = (params = {}) => {
        setLoading(true);
        getUsersApi({ search, plan: planFilter, ...params }).then(r => setData(r.data)).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, [search, planFilter]);

    const openEdit = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, mobile: u.mobile || '', country: u.country || '', role: u.role, membership_plan: u.membership_plan, is_active: u.is_active }); setModalType('edit'); setMsg(''); setShowModal(true); };
    const openCreate = () => { setSelected(null); setForm({ name: '', email: '', password: '', role: 'user', membership_plan: 'free' }); setModalType('create'); setMsg(''); setShowModal(true); };
    const openReset = (u) => { setSelected(u); setForm({ new_password: '' }); setModalType('reset'); setMsg(''); setShowModal(true); };

    const handleSave = async () => {
        setSaving(true); setMsg('');
        try {
            if (modalType === 'create') { await createUserApi(form); }
            else if (modalType === 'edit') { await updateUserApi(selected.id, form); }
            else if (modalType === 'reset') { await resetUserPasswordApi(selected.id, form); }
            setShowModal(false);
            load();
        } catch (e) {
            setMsg(e.response?.data?.message || 'Error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this user? This cannot be undone.')) return;
        await deleteUserApi(id).catch(() => {});
        load();
    };

    const handleToggleActive = async (u) => {
        await updateUserApi(u.id, { is_active: u.is_active ? 0 : 1 }).catch(() => {});
        load();
    };

    return (
        <DashboardLayout isAdmin>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">User Management</h1>
                        <p className="text-white/50 text-sm mt-1">{data.total} total users</p>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all">
                        <Plus size={16} /> Add User
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                            className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 text-white" />
                    </div>
                    <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white">
                        <option value="">All Plans</option>
                        {PLANS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="glass-morphism rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-xs text-white/40 uppercase">
                                    <th className="text-left px-5 py-3">User</th>
                                    <th className="text-left px-5 py-3">Plan</th>
                                    <th className="text-left px-5 py-3">Role</th>
                                    <th className="text-left px-5 py-3">Status</th>
                                    <th className="text-left px-5 py-3">Joined</th>
                                    <th className="text-left px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-white/30">Loading...</td></tr>
                                ) : data.users.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-white/30">No users found</td></tr>
                                ) : data.users.map(u => (
                                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{u.name}</p>
                                                    <p className="text-xs text-white/40">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${u.membership_plan === 'platinum' ? 'bg-gold/20 border-gold/40 text-gold' : u.membership_plan === 'premium' ? 'bg-blue-400/20 border-blue-400/40 text-blue-400' : 'bg-gray-500/20 border-gray-500/40 text-gray-400'}`}>
                                                {u.membership_plan}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize
                                                ${u.role === 'super_admin' ? 'bg-gold/20 border-gold/40 text-gold'
                                                : u.role === 'admin' ? 'bg-blue-400/20 border-blue-400/40 text-blue-400'
                                                : 'bg-white/10 border-white/20 text-white/50'}`}>
                                                {ROLE_LABELS[u.role] || u.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'}`}>
                                                {u.is_active ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-white/40">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-all"><Edit2 size={13} /></button>
                                                <button onClick={() => handleToggleActive(u)} className={`p-1.5 rounded-lg transition-all ${u.is_active ? 'text-white/40 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10'}`}>
                                                    {u.is_active ? <ShieldOff size={13} /> : <Shield size={13} />}
                                                </button>
                                                <button onClick={() => openReset(u)} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-all"><Key size={13} /></button>
                                                <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-mystic-dark border border-white/10 rounded-2xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold">
                                    {modalType === 'create' ? 'Add User' : modalType === 'reset' ? 'Reset Password' : 'Edit User'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                            </div>
                            {msg && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{msg}</div>}

                            {modalType === 'reset' ? (
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">New Password</label>
                                    <input type="password" value={form.new_password || ''} onChange={e => setForm({ ...form, new_password: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {modalType === 'create' && (
                                        <>
                                            <div><label className="block text-xs text-white/50 mb-1">Password *</label>
                                                <input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" /></div>
                                        </>
                                    )}
                                    {[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'mobile', label: 'Mobile' }, { key: 'country', label: 'Country' }].map(({ key, label, type }) => (
                                        <div key={key}>
                                            <label className="block text-xs text-white/50 mb-1">{label}</label>
                                            <input type={type || 'text'} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Role</label>
                                            <select value={form.role || 'user'} onChange={e => setForm({ ...form, role: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40">
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                {currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Plan</label>
                                            <select value={form.membership_plan || 'free'} onChange={e => setForm({ ...form, membership_plan: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40">
                                                {PLANS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {modalType === 'edit' && (
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Status</label>
                                            <select value={form.is_active ?? 1} onChange={e => setForm({ ...form, is_active: parseInt(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40">
                                                <option value={1}>Active</option>
                                                <option value={0}>Suspended</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 text-sm">Cancel</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
