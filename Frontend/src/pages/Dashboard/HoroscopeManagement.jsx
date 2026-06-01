import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Download, X, Save, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getHoroscopesApi, createHoroscopeApi, updateHoroscopeApi, deleteHoroscopeApi, getMembersApi } from '../../services/api';

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ZODIAC_EMOJI = { Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓' };

const empty = { member_id: '', name: '', gender: '', birth_date: '', birth_time: '', birth_place: '', zodiac_sign: '' };

export default function HoroscopeManagement() {
    const [horoscopes, setHoroscopes] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [pdfFile, setPdfFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = () => {
        getHoroscopesApi().then(r => setHoroscopes(r.data)).catch(() => {});
        getMembersApi().then(r => setMembers(r.data)).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm(empty); setPdfFile(null); setError(''); setShowModal(true); };
    const openEdit = (h) => {
        setEditing(h);
        setForm({ member_id: h.member_id, name: h.name || '', gender: h.gender || '', birth_date: h.birth_date || '', birth_time: h.birth_time || '', birth_place: h.birth_place || '', zodiac_sign: h.zodiac_sign || '' });
        setPdfFile(null); setError(''); setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.member_id) { setError('Please select a family member'); return; }
        setSaving(true); setError('');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
            if (pdfFile) fd.append('horoscope_pdf', pdfFile);
            if (editing) await updateHoroscopeApi(editing.id, fd);
            else await createHoroscopeApi(fd);
            setShowModal(false);
            load();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to save horoscope');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this horoscope?')) return;
        await deleteHoroscopeApi(id).catch(() => {});
        load();
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Horoscope Management</h1>
                        <p className="text-white/50 text-sm mt-1">Upload and manage horoscope data</p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 transition-all text-sm font-medium">
                        <Plus size={16} /> Add Horoscope
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading...</div>
                ) : horoscopes.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="mb-3">No horoscopes added yet.</p>
                        <button onClick={openAdd} className="text-gold/70 hover:text-gold text-sm">Add your first horoscope →</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {horoscopes.map(h => (
                            <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism rounded-2xl p-5 border border-white/10 hover:border-gold/20 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                                            <span className="text-2xl">{ZODIAC_EMOJI[h.zodiac_sign] || '📜'}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{h.member_name || h.name}</p>
                                            <p className="text-xs text-white/40">{h.zodiac_sign || 'Unknown sign'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-all"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(h.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="space-y-1 text-xs text-white/50 mb-4">
                                    {h.birth_date && <p>Birth Date: <span className="text-white/70">{h.birth_date}</span></p>}
                                    {h.birth_time && <p>Birth Time: <span className="text-white/70">{h.birth_time}</span></p>}
                                    {h.birth_place && <p>Birth Place: <span className="text-white/70">{h.birth_place}</span></p>}
                                </div>
                                {h.horoscope_pdf && (
                                    <a href={`http://localhost:5000${h.horoscope_pdf}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-gold/70 hover:text-gold transition-colors">
                                        <Download size={12} /> Download Horoscope PDF
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                <AnimatePresence>
                    {showModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                                className="bg-mystic-dark border border-white/10 rounded-2xl p-6 w-full max-w-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">{editing ? 'Edit Horoscope' : 'Add Horoscope'}</h2>
                                    <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                                </div>
                                {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Family Member *</label>
                                        <select value={form.member_id} onChange={e => {
                                            const m = members.find(m => m.id == e.target.value);
                                            setForm({ ...form, member_id: e.target.value, name: m?.name || '', gender: m?.gender || '', birth_date: m?.date_of_birth || '', birth_time: m?.time_of_birth || '', birth_place: m?.birth_place || '', zodiac_sign: m?.zodiac_sign || '' });
                                        }} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white">
                                            <option value="">Select member</option>
                                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Birth Date</label>
                                            <input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1">Birth Time</label>
                                            <input type="time" value={form.birth_time} onChange={e => setForm({ ...form, birth_time: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Birth Place</label>
                                        <input type="text" value={form.birth_place} onChange={e => setForm({ ...form, birth_place: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Zodiac Sign</label>
                                        <select value={form.zodiac_sign} onChange={e => setForm({ ...form, zodiac_sign: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white">
                                            <option value="">Select sign</option>
                                            {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{ZODIAC_EMOJI[s]} {s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Upload Horoscope PDF</label>
                                        <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])}
                                            className="w-full text-sm text-white/60 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gold/20 file:text-gold file:text-xs cursor-pointer" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 hover:text-white text-sm transition-all">Cancel</button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="flex-1 py-2.5 rounded-xl bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
