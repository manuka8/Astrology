import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Star, Zap, Crown } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getPlansApi, subscribeApi, getMySubscriptionsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PLAN_ICONS = { Free: Star, Premium: Zap, Platinum: Crown };
const PLAN_COLORS = {
    Free: { border: 'border-gray-500/30', bg: 'bg-gray-500/10', text: 'text-gray-400', btn: 'bg-gray-500/20 border-gray-500/40 text-gray-300' },
    Premium: { border: 'border-blue-400/30', bg: 'bg-blue-400/10', text: 'text-blue-400', btn: 'bg-blue-400/20 border-blue-400/40 text-blue-300' },
    Platinum: { border: 'border-gold/30', bg: 'bg-gold/10', text: 'text-gold', btn: 'bg-gold/20 border-gold/40 text-gold' },
};

export default function Subscription() {
    const { user, refreshUser } = useAuth();
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        getPlansApi().then(r => setPlans(r.data)).catch(() => {});
        getMySubscriptionsApi().then(r => setSubscriptions(r.data)).finally(() => setLoading(false));
    }, []);

    const handleSubscribe = async (planId, planName) => {
        if (planName === 'Free') return;
        setSubscribing(planId); setError(''); setSuccess('');
        try {
            await subscribeApi({ plan_id: planId, payment_method: 'card' });
            setSuccess(`Successfully subscribed to ${planName} plan!`);
            await refreshUser();
            getMySubscriptionsApi().then(r => setSubscriptions(r.data)).catch(() => {});
        } catch (e) {
            setError(e.response?.data?.message || 'Subscription failed');
        } finally {
            setSubscribing(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Subscription Plans</h1>
                    <p className="text-white/50 text-sm mt-1">Choose the plan that fits your celestial journey</p>
                </div>

                {/* Current plan */}
                <div className="glass-morphism rounded-2xl p-5 border border-white/10 mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-white/40 mb-1">Current Plan</p>
                        <p className="text-lg font-bold capitalize">{user?.membership_plan} Plan</p>
                        {user?.membership_expiry && (
                            <p className="text-xs text-white/40 mt-1">Expires: {new Date(user.membership_expiry).toLocaleDateString()}</p>
                        )}
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize
                        ${user?.membership_plan === 'platinum' ? 'bg-gold/20 border-gold/40 text-gold' :
                          user?.membership_plan === 'premium' ? 'bg-blue-400/20 border-blue-400/40 text-blue-400' :
                          'bg-gray-500/20 border-gray-500/40 text-gray-400'}`}>
                        ✦ {user?.membership_plan}
                    </div>
                </div>

                {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                {success && <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">{success}</div>}

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {plans.map(plan => {
                        const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.Free;
                        const Icon = PLAN_ICONS[plan.name] || Star;
                        const isCurrent = user?.membership_plan === plan.name.toLowerCase();
                        return (
                            <motion.div key={plan.id} whileHover={{ y: -4 }}
                                className={`glass-morphism rounded-2xl p-6 border ${colors.border} relative overflow-hidden ${plan.name === 'Platinum' ? 'ring-1 ring-gold/30' : ''}`}>
                                {plan.name === 'Platinum' && (
                                    <div className="absolute top-3 right-3 text-xs bg-gold/20 border border-gold/40 text-gold px-2 py-0.5 rounded-full">Best Value</div>
                                )}
                                <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                                    <Icon size={22} className={colors.text} />
                                </div>
                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <div className="mb-4">
                                    {plan.price === 0 ? (
                                        <span className="text-3xl font-bold">Free</span>
                                    ) : (
                                        <><span className="text-3xl font-bold">LKR {plan.price.toLocaleString()}</span><span className="text-white/40 text-sm">/yr</span></>
                                    )}
                                </div>
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                            <Check size={14} className={`${colors.text} mt-0.5 flex-shrink-0`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-xs text-white/40 mb-4 space-y-1">
                                    <p>Members: {plan.max_members === -1 ? 'Unlimited' : plan.max_members}</p>
                                    <p>Matching: {plan.max_matching === -1 ? 'Unlimited' : `${plan.max_matching}/month`}</p>
                                    <p>Predictions: {plan.max_predictions === -1 ? 'Unlimited' : `${plan.max_predictions}/month`}</p>
                                </div>
                                {isCurrent ? (
                                    <div className={`w-full py-2.5 rounded-xl text-center text-sm font-medium border ${colors.btn} opacity-60`}>Current Plan</div>
                                ) : plan.name === 'Free' ? (
                                    <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium border border-gray-500/30 text-gray-500 opacity-40">Downgrade not available</div>
                                ) : (
                                    <button onClick={() => handleSubscribe(plan.id, plan.name)} disabled={subscribing === plan.id}
                                        className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-all hover:opacity-90 disabled:opacity-50 ${colors.btn}`}>
                                        {subscribing === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Payment methods */}
                <div className="glass-morphism rounded-2xl p-6 border border-white/10 mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard size={18} className="text-gold" /> Accepted Payment Methods</h2>
                    <div className="flex flex-wrap gap-3">
                        {['Visa', 'MasterCard', 'PayHere', 'Stripe'].map(method => (
                            <div key={method} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60">{method}</div>
                        ))}
                    </div>
                </div>

                {/* Subscription history */}
                {subscriptions.length > 0 && (
                    <div className="glass-morphism rounded-2xl p-6 border border-white/10">
                        <h2 className="text-lg font-bold mb-4">Payment History</h2>
                        <div className="space-y-3">
                            {subscriptions.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-sm font-medium">{s.plan_name} Plan</p>
                                        <p className="text-xs text-white/40">{new Date(s.created_at).toLocaleDateString()} · {s.invoice_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gold">LKR {s.amount.toLocaleString()}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'completed' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-yellow-400/20 text-yellow-400'}`}>{s.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
