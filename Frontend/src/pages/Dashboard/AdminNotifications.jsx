import React, { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { broadcastNotificationApi } from '../../services/api';

export default function AdminNotifications() {
    const [form, setForm] = useState({ title: '', message: '', type: 'info' });
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSend = async () => {
        if (!form.title || !form.message) { setMsg('Title and message required'); return; }
        setSending(true); setMsg('');
        try {
            const res = await broadcastNotificationApi(form);
            setMsg(res.data.message || 'Notification sent!');
            setForm({ title: '', message: '', type: 'info' });
        } catch (e) {
            setMsg(e.response?.data?.message || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    return (
        <DashboardLayout isAdmin>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Notifications</h1>
                    <p className="text-white/50 text-sm mt-1">Broadcast notifications to all users</p>
                </div>

                <div className="glass-morphism rounded-2xl p-6 border border-white/10">
                    <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><Bell size={18} className="text-gold" /> Send Broadcast</h2>
                    {msg && (
                        <div className={`mb-4 p-3 rounded-xl text-sm ${msg.includes('sent') || msg.includes('Notification') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg}</div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Title *</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Message *</label>
                            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40">
                                <option value="info">Info</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                            </select>
                        </div>
                        <button onClick={handleSend} disabled={sending}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                            <Send size={14} /> {sending ? 'Sending...' : 'Send to All Users'}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
