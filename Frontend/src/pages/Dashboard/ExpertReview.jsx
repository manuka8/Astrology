import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, Plus, Eye, X, ChevronRight, Clock, CheckCircle,
    AlertCircle, BookOpen, Briefcase, Heart, TrendingUp,
    DollarSign, Leaf, Calendar, Sparkles, Trash2, Search,
    Filter, Users, Award, Globe, MessageSquare, Video, Phone,
    Mail, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
    browseExpertsApi, createExpertRequestApi, getMyExpertRequestsApi,
    getMyExpertRequestApi, cancelExpertRequestApi, getMembersApi,
} from '../../services/api';

const REVIEW_TYPES = [
    { id: 'personal',      label: 'Personal Horoscope Reading',  icon: Star,        desc: 'Birth chart analysis, personality, talents' },
    { id: 'career',        label: 'Career & Business Guidance',  icon: Briefcase,   desc: 'Career paths, business timing, leadership' },
    { id: 'relationship',  label: 'Relationship Compatibility',  icon: Heart,       desc: 'Partner compatibility, marriage prospects' },
    { id: 'forecast',      label: 'Life Forecasts',              icon: TrendingUp,  desc: 'Yearly & monthly predictions, life cycles' },
    { id: 'financial',     label: 'Financial Astrology',         icon: DollarSign,  desc: 'Wealth indicators, investment timing' },
    { id: 'health',        label: 'Health Tendencies',           icon: Leaf,        desc: 'Wellness patterns, energy cycles' },
    { id: 'electional',    label: 'Electional Astrology',        icon: Calendar,    desc: 'Favorable dates for major events' },
    { id: 'spiritual',     label: 'Spiritual & Personal Growth', icon: Sparkles,    desc: 'Life purpose, personal development' },
];

const REPORT_TYPES = [
    'Detailed PDF birth chart report', 'Annual forecast report',
    'Compatibility report', 'Career-focused report',
    'Business success analysis', 'Lucky dates calendar',
];

const STATUS_BADGE = {
    pending:   { label: 'Pending',    color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
    in_review: { label: 'In Review',  color: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
    completed: { label: 'Completed',  color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
    cancelled: { label: 'Cancelled',  color: 'bg-white/5 text-white/40 border-white/10' },
};

const CONSULT_ICONS = { Chat: MessageSquare, 'Voice Call': Phone, 'Video Call': Video, Email: Mail };

const safeArr = (v) => { try { return JSON.parse(v || '[]'); } catch { return []; } };

const imgSrc = (path) => path ? `http://localhost:5000${path}` : null;

// ── Expert Card ───────────────────────────────────────────────────────────────
function ExpertCard({ expert, onClick }) {
    const specs = safeArr(expert.specializations).slice(0, 3);
    const photo = imgSrc(expert.profile_photo) || imgSrc(expert.user_photo);
    return (
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.15 }}
            onClick={onClick}
            className="bg-mystic-dark border border-white/10 hover:border-gold/30 rounded-2xl overflow-hidden cursor-pointer transition-all group">
            {/* Banner */}
            <div className="h-16 bg-gradient-to-r from-gold/10 via-purple-500/10 to-blue-500/10 relative">
                {imgSrc(expert.profile_banner) && (
                    <img src={imgSrc(expert.profile_banner)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
            </div>
            <div className="px-4 pb-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full border-2 border-mystic-dark bg-gold/20 -mt-7 flex items-center justify-center overflow-hidden mb-3">
                    {photo
                        ? <img src={photo} alt={expert.name} className="w-full h-full object-cover" />
                        : <Star size={22} className="text-gold" />}
                </div>
                <div className="mb-2">
                    <p className="font-semibold text-white text-sm group-hover:text-gold transition-colors">{expert.name}</p>
                    <p className="text-xs text-white/50 truncate">{expert.headline || 'Expert Astrologer'}</p>
                </div>
                {/* Rating + experience */}
                <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                    <span className="flex items-center gap-1 text-yellow-400"><Star size={11} fill="currentColor" /> {expert.rating ? Number(expert.rating).toFixed(1) : 'New'}</span>
                    <span>{expert.review_count || 0} reviews</span>
                    <span>{expert.experience_years || 0} yrs</span>
                </div>
                {/* Specs */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {specs.map(s => <span key={s} className="text-xs bg-gold/10 text-gold/80 px-2 py-0.5 rounded-md">{s}</span>)}
                    {safeArr(expert.specializations).length > 3 && <span className="text-xs text-white/30">+{safeArr(expert.specializations).length - 3}</span>}
                </div>
                <div className="flex items-center justify-between">
                    {expert.consultation_fee
                        ? <span className="text-xs text-gold font-semibold">LKR {Number(expert.consultation_fee).toLocaleString()}</span>
                        : <span className="text-xs text-white/30">Fee on request</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${expert.is_available ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                        {expert.is_available ? '● Available' : '○ Busy'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// ── Expert Profile Panel ──────────────────────────────────────────────────────
function ExpertProfilePanel({ expert, onClose, onRequestReview }) {
    const photo = imgSrc(expert.profile_photo) || imgSrc(expert.user_photo);
    const specs = safeArr(expert.specializations);
    const langs = safeArr(expert.languages);
    const consultTypes = safeArr(expert.consultation_types);
    const cats = safeArr(expert.categories);

    return (
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-mystic-dark border-l border-white/10 z-50 overflow-y-auto shadow-2xl">

            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-gold/15 via-purple-500/15 to-blue-500/15 relative flex-shrink-0">
                {imgSrc(expert.profile_banner) && (
                    <img src={imgSrc(expert.profile_banner)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <button onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all">
                    <X size={16} />
                </button>
            </div>

            <div className="px-6 pb-8">
                {/* Avatar + name */}
                <div className="flex items-end gap-4 -mt-10 mb-4">
                    <div className="w-20 h-20 rounded-2xl border-4 border-mystic-dark bg-gold/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {photo
                            ? <img src={photo} alt={expert.name} className="w-full h-full object-cover" />
                            : <Star size={32} className="text-gold" />}
                    </div>
                    <div className="pb-1">
                        <h2 className="text-xl font-bold text-white">{expert.name}</h2>
                        <p className="text-sm text-white/50">{expert.headline || 'Expert Astrologer'}</p>
                    </div>
                </div>

                {/* Availability */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4
                    ${expert.is_available ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {expert.is_available ? 'Available for requests' : 'Currently busy'}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'Rating', value: expert.rating ? `${Number(expert.rating).toFixed(1)} ★` : 'New', color: 'text-yellow-400' },
                        { label: 'Reviews', value: expert.review_count || 0, color: 'text-gold' },
                        { label: 'Experience', value: `${expert.experience_years || 0} yrs`, color: 'text-blue-400' },
                    ].map(s => (
                        <div key={s.label} className="text-center p-3 bg-white/5 rounded-xl">
                            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Fee */}
                {expert.consultation_fee && (
                    <div className="flex items-center justify-between p-3 bg-gold/5 border border-gold/20 rounded-xl mb-5">
                        <span className="text-sm text-white/60">Consultation Fee</span>
                        <span className="text-gold font-bold">LKR {Number(expert.consultation_fee).toLocaleString()} / session</span>
                    </div>
                )}

                {/* Bio */}
                {(expert.public_description || expert.bio) && (
                    <div className="mb-5">
                        <p className="text-xs text-white/40 uppercase tracking-wide mb-2">About</p>
                        <p className="text-sm text-white/70 leading-relaxed">{expert.public_description || expert.bio}</p>
                    </div>
                )}

                {/* Specializations */}
                {specs.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-1.5">
                            {specs.map(s => <span key={s} className="text-xs bg-gold/10 text-gold border border-gold/20 px-2.5 py-1 rounded-lg">{s}</span>)}
                        </div>
                    </div>
                )}

                {/* Consultation types */}
                {consultTypes.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Consultation Methods</p>
                        <div className="flex flex-wrap gap-2">
                            {consultTypes.map(t => {
                                const Icon = CONSULT_ICONS[t] || MessageSquare;
                                return (
                                    <span key={t} className="flex items-center gap-1.5 text-xs bg-white/5 text-white/60 border border-white/10 px-2.5 py-1 rounded-lg">
                                        <Icon size={12} /> {t}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {langs.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Languages</p>
                        <div className="flex flex-wrap gap-1.5">
                            {langs.map(l => (
                                <span key={l} className="flex items-center gap-1 text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-lg">
                                    <Globe size={10} /> {l}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories */}
                {cats.length > 0 && (
                    <div className="mb-6">
                        <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Categories</p>
                        <div className="flex flex-wrap gap-1.5">
                            {cats.map(c => <span key={c} className="text-xs text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2.5 py-1 rounded-lg">{c}</span>)}
                        </div>
                    </div>
                )}

                {/* CTA */}
                <button onClick={() => onRequestReview(expert)}
                    disabled={!expert.is_available}
                    className="w-full py-3.5 bg-gold text-black font-bold rounded-xl hover:bg-gold/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Star size={16} fill="currentColor" />
                    {expert.is_available ? `Request Review from ${expert.name.split(' ')[0]}` : 'Currently Unavailable'}
                </button>
            </div>
        </motion.div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ExpertReview() {
    const [tab, setTab] = useState('browse');
    const [view, setView] = useState('list'); // list | new | detail

    // Browse state
    const [experts, setExperts] = useState([]);
    const [browsing, setBrowsing] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSpec, setFilterSpec] = useState('');
    const [filterLang, setFilterLang] = useState('');
    const [filterType, setFilterType] = useState('');
    const [panelExpert, setPanelExpert] = useState(null);
    const [preselectedExpert, setPreselectedExpert] = useState(null);

    // Request state
    const [requests, setRequests] = useState([]);
    const [members, setMembers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        member_id: '', subject_name: '', subject_birth_date: '',
        subject_birth_time: '', subject_birth_place: '',
        review_types: [], report_types: [], message: '',
    });

    useEffect(() => {
        Promise.all([getMyExpertRequestsApi(), getMembersApi()])
            .then(([rRes, mRes]) => {
                setRequests(rRes.data);
                setMembers(mRes.data || []);
            }).finally(() => setLoading(false));
        loadExperts();
    }, []);

    const loadExperts = useCallback(async (params = {}) => {
        setBrowsing(true);
        try {
            const res = await browseExpertsApi(params);
            setExperts(res.data);
        } finally {
            setBrowsing(false);
        }
    }, []);

    const applyFilters = () => loadExperts({
        search: search || undefined,
        specialization: filterSpec || undefined,
        language: filterLang || undefined,
        consultation_type: filterType || undefined,
    });

    useEffect(() => {
        const t = setTimeout(applyFilters, 350);
        return () => clearTimeout(t);
    }, [search, filterSpec, filterLang, filterType]);

    const refreshRequests = () => getMyExpertRequestsApi().then(r => setRequests(r.data));

    const handleMemberSelect = (memberId) => {
        const m = members.find(x => x.id === Number(memberId));
        setForm(f => ({
            ...f, member_id: memberId,
            subject_name: m?.name || '',
            subject_birth_date: m?.date_of_birth || '',
            subject_birth_time: m?.time_of_birth || '',
            subject_birth_place: m?.birth_place || '',
        }));
    };

    const toggleType = (id, field) => {
        setForm(f => ({
            ...f,
            [field]: f[field].includes(id) ? f[field].filter(x => x !== id) : [...f[field], id],
        }));
    };

    const handleRequestReview = (expert) => {
        setPreselectedExpert(expert);
        setPanelExpert(null);
        setForm({ member_id: '', subject_name: '', subject_birth_date: '', subject_birth_time: '', subject_birth_place: '', review_types: [], report_types: [], message: '' });
        setError('');
        setTab('requests');
        setView('new');
    };

    const submitRequest = async () => {
        setError('');
        if (!form.subject_name) { setError('Subject name is required.'); return; }
        if (form.review_types.length === 0) { setError('Select at least one review type.'); return; }
        setSaving(true);
        try {
            await createExpertRequestApi({ ...form, assigned_expert_id: preselectedExpert?.id || undefined });
            await refreshRequests();
            setPreselectedExpert(null);
            setView('list');
            setForm({ member_id: '', subject_name: '', subject_birth_date: '', subject_birth_time: '', subject_birth_place: '', review_types: [], report_types: [], message: '' });
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to submit request.');
        } finally {
            setSaving(false);
        }
    };

    const openDetail = async (req) => {
        setSelected(req);
        const res = await getMyExpertRequestApi(req.id);
        setDetail(res.data);
        setView('detail');
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this request?')) return;
        await cancelExpertRequestApi(id);
        await refreshRequests();
        setView('list');
    };

    // All specializations from loaded experts
    const allSpecs = [...new Set(experts.flatMap(e => safeArr(e.specializations)))].sort();
    const allLangs = [...new Set(experts.flatMap(e => safeArr(e.languages)))].sort();
    const allTypes = [...new Set(experts.flatMap(e => safeArr(e.consultation_types)))].sort();

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {view !== 'list' && tab === 'requests' && (
                            <button onClick={() => { setView('list'); setPreselectedExpert(null); }} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                <X size={18} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Expert Review</h1>
                            <p className="text-white/50 text-sm mt-1">Find a certified astrologer and get a personal reading</p>
                        </div>
                    </div>
                    {tab === 'requests' && view === 'list' && (
                        <button onClick={() => { setPreselectedExpert(null); setTab('browse'); }}
                            className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all">
                            <Users size={15} /> Browse Experts
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
                    {[
                        { key: 'browse', label: 'Browse Experts', icon: Users },
                        { key: 'requests', label: 'My Requests', icon: BookOpen, count: requests.filter(r => r.status === 'pending' || r.status === 'in_review').length },
                    ].map(t => (
                        <button key={t.key} onClick={() => { setTab(t.key); setView('list'); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${tab === t.key ? 'bg-gold/20 text-gold border border-gold/30' : 'text-white/60 hover:text-white'}`}>
                            <t.icon size={15} />
                            {t.label}
                            {t.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-gold/30' : 'bg-white/10'}`}>{t.count}</span>}
                        </button>
                    ))}
                </div>

                {/* ── BROWSE TAB ── */}
                {tab === 'browse' && (
                    <div>
                        {/* Search + Filters */}
                        <div className="space-y-3 mb-6">
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name or headline..."
                                    className="w-full bg-mystic-dark border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Specialization', value: filterSpec, onChange: setFilterSpec, options: allSpecs },
                                    { label: 'Language', value: filterLang, onChange: setFilterLang, options: allLangs },
                                    { label: 'Consultation Type', value: filterType, onChange: setFilterType, options: allTypes },
                                ].map(f => (
                                    <select key={f.label} value={f.value} onChange={e => f.onChange(e.target.value)}
                                        className="bg-mystic-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 flex-1 min-w-[140px]">
                                        <option value="">All {f.label}s</option>
                                        {f.options.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                ))}
                                {(search || filterSpec || filterLang || filterType) && (
                                    <button onClick={() => { setSearch(''); setFilterSpec(''); setFilterLang(''); setFilterType(''); }}
                                        className="px-3 py-2 text-xs text-white/50 hover:text-white border border-white/10 rounded-xl transition-all">
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {browsing ? (
                            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
                        ) : experts.length === 0 ? (
                            <div className="text-center py-20 bg-mystic-dark border border-white/10 rounded-2xl">
                                <Users size={48} className="text-white/20 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">No Experts Found</h3>
                                <p className="text-white/40 text-sm">Try adjusting your filters or search terms.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-white/40 mb-3">{experts.length} expert{experts.length !== 1 ? 's' : ''} available</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {experts.map(e => (
                                        <ExpertCard key={e.id} expert={e} onClick={() => setPanelExpert(e)} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── REQUESTS TAB ── */}
                {tab === 'requests' && (
                    <div>
                        {/* New Request Form */}
                        {view === 'new' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                {/* Preselected expert banner */}
                                {preselectedExpert && (
                                    <div className="flex items-center justify-between p-4 mb-5 bg-gold/5 border border-gold/20 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center overflow-hidden">
                                                {imgSrc(preselectedExpert.profile_photo) || imgSrc(preselectedExpert.user_photo)
                                                    ? <img src={imgSrc(preselectedExpert.profile_photo) || imgSrc(preselectedExpert.user_photo)} className="w-full h-full object-cover" />
                                                    : <Star size={18} className="text-gold" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{preselectedExpert.name}</p>
                                                <p className="text-xs text-white/50">{preselectedExpert.headline || 'Expert Astrologer'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded-lg">Selected Expert</span>
                                            <button onClick={() => setPreselectedExpert(null)} className="text-white/30 hover:text-white/60 transition-all"><X size={14} /></button>
                                        </div>
                                    </div>
                                )}

                                {!preselectedExpert && (
                                    <div className="flex items-center gap-2 p-3 mb-5 bg-blue-400/5 border border-blue-400/20 rounded-xl text-blue-400 text-xs">
                                        <AlertCircle size={14} className="flex-shrink-0" />
                                        No expert selected — your request will be visible to all available experts.
                                        <button onClick={() => setTab('browse')} className="underline ml-auto flex-shrink-0">Browse Experts</button>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
                                        <AlertCircle size={15} /> {error}
                                    </div>
                                )}

                                <div className="bg-mystic-dark rounded-2xl p-6 border border-white/10 space-y-6">
                                    {/* Subject */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Subject Information</h3>
                                        {members.length > 0 && (
                                            <div className="mb-4">
                                                <label className="block text-xs text-white/50 mb-1.5">Auto-fill from my members</label>
                                                <select value={form.member_id} onChange={e => handleMemberSelect(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50">
                                                    <option value="">Select a member (optional)</option>
                                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { key: 'subject_name', label: 'Full Name *', placeholder: 'Name of the person' },
                                                { key: 'subject_birth_place', label: 'Birth Place', placeholder: 'City, Country' },
                                                { key: 'subject_birth_date', label: 'Date of Birth', type: 'date' },
                                                { key: 'subject_birth_time', label: 'Time of Birth', type: 'time' },
                                            ].map(f => (
                                                <div key={f.key}>
                                                    <label className="block text-xs text-white/50 mb-1.5">{f.label}</label>
                                                    <input type={f.type || 'text'} value={form[f.key]}
                                                        onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                                                        placeholder={f.placeholder}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Review Types */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Review Types *</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {REVIEW_TYPES.map(rt => {
                                                const active = form.review_types.includes(rt.id);
                                                return (
                                                    <button key={rt.id} type="button" onClick={() => toggleType(rt.id, 'review_types')}
                                                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all
                                                            ${active ? 'bg-gold/10 border-gold/30' : 'bg-white/3 border-white/10 hover:border-white/20'}`}>
                                                        <rt.icon size={16} className={active ? 'text-gold mt-0.5' : 'text-white/30 mt-0.5'} />
                                                        <div>
                                                            <p className={`text-xs font-medium ${active ? 'text-gold' : 'text-white/70'}`}>{rt.label}</p>
                                                            <p className="text-white/30 text-xs mt-0.5">{rt.desc}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Report Types */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Requested Reports (optional)</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {REPORT_TYPES.map(r => {
                                                const active = form.report_types.includes(r);
                                                return (
                                                    <button key={r} type="button" onClick={() => toggleType(r, 'report_types')}
                                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all
                                                            ${active ? 'bg-gold/10 text-gold border-gold/30' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'}`}>
                                                        {r}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1.5">Additional Notes (optional)</label>
                                        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                            placeholder="Any specific questions or areas you'd like the expert to focus on..."
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none" />
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => { setView('list'); setPreselectedExpert(null); }}
                                            className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
                                            Cancel
                                        </button>
                                        <button onClick={submitRequest} disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold text-sm font-medium transition-all disabled:opacity-50">
                                            {saving ? <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> : <Star size={16} />}
                                            Submit Request
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Request Detail */}
                        {view === 'detail' && detail && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                <div className="bg-mystic-dark rounded-2xl p-6 border border-white/10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{detail.subject_name}</h2>
                                            <p className="text-white/40 text-sm">{detail.subject_birth_date} {detail.subject_birth_time} · {detail.subject_birth_place}</p>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full border ${STATUS_BADGE[detail.status]?.color}`}>
                                            {STATUS_BADGE[detail.status]?.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {safeArr(detail.review_types).map(rt => {
                                            const found = REVIEW_TYPES.find(x => x.id === rt);
                                            return <span key={rt} className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-lg">{found?.label || rt}</span>;
                                        })}
                                    </div>
                                    {detail.expert_name && (
                                        <p className="text-sm text-white/50">Assigned to: <span className="text-white/80">{detail.expert_name}</span></p>
                                    )}
                                    {detail.status === 'pending' && (
                                        <button onClick={() => handleCancel(detail.id)}
                                            className="mt-4 flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors">
                                            <Trash2 size={14} /> Cancel Request
                                        </button>
                                    )}
                                </div>

                                {detail.review && (
                                    <div className="bg-mystic-dark rounded-2xl p-6 border border-gold/20">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
                                                <Star size={16} className="text-gold" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">Expert Review</h3>
                                        </div>
                                        {[
                                            { key: 'personal_reading', label: '✨ Personal Horoscope Reading' },
                                            { key: 'career_guidance', label: '💼 Career & Business Guidance' },
                                            { key: 'relationship_insights', label: '💝 Relationship Compatibility' },
                                            { key: 'life_forecasts', label: '🔮 Life Forecasts' },
                                            { key: 'financial_astrology', label: '💰 Financial Astrology' },
                                            { key: 'health_tendencies', label: '🌿 Health Tendencies' },
                                            { key: 'electional_astrology', label: '📅 Electional Astrology' },
                                            { key: 'spiritual_growth', label: '🌟 Spiritual & Personal Growth' },
                                            { key: 'lucky_dates', label: '🗓 Lucky Dates' },
                                        ].filter(f => detail.review[f.key]).map(f => (
                                            <div key={f.key} className="mb-5">
                                                <h4 className="text-sm font-semibold text-gold mb-2">{f.label}</h4>
                                                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{detail.review[f.key]}</p>
                                            </div>
                                        ))}
                                        {detail.review.summary && (
                                            <div className="mt-6 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                                                <h4 className="text-sm font-semibold text-gold mb-2">Summary</h4>
                                                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{detail.review.summary}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {detail.status === 'in_review' && (
                                    <div className="flex items-center gap-3 p-4 bg-blue-400/5 border border-blue-400/20 rounded-xl text-blue-400 text-sm">
                                        <Clock size={16} className="flex-shrink-0" />
                                        Your request has been accepted and is currently being reviewed.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Request List */}
                        {view === 'list' && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-white/40">{requests.length} request{requests.length !== 1 ? 's' : ''}</span>
                                    <button onClick={() => { setPreselectedExpert(null); setView('new'); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all">
                                        <Plus size={15} /> New Request
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
                                ) : requests.length === 0 ? (
                                    <div className="text-center py-20 bg-mystic-dark border border-white/10 rounded-2xl">
                                        <Star size={48} className="text-gold/30 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-white mb-2">No Requests Yet</h3>
                                        <p className="text-white/40 text-sm mb-6">Browse experts and request a personal reading.</p>
                                        <button onClick={() => setTab('browse')}
                                            className="px-6 py-2.5 bg-gold/20 border border-gold/30 text-gold rounded-xl text-sm font-medium hover:bg-gold/30 transition-all">
                                            Browse Experts
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {requests.map(req => (
                                            <motion.div key={req.id} whileHover={{ y: -1 }}
                                                className="bg-mystic-dark rounded-2xl p-5 border border-white/10 cursor-pointer hover:border-gold/20 transition-all"
                                                onClick={() => openDetail(req)}>
                                                <div className="flex items-center justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-semibold text-white">{req.subject_name}</h3>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_BADGE[req.status]?.color}`}>
                                                                {STATUS_BADGE[req.status]?.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-white/40 text-sm">
                                                            {safeArr(req.review_types).map(rt => REVIEW_TYPES.find(x => x.id === rt)?.label || rt).join(' · ')}
                                                        </p>
                                                        <p className="text-white/30 text-xs mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-white/30 flex-shrink-0" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Expert Profile Panel Overlay */}
            <AnimatePresence>
                {panelExpert && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40" onClick={() => setPanelExpert(null)} />
                        <ExpertProfilePanel expert={panelExpert}
                            onClose={() => setPanelExpert(null)}
                            onRequestReview={handleRequestReview} />
                    </>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
