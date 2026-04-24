import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Moon, Zap, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const UserDashboard = () => {
    const { user } = useAuth();

    const insights = [
        { label: 'Daily Energy', value: 'High', icon: <Zap className="text-gold" /> },
        { label: 'Lucky Color', value: 'Deep Gold', icon: <Star className="text-gold" /> },
        { label: 'Compatibility', value: 'Leo', icon: <Star className="text-gold" /> },
    ];

    return (
        <DashboardLayout>
            <div className="pt-32 pb-24 px-6 md:px-12 text-white">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center border-2 border-gold/30">
                                <UserCircle size={48} className="text-gold" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold font-outfit gold-text-gradient">Welcome, {user?.name}</h1>
                                <p className="text-white/50">Your celestial journey is illuminated today.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/profile">
                                <Button variant="outline">Edit Profile</Button>
                            </Link>
                            <Link to="/horoscopes/add">
                                <Button variant="primary">Add Horoscope</Button>
                            </Link>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {insights.map((item, idx) => (
                            <Card key={idx} className="p-6 border-gold/10 flex items-center gap-4">
                                <div className="p-3 bg-gold/10 rounded-xl">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs uppercase tracking-widest">{item.label}</p>
                                    <p className="text-xl font-bold">{item.value}</p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-8 border-gold/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Moon size={120} className="text-gold" />
                            </div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                Your Daily Horoscope
                            </h2>
                            <p className="text-white/70 leading-relaxed mb-8">
                                Today, the alignment of Jupiter in your second house suggests a fortuitous day for spiritual growth and self-reflection. Embrace the quiet moments
                                and listen to your inner voice. Opportunities for creative expression are abundant.
                            </p>
                            <Button variant="outline" className="text-sm">Read Full Prediction</Button>
                        </Card>

                        <Card className="p-8 border-gold/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                Upcoming Celestial Events
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { event: 'Full Moon in Taurus', date: 'Oct 28', desc: 'A time for grounding and sensory focus.' },
                                    { event: 'Mercury Direct', date: 'Nov 4', desc: 'Communications will become clearer.' }
                                ].map((e, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5">
                                        <div className="text-center min-w-[60px]">
                                            <p className="text-gold font-bold">{e.date.split(' ')[1]}</p>
                                            <p className="text-[10px] uppercase text-white/40">{e.date.split(' ')[0]}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{e.event}</h4>
                                            <p className="text-sm text-white/50">{e.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;
