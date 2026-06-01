import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Zap, Heart, Briefcase, DollarSign, Activity, BookOpen, Plus, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getPredictionsApi, generatePredictionApi, getMembersApi } from '../../services/api';

const aspects = [
    { key: 'love', icon: Heart, label: 'Love', color: 'text-pink-400' },
    { key: 'career', icon: Briefcase, label: 'Career', color: 'text-blue-400' },
    { key: 'finance', icon: DollarSign, label: 'Finance', color: 'text-emerald-400' },
    { key: 'health', icon: Activity, label: 'Health', color: 'text-red-400' },
    { key: 'education', icon: BookOpen, label: 'Education', color: 'text-purple-400' },
];

export default function DailyPredictions() {
    const [predictions, setPredictions] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedMember, setSelectedMember] = useState('');
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);

    const load = () => {
        getPredictionsApi('daily').then(r => setPredictions(r.data)).catch(() => {});
        getMembersApi().then(r => setMembers(r.data)).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleGenerate = async () => {
        setGenerating(true); setError('');
        try {
            await generatePredictionApi({ prediction_type: 'daily', member_id: selectedMember || undefined });
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Daily Predictions</h1>
                        <p className="text-white/50 text-sm mt-1">AI-powered daily astrological guidance</p>
                    </div>
                </div>

                {/* Generator */}
                <div className="glass-morphism rounded-2xl p-6 border border-white/10 mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-gold" /> Generate Today's Reading</h2>
                    {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                    <div className="flex flex-col md:flex-row gap-3">
                        <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white">
                            <option value="">Myself (general reading)</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name} {m.zodiac_sign ? `— ${m.zodiac_sign}` : ''}</option>)}
                        </select>
                        <button onClick={handleGenerate} disabled={generating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap">
                            <Sun size={16} /> {generating ? 'Generating...' : 'Generate Reading'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-white/30">Loading...</div>
                ) : predictions.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <Sun size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="mb-3">No daily predictions yet.</p>
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
                                                <Sun size={16} className="text-gold" />
                                                <span className="font-semibold">{p.period}</span>
                                            </div>
                                            <p className="text-xs text-white/50 line-clamp-2">{p.ai_summary}</p>
                                        </div>
                                        <ChevronDown size={16} className={`text-white/30 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                {expanded === p.id && (
                                    <div className="border-t border-white/10 p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {aspects.map(({ key, icon: Icon, label, color }) => p[key] && (
                                                <div key={key} className="bg-white/5 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Icon size={14} className={color} />
                                                        <span className={`text-xs font-semibold ${color}`}>{label}</span>
                                                    </div>
                                                    <p className="text-xs text-white/70 leading-relaxed">{p[key]}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                                            <p className="text-xs text-gold/80 leading-relaxed"><span className="font-semibold text-gold">AI Summary: </span>{p.ai_summary}</p>
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
