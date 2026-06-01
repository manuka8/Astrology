import React, { useState } from 'react';
import { UserCircle, Save, Camera, Lock } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { updateProfileApi, changePasswordApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', mobile: user?.mobile || '', country: user?.country || '' });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [savingPw, setSavingPw] = useState(false);
    const [pwMsg, setPwMsg] = useState('');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSaveProfile = async () => {
        setSaving(true); setProfileMsg('');
        try {
            const fd = new FormData();
            if (form.name) fd.append('name', form.name);
            fd.append('mobile', form.mobile);
            fd.append('country', form.country);
            if (photoFile) fd.append('profile_photo', photoFile);
            await updateProfileApi(fd);
            await refreshUser();
            setProfileMsg('Profile updated successfully!');
        } catch (e) {
            setProfileMsg(e.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (pwForm.new_password !== pwForm.confirm_password) { setPwMsg('New passwords do not match'); return; }
        if (pwForm.new_password.length < 6) { setPwMsg('Password must be at least 6 characters'); return; }
        setSavingPw(true); setPwMsg('');
        try {
            await changePasswordApi({ current_password: pwForm.current_password, new_password: pwForm.new_password });
            setPwMsg('Password changed successfully!');
            setPwForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (e) {
            setPwMsg(e.response?.data?.message || 'Failed to change password');
        } finally {
            setSavingPw(false);
        }
    };

    const avatarSrc = photoPreview || (user?.profile_photo ? `http://localhost:5000${user.profile_photo}` : null);

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit gold-text-gradient">Profile Settings</h1>
                    <p className="text-white/50 text-sm mt-1">Manage your account information</p>
                </div>

                <div className="glass-morphism rounded-2xl p-6 border border-white/10 mb-6">
                    <h2 className="text-lg font-bold mb-6">Personal Information</h2>
                    <div className="flex items-center gap-5 mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gold/20 border border-gold/30 overflow-hidden flex items-center justify-center">
                                {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-gold" />}
                            </div>
                            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-gold/20 border border-gold/40 rounded-full flex items-center justify-center cursor-pointer hover:bg-gold/30 transition-all">
                                <Camera size={12} className="text-gold" />
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </label>
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{user?.name}</p>
                            <p className="text-sm text-white/50">{user?.email}</p>
                            <p className="text-xs text-white/30 mt-1 capitalize">{user?.role} · {user?.membership_plan} plan</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[{ key: 'name', label: 'Full Name', type: 'text' }, { key: 'mobile', label: 'Mobile Number', type: 'tel' }, { key: 'country', label: 'Country', type: 'text' }].map(({ key, label, type }) => (
                            <div key={key}>
                                <label className="block text-xs text-white/50 mb-1">{label}</label>
                                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Email</label>
                            <input type="email" value={user?.email || ''} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/40 cursor-not-allowed" />
                        </div>
                    </div>
                    {profileMsg && (
                        <div className={`mt-4 p-3 rounded-xl text-sm ${profileMsg.includes('success') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{profileMsg}</div>
                    )}
                    <button onClick={handleSaveProfile} disabled={saving}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 text-sm font-medium transition-all disabled:opacity-50">
                        <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>

                <div className="glass-morphism rounded-2xl p-6 border border-white/10">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Lock size={18} className="text-gold" /> Change Password</h2>
                    <div className="space-y-4">
                        {[{ key: 'current_password', label: 'Current Password' }, { key: 'new_password', label: 'New Password' }, { key: 'confirm_password', label: 'Confirm New Password' }].map(({ key, label }) => (
                            <div key={key}>
                                <label className="block text-xs text-white/50 mb-1">{label}</label>
                                <input type="password" value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/40 text-white" />
                            </div>
                        ))}
                    </div>
                    {pwMsg && (
                        <div className={`mt-4 p-3 rounded-xl text-sm ${pwMsg.includes('success') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{pwMsg}</div>
                    )}
                    <button onClick={handleChangePassword} disabled={savingPw}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 text-sm font-medium transition-all disabled:opacity-50">
                        <Lock size={14} /> {savingPw ? 'Updating...' : 'Change Password'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
