import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, UserCircle, X, Save } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getMembersApi, createMemberApi, updateMemberApi, deleteMemberApi, uploadMemberHoroscopeApi } from '../../services/api';
import { serverUrl } from '../../config/server';

const RELATIONSHIPS = ['Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'];
const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ZODIAC_EMOJI = { Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓' };

const empty = { name: '', gender: '', date_of_birth: '', time_of_birth: '', birth_place: '', relationship: '', zodiac_sign: '' };

export default function MyMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [photoFile, setPhotoFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [uploadingPdf, setUploadingPdf] = useState(null);

    const load = () => getMembersApi().then(r => setMembers(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm(empty); setPhotoFile(null); setPdfFile(null); setError(''); setShowModal(true); };
    const openEdit = (m) => { setEditing(m); setForm({ name: m.name, gender: m.gender || '', date_of_birth: m.date_of_birth || '', time_of_birth: m.time_of_birth || '', birth_place: m.birth_place || '', relationship: m.relationship || '', zodiac_sign: m.zodiac_sign || '' }); setPhotoFile(null); setError(''); setShowModal(true); };

    const handleSave = async () => {
        if (!form.name) { setError('Name is required'); return; }
        setSaving(true); setError('');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
            if (photoFile) fd.append('profile_photo', photoFile);
            if (editing) await updateMemberApi(editing.id, fd);
            else await createMemberApi(fd);
            setShowModal(false);
            load();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to save member');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this member?')) return;
        await deleteMemberApi(id).catch(() => {});
        load();
    };

    const handlePdfUpload = async (memberId, file) => {
        setUploadingPdf(memberId);
        const fd = new FormData();
        fd.append('horoscope_pdf', file);
        await uploadMemberHoroscopeApi(memberId, fd).catch(() => {});
        setUploadingPdf(null);
        load();
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">My Members</h1>
                        <p className="text-white/50 text-sm mt-1">Manage your family members</p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 transition-all text-sm font-medium">
                        <Plus size={16} /> Add Member
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading...</div>
                ) : members.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <UserCircle size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="mb-3">No family members yet.</p>
                        <button onClick={openAdd} className="text-gold/70 hover:text-gold text-sm">Add your first member →</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {members.map(m => (
                            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism rounded-2xl p-5 border border-white/10 hover:border-gold/20 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center overflow-hidden">
                                            {m.profile_photo
                                                ? <img src={serverUrl(m.profile_photo)} alt="" className="w-full h-full object-cover" />
                                                : <span className="text-xl">{ZODIAC_EMOJI[m.zodiac_sign] || '👤'}</span>}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{m.name}</p>
                                            <p className="text-xs text-white/40">{m.relationship || 'Family Member'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-all">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1 text-xs text-white/50 mb-4">
                                    {m.zodiac_sign && <p>Zodiac: <span className="text-white/70">{ZODIAC_EMOJI[m.zodiac_sign]} {m.zodiac_sign}</span></p>}
                                    {m.date_of_birth && <p>DOB: <span className="text-white/70">{m.date_of_birth}</span></p>}
                                    {m.birth_place && <p>Birth Place: <span className="text-white/70">{m.birth_place}</span></p>}
                                    {m.gender && <p>Gender: <span className="text-white/70 capitalize">{m.gender}</span></p>}
                                </div>
                                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                                    {m.horoscope_pdf
                                        ? <a href={serverUrl(m.horoscope_pdf)} target="_blank" rel="noopener noreferrer" className="text-xs text-gold/70 hover:text-gold flex items-center gap-1">
                                            <Upload size={12} /> View PDF
                                          </a>
                                        : <span className="text-xs text-white/30">No horoscope PDF</span>
                                    }
                                    <label className="cursor-pointer">
                                        <input type="file" accept=".pdf" className="hidden" onChange={e => handlePdfUpload(m.id, e.target.files[0])} />
                                        <span className={`text-xs flex items-center gap-1 transition-all ${uploadingPdf === m.id ? 'text-yellow-400' : 'text-white/40 hover:text-white/70'}`}>
                                            <Upload size={12} /> {uploadingPdf === m.id ? 'Uploading...' : 'Upload PDF'}
                                        </span>
                                    </label>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-mystic-dark border border-white/10 rounded-2xl p-6 w-full max-w-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">{editing ? 'Edit Member' : 'Add Member'}</h2>
                                    <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                                </div>
                                {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { field: 'name', label: 'Full Name *', type: 'text', col: 2 },
                                        { field: 'date_of_birth', label: 'Date of Birth', type: 'date' },
                                        { field: 'time_of_birth', label: 'Time of Birth', type: 'time' },
                                        { field: 'birth_place', label: 'Birth Place', type: 'text', col: 2 },
                                    ].map(({ field, label, type, col }) => (
                                        <div key={field} className={col === 2 ? 'col-span-2' : ''}>
                                            <label className="block text-xs text-white/50 mb-1">{label}</label>
                                            <input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Gender</label>
                                        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white">
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Relationship</label>
                                        <select value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white">
                                            <option value="">Select</option>
                                            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-white/50 mb-1">Zodiac Sign (auto-detected or manual)</label>
                                        <select value={form.zodiac_sign} onChange={e => setForm({ ...form, zodiac_sign: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/40 text-white">
                                            <option value="">Auto detect from DOB</option>
                                            {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{ZODIAC_EMOJI[s]} {s}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-white/50 mb-1">Profile Photo</label>
                                        <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])}
                                            className="w-full text-sm text-white/60 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gold/20 file:text-gold file:text-xs cursor-pointer" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-sm transition-all">Cancel</button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="flex-1 py-2.5 rounded-xl bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                        <Save size={14} /> {saving ? 'Saving...' : 'Save Member'}
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
