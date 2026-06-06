import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, ChevronRight, ChevronLeft, Upload, Check, AlertCircle, Copy
} from 'lucide-react';
import { submitExpertApplicationApi } from '../services/api';

const STEPS = [
    { n: 1, label: 'Personal Info' },
    { n: 2, label: 'Professional' },
    { n: 3, label: 'Qualifications' },
    { n: 4, label: 'Services' },
    { n: 5, label: 'Portfolio' },
    { n: 6, label: 'Verification' },
    { n: 7, label: 'Banking' },
    { n: 8, label: 'Profile' },
    { n: 9, label: 'Agreements' },
];

const SPECIALIZATIONS = ['Vedic Astrology', 'Western Astrology', 'Numerology', 'Palmistry', 'Tarot', 'Feng Shui', 'Horoscope Matching', 'Other'];
const LANGUAGES = ['Sinhala', 'Tamil', 'English', 'Hindi', 'Urdu', 'Arabic', 'French', 'German', 'Chinese', 'Japanese'];
const CONSULTATION_TYPES = ['Chat', 'Voice Call', 'Video Call', 'Email'];
const SERVICES = ['Birth Chart Reading', 'Transit Analysis', 'Relationship Compatibility', 'Career Guidance', 'Financial Forecast', 'Health Reading', 'Vastu Shastra', 'Gem Recommendation', 'Name Correction', 'Marriage Timing'];
const CATEGORIES = ['Astrology', 'Numerology', 'Tarot', 'Palmistry', 'Feng Shui', 'Meditation', 'Spiritual Healing'];
const TIMEZONES = ['Asia/Colombo', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'];
const PAYMENT_METHODS = ['Bank Transfer', 'PayPal', 'Stripe', 'Wise', 'Payoneer'];

const ic = 'w-full bg-mystic-light border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 placeholder:text-white/30';
const lc = 'block text-xs text-white/50 mb-1.5 uppercase tracking-wide';
const st = 'text-base font-semibold text-gold mb-4';

const initialForm = {
    name: '', display_name: '', date_of_birth: '', gender: '', nationality: '',
    phone: '', email: '', address_line1: '', address_line2: '', city: '',
    state_province: '', postal_code: '', country: '',
    specializations: [], years_experience: '', current_occupation: '',
    languages_spoken: [], professional_bio: '', expertise_areas: [], why_join: '',
    education_level: '', certifications: '', training_institute: '', additional_qualifications: '',
    consultation_types: [], services_offered: [], consultation_fee: '',
    availability_schedule: '', timezone: '',
    clients_served: '', years_practice: '', testimonials: '',
    social_facebook: '', social_instagram: '', social_twitter: '', social_youtube: '',
    website_url: '', linkedin_url: '',
    id_type: '', id_number: '',
    bank_name: '', account_holder_name: '', account_number: '', branch_name: '',
    payment_method: '', tax_id: '',
    public_display_name: '', public_description: '', headline: '',
    profile_languages: [], consultation_categories: [],
    agreed_terms: false, agreed_privacy: false, agreed_nda: false,
    electronic_signature: '', submission_date: new Date().toISOString().split('T')[0],
};

function CheckboxGroup({ options, value = [], onChange, cols = 3 }) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-2`}>
            {options.map(opt => {
                const checked = value.includes(opt);
                return (
                    <label key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm
                        ${checked ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
                        <input type="checkbox" className="hidden" checked={checked}
                            onChange={() => onChange(checked ? value.filter(v => v !== opt) : [...value, opt])} />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                            ${checked ? 'border-gold bg-gold' : 'border-white/30'}`}>
                            {checked && <Check size={10} className="text-black" />}
                        </div>
                        {opt}
                    </label>
                );
            })}
        </div>
    );
}

function FileInput({ label, name, accept, multiple, onChange, current }) {
    const ref = useRef();
    return (
        <div>
            <label className={lc}>{label}</label>
            <div onClick={() => ref.current.click()}
                className="flex items-center gap-3 px-4 py-3 bg-mystic-light border border-white/10 rounded-xl cursor-pointer hover:border-gold/40 transition-all">
                <Upload size={16} className="text-gold flex-shrink-0" />
                <span className="text-sm text-white/60 truncate">
                    {current
                        ? (Array.isArray(current) && current.length ? `${current.length} file(s) selected` : current?.name || 'File selected')
                        : `Choose ${multiple ? 'files' : 'file'}`}
                </span>
            </div>
            <input ref={ref} type="file" className="hidden" accept={accept} multiple={multiple}
                onChange={e => onChange(multiple ? Array.from(e.target.files) : e.target.files[0])} />
        </div>
    );
}

export default function BecomeExpert() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(() => {
        try {
            const saved = localStorage.getItem('expertAppDraft');
            return saved ? { ...initialForm, ...JSON.parse(saved) } : initialForm;
        } catch { return initialForm; }
    });
    const [files, setFiles] = useState({
        profile_photo: null, certification_docs: [], id_document: null,
        selfie_photo: null, address_proof: null, sample_reports: [], profile_banner: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [pinCopied, setPinCopied] = useState(false);

    useEffect(() => {
        try { localStorage.setItem('expertAppDraft', JSON.stringify(form)); } catch {}
    }, [form]);

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const setFile = (field, value) => setFiles(f => ({ ...f, [field]: value }));

    const validate = () => {
        if (step === 1 && (!form.name.trim() || !form.email.trim() || !form.phone.trim())) return 'Full name, email, and phone are required.';
        if (step === 2 && (!form.specializations.length || !form.years_experience)) return 'Select at least one specialization and enter years of experience.';
        if (step === 6 && (!form.id_type || !form.id_number.trim())) return 'Government ID type and number are required.';
        if (step === 9) {
            if (!form.agreed_terms || !form.agreed_privacy || !form.agreed_nda) return 'Please accept all three agreements to continue.';
            if (!form.electronic_signature.trim()) return 'Electronic signature is required.';
        }
        return '';
    };

    const next = () => {
        const err = validate();
        if (err) { setError(err); return; }
        setError('');
        setStep(s => Math.min(s + 1, 9));
        window.scrollTo(0, 0);
    };

    const back = () => { setError(''); setStep(s => Math.max(s - 1, 1)); window.scrollTo(0, 0); };

    const handleSubmit = async () => {
        const err = validate();
        if (err) { setError(err); return; }
        setLoading(true);
        setError('');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
                else if (v !== null && v !== undefined && v !== '') fd.append(k, v);
            });
            if (files.profile_photo) fd.append('profile_photo', files.profile_photo);
            if (files.id_document) fd.append('id_document', files.id_document);
            if (files.selfie_photo) fd.append('selfie_photo', files.selfie_photo);
            if (files.address_proof) fd.append('address_proof', files.address_proof);
            if (files.profile_banner) fd.append('profile_banner', files.profile_banner);
            files.certification_docs.forEach(f => fd.append('certification_docs', f));
            files.sample_reports.forEach(f => fd.append('sample_reports', f));

            const res = await submitExpertApplicationApi(fd);
            try { localStorage.removeItem('expertAppDraft'); } catch {}
            setSuccess(res.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyPin = () => {
        navigator.clipboard.writeText(success.pin).catch(() => {});
        setPinCopied(true);
        setTimeout(() => setPinCopied(false), 2000);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-mystic flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-mystic-dark border border-gold/30 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} className="text-gold" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                    <p className="text-white/60 text-sm mb-6">Your expert application has been received. Save the PIN below to access your application portal.</p>

                    <div className="bg-mystic-light border border-gold/40 rounded-xl p-6 mb-4">
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-3">Your Access PIN — Save This Now</p>
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-4xl font-mono font-bold tracking-[0.3em] text-gold">{success.pin}</span>
                            <button onClick={copyPin} className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 transition-all">
                                {pinCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-gold" />}
                            </button>
                        </div>
                        <p className="text-xs text-red-400 mt-3 flex items-center justify-center gap-1">
                            <AlertCircle size={12} /> This PIN is shown only once. Copy and save it securely.
                        </p>
                    </div>
                    <p className="text-sm text-white/50 mb-6">Login email: <span className="text-gold font-mono">{success.email}</span></p>

                    <div className="flex flex-col gap-3">
                        <Link to="/expert-status"
                            className="py-3 bg-gold text-black font-semibold rounded-xl text-sm hover:bg-gold/90 transition-all text-center">
                            Go to Application Portal
                        </Link>
                        <Link to="/" className="py-3 bg-white/10 text-white rounded-xl text-sm hover:bg-white/15 transition-all text-center">
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 1: return (
                <div className="space-y-5">
                    <p className={st}>Personal Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={lc}>Full Name *</label><input className={ic} value={form.name} onChange={e => set('name', e.target.value)} placeholder="As on official ID" /></div>
                        <div><label className={lc}>Display Name</label><input className={ic} value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="Publicly shown name" /></div>
                        <div><label className={lc}>Date of Birth</label><input type="date" className={ic} value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} /></div>
                        <div>
                            <label className={lc}>Gender</label>
                            <select className={ic} value={form.gender} onChange={e => set('gender', e.target.value)}>
                                <option value="">Select</option>
                                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                            </select>
                        </div>
                        <div><label className={lc}>Nationality</label><input className={ic} value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g. Sri Lankan" /></div>
                        <div><label className={lc}>Email *</label><input type="email" className={ic} value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" /></div>
                        <div><label className={lc}>Phone *</label><input className={ic} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+94 77 000 0000" /></div>
                    </div>
                    <FileInput label="Profile Photo" accept="image/*" onChange={v => setFile('profile_photo', v)} current={files.profile_photo} />
                    <p className={st + ' mt-6'}>Address</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><label className={lc}>Address Line 1</label><input className={ic} value={form.address_line1} onChange={e => set('address_line1', e.target.value)} placeholder="Street address" /></div>
                        <div className="md:col-span-2"><label className={lc}>Address Line 2</label><input className={ic} value={form.address_line2} onChange={e => set('address_line2', e.target.value)} placeholder="Apartment, suite, etc." /></div>
                        <div><label className={lc}>City</label><input className={ic} value={form.city} onChange={e => set('city', e.target.value)} /></div>
                        <div><label className={lc}>State / Province</label><input className={ic} value={form.state_province} onChange={e => set('state_province', e.target.value)} /></div>
                        <div><label className={lc}>Postal Code</label><input className={ic} value={form.postal_code} onChange={e => set('postal_code', e.target.value)} /></div>
                        <div><label className={lc}>Country</label><input className={ic} value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. Sri Lanka" /></div>
                    </div>
                </div>
            );
            case 2: return (
                <div className="space-y-5">
                    <p className={st}>Professional Information</p>
                    <div><label className={lc}>Specializations * (select all that apply)</label><CheckboxGroup options={SPECIALIZATIONS} value={form.specializations} onChange={v => set('specializations', v)} cols={4} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={lc}>Years of Experience *</label><input type="number" min="0" className={ic} value={form.years_experience} onChange={e => set('years_experience', e.target.value)} /></div>
                        <div><label className={lc}>Current Occupation</label><input className={ic} value={form.current_occupation} onChange={e => set('current_occupation', e.target.value)} placeholder="e.g. Full-time Astrologer" /></div>
                    </div>
                    <div><label className={lc}>Languages Spoken</label><CheckboxGroup options={LANGUAGES} value={form.languages_spoken} onChange={v => set('languages_spoken', v)} cols={4} /></div>
                    <div>
                        <label className={lc}>Professional Bio</label>
                        <textarea rows={5} className={ic + ' resize-none'} value={form.professional_bio} onChange={e => set('professional_bio', e.target.value)} placeholder="Describe your background, approach, and unique expertise..." />
                    </div>
                    <div><label className={lc}>Specific Expertise Areas</label><CheckboxGroup options={SPECIALIZATIONS} value={form.expertise_areas} onChange={v => set('expertise_areas', v)} cols={4} /></div>
                    <div>
                        <label className={lc}>Why do you want to join Astro.lk?</label>
                        <textarea rows={3} className={ic + ' resize-none'} value={form.why_join} onChange={e => set('why_join', e.target.value)} placeholder="Share your motivation..." />
                    </div>
                </div>
            );
            case 3: return (
                <div className="space-y-5">
                    <p className={st}>Qualifications & Certifications</p>
                    <div>
                        <label className={lc}>Highest Education Level</label>
                        <select className={ic} value={form.education_level} onChange={e => set('education_level', e.target.value)}>
                            <option value="">Select</option>
                            <option>High School</option><option>Diploma</option><option>Bachelor's Degree</option><option>Master's Degree</option><option>PhD / Doctorate</option><option>Professional Certification</option>
                        </select>
                    </div>
                    <div>
                        <label className={lc}>Certifications (one per line)</label>
                        <textarea rows={4} className={ic + ' resize-none'} value={form.certifications} onChange={e => set('certifications', e.target.value)}
                            placeholder="e.g. Certified Vedic Astrologer – Institute of Vedic Astrology, 2018" />
                    </div>
                    <FileInput label="Upload Certificates (up to 5, images or PDF)" accept="image/*,.pdf" multiple onChange={v => setFile('certification_docs', v)} current={files.certification_docs} />
                    <div><label className={lc}>Training Institute / Guru</label><input className={ic} value={form.training_institute} onChange={e => set('training_institute', e.target.value)} placeholder="e.g. Institute of Vedic Astrology" /></div>
                    <div>
                        <label className={lc}>Additional Qualifications</label>
                        <textarea rows={3} className={ic + ' resize-none'} value={form.additional_qualifications} onChange={e => set('additional_qualifications', e.target.value)} placeholder="Workshops, online courses, other training..." />
                    </div>
                </div>
            );
            case 4: return (
                <div className="space-y-5">
                    <p className={st}>Service Information</p>
                    <div><label className={lc}>Consultation Types</label><CheckboxGroup options={CONSULTATION_TYPES} value={form.consultation_types} onChange={v => set('consultation_types', v)} cols={4} /></div>
                    <div><label className={lc}>Services Offered</label><CheckboxGroup options={SERVICES} value={form.services_offered} onChange={v => set('services_offered', v)} cols={3} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={lc}>Consultation Fee (LKR / session)</label><input type="number" min="0" className={ic} value={form.consultation_fee} onChange={e => set('consultation_fee', e.target.value)} placeholder="e.g. 2500" /></div>
                        <div>
                            <label className={lc}>Timezone</label>
                            <select className={ic} value={form.timezone} onChange={e => set('timezone', e.target.value)}>
                                <option value="">Select timezone</option>
                                {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={lc}>Availability Schedule</label>
                        <textarea rows={3} className={ic + ' resize-none'} value={form.availability_schedule} onChange={e => set('availability_schedule', e.target.value)} placeholder="e.g. Mon–Fri 9am–5pm, Sat 9am–1pm (Sri Lanka time)" />
                    </div>
                </div>
            );
            case 5: return (
                <div className="space-y-5">
                    <p className={st}>Experience & Portfolio</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={lc}>Total Clients Served</label><input type="number" min="0" className={ic} value={form.clients_served} onChange={e => set('clients_served', e.target.value)} placeholder="Approximate number" /></div>
                        <div><label className={lc}>Years in Practice</label><input type="number" min="0" className={ic} value={form.years_practice} onChange={e => set('years_practice', e.target.value)} /></div>
                    </div>
                    <FileInput label="Sample Reports (up to 5)" accept="image/*,.pdf" multiple onChange={v => setFile('sample_reports', v)} current={files.sample_reports} />
                    <div>
                        <label className={lc}>Client Testimonials</label>
                        <textarea rows={4} className={ic + ' resize-none'} value={form.testimonials} onChange={e => set('testimonials', e.target.value)} placeholder="Paste testimonials or describe client feedback..." />
                    </div>
                    <p className={st + ' mt-4'}>Online Presence</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={lc}>Website URL</label><input className={ic} value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://" /></div>
                        <div><label className={lc}>LinkedIn / Portfolio</label><input className={ic} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
                        <div><label className={lc}>Facebook</label><input className={ic} value={form.social_facebook} onChange={e => set('social_facebook', e.target.value)} placeholder="https://facebook.com/..." /></div>
                        <div><label className={lc}>Instagram</label><input className={ic} value={form.social_instagram} onChange={e => set('social_instagram', e.target.value)} placeholder="@username" /></div>
                        <div><label className={lc}>Twitter / X</label><input className={ic} value={form.social_twitter} onChange={e => set('social_twitter', e.target.value)} placeholder="@username" /></div>
                        <div><label className={lc}>YouTube</label><input className={ic} value={form.social_youtube} onChange={e => set('social_youtube', e.target.value)} placeholder="https://youtube.com/..." /></div>
                    </div>
                </div>
            );
            case 6: return (
                <div className="space-y-5">
                    <p className={st}>Verification Information</p>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <p className="text-xs text-yellow-300 flex items-start gap-2">
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                            All verification documents are strictly confidential and used only for identity verification.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={lc}>Government ID Type *</label>
                            <select className={ic} value={form.id_type} onChange={e => set('id_type', e.target.value)}>
                                <option value="">Select ID type</option>
                                <option>National Identity Card</option><option>Passport</option><option>Driving License</option><option>Voter ID</option><option>Other</option>
                            </select>
                        </div>
                        <div><label className={lc}>ID Number *</label><input className={ic} value={form.id_number} onChange={e => set('id_number', e.target.value)} placeholder="Enter ID number" /></div>
                    </div>
                    <FileInput label="ID Document (front & back)" accept="image/*,.pdf" onChange={v => setFile('id_document', v)} current={files.id_document} />
                    <FileInput label="Selfie Holding ID" accept="image/*" onChange={v => setFile('selfie_photo', v)} current={files.selfie_photo} />
                    <FileInput label="Address Proof (utility bill, bank statement)" accept="image/*,.pdf" onChange={v => setFile('address_proof', v)} current={files.address_proof} />
                </div>
            );
            case 7: return (
                <div className="space-y-5">
                    <p className={st}>Banking & Payment Details</p>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <p className="text-xs text-blue-300">Payment information is used for consultation fee disbursement. Data is encrypted and securely stored.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={lc}>Bank Name</label><input className={ic} value={form.bank_name} onChange={e => set('bank_name', e.target.value)} placeholder="e.g. Bank of Ceylon" /></div>
                        <div><label className={lc}>Account Holder Name</label><input className={ic} value={form.account_holder_name} onChange={e => set('account_holder_name', e.target.value)} /></div>
                        <div><label className={lc}>Account Number</label><input className={ic} value={form.account_number} onChange={e => set('account_number', e.target.value)} /></div>
                        <div><label className={lc}>Branch Name</label><input className={ic} value={form.branch_name} onChange={e => set('branch_name', e.target.value)} /></div>
                        <div>
                            <label className={lc}>Preferred Payment Method</label>
                            <select className={ic} value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
                                <option value="">Select</option>
                                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div><label className={lc}>Tax ID / NIC</label><input className={ic} value={form.tax_id} onChange={e => set('tax_id', e.target.value)} placeholder="For tax purposes" /></div>
                    </div>
                </div>
            );
            case 8: return (
                <div className="space-y-5">
                    <p className={st}>Platform Profile Settings</p>
                    <p className="text-sm text-white/50">This is how you will appear to users browsing the platform.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={lc}>Public Display Name</label><input className={ic} value={form.public_display_name} onChange={e => set('public_display_name', e.target.value)} placeholder="e.g. Astrologer Priya" /></div>
                        <div><label className={lc}>Headline</label><input className={ic} value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="e.g. Vedic Astrologer | 15 Years" /></div>
                        <div className="md:col-span-2">
                            <label className={lc}>Public Profile Description</label>
                            <textarea rows={4} className={ic + ' resize-none'} value={form.public_description} onChange={e => set('public_description', e.target.value)} placeholder="Description shown to users browsing experts..." />
                        </div>
                    </div>
                    <FileInput label="Profile Banner Image" accept="image/*" onChange={v => setFile('profile_banner', v)} current={files.profile_banner} />
                    <div><label className={lc}>Languages (for profile)</label><CheckboxGroup options={LANGUAGES} value={form.profile_languages} onChange={v => set('profile_languages', v)} cols={4} /></div>
                    <div><label className={lc}>Consultation Categories</label><CheckboxGroup options={CATEGORIES} value={form.consultation_categories} onChange={v => set('consultation_categories', v)} cols={4} /></div>
                </div>
            );
            case 9: return (
                <div className="space-y-5">
                    <p className={st}>Agreements & Submission</p>
                    {[
                        { field: 'agreed_terms', label: 'Terms of Service *', text: 'I have read and agree to the Astro.lk Terms of Service, including expert conduct guidelines and commission structure.' },
                        { field: 'agreed_privacy', label: 'Privacy Policy *', text: 'I understand and agree to the Privacy Policy regarding how my personal and professional data will be used.' },
                        { field: 'agreed_nda', label: 'Non-Disclosure Agreement *', text: 'I agree to maintain strict confidentiality of all client information and will not share it with any third parties.' },
                    ].map(({ field, label, text }) => (
                        <label key={field} className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all
                            ${form[field] ? 'border-gold/50 bg-gold/5' : 'border-white/10 hover:border-white/20'}`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                                ${form[field] ? 'border-gold bg-gold' : 'border-white/30'}`}>
                                {form[field] && <Check size={12} className="text-black" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={form[field]} onChange={e => set(field, e.target.checked)} />
                            <div>
                                <p className="text-sm font-medium text-white">{label}</p>
                                <p className="text-xs text-white/50 mt-1">{text}</p>
                            </div>
                        </label>
                    ))}
                    <div>
                        <label className={lc}>Electronic Signature *</label>
                        <input className={ic} value={form.electronic_signature} onChange={e => set('electronic_signature', e.target.value)} placeholder="Type your full legal name as signature" />
                    </div>
                    <div>
                        <label className={lc}>Submission Date</label>
                        <input type="date" className={ic} value={form.submission_date} onChange={e => set('submission_date', e.target.value)} />
                    </div>
                    <div className="p-4 bg-mystic-light border border-white/10 rounded-xl">
                        <p className="text-xs text-white/50">By submitting, you confirm all information is accurate and complete. A 6-digit access PIN will be generated — save it to check your application status.</p>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-mystic text-white">
            <div className="border-b border-white/10 p-4 flex items-center gap-3">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
                        <Star size={16} className="text-gold" fill="currentColor" />
                    </div>
                    <span className="font-bold text-gold">Astro.lk</span>
                </Link>
                <span className="text-white/30">/</span>
                <span className="text-white/60 text-sm">Expert Application</span>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-1">Apply to Become an Expert</h1>
                    <p className="text-white/50 text-sm">Complete all sections below. Progress is auto-saved in your browser.</p>
                </div>

                {/* Step progress */}
                <div className="mb-8 overflow-x-auto pb-2">
                    <div className="flex items-center gap-1 min-w-max">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s.n}>
                                <button onClick={() => step > s.n ? setStep(s.n) : undefined}
                                    className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all
                                        ${step === s.n ? 'text-gold' : step > s.n ? 'text-green-400 cursor-pointer' : 'text-white/30 cursor-default'}`}>
                                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold
                                        ${step === s.n ? 'border-gold bg-gold/20 text-gold' : step > s.n ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-white/20 text-white/30'}`}>
                                        {step > s.n ? <Check size={12} /> : s.n}
                                    </div>
                                    <span className="text-xs whitespace-nowrap hidden sm:block">{s.label}</span>
                                </button>
                                {i < STEPS.length - 1 && <div className={`w-5 h-px ${step > s.n ? 'bg-green-400/40' : 'bg-white/10'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="bg-mystic-dark border border-white/10 rounded-2xl p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div key={step}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}>
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        <AlertCircle size={16} className="flex-shrink-0" />{error}
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-4">
                    <button onClick={back} disabled={step === 1}
                        className="flex items-center gap-2 px-5 py-3 bg-white/10 rounded-xl text-sm hover:bg-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronLeft size={16} /> Back
                    </button>
                    <span className="text-sm text-white/40">Step {step} of {STEPS.length}</span>
                    {step < 9 ? (
                        <button onClick={next}
                            className="flex items-center gap-2 px-5 py-3 bg-gold text-black font-semibold rounded-xl text-sm hover:bg-gold/90 transition-all">
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-xl text-sm hover:bg-gold/90 transition-all disabled:opacity-50">
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
