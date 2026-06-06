import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Star, Inbox, CheckCircle, Clock, User, ChevronRight,
    X, Save, AlertCircle, BookOpen, Briefcase, Heart,
    TrendingUp, DollarSign, Leaf, Calendar, Sparkles,
    Camera, Globe, MessageSquare, Phone, Video, Mail,
    Upload, Image, UserCircle
} from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
    getExpertQueueApi, acceptExpertRequestApi, submitExpertReviewApi,
    getMyExpertWorkApi, getMyExpertProfileApi, updateMyExpertProfileApi,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const REVIEW_TYPES = [
    { id: 'personal', label: 'Personal Horoscope Reading', icon: Star },
    { id: 'career', label: 'Career & Business Guidance', icon: Briefcase },
    { id: 'relationship', label: 'Relationship Compatibility', icon: Heart },
    { id: 'forecast', label: 'Life Forecasts', icon: TrendingUp },
    { id: 'financial', label: 'Financial Astrology', icon: DollarSign },
    { id: 'health', label: 'Health Tendencies', icon: Leaf },
    { id: 'electional', label: 'Electional Astrology', icon: Calendar },
    { id: 'spiritual', label: 'Spiritual & Personal Growth', icon: Sparkles },
];

const REVIEW_FIELDS = [
    { key: 'personal_reading',     label: 'Personal Horoscope Reading',  placeholder: 'Analysis of birth chart, personality strengths/weaknesses, natural talents...', typeId: 'personal' },
    { key: 'career_guidance',      label: 'Career & Business Guidance',  placeholder: 'Favorable career paths, business opportunities, timing for decisions...', typeId: 'career' },
    { key: 'relationship_insights',label: 'Relationship Compatibility',  placeholder: 'Partner compatibility, marriage prospects, communication strengths...', typeId: 'relationship' },
    { key: 'life_forecasts',       label: 'Life Forecasts',              placeholder: 'Yearly predictions, monthly forecasts, major life cycles...', typeId: 'forecast' },
    { key: 'financial_astrology',  label: 'Financial Astrology',         placeholder: 'Wealth potential indicators, spending tendencies, favorable periods...', typeId: 'financial' },
    { key: 'health_tendencies',    label: 'Health Tendencies',           placeholder: 'General wellness patterns, stress and energy-cycle observations...', typeId: 'health' },
    { key: 'electional_astrology', label: 'Electional Astrology',        placeholder: 'Favorable dates for business launches, weddings, contracts...', typeId: 'electional' },
    { key: 'spiritual_growth',     label: 'Spiritual & Personal Growth', placeholder: 'Life purpose themes, personal development areas...', typeId: 'spiritual' },
    { key: 'lucky_dates',          label: 'Lucky Dates Calendar',        placeholder: 'List favorable dates and what they are best used for...', typeId: null },
];

const SPECIALIZATIONS = [
    'Natal Chart Reading', 'Career Astrology', 'Relationship Compatibility',
    'Financial Astrology', 'Medical Astrology', 'Electional Astrology',
    'Mundane Astrology', 'Vedic Astrology', 'Western Astrology', 'Spiritual Guidance',
];
const LANGUAGES = ['English', 'Sinhala', 'Tamil', 'Hindi', 'Malay', 'Arabic'];
const CONSULTATION_TYPES = ['Chat', 'Voice Call', 'Video Call', 'Email'];
const CATEGORIES = ['Vedic', 'Western', 'Chinese', 'Numerology', 'Tarot', 'Vastu', 'Palmistry', 'Face Reading'];

const safeArr = (v) => { try { return JSON.parse(v || '[]'); } catch { return []; } };
const imgSrc = (path) => path ? `http://localhost:5000${path}` : null;

const CONSULT_ICONS = { Chat: MessageSquare, 'Voice Call': Phone, 'Video Call': Video, Email: Mail };

function TagToggle({ options, selected, onToggle, colorClass = 'bg-gold/20 text-gold border-gold/30' }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(o => {
                const active = selected.includes(o);
                return (
                    <button key={o} type="button" onClick={() => onToggle(o)}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all
                            ${active ? colorClass : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'}`}>
                        {o}
                    </button>
                );
            })}
        </div>
    );
}

function PhotoUpload({ label, previewSrc, accept, inputRef, onFileChange, icon: Icon, className = '' }) {
    return (
        <div className={`relative group cursor-pointer ${className}`} onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onFileChange} />
            {previewSrc
                ? <img src={previewSrc} alt={label} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/30 group-hover:text-white/60 transition-colors">
                    <Icon size={22} />
                    <span className="text-xs">{label}</span>
                  </div>}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[inherit]">
                <Camera size={20} className="text-white" />
            </div>
        </div>
    );
}

export default function ExpertDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('queue');
    const [queue, setQueue] = useState([]);
    const [myWork, setMyWork] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review writing
    const [activeRequest, setActiveRequest] = useState(null);
    const [reviewForm, setReviewForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Profile
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileForm, setProfileForm] = useState({
        bio: '', headline: '', public_description: '',
        experience_years: 0, consultation_fee: '',
        specializations: [], languages: [], consultation_types: [], categories: [],
        is_available: 1,
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const photoRef = useRef();
    const bannerRef = useRef();

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [qRes, wRes, pRes] = await Promise.all([
                getExpertQueueApi(), getMyExpertWorkApi(), getMyExpertProfileApi(),
            ]);
            setQueue(qRes.data);
            setMyWork(wRes.data);
            const p = pRes.data;
            setProfile(p);
            setProfileForm({
                bio: p.bio || '',
                headline: p.headline || '',
                public_description: p.public_description || '',
                experience_years: p.experience_years || 0,
                consultation_fee: p.consultation_fee || '',
                specializations: safeArr(p.specializations),
                languages: safeArr(p.languages),
                consultation_types: safeArr(p.consultation_types),
                categories: safeArr(p.categories),
                is_available: p.is_available ?? 1,
            });
            setPhotoPreview(null);
            setBannerPreview(null);
            setPhotoFile(null);
            setBannerFile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptExpertRequestApi(id);
            await fetchAll();
            setTab('mywork');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to accept request');
        }
    };

    const openReview = (req) => {
        setActiveRequest(req);
        setReviewForm({
            personal_reading: '', career_guidance: '', relationship_insights: '',
            life_forecasts: '', financial_astrology: '', health_tendencies: '',
            electional_astrology: '', spiritual_growth: '', lucky_dates: '', summary: '',
        });
        setError('');
        setSuccess('');
    };

    const submitReview = async () => {
        if (!reviewForm.summary?.trim()) { setError('Summary is required.'); return; }
        setSaving(true);
        setError('');
        try {
            await submitExpertReviewApi(activeRequest.id, reviewForm);
            setSuccess('Review submitted successfully!');
            setActiveRequest(null);
            await fetchAll();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to submit review');
        } finally {
            setSaving(false);
        }
    };

    const saveProfile = async () => {
        setProfileError('');
        setProfileSuccess('');
        setProfileSaving(true);
        try {
            const hasFiles = photoFile || bannerFile;
            let payload;
            if (hasFiles) {
                payload = new FormData();
                Object.entries(profileForm).forEach(([k, v]) => {
                    payload.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
                });
                if (photoFile) payload.append('profile_photo', photoFile);
                if (bannerFile) payload.append('profile_banner', bannerFile);
            } else {
                payload = {
                    ...profileForm,
                    specializations: JSON.stringify(profileForm.specializations),
                    languages: JSON.stringify(profileForm.languages),
                    consultation_types: JSON.stringify(profileForm.consultation_types),
                    categories: JSON.stringify(profileForm.categories),
                };
            }
            await updateMyExpertProfileApi(payload);
            setProfileSuccess('Profile saved successfully!');
            await fetchAll();
        } catch (e) {
            setProfileError(e.response?.data?.message || 'Failed to save profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const toggleArr = (field, val) => setProfileForm(f => ({
        ...f,
        [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
    }));

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const reqTypes = activeRequest ? safeArr(activeRequest.review_types) : [];
    const relevantFields = REVIEW_FIELDS.filter(f => f.typeId === null || reqTypes.includes(f.typeId));

    const profilePhoto = photoPreview || imgSrc(profile?.profile_photo);
    const profileBanner = bannerPreview || imgSrc(profile?.profile_banner);

    return (
        <DashboardLayout isExpert>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Expert Dashboard</h1>
                        <p className="text-white/50 text-sm mt-1">Welcome back, {user?.name}</p>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${profile.is_available ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                            <span className="text-sm text-white/50">{profile.is_available ? 'Available' : 'Unavailable'}</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                {profile && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { label: 'Reviews Done', value: profile.review_count || 0, color: 'text-gold' },
                            { label: 'Rating', value: profile.rating ? `${Number(profile.rating).toFixed(1)} ★` : 'N/A', color: 'text-yellow-400' },
                            { label: 'Queue', value: queue.length, color: 'text-blue-400' },
                        ].map(s => (
                            <div key={s.label} className="glass-morphism rounded-2xl p-4 border border-white/10 text-center">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-white/40 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
                    {[
                        { key: 'queue',   label: 'Request Queue', icon: Inbox,       count: queue.length },
                        { key: 'mywork',  label: 'My Work',       icon: BookOpen,    count: myWork.filter(r => r.status === 'in_review').length },
                        { key: 'profile', label: 'My Profile',    icon: UserCircle,  count: 0 },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${tab === t.key ? 'bg-gold/20 text-gold border border-gold/30' : 'text-white/60 hover:text-white'}`}>
                            <t.icon size={15} />
                            {t.label}
                            {t.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-gold/30' : 'bg-white/10'}`}>{t.count}</span>}
                        </button>
                    ))}
                </div>

                {success && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-4 text-sm">
                        <CheckCircle size={15} /> {success}
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                        <AlertCircle size={15} /> {error}
                        <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
                    </div>
                )}

                {/* ── Queue Tab ── */}
                {tab === 'queue' && (
                    loading
                        ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
                        : queue.length === 0
                            ? <div className="text-center py-16 glass-morphism rounded-2xl border border-white/10">
                                <Inbox size={40} className="text-white/20 mx-auto mb-3" />
                                <p className="text-white/40">No pending requests in the queue.</p>
                              </div>
                            : <div className="space-y-3">
                                {queue.map(req => (
                                    <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        className="glass-morphism rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User size={14} className="text-white/30" />
                                                    <span className="text-white/50 text-xs">{req.requester_name}</span>
                                                    {req.assigned_expert_id && (
                                                        <span className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-md">Assigned to you</span>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-white">{req.subject_name}</h3>
                                                <p className="text-white/40 text-xs mt-0.5">
                                                    {req.subject_birth_date} {req.subject_birth_time} · {req.subject_birth_place}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {safeArr(req.review_types).map(rt => {
                                                        const found = REVIEW_TYPES.find(x => x.id === rt);
                                                        return <span key={rt} className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-md">{found?.label || rt}</span>;
                                                    })}
                                                </div>
                                                {req.message && <p className="text-white/40 text-xs mt-2 italic">"{req.message}"</p>}
                                            </div>
                                            <button onClick={() => handleAccept(req.id)}
                                                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold rounded-xl text-xs font-medium transition-all">
                                                Accept <ChevronRight size={13} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                              </div>
                )}

                {/* ── My Work Tab ── */}
                {tab === 'mywork' && (
                    <div className="space-y-3">
                        {myWork.map(req => (
                            <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism rounded-2xl p-5 border border-white/10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white">{req.subject_name}</h3>
                                        <p className="text-white/40 text-xs mt-0.5">{req.subject_birth_date} · {req.requester_name}</p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {safeArr(req.review_types).map(rt => {
                                                const found = REVIEW_TYPES.find(x => x.id === rt);
                                                return <span key={rt} className="text-xs bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 rounded-md">{found?.label || rt}</span>;
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {req.status === 'completed'
                                            ? <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1 rounded-full flex items-center gap-1">
                                                <CheckCircle size={11} /> Done
                                              </span>
                                            : <button onClick={() => openReview(req)}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 text-blue-400 rounded-xl text-xs font-medium transition-all">
                                                <Star size={13} /> Write Review
                                              </button>}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {myWork.length === 0 && (
                            <div className="text-center py-16 glass-morphism rounded-2xl border border-white/10">
                                <BookOpen size={40} className="text-white/20 mx-auto mb-3" />
                                <p className="text-white/40">Accept requests from the queue to see them here.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Profile Tab ── */}
                {tab === 'profile' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {profileSuccess && (
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm">
                                <CheckCircle size={15} /> {profileSuccess}
                            </div>
                        )}
                        {profileError && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                                <AlertCircle size={15} /> {profileError}
                            </div>
                        )}

                        {/* Public Preview Card */}
                        <div className="bg-mystic-dark border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
                                <span className="text-xs text-white/40">Public Preview — how users see your profile</span>
                            </div>
                            {/* Banner */}
                            <div className="h-24 bg-gradient-to-r from-gold/10 via-purple-500/10 to-blue-500/10 relative">
                                {profileBanner && <img src={profileBanner} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                            </div>
                            <div className="px-5 pb-5">
                                <div className="flex items-end gap-4 -mt-8 mb-3">
                                    <div className="w-16 h-16 rounded-2xl border-4 border-mystic-dark bg-gold/20 flex items-center justify-center overflow-hidden">
                                        {profilePhoto
                                            ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                                            : <Star size={24} className="text-gold" />}
                                    </div>
                                    <div className="pb-1">
                                        <p className="font-bold text-white">{user?.name}</p>
                                        <p className="text-sm text-white/50">{profileForm.headline || 'Expert Astrologer'}</p>
                                    </div>
                                    <div className="ml-auto pb-1">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border ${profileForm.is_available ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                            {profileForm.is_available ? '● Available' : '○ Busy'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-white/60 line-clamp-2">{profileForm.public_description || profileForm.bio || 'No description set.'}</p>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {profileForm.specializations.slice(0, 4).map(s => <span key={s} className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-md">{s}</span>)}
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="bg-mystic-dark border border-white/10 rounded-2xl p-6 space-y-7">
                            {/* Photos */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Photos</h3>
                                <div className="flex gap-4 items-end">
                                    <div>
                                        <p className="text-xs text-white/40 mb-2">Profile Photo</p>
                                        <PhotoUpload
                                            label="Upload photo" accept="image/*"
                                            previewSrc={profilePhoto} inputRef={photoRef}
                                            onFileChange={handlePhotoChange} icon={Camera}
                                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 overflow-hidden" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-white/40 mb-2">Profile Banner</p>
                                        <PhotoUpload
                                            label="Upload banner" accept="image/*"
                                            previewSrc={profileBanner} inputRef={bannerRef}
                                            onFileChange={handleBannerChange} icon={Image}
                                            className="w-full h-20 rounded-xl border-2 border-dashed border-white/20 bg-white/5 overflow-hidden" />
                                    </div>
                                </div>
                            </div>

                            {/* Basic info */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Profile Info</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1.5">Headline</label>
                                        <input value={profileForm.headline} onChange={e => setProfileForm(f => ({ ...f, headline: e.target.value }))}
                                            placeholder="e.g. Vedic Astrologer with 10+ years of experience"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1.5">Public Description</label>
                                        <textarea value={profileForm.public_description}
                                            onChange={e => setProfileForm(f => ({ ...f, public_description: e.target.value }))}
                                            placeholder="Describe your approach, what clients can expect, your philosophy..."
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1.5">Professional Bio</label>
                                        <textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                                            placeholder="Your background, qualifications, and expertise..."
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1.5">Years of Experience</label>
                                            <input type="number" min={0} value={profileForm.experience_years}
                                                onChange={e => setProfileForm(f => ({ ...f, experience_years: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-white/50 mb-1.5">Consultation Fee (LKR / session)</label>
                                            <input type="number" min={0} value={profileForm.consultation_fee}
                                                onChange={e => setProfileForm(f => ({ ...f, consultation_fee: e.target.value }))}
                                                placeholder="e.g. 5000"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specializations */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Specializations</h3>
                                <TagToggle options={SPECIALIZATIONS} selected={profileForm.specializations}
                                    onToggle={v => toggleArr('specializations', v)} />
                            </div>

                            {/* Consultation Types */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Consultation Methods</h3>
                                <TagToggle options={CONSULTATION_TYPES} selected={profileForm.consultation_types}
                                    onToggle={v => toggleArr('consultation_types', v)}
                                    colorClass="bg-blue-400/20 text-blue-400 border-blue-400/30" />
                            </div>

                            {/* Languages */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Languages</h3>
                                <TagToggle options={LANGUAGES} selected={profileForm.languages}
                                    onToggle={v => toggleArr('languages', v)}
                                    colorClass="bg-purple-400/20 text-purple-400 border-purple-400/30" />
                            </div>

                            {/* Categories */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Categories</h3>
                                <TagToggle options={CATEGORIES} selected={profileForm.categories}
                                    onToggle={v => toggleArr('categories', v)}
                                    colorClass="bg-emerald-400/20 text-emerald-400 border-emerald-400/30" />
                            </div>

                            {/* Availability toggle */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div>
                                    <p className="text-sm font-medium text-white">Available for new requests</p>
                                    <p className="text-xs text-white/40 mt-0.5">Users can see you as available and request reviews</p>
                                </div>
                                <button onClick={() => setProfileForm(f => ({ ...f, is_available: f.is_available ? 0 : 1 }))}
                                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${profileForm.is_available ? 'bg-emerald-500' : 'bg-white/20'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${profileForm.is_available ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Save button */}
                            <button onClick={saveProfile} disabled={profileSaving}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold font-medium transition-all disabled:opacity-50">
                                {profileSaving
                                    ? <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                                    : <Save size={16} />}
                                Save Profile
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Review Writing Modal */}
            {activeRequest && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
                    <div className="min-h-screen flex items-start justify-center p-4 pt-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-3xl bg-mystic-dark border border-white/10 rounded-3xl p-8 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Write Expert Review</h2>
                                    <p className="text-white/40 text-sm">{activeRequest.subject_name} · {activeRequest.subject_birth_date}</p>
                                </div>
                                <button onClick={() => setActiveRequest(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
                                    <AlertCircle size={15} /> {error}
                                </div>
                            )}
                            <div className="space-y-5">
                                {relevantFields.map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-medium text-gold mb-1.5">{f.label}</label>
                                        <textarea value={reviewForm[f.key] || ''} onChange={e => setReviewForm(r => ({ ...r, [f.key]: e.target.value }))}
                                            placeholder={f.placeholder} rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-y" />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-medium text-gold mb-1.5">Summary * (required)</label>
                                    <textarea value={reviewForm.summary || ''} onChange={e => setReviewForm(r => ({ ...r, summary: e.target.value }))}
                                        placeholder="Overall summary and key takeaways..." rows={5}
                                        className="w-full bg-white/5 border border-gold/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-y" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setActiveRequest(null)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">Cancel</button>
                                <button onClick={submitReview} disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold text-sm font-medium transition-all disabled:opacity-50">
                                    {saving ? <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> : <Save size={15} />}
                                    Submit Review
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
