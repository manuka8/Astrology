import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { submitContactApi } from '../services/api';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true); setMsg('');
        try {
            const res = await submitContactApi(form);
            setMsg(res.data.message);
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (e) {
            setMsg(e.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6">
            <div className="max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    <h1 className="text-5xl font-bold font-outfit gold-text-gradient mb-4">Contact Us</h1>
                    <p className="text-white/60 text-lg">Reach out to us for any questions about your celestial journey</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h2 className="text-2xl font-bold">Get in Touch</h2>
                        {[
                            { icon: Mail, label: 'Email', value: 'support@astro.lk' },
                            { icon: Phone, label: 'Phone', value: '+94 11 234 5678' },
                            { icon: MapPin, label: 'Location', value: 'Colombo, Sri Lanka' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-4 p-4 glass-morphism rounded-2xl border border-white/10">
                                <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                                    <Icon size={18} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/40">{label}</p>
                                    <p className="text-sm font-medium">{value}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="glass-morphism rounded-2xl p-8 border border-white/10">
                            <h2 className="text-xl font-bold mb-6">Send a Message</h2>
                            {msg && (
                                <div className={`mb-4 p-3 rounded-xl text-sm ${msg.includes('success') || msg.includes('soon') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg}</div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Name</label>
                                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Email</label>
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">Subject</label>
                                    <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1">Message</label>
                                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white resize-none" />
                                </div>
                                <button type="submit" disabled={sending}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                                    <Send size={14} /> {sending ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
