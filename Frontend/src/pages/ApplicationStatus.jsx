import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, LogIn, Clock, CheckCircle, XCircle, AlertCircle, Download,
    ChevronDown, ChevronUp, RefreshCw, Eye, EyeOff, Loader
} from 'lucide-react';
import { loginTempAccountApi, getTempApplicationApi } from '../services/api';

const STATUS_FLOW = [
    { key: 'draft',               label: 'Draft',               color: 'text-gray-400',  bg: 'bg-gray-400/20',  border: 'border-gray-400/30' },
    { key: 'submitted',           label: 'Submitted',           color: 'text-blue-400',  bg: 'bg-blue-400/20',  border: 'border-blue-400/30' },
    { key: 'under_review',        label: 'Under Review',        color: 'text-yellow-400',bg: 'bg-yellow-400/20',border: 'border-yellow-400/30' },
    { key: 'interview_scheduled', label: 'Interview Scheduled', color: 'text-purple-400',bg: 'bg-purple-400/20',border: 'border-purple-400/30' },
    { key: 'approved',            label: 'Approved',            color: 'text-green-400', bg: 'bg-green-400/20', border: 'border-green-400/30' },
    { key: 'rejected',            label: 'Rejected',            color: 'text-red-400',   bg: 'bg-red-400/20',   border: 'border-red-400/30' },
    { key: 'suspended',           label: 'Suspended',           color: 'text-orange-400',bg: 'bg-orange-400/20',border: 'border-orange-400/30' },
];

const ic = 'w-full bg-mystic-light border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 placeholder:text-white/30';
const lc = 'block text-xs text-white/50 mb-1.5 uppercase tracking-wide';

function StatusBadge({ status }) {
    const s = STATUS_FLOW.find(x => x.key === status) || STATUS_FLOW[0];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.bg} ${s.color} ${s.border}`}>
            {status === 'approved' && <CheckCircle size={12} />}
            {status === 'rejected' && <XCircle size={12} />}
            {!['approved', 'rejected'].includes(status) && <Clock size={12} />}
            {s.label}
        </span>
    );
}

function Section({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-all">
                <span className="text-sm font-semibold text-white">{title}</span>
                {open ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Field({ label, value, full }) {
    if (!value && value !== 0) return null;
    let display = value;
    if (typeof value === 'string' && value.startsWith('[')) {
        try { display = JSON.parse(value).join(', '); } catch {}
    }
    return (
        <div className={full ? 'md:col-span-2' : ''}>
            <p className="text-xs text-white/40 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm text-white/80 break-words">{String(display)}</p>
        </div>
    );
}

function CountdownTimer({ expiresAt }) {
    const [remaining, setRemaining] = useState('');

    useEffect(() => {
        const update = () => {
            const diff = new Date(expiresAt) - Date.now();
            if (diff <= 0) { setRemaining('Account deleted'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${h}h ${m}m ${s}s`);
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, [expiresAt]);

    return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-1">Account Deletion Countdown</p>
            <p className="text-2xl font-mono text-red-400 font-bold">{remaining}</p>
            <p className="text-xs text-white/50 mt-1">This temporary account and all data will be permanently deleted when the timer reaches zero.</p>
        </div>
    );
}

export default function ApplicationStatus() {
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [token, setToken] = useState(() => sessionStorage.getItem('expertTempToken') || '');
    const [app, setApp] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadApplication = useCallback(async (t) => {
        try {
            const res = await getTempApplicationApi(t);
            setApp(res.data);
            setView('portal');
        } catch (e) {
            sessionStorage.removeItem('expertTempToken');
            setToken('');
            setView('login');
        }
    }, []);

    useEffect(() => {
        if (token) loadApplication(token);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !pin.trim()) { setError('Email and PIN are required.'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await loginTempAccountApi({ email: email.trim(), pin: pin.trim() });
            const { token: t, application } = res.data;
            sessionStorage.setItem('expertTempToken', t);
            setToken(t);
            setApp(application);
            setView('portal');
        } catch (e) {
            setError(e.response?.data?.message || 'Login failed. Check your email and PIN.');
        } finally {
            setLoading(false);
        }
    };

    const refresh = async () => {
        setRefreshing(true);
        await loadApplication(token);
        setRefreshing(false);
    };

    const logout = () => {
        sessionStorage.removeItem('expertTempToken');
        setToken('');
        setApp(null);
        setView('login');
        setEmail('');
        setPin('');
    };

    const downloadApplication = () => {
        if (!app) return;
        const safe = (v) => {
            if (!v) return 'N/A';
            if (typeof v === 'string' && v.startsWith('[')) {
                try { return JSON.parse(v).join(', '); } catch {}
            }
            return String(v);
        };
        const lines = [
            '========================================',
            'ASTRO.LK — EXPERT APPLICATION',
            '========================================',
            '',
            `Application ID:  ${app.id}`,
            `Submitted:       ${app.created_at ? new Date(app.created_at).toLocaleString() : 'N/A'}`,
            `Status:          ${app.status?.toUpperCase() || 'N/A'}`,
            '',
            '--- PERSONAL INFORMATION ---',
            `Full Name:       ${safe(app.name)}`,
            `Display Name:    ${safe(app.display_name)}`,
            `Email:           ${safe(app.email)}`,
            `Phone:           ${safe(app.phone)}`,
            `Date of Birth:   ${safe(app.date_of_birth)}`,
            `Gender:          ${safe(app.gender)}`,
            `Nationality:     ${safe(app.nationality)}`,
            `Address:         ${[app.address_line1, app.address_line2, app.city, app.state_province, app.postal_code, app.country].filter(Boolean).join(', ') || 'N/A'}`,
            '',
            '--- PROFESSIONAL INFORMATION ---',
            `Specializations: ${safe(app.specializations)}`,
            `Years Experience:${safe(app.years_experience)}`,
            `Occupation:      ${safe(app.current_occupation)}`,
            `Languages:       ${safe(app.languages_spoken)}`,
            `Bio:             ${safe(app.bio)}`,
            '',
            '--- QUALIFICATIONS ---',
            `Education:       ${safe(app.education_level)}`,
            `Certifications:  ${safe(app.certifications)}`,
            `Training:        ${safe(app.training_institute)}`,
            `Additional:      ${safe(app.additional_qualifications)}`,
            '',
            '--- SERVICES ---',
            `Consultation:    ${safe(app.consultation_types)}`,
            `Services:        ${safe(app.services_offered)}`,
            `Fee (LKR):       ${safe(app.consultation_fee)}`,
            `Timezone:        ${safe(app.timezone)}`,
            `Availability:    ${safe(app.availability_schedule)}`,
            '',
            '--- EXPERIENCE & PORTFOLIO ---',
            `Clients Served:  ${safe(app.clients_served)}`,
            `Years Practice:  ${safe(app.years_practice)}`,
            `Website:         ${safe(app.website_url)}`,
            '',
            '--- PLATFORM PROFILE ---',
            `Display Name:    ${safe(app.public_display_name)}`,
            `Headline:        ${safe(app.headline)}`,
            `Categories:      ${safe(app.consultation_categories)}`,
            '',
            '========================================',
            `Downloaded: ${new Date().toLocaleString()}`,
            '========================================',
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `astrolks-expert-application-${app.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const statusInfo = STATUS_FLOW.find(s => s.key === app?.status) || STATUS_FLOW[1];
    const history = (() => { try { return JSON.parse(app?.status_history || '[]'); } catch { return []; } })();
    const isRejected = app?.status === 'rejected';
    const isApproved = app?.status === 'approved';

    return (
        <div className="min-h-screen bg-mystic text-white">
            <div className="border-b border-white/10 p-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
                        <Star size={16} className="text-gold" fill="currentColor" />
                    </div>
                    <span className="font-bold text-gold">Astro.lk</span>
                </Link>
                {view === 'portal' && (
                    <button onClick={logout} className="text-xs text-white/40 hover:text-white/70 transition-all">Sign Out</button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'login' ? (
                    <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-center min-h-[calc(100vh-65px)] p-4">
                        <div className="w-full max-w-sm">
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-gold/10 border border-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <LogIn size={24} className="text-gold" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-1">Application Portal</h1>
                                <p className="text-white/50 text-sm">Enter your email and PIN to access your application status.</p>
                            </div>

                            <form onSubmit={handleLogin} className="bg-mystic-dark border border-white/10 rounded-2xl p-6 space-y-4">
                                <div>
                                    <label className={lc}>Email Address</label>
                                    <input type="email" className={ic} value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" />
                                </div>
                                <div>
                                    <label className={lc}>Access PIN</label>
                                    <div className="relative">
                                        <input type={showPin ? 'text' : 'password'} className={ic + ' pr-12'} value={pin}
                                            onChange={e => setPin(e.target.value)} placeholder="6-digit PIN" maxLength={6} inputMode="numeric" />
                                        <button type="button" onClick={() => setShowPin(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-all">
                                            {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                                        <AlertCircle size={14} className="flex-shrink-0" />{error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full py-3 bg-gold text-black font-bold rounded-xl text-sm hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <><Loader size={16} className="animate-spin" /> Signing in...</> : 'Access Portal'}
                                </button>
                            </form>

                            <p className="text-center text-xs text-white/40 mt-4">
                                Haven't applied yet?{' '}
                                <Link to="/become-expert" className="text-gold hover:underline">Apply Now</Link>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="max-w-3xl mx-auto px-4 py-8">

                        {/* Header */}
                        <div className="flex items-start justify-between mb-6 gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-white">Expert Application</h1>
                                <p className="text-sm text-white/50">{app?.name} — {app?.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={refresh} disabled={refreshing}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50">
                                    <RefreshCw size={15} className={refreshing ? 'animate-spin text-gold' : 'text-white/60'} />
                                </button>
                                <button onClick={downloadApplication}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm transition-all">
                                    <Download size={15} /> Download
                                </button>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={`p-5 rounded-2xl border mb-6 ${statusInfo.bg} ${statusInfo.border}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Current Status</p>
                                    <StatusBadge status={app?.status} />
                                    {app?.rejection_reason && (
                                        <p className="text-sm text-white/70 mt-2">{app.rejection_reason}</p>
                                    )}
                                    {isApproved && (
                                        <p className="text-sm text-green-300 mt-2">🎉 Congratulations! Your application has been approved. You will receive login credentials shortly.</p>
                                    )}
                                </div>
                                <div className="text-right text-xs text-white/40">
                                    <p>Applied</p>
                                    <p>{app?.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rejection countdown */}
                        {isRejected && app?.account_expires_at && (
                            <div className="mb-6"><CountdownTimer expiresAt={app.account_expires_at} /></div>
                        )}

                        {/* Status Timeline */}
                        {history.length > 0 && (
                            <div className="bg-mystic-dark border border-white/10 rounded-2xl p-5 mb-6">
                                <p className="text-sm font-semibold text-white mb-4">Status History</p>
                                <div className="space-y-3">
                                    {history.map((h, i) => {
                                        const s = STATUS_FLOW.find(x => x.key === h.status);
                                        return (
                                            <div key={i} className="flex gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s?.color?.replace('text-', 'bg-') || 'bg-gray-400'}`} />
                                                <div>
                                                    <p className={`text-sm font-medium ${s?.color || 'text-white'}`}>{s?.label || h.status}</p>
                                                    {h.note && <p className="text-xs text-white/50">{h.note}</p>}
                                                    <p className="text-xs text-white/30">{new Date(h.timestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Application Data Sections */}
                        <div className="space-y-3">
                            <Section title="Personal Information" defaultOpen={true}>
                                <Field label="Full Name" value={app?.name} />
                                <Field label="Display Name" value={app?.display_name} />
                                <Field label="Email" value={app?.email} />
                                <Field label="Phone" value={app?.phone} />
                                <Field label="Date of Birth" value={app?.date_of_birth} />
                                <Field label="Gender" value={app?.gender} />
                                <Field label="Nationality" value={app?.nationality} />
                                <Field label="City" value={app?.city} />
                                <Field label="Country" value={app?.country} />
                            </Section>

                            <Section title="Professional Information">
                                <Field label="Specializations" value={app?.specializations} full />
                                <Field label="Years of Experience" value={app?.years_experience} />
                                <Field label="Current Occupation" value={app?.current_occupation} />
                                <Field label="Languages Spoken" value={app?.languages_spoken} full />
                                <Field label="Professional Bio" value={app?.bio} full />
                            </Section>

                            <Section title="Qualifications & Certifications">
                                <Field label="Education Level" value={app?.education_level} />
                                <Field label="Training Institute" value={app?.training_institute} />
                                <Field label="Certifications" value={app?.certifications} full />
                                <Field label="Additional Qualifications" value={app?.additional_qualifications} full />
                            </Section>

                            <Section title="Service Information">
                                <Field label="Consultation Types" value={app?.consultation_types} />
                                <Field label="Services Offered" value={app?.services_offered} full />
                                <Field label="Consultation Fee" value={app?.consultation_fee ? `LKR ${app.consultation_fee}` : null} />
                                <Field label="Timezone" value={app?.timezone} />
                                <Field label="Availability" value={app?.availability_schedule} full />
                            </Section>

                            <Section title="Experience & Portfolio">
                                <Field label="Clients Served" value={app?.clients_served} />
                                <Field label="Years in Practice" value={app?.years_practice} />
                                <Field label="Website" value={app?.website_url} />
                                <Field label="LinkedIn" value={app?.linkedin_url} />
                                <Field label="Social Media" value={[app?.social_facebook, app?.social_instagram, app?.social_twitter, app?.social_youtube].filter(Boolean).join(' | ')} full />
                            </Section>

                            <Section title="Platform Profile Settings">
                                <Field label="Public Display Name" value={app?.public_display_name} />
                                <Field label="Headline" value={app?.headline} />
                                <Field label="Profile Description" value={app?.public_description} full />
                                <Field label="Languages" value={app?.profile_languages} />
                                <Field label="Categories" value={app?.consultation_categories} />
                            </Section>

                            <Section title="Agreements">
                                <Field label="Terms of Service" value={app?.agreed_terms ? '✓ Agreed' : 'Not agreed'} />
                                <Field label="Privacy Policy" value={app?.agreed_privacy ? '✓ Agreed' : 'Not agreed'} />
                                <Field label="NDA" value={app?.agreed_nda ? '✓ Agreed' : 'Not agreed'} />
                                <Field label="Electronic Signature" value={app?.electronic_signature} />
                                <Field label="Submission Date" value={app?.submission_date} />
                            </Section>
                        </div>

                        <div className="mt-8 flex items-center justify-between text-xs text-white/30">
                            <span>Application #{app?.id}</span>
                            <Link to="/" className="hover:text-white/60 transition-all">← Back to Astro.lk</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
