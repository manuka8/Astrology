import React, { useEffect, useState } from 'react';
import { BookOpen, Download } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getHoroscopesApi } from '../../services/api';

export default function AdminHoroscopes() {
    const [horoscopes, setHoroscopes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHoroscopesApi().then(r => setHoroscopes(r.data)).finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout isAdmin>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Horoscope Management</h1>
                    <p className="text-white/50 text-sm mt-1">View and manage uploaded horoscopes</p>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading...</div>
                ) : horoscopes.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No horoscopes uploaded yet.</p>
                    </div>
                ) : (
                    <div className="glass-morphism rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-xs text-white/40 uppercase">
                                    <th className="text-left px-5 py-3">Member</th>
                                    <th className="text-left px-5 py-3">Zodiac</th>
                                    <th className="text-left px-5 py-3">Birth Date</th>
                                    <th className="text-left px-5 py-3">Birth Place</th>
                                    <th className="text-left px-5 py-3">PDF</th>
                                    <th className="text-left px-5 py-3">Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {horoscopes.map(h => (
                                    <tr key={h.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                        <td className="px-5 py-3 text-sm font-medium">{h.member_name || h.name}</td>
                                        <td className="px-5 py-3 text-sm text-white/60">{h.zodiac_sign || '—'}</td>
                                        <td className="px-5 py-3 text-sm text-white/60">{h.birth_date || '—'}</td>
                                        <td className="px-5 py-3 text-sm text-white/60">{h.birth_place || '—'}</td>
                                        <td className="px-5 py-3">
                                            {h.horoscope_pdf ? (
                                                <a href={`http://localhost:5000${h.horoscope_pdf}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-gold/70 hover:text-gold transition-colors">
                                                    <Download size={12} /> Download
                                                </a>
                                            ) : <span className="text-xs text-white/30">No PDF</span>}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-white/40">{new Date(h.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
