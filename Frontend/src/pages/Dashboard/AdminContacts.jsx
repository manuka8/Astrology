import React, { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getContactsApi } from '../../services/api';
import API from '../../services/api';

export default function AdminContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    const load = () => getContactsApi().then(r => setContacts(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const markRead = async (id) => {
        await API.put(`/contact/${id}`, { status: 'read' }).catch(() => {});
        load();
    };

    return (
        <DashboardLayout isAdmin>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Contact Messages</h1>
                    <p className="text-white/50 text-sm mt-1">{contacts.filter(c => c.status === 'unread').length} unread messages</p>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading...</div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No contact messages yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {contacts.map(c => (
                            <div key={c.id} className={`glass-morphism rounded-2xl border transition-all cursor-pointer ${c.status === 'unread' ? 'border-gold/20' : 'border-white/10 opacity-70'}`}>
                                <div className="p-5" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {c.status === 'unread' && <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />}
                                                <p className="font-semibold text-sm">{c.subject}</p>
                                            </div>
                                            <p className="text-xs text-white/50">{c.name} · {c.email}</p>
                                            <p className="text-xs text-white/30 mt-1">{new Date(c.created_at).toLocaleString()}</p>
                                        </div>
                                        {c.status === 'unread' && (
                                            <button onClick={e => { e.stopPropagation(); markRead(c.id); }}
                                                className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all flex-shrink-0">
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {expanded === c.id && (
                                    <div className="border-t border-white/10 p-5">
                                        <p className="text-sm text-white/70 leading-relaxed">{c.message}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
