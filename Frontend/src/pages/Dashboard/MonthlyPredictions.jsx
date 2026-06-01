import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap, ChevronDown, Star } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getPredictionsApi, generatePredictionApi, getMembersApi } from '../../services/api';

export default function MonthlyPredictions() {
    const [predictions, setPredictions] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);

    const load = () => {
        getPredictionsApi('monthly').then(r => setPredictions(r.data)).catch(() => {});
        getMembersApi().then(r => setMembers(r.data)).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleGenerate = async () => {
        setGenerating(true); setError('');
        try {
            await generatePredictionApi({ prediction_type: 'monthly', member_id: selectedMember || undefined, period_date: `${selectedMonth}-01` });
            load();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to generate prediction');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Monthly Predictions</h1>
                    <p className="text-white/50 text-sm mt-1">Monthly cosmic overview and guidance</p>
                </div>

                <div className="glass-morphism rounded-2xl p-6 border border-white/10 mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-gold" /> Generate Monthly Reading</h2>
                    {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                    <div className="flex flex-col md:flex-row gap-3">
                        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                        <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white">
                            <option value="">General Reading</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <button onClick={handleGenerate} disabled={generating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap">
                            <Calendar size={16} /> {generating ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                    <p className="text-xs text-white/30 mt-2">Requires Premium or Platinum plan</p>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-white/30">Loading...</div>
                ) : predictions.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No monthly predictions yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {predictions.map(p => {
                            const opportunities = (() => { try { return JSON.parse(p.opportunities || '[]'); } catch { return []; } })();
                            const challenges = (() => { try { return JSON.parse(p.challenges || '[]'); } catch { return []; } })();
                            const luckyDates = (() => { try { return JSON.parse(p.lucky_dates || '[]'); } catch { return []; } })();
                            return (
                                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="glass-morphism rounded-2xl border border-white/10 hover:border-gold/20 transition-all overflow-hidden">
                                    <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={16} className="text-blue-400" />
                                                    <span className="font-semibold">{p.period}</span>
                                                </div>
                                                <p className="text-xs text-white/50 line-clamp-2">{p.overview}</p>
                                            </div>
                                            <ChevronDown size={16} className={`text-white/30 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                    {expanded === p.id && (
                                        <div className="border-t border-white/10 p-5 space-y-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-white/60 mb-2">Overview</h4>
                                                <p className="text-sm text-white/70 leading-relaxed">{p.overview}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-4">
                                                    <h4 className="text-xs font-semibold text-emerald-400 mb-2">✦ Opportunities</h4>
                                                    <ul>{opportunities.map((o, i) => <li key={i} className="text-xs text-white/60 mb-1">• {o}</li>)}</ul>
                                                </div>
                                                <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4">
                                                    <h4 className="text-xs font-semibold text-red-400 mb-2">⚠ Challenges</h4>
                                                    <ul>{challenges.map((c, i) => <li key={i} className="text-xs text-white/60 mb-1">• {c}</li>)}</ul>
                                                </div>
                                            </div>
                                            {luckyDates.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gold mb-2"><Star size={12} className="inline mr-1" />Lucky Dates</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {luckyDates.map((d, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs">{d}</span>)}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl">
                                                <p className="text-xs text-gold/80"><span className="font-semibold text-gold">AI Summary: </span>{p.ai_summary}</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
