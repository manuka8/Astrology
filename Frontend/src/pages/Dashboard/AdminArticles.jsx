import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getArticlesApi, createArticleApi, updateArticleApi, deleteArticleApi } from '../../services/api';

const empty = { title: '', content: '', excerpt: '', category: '', is_published: false };

export default function AdminArticles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const load = () => getArticlesApi({}).then(r => setArticles(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm(empty); setMsg(''); setShowModal(true); };
    const openEdit = (a) => { setEditing(a); setForm({ title: a.title, content: a.content, excerpt: a.excerpt || '', category: a.category || '', is_published: !!a.is_published }); setMsg(''); setShowModal(true); };

    const handleSave = async () => {
        if (!form.title || !form.content) { setMsg('Title and content required'); return; }
        setSaving(true); setMsg('');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (editing) await updateArticleApi(editing.id, fd);
            else await createArticleApi(fd);
            setShowModal(false);
            load();
        } catch (e) {
            setMsg(e.response?.data?.message || 'Error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout isAdmin>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Articles & Blog</h1>
                        <p className="text-white/50 text-sm mt-1">Manage astrology articles and blog posts</p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all">
                        <Plus size={16} /> New Article
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/30">Loading...</div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-16 text-white/30">No articles yet.</div>
                ) : (
                    <div className="space-y-3">
                        {articles.map(a => (
                            <div key={a.id} className="glass-morphism rounded-2xl p-5 border border-white/10 flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.is_published ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                        <p className="font-semibold truncate">{a.title}</p>
                                    </div>
                                    <p className="text-xs text-white/40">{a.category || 'Uncategorized'} · {new Date(a.created_at).toLocaleDateString()} · {a.is_published ? 'Published' : 'Draft'}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => updateArticleApi(a.id, new FormData()).catch(() => {})} title="Toggle publish"
                                        className="p-1.5 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all">
                                        {a.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                                    </button>
                                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-all"><Edit2 size={13} /></button>
                                    <button onClick={() => { if (confirm('Delete?')) deleteArticleApi(a.id).then(load).catch(() => {}); }}
                                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-mystic-dark border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold">{editing ? 'Edit Article' : 'New Article'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                            </div>
                            {msg && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{msg}</div>}
                            <div className="space-y-3">
                                <div><label className="block text-xs text-white/50 mb-1">Title *</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" /></div>
                                <div><label className="block text-xs text-white/50 mb-1">Excerpt</label>
                                    <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" /></div>
                                <div><label className="block text-xs text-white/50 mb-1">Category</label>
                                    <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Horoscope, Zodiac, Tips..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" /></div>
                                <div><label className="block text-xs text-white/50 mb-1">Content *</label>
                                    <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white resize-none" /></div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="pub" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="accent-gold" />
                                    <label htmlFor="pub" className="text-sm text-white/60">Publish immediately</label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 text-sm">Cancel</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save Article'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
