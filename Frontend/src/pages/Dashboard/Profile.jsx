import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfileApi } from '../../services/api';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const Profile = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        dob: user?.dob ? user.dob.split('T')[0] : ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const { data } = await updateProfileApi(formData);
            login({ ...user, ...data });
            setMessage({ type: 'success', text: 'Celestial records updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update alignment. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-gold/20 rounded-2xl text-gold">
                            <User size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-outfit gold-text-gradient">My Profile</h1>
                            <p className="text-white/50">Manage your spiritual presence.</p>
                        </div>
                    </div>

                    <Card className="p-8 md:p-12 border-gold/10">
                        {message.text && (
                            <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    icon={<User size={18} />}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={<Mail size={18} />}
                                    required
                                />
                            </div>
                            <Input
                                label="Date of Birth"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                icon={<Calendar size={18} />}
                                required
                            />

                            <div className="pt-4">
                                <Button type="submit" variant="primary" className="px-10 py-4" disabled={loading}>
                                    {loading ? 'Updating Alignment...' : 'Save Changes'} <Save size={20} className="ml-2" />
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
