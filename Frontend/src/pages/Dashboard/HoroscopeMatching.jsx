import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Trash2, Plus, X, Heart, Briefcase, Users } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getMatchesApi, createMatchApi, deleteMatchApi, getMembersApi } from '../../services/api';

const MATCH_TYPES = [
    { value: 'marriage', label: 'Marriage', icon: Heart },
    { value: 'friendship', label: 'Friendship', icon: Users },
    { value: 'business', label: 'Business', icon: Briefcase },
];

const ScoreCircle = ({ score }) => {
    const color = score >= 80 ? '#D4AF37' : score >= 60 ? '#60a5fa' : '#f87171';
    return (
        <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
                    strokeDasharray={`${score} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color }}>{score}%</span>
            </div>
        </div>
    );
};

export default function HoroscopeMatching() {
    const [matches, setMatches] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ member1_id: '', member2_id: '', match_type: 'marriage' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);

    const load = () => {
        getMatchesApi().then(r => setMatches(r.data)).catch(() => {});
        getMembersApi().then(r => setMembers(r.data)).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        if (!form.member1_id || !form.member2_id) { setError('Select both members'); return; }
        if (form.member1_id === form.member2_id) { setError('Select different members'); return; }
        setCreating(true); setError('');
        try {
            await createMatchApi(form);
            setShowForm(false);
            setForm({ member1_id: '', member2_id: '', match_type: 'marriage' });
            load();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create match');
        } finally {
            setCreating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Horoscope Matching</h1>
                        <p className="text-white/50 text-sm mt-1">Analyze compatibility between family members</p>
                    </div>
                    <button onClick={() => { setShowForm(true); setError(''); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 transition-all text-sm font-medium">
                        <Plus size={16} /> New Match
                    </button>
                </div>

                {/* Match form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="glass-morphism rounded-2xl p-6 border border-gold/20 mb-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">Create New Match</h2>
                                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                            </div>
                            {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                            {members.length < 2 ? (
                                <p className="text-yellow-400 text-sm">You need at least 2 family members to perform matching. <a href="/dashboard/members" className="underline">Add members →</a></p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Member 1 *</label>
                                        <select value={form.member1_id} onChange={e => setForm({ ...form, member1_id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white">
                                            <option value="">Select...</option>
                                            {members.map(m => <option key={m.id} value={m.id}>{m.name} {m.zodiac_sign ? `(${m.zodiac_sign})` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Member 2 *</label>
                                        <select value={form.member2_id} onChange={e => setForm({ ...form, member2_id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white">
                                            <option value="">Select...</option>
                                            {members.filter(m => m.id != form.member1_id).map(m => <option key={m.id} value={m.id}>{m.name} {m.zodiac_sign ? `(${m.zodiac_sign})` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Match Type</label>
                                        <select value={form.match_type} onChange={e => setForm({ ...form, match_type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white">
                                            {MATCH_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <button onClick={handleCreate} disabled={creating}
                                            className="w-full py-2.5 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all disabled:opacity-50">
                                            {creating ? 'Analyzing...' : '✦ Analyze Compatibility'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading...</div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <GitCompare size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="mb-3">No matches yet.</p>
                        <button onClick={() => setShowForm(true)} className="text-gold/70 hover:text-gold text-sm">Create your first match →</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {matches.map(m => {
                            const strengths = (() => { try { return JSON.parse(m.strengths || '[]'); } catch { return []; } })();
                            const weaknesses = (() => { try { return JSON.parse(m.weaknesses || '[]'); } catch { return []; } })();
                            return (
                                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="glass-morphism rounded-2xl border border-white/10 hover:border-gold/20 transition-all overflow-hidden">
                                    <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                                        <ScoreCircle score={m.compatibility_score || 0} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{m.member1_name}</span>
                                                <GitCompare size={14} className="text-gold" />
                                                <span className="font-semibold">{m.member2_name}</span>
                                            </div>
                                            <p className="text-xs text-white/50">
                                                {m.sign1 && m.sign2 ? `${m.sign1} ↔ ${m.sign2} · ` : ''}
                                                <span className="capitalize">{m.match_type}</span> Compatibility
                                            </p>
                                            <p className="text-xs text-white/30 mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full border ${m.compatibility_score >= 80 ? 'bg-gold/20 border-gold/40 text-gold' : m.compatibility_score >= 60 ? 'bg-blue-400/20 border-blue-400/40 text-blue-400' : 'bg-red-400/20 border-red-400/40 text-red-400'}`}>
                                                {m.compatibility_score >= 80 ? 'Excellent' : m.compatibility_score >= 60 ? 'Good' : 'Challenging'}
                                            </span>
                                            <button onClick={e => { e.stopPropagation(); if (confirm('Delete?')) deleteMatchApi(m.id).then(load).catch(() => {}); }}
                                                className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expanded === m.id && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                className="overflow-hidden border-t border-white/10">
                                                <div className="p-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-emerald-400 mb-2">✓ Strengths</h4>
                                                            <ul className="space-y-1">{strengths.map((s, i) => <li key={i} className="text-xs text-white/60">• {s}</li>)}</ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-red-400 mb-2">✗ Weaknesses</h4>
                                                            <ul className="space-y-1">{weaknesses.map((w, i) => <li key={i} className="text-xs text-white/60">• {w}</li>)}</ul>
                                                        </div>
                                                    </div>
                                                    {m.detailed_report && (
                                                        <div className="bg-white/5 rounded-xl p-4 text-xs text-white/60 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                                            {m.detailed_report}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
