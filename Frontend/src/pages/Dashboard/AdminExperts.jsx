import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Star, Users, CheckCircle, XCircle, Clock, Search,
    X, AlertCircle, Eye, UserCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
    getExpertApplicationsApi, approveExpertApplicationApi,
    rejectExpertApplicationApi, getExpertsListApi,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_BADGE = {
    pending: { color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20', icon: Clock, label: 'Pending' },
    approved: { color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'bg-red-400/10 text-red-400 border-red-400/20', icon: XCircle, label: 'Rejected' },
};

export default function AdminExperts() {
    const { hasPermission } = useAuth();
    const canApprove = hasPermission('expert.approve_reject');

    const [tab, setTab] = useState('applications');
    const [applications, setApplications] = useState([]);
    const [experts, setExperts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [expanded, setExpanded] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (tab === 'applications') fetchApplications();
        else fetchExperts();
    }, [tab, search, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await getExpertApplicationsApi({ search, status: statusFilter });
            setApplications(res.data.applications);
            setTotal(res.data.total);
        } finally { setLoading(false); }
    };

    const fetchExperts = async () => {
        setLoading(true);
        try {
            const res = await getExpertsListApi();
            setExperts(res.data);
        } finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this application and activate their expert account?')) return;
        try {
            await approveExpertApplicationApi(id);
            setSuccess('Application approved. Expert account activated.');
            fetchApplications();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async () => {
        try {
            await rejectExpertApplicationApi(rejectModal, { rejection_reason: rejectReason });
            setRejectModal(null);
            setRejectReason('');
            setSuccess('Application rejected.');
            fetchApplications();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to reject');
        }
    };

    return (
        <DashboardLayout isAdmin>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                        <Star size={20} className="text-gold" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Expert Management</h1>
                        <p className="text-white/50 text-sm mt-1">Review applications and manage your expert team</p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
                        <AlertCircle size={15} /> {error}
                        <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-5 text-sm">
                        <CheckCircle size={15} /> {success}
                        <button onClick={() => setSuccess('')} className="ml-auto"><X size={13} /></button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
                    {[
                        { key: 'applications', label: 'Applications', icon: UserCheck },
                        { key: 'experts', label: 'Active Experts', icon: Users },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${tab === t.key ? 'bg-gold/20 text-gold border border-gold/30' : 'text-white/60 hover:text-white'}`}>
                            <t.icon size={15} />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Applications Tab */}
                {tab === 'applications' && (
                    <div>
                        <div className="flex flex-col sm:flex-row gap-3 mb-5">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50" />
                            </div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50">
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-16 glass-morphism rounded-2xl border border-white/10">
                                <UserCheck size={40} className="text-white/20 mx-auto mb-3" />
                                <p className="text-white/40">No applications found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {applications.map(app => {
                                    const cfg = STATUS_BADGE[app.status];
                                    const isExpanded = expanded === app.id;
                                    return (
                                        <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className="glass-morphism rounded-2xl border border-white/10 overflow-hidden">
                                            <div className="p-5 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold font-bold">
                                                    {app.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-white">{app.name}</p>
                                                    <p className="text-white/40 text-sm">{app.email}</p>
                                                </div>
                                                <span className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 flex-shrink-0 ${cfg.color}`}>
                                                    <cfg.icon size={11} /> {cfg.label}
                                                </span>
                                                <p className="text-white/30 text-xs flex-shrink-0 hidden sm:block">{new Date(app.created_at).toLocaleDateString()}</p>
                                                <button onClick={() => setExpanded(isExpanded ? null : app.id)}
                                                    className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                                                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                </button>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-white/10 p-5 space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                        {app.phone && <div><p className="text-white/40 text-xs mb-1">Phone</p><p className="text-white">{app.phone}</p></div>}
                                                        {app.experience_years > 0 && <div><p className="text-white/40 text-xs mb-1">Experience</p><p className="text-white">{app.experience_years} years</p></div>}
                                                        {app.portfolio_url && <div><p className="text-white/40 text-xs mb-1">Portfolio</p><a href={app.portfolio_url} target="_blank" rel="noreferrer" className="text-gold hover:underline truncate block">{app.portfolio_url}</a></div>}
                                                        {app.linkedin_url && <div><p className="text-white/40 text-xs mb-1">LinkedIn</p><a href={app.linkedin_url} target="_blank" rel="noreferrer" className="text-gold hover:underline truncate block">{app.linkedin_url}</a></div>}
                                                    </div>
                                                    {app.specializations && (() => {
                                                        try {
                                                            const specs = JSON.parse(app.specializations);
                                                            return specs.length > 0 ? (
                                                                <div>
                                                                    <p className="text-white/40 text-xs mb-2">Specializations</p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {specs.map(s => <span key={s} className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-md">{s}</span>)}
                                                                    </div>
                                                                </div>
                                                            ) : null;
                                                        } catch { return null; }
                                                    })()}
                                                    {app.qualifications && <div><p className="text-white/40 text-xs mb-1">Qualifications</p><p className="text-white/70 text-sm">{app.qualifications}</p></div>}
                                                    {app.bio && <div><p className="text-white/40 text-xs mb-1">Bio</p><p className="text-white/70 text-sm">{app.bio}</p></div>}
                                                    {app.why_join && <div><p className="text-white/40 text-xs mb-1">Why they want to join</p><p className="text-white/70 text-sm">{app.why_join}</p></div>}
                                                    {app.rejection_reason && <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-3"><p className="text-white/40 text-xs mb-1">Rejection Reason</p><p className="text-red-300 text-sm">{app.rejection_reason}</p></div>}

                                                    {app.status === 'pending' && canApprove && (
                                                        <div className="flex gap-3 pt-2">
                                                            <button onClick={() => handleApprove(app.id)}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20 text-emerald-400 text-sm font-medium transition-all">
                                                                <CheckCircle size={14} /> Approve
                                                            </button>
                                                            <button onClick={() => { setRejectModal(app.id); setRejectReason(''); }}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-red-400 text-sm font-medium transition-all">
                                                                <XCircle size={14} /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Active Experts Tab */}
                {tab === 'experts' && (
                    loading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
                    ) : experts.length === 0 ? (
                        <div className="text-center py-16 glass-morphism rounded-2xl border border-white/10">
                            <Users size={40} className="text-white/20 mx-auto mb-3" />
                            <p className="text-white/40">No active experts yet. Approve applications above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {experts.map(exp => (
                                <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    className="glass-morphism rounded-2xl p-5 border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                                            {exp.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-white">{exp.name}</p>
                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${exp.is_available ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                                            </div>
                                            <p className="text-white/40 text-xs">{exp.email}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-gold font-semibold">{exp.review_count || 0}</p>
                                            <p className="text-white/30 text-xs">reviews</p>
                                        </div>
                                    </div>
                                    {exp.specializations && (() => {
                                        try {
                                            const specs = JSON.parse(exp.specializations);
                                            return specs.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {specs.slice(0, 3).map(s => <span key={s} className="text-xs bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 rounded-md">{s}</span>)}
                                                    {specs.length > 3 && <span className="text-xs text-white/30">+{specs.length - 3}</span>}
                                                </div>
                                            ) : null;
                                        } catch { return null; }
                                    })()}
                                    {exp.bio && <p className="text-white/40 text-xs line-clamp-2">{exp.bio}</p>}
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md bg-mystic-dark border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Reject Application</h3>
                        <label className="block text-xs text-white/50 mb-1.5">Reason (optional)</label>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            placeholder="Provide feedback to help the applicant improve..."
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none mb-5" />
                        <div className="flex gap-3">
                            <button onClick={() => setRejectModal(null)}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm">Cancel</button>
                            <button onClick={handleReject}
                                className="flex-1 py-2.5 rounded-xl bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-red-400 text-sm font-medium transition-all">
                                Confirm Reject
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
