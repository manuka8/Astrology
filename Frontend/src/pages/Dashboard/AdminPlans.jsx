import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Check } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getAdminPlansApi, createPlanApi, updatePlanApi, deletePlanApi } from '../../services/api';

const empty = { name: '', price: '', duration_months: 12, max_members: 3, max_matching: 1, max_predictions: 3, features: '', is_active: 1 };

export default function AdminPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const load = () => getAdminPlansApi().then(r => setPlans(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm(empty); setMsg(''); setShowModal(true); };
    const openEdit = (p) => {
        setEditing(p);
        setForm({ name: p.name, price: p.price, duration_months: p.duration_months, max_members: p.max_members, max_matching: p.max_matching, max_predictions: p.max_predictions, features: p.features?.join('\n') || '', is_active: p.is_active });
        setMsg(''); setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true); setMsg('');
        try {
            const payload = { ...form, price: parseFloat(form.price), features: form.features.split('\n').filter(Boolean) };
            if (editing) await updatePlanApi(editing.id, payload);
            else await createPlanApi(payload);
            setShowModal(false);
            load();
        } catch (e) {
            setMsg(e.response?.data?.message || 'Error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout isAdmin>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Membership Plans</h1>
                        <p className="text-white/50 text-sm mt-1">Manage subscription plans and pricing</p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all">
                        <Plus size={16} /> Add Plan
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {plans.map(p => (
                            <div key={p.id} className={`glass-morphism rounded-2xl p-6 border ${p.is_active ? 'border-white/10' : 'border-red-400/20 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{p.name}</h3>
                                        <p className="text-gold text-xl font-bold mt-1">{p.price === 0 ? 'Free' : `LKR ${p.price.toLocaleString()}`}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-all"><Edit2 size={13} /></button>
                                        <button onClick={() => { if (confirm('Delete plan?')) deletePlanApi(p.id).then(load).catch(() => {}); }}
                                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button>
                                    </div>
                                </div>
                                <div className="text-xs text-white/50 space-y-1 mb-4">
                                    <p>Duration: {p.duration_months} months</p>
                                    <p>Members: {p.max_members === -1 ? 'Unlimited' : p.max_members}</p>
                                    <p>Matching: {p.max_matching === -1 ? 'Unlimited' : `${p.max_matching}/month`}</p>
                                    <p>Predictions: {p.max_predictions === -1 ? 'Unlimited' : `${p.max_predictions}/month`}</p>
                                </div>
                                <ul className="space-y-1">
                                    {p.features?.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                            <Check size={10} className="text-gold mt-0.5 flex-shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'}`}>
                                        {p.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-mystic-dark border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold">{editing ? 'Edit Plan' : 'Add Plan'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                            </div>
                            {msg && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{msg}</div>}
                            <div className="space-y-3">
                                {[{ key: 'name', label: 'Plan Name' }, { key: 'price', label: 'Price (LKR)', type: 'number' }, { key: 'duration_months', label: 'Duration (months)', type: 'number' }, { key: 'max_members', label: 'Max Members (-1 = unlimited)', type: 'number' }, { key: 'max_matching', label: 'Max Matching/month (-1 = unlimited)', type: 'number' }, { key: 'max_predictions', label: 'Max Predictions/month (-1 = unlimited)', type: 'number' }].map(({ key, label, type }) => (
                                    <div key={key}>
                                        <label className="block text-xs text-white/50 mb-1">{label}</label>
                                        <input type={type || 'text'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">Features (one per line)</label>
                                    <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">Status</label>
                                    <select value={form.is_active} onChange={e => setForm({ ...form, is_active: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40">
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 text-sm">Cancel</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
