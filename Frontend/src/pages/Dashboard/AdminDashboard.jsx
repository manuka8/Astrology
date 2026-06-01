import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, CreditCard, GitCompare, Sun, Star, UserCheck, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getStatsApi } from '../../services/api';

const Stat = ({ icon: Icon, label, value, color = 'text-gold' }) => (
    <motion.div whileHover={{ y: -2 }} className="glass-morphism rounded-2xl p-5 border border-white/10">
        <div className="p-2 bg-white/5 rounded-xl w-fit mb-3"><Icon size={20} className={color} /></div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-white/50 text-sm mt-1">{label}</p>
    </motion.div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStatsApi().then(r => setStats(r.data)).finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout isAdmin>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Admin Dashboard</h1>
                    <p className="text-white/50 text-sm mt-1">Platform overview and analytics</p>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading stats...</div>
                ) : !stats ? null : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <Stat icon={Users} label="Total Users" value={stats.totalUsers} color="text-blue-400" />
                            <Stat icon={UserCheck} label="Active Users" value={stats.activeUsers} color="text-emerald-400" />
                            <Stat icon={Star} label="Premium Users" value={stats.premiumUsers} color="text-gold" />
                            <Stat icon={DollarSign} label="Total Revenue" value={`LKR ${(stats.totalRevenue || 0).toLocaleString()}`} color="text-purple-400" />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <Stat icon={Sun} label="Predictions" value={stats.totalPredictions} color="text-yellow-400" />
                            <Stat icon={GitCompare} label="Matches" value={stats.totalMatches} color="text-pink-400" />
                            <Stat icon={Users} label="Family Members" value={stats.totalMembers} color="text-cyan-400" />
                            <Stat icon={TrendingUp} label="Free Users" value={stats.freeUsers} color="text-gray-400" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-morphism rounded-2xl p-6 border border-white/10">
                                <h2 className="text-lg font-bold mb-4">Plan Distribution</h2>
                                {stats.planDistribution?.map(p => (
                                    <div key={p.membership_plan} className="mb-3">
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="capitalize text-white/70">{p.membership_plan}</span>
                                            <span className="text-white font-medium">{p.count}</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${p.membership_plan === 'platinum' ? 'bg-gold' : p.membership_plan === 'premium' ? 'bg-blue-400' : 'bg-gray-400'}`}
                                                style={{ width: `${stats.totalUsers ? Math.max(4, (p.count / stats.totalUsers) * 100) : 4}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-morphism rounded-2xl p-6 border border-white/10">
                                <h2 className="text-lg font-bold mb-4">Recent Users</h2>
                                <div className="space-y-3">
                                    {stats.recentUsers?.map(u => (
                                        <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{u.name}</p>
                                                <p className="text-xs text-white/40 truncate">{u.email}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${u.membership_plan === 'platinum' ? 'bg-gold/20 border-gold/40 text-gold' : u.membership_plan === 'premium' ? 'bg-blue-400/20 border-blue-400/40 text-blue-400' : 'bg-gray-500/20 border-gray-500/40 text-gray-400'}`}>
                                                {u.membership_plan}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
