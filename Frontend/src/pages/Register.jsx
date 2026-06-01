import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Eye, EyeOff } from 'lucide-react';
import { registerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', country: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true); setError('');
        try {
            const { data } = await registerApi(form);
            login(data);
            navigate('/dashboard');
        } catch (e) {
            setError(e.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-4">
                        <Star size={28} className="text-gold" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Create Account</h1>
                    <p className="text-white/50 mt-2 text-sm">Begin your celestial journey with Astro.lk</p>
                </div>

                <div className="glass-morphism rounded-2xl p-8 border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

                        <div>
                            <label className="block text-sm text-white/60 mb-2">Full Name *</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/40 text-white" />
                        </div>

                        <div>
                            <label className="block text-sm text-white/60 mb-2">Email Address *</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/40 text-white" />
                        </div>

                        <div>
                            <label className="block text-sm text-white/60 mb-2">Password *</label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="At least 6 characters"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Mobile</label>
                                <input type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="+94 77 123 4567"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/40 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Country</label>
                                <input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Sri Lanka"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/40 text-white" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-white/40">
                        Already have an account?{' '}
                        <Link to="/login" className="text-gold/70 hover:text-gold transition-colors font-medium">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
