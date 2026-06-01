import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Crown, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPlansApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ICONS = { Free: Star, Premium: Zap, Platinum: Crown };
const COLORS = {
    Free: { border: 'border-gray-500/30', text: 'text-gray-400', btn: 'border-gray-500/40 text-gray-300 hover:bg-gray-500/10' },
    Premium: { border: 'border-blue-400/40', text: 'text-blue-400', btn: 'border-blue-400/40 text-blue-300 hover:bg-blue-400/10' },
    Platinum: { border: 'border-gold/40', text: 'text-gold', btn: 'border-gold/40 text-gold hover:bg-gold/10' },
};

export default function Plans() {
    const [plans, setPlans] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        getPlansApi().then(r => setPlans(r.data)).catch(() => {});
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold font-outfit gold-text-gradient mb-4">Choose Your Plan</h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">Unlock the celestial wisdom that awaits you. Choose the plan that aligns with your journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => {
                        const Icon = ICONS[plan.name] || Star;
                        const colors = COLORS[plan.name] || COLORS.Free;
                        return (
                            <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                className={`glass-morphism rounded-3xl p-8 border ${colors.border} relative ${plan.name === 'Platinum' ? 'ring-1 ring-gold/20' : ''}`}>
                                {plan.name === 'Platinum' && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold/20 border border-gold/40 rounded-full text-xs text-gold font-medium">Most Popular</div>
                                )}
                                <div className={`w-14 h-14 rounded-2xl border ${colors.border} bg-white/5 flex items-center justify-center mb-6`}>
                                    <Icon size={26} className={colors.text} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="mb-6">
                                    {plan.price === 0 ? (
                                        <span className="text-4xl font-bold">Free</span>
                                    ) : (
                                        <><span className="text-4xl font-bold">LKR {plan.price.toLocaleString()}</span><span className="text-white/40">/year</span></>
                                    )}
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                                            <Check size={14} className={`${colors.text} mt-0.5 flex-shrink-0`} /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to={user ? '/dashboard/subscription' : '/register'}
                                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl border text-sm font-medium transition-all ${colors.btn}`}>
                                    {plan.price === 0 ? 'Get Started Free' : `Get ${plan.name}`} <ArrowRight size={14} />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
