import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Mail } from 'lucide-react';
import { forgotPasswordApi } from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await forgotPasswordApi({ email });
            setSent(true);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to send reset email');
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
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Forgot Password</h1>
                    <p className="text-white/50 mt-2 text-sm">Enter your email to receive a reset link</p>
                </div>

                <div className="glass-morphism rounded-2xl p-8 border border-white/10">
                    {sent ? (
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                                <Mail size={24} className="text-emerald-400" />
                            </div>
                            <p className="text-emerald-400 font-semibold mb-2">Reset Link Sent!</p>
                            <p className="text-white/60 text-sm mb-4">Check your email for the password reset instructions.</p>
                            <Link to="/login" className="text-gold/70 hover:text-gold text-sm">← Back to Login</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/40 text-white" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full py-3 bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            <div className="text-center">
                                <Link to="/login" className="text-white/40 hover:text-white/70 text-sm">← Back to Login</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
