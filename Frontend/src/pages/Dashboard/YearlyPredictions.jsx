import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, ChevronDown, Briefcase, DollarSign, Heart, Activity, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getPredictionsApi, generatePredictionApi, getMembersApi } from '../../services/api';

export default function YearlyPredictions() {
    const [predictions, setPredictions] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);

    const load = () => {
        getPredictionsApi('yearly').then(r => setPredictions(r.data)).catch(() => {});
        getMembersApi().then(r => setMembers(r.data)).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleGenerate = async () => {
        setGenerating(true); setError('');
        try {
            await generatePredictionApi({ prediction_type: 'yearly', member_id: selectedMember || undefined, period_date: `${selectedYear}-01-01` });
            load();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to generate prediction');
        } finally {
            setGenerating(false);
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() + i - 2).toString());

    const aspects = [
        { key: 'career', icon: Briefcase, label: 'Career', color: 'text-blue-400', bg: 'bg-blue-400/5 border-blue-400/20' },
        { key: 'finance', icon: DollarSign, label: 'Finance', color: 'text-emerald-400', bg: 'bg-emerald-400/5 border-emerald-400/20' },
        { key: 'love', icon: Heart, label: 'Relationships', color: 'text-pink-400', bg: 'bg-pink-400/5 border-pink-400/20' },
        { key: 'health', icon: Activity, label: 'Health', color: 'text-red-400', bg: 'bg-red-400/5 border-red-400/20' },
        { key: 'personal_growth', icon: TrendingUp, label: 'Personal Growth', color: 'text-purple-400', bg: 'bg-purple-400/5 border-purple-400/20' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Yearly Predictions</h1>
                    <p className="text-white/50 text-sm mt-1">Comprehensive annual astrological forecast</p>
                </div>

                <div className="glass-morphism rounded-2xl p-6 border border-white/10 mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-gold" /> Generate Yearly Forecast</h2>
                    {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                    <div className="flex flex-col md:flex-row gap-3">
                        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white">
                            <option value="">General Reading</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <button onClick={handleGenerate} disabled={generating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap">
                            <Star size={16} /> {generating ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                    <p className="text-xs text-white/30 mt-2">Requires Premium or Platinum plan</p>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-white/30">Loading...</div>
                ) : predictions.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <Star size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No yearly predictions yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {predictions.map(p => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism rounded-2xl border border-white/10 hover:border-gold/20 transition-all overflow-hidden">
                                <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Star size={16} className="text-gold" />
                                                <span className="font-semibold">{p.period}</span>
                                            </div>
                                            <p className="text-xs text-white/50 line-clamp-2">{p.year_summary}</p>
                                        </div>
                                        <ChevronDown size={16} className={`text-white/30 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                {expanded === p.id && (
                                    <div className="border-t border-white/10 p-5 space-y-4">
                                        <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl">
                                            <h4 className="text-xs font-semibold text-gold mb-1">Year Summary</h4>
                                            <p className="text-sm text-white/70">{p.year_summary}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {aspects.map(({ key, icon: Icon, label, color, bg }) => p[key] && (
                                                <div key={key} className={`border rounded-xl p-4 ${bg}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Icon size={14} className={color} />
                                                        <span className={`text-xs font-semibold ${color}`}>{label}</span>
                                                    </div>
                                                    <p className="text-xs text-white/60 leading-relaxed">{p[key]}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-purple-400/5 border border-purple-400/20 rounded-xl">
                                            <p className="text-xs text-purple-300/80"><span className="font-semibold">AI Insight: </span>{p.ai_summary}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
