import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getNotificationsApi, markNotificationReadApi } from '../../services/api';

const TYPE_COLORS = {
    info: 'border-blue-400/30 bg-blue-400/5',
    success: 'border-emerald-400/30 bg-emerald-400/5',
    warning: 'border-yellow-400/30 bg-yellow-400/5',
    error: 'border-red-400/30 bg-red-400/5',
};
const TYPE_DOT = { info: 'bg-blue-400', success: 'bg-emerald-400', warning: 'bg-yellow-400', error: 'bg-red-400' };

export default function Notifications() {
    const [data, setData] = useState({ notifications: [], unread_count: 0 });
    const [loading, setLoading] = useState(true);

    const load = () => getNotificationsApi().then(r => setData(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const markRead = async (id) => {
        await markNotificationReadApi(id).catch(() => {});
        load();
    };
    const markAllRead = async () => {
        await markNotificationReadApi('all').catch(() => {});
        load();
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Notifications</h1>
                        <p className="text-white/50 text-sm mt-1">{data.unread_count} unread notifications</p>
                    </div>
                    {data.unread_count > 0 && (
                        <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all">
                            <CheckCheck size={14} /> Mark all read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading...</div>
                ) : data.notifications.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <Bell size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.notifications.map(n => (
                            <div key={n.id} className={`rounded-2xl p-4 border transition-all ${TYPE_COLORS[n.type] || TYPE_COLORS.info} ${!n.is_read ? 'opacity-100' : 'opacity-60'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.is_read ? (TYPE_DOT[n.type] || 'bg-blue-400') : 'bg-white/20'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">{n.title}</p>
                                        <p className="text-xs text-white/60 mt-0.5">{n.message}</p>
                                        <p className="text-xs text-white/30 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                                    </div>
                                    {!n.is_read && (
                                        <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-all flex-shrink-0">
                                            <CheckCheck size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
