import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GitCompare, Zap, Star, Sun, Calendar, CreditCard, Bell, ChevronRight, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getMembersApi, getPredictionsApi, getMatchesApi, getPredictionUsageApi, getNotificationsApi } from '../../services/api';
import { serverUrl } from '../../config/server';

const StatCard = ({ icon: Icon, label, value, color = 'text-gold', to }) => (
    <Link to={to || '#'}>
        <motion.div whileHover={{ y: -2 }} className="glass-morphism rounded-2xl p-5 border border-white/10 hover:border-gold/30 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gold/10 rounded-xl"><Icon size={20} className={color} /></div>
                <ChevronRight size={16} className="text-white/30" />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-white/50 text-sm mt-1">{label}</p>
        </motion.div>
    </Link>
);

export default function UserDashboard() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [matches, setMatches] = useState([]);
    const [usage, setUsage] = useState(null);
    const [notifications, setNotifications] = useState({ unread_count: 0 });

    useEffect(() => {
        getMembersApi().then(r => setMembers(r.data)).catch(() => {});
        getPredictionsApi().then(r => setPredictions(r.data)).catch(() => {});
        getMatchesApi().then(r => setMatches(r.data)).catch(() => {});
        getPredictionUsageApi().then(r => setUsage(r.data)).catch(() => {});
        getNotificationsApi().then(r => setNotifications(r.data)).catch(() => {});
    }, []);

    const daysLeft = user?.membership_expiry
        ? Math.max(0, Math.ceil((new Date(user.membership_expiry) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;
    const isExpired = user?.membership_expiry && new Date(user.membership_expiry) < new Date();

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center overflow-hidden">
                                {user?.profile_photo
                                    ? <img src={serverUrl(user.profile_photo)} alt="" className="w-full h-full object-cover" />
                                    : <UserCircle size={36} className="text-gold" />}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Welcome, {user?.name?.split(' ')[0]}</h1>
                                <p className="text-white/50 text-sm">Your celestial journey continues today</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${user?.membership_plan === 'platinum' ? 'bg-gold/20 border-gold/40 text-gold' : user?.membership_plan === 'premium' ? 'bg-blue-400/20 border-blue-400/40 text-blue-400' : 'bg-gray-400/20 border-gray-400/40 text-gray-400'}`}>
                                ✦ {user?.membership_plan} Plan
                            </span>
                            {notifications.unread_count > 0 && (
                                <Link to="/dashboard/notifications">
                                    <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs">{notifications.unread_count} alerts</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {daysLeft <= 7 && daysLeft > 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center justify-between">
                        <span>⚠️ Your membership expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}!</span>
                        <Link to="/dashboard/subscription" className="underline font-medium">Renew Now</Link>
                    </div>
                )}
                {isExpired && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
                        <span>❌ Your membership has expired.</span>
                        <Link to="/dashboard/subscription" className="underline font-medium">Upgrade Now</Link>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Users} label="Family Members" value={members.length} to="/dashboard/members" />
                    <StatCard icon={Sun} label="Total Predictions" value={predictions.length} color="text-yellow-400" to="/dashboard/predictions/daily" />
                    <StatCard icon={GitCompare} label="Matches Run" value={matches.length} color="text-pink-400" to="/dashboard/matching" />
                    <StatCard icon={Bell} label="Unread Alerts" value={notifications.unread_count || 0} color="text-blue-400" to="/dashboard/notifications" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="glass-morphism rounded-2xl p-6 border border-white/10">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-gold" /> Usage This Month</h2>
                        {usage ? (
                            <div className="space-y-4">
                                {[
                                    { label: 'Daily Predictions', used: usage.usage?.daily_count || 0, max: usage.limits?.max_predictions || 3 },
                                    { label: 'Horoscope Matches', used: usage.usage?.matching_count || 0, max: usage.limits?.max_matching || 1 },
                                ].map(({ label, used, max }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-white/60">{label}</span>
                                            <span className="text-white font-medium">{used} / {max === -1 ? '∞' : max}</span>
                                        </div>
                                        {max !== -1 && (
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(100, (used / max) * 100)}%` }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-white/10 text-center">
                                    <span className="text-xs text-white/40">Plan: </span>
                                    <span className="text-xs text-gold capitalize font-medium">{usage.plan}</span>
                                </div>
                                <Link to="/dashboard/subscription" className="block text-center text-xs text-gold/70 hover:text-gold transition-colors">Upgrade for unlimited →</Link>
                            </div>
                        ) : (
                            <p className="text-white/30 text-sm">Loading...</p>
                        )}
                    </div>

                    <div className="lg:col-span-2 glass-morphism rounded-2xl p-6 border border-white/10">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Star size={18} className="text-gold" /> Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { icon: Users, label: 'Add Member', to: '/dashboard/members', color: 'text-emerald-400' },
                                { icon: Sun, label: 'Daily Reading', to: '/dashboard/predictions/daily', color: 'text-yellow-400' },
                                { icon: GitCompare, label: 'Match Now', to: '/dashboard/matching', color: 'text-pink-400' },
                                { icon: Calendar, label: 'Monthly', to: '/dashboard/predictions/monthly', color: 'text-blue-400' },
                                { icon: Star, label: 'Yearly', to: '/dashboard/predictions/yearly', color: 'text-purple-400' },
                                { icon: CreditCard, label: 'Upgrade', to: '/dashboard/subscription', color: 'text-gold' },
                            ].map(({ icon: Icon, label, to, color }) => (
                                <Link key={to} to={to}>
                                    <motion.div whileHover={{ scale: 1.03 }}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                                        <Icon size={22} className={color} />
                                        <span className="text-xs text-white/70">{label}</span>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-morphism rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2"><Sun size={18} className="text-gold" /> Recent Predictions</h2>
                        <Link to="/dashboard/predictions/daily" className="text-sm text-gold/70 hover:text-gold transition-colors">View All →</Link>
                    </div>
                    {predictions.length === 0 ? (
                        <div className="text-center py-8 text-white/30">
                            <Sun size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm mb-2">No predictions yet.</p>
                            <Link to="/dashboard/predictions/daily" className="text-gold/70 text-sm hover:text-gold">Generate your first prediction →</Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {predictions.slice(0, 5).map(p => (
                                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.prediction_type === 'daily' ? 'bg-yellow-400' : p.prediction_type === 'monthly' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium capitalize">{p.prediction_type} Prediction — {p.period}</p>
                                        <p className="text-xs text-white/40 truncate">{p.ai_summary?.slice(0, 80)}</p>
                                    </div>
                                    <span className="text-xs text-white/30 flex-shrink-0">{new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
