import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Star, Type, FileText, Calendar, Send } from 'lucide-react';
import { createHoroscopeApi } from '../../services/api';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const AddHoroscope = () => {
    const [formData, setFormData] = useState({
        sign: '',
        prediction: '',
        type: 'daily',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await createHoroscopeApi(formData);
            setMessage({ type: 'success', text: 'Prediction woven into the stars successfully!' });
            setFormData({
                sign: '',
                prediction: '',
                type: 'daily',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Formation failed. The cosmos is currently silent.' });
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
                            <PlusCircle size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-outfit gold-text-gradient">Add Horoscope</h1>
                            <p className="text-white/50">Write destiny in the celestial scripts.</p>
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
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70 block mb-2">Zodiac Sign</label>
                                    <select
                                        name="sign"
                                        value={formData.sign}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-colors"
                                    >
                                        <option value="" disabled className="bg-mystic-dark">Select Sign</option>
                                        {signs.map(sign => (
                                            <option key={sign} value={sign} className="bg-mystic-dark">{sign}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70 block mb-2">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-colors"
                                    >
                                        <option value="daily" className="bg-mystic-dark">Daily</option>
                                        <option value="weekly" className="bg-mystic-dark">Weekly</option>
                                        <option value="monthly" className="bg-mystic-dark">Monthly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 block mb-2">Prediction</label>
                                <textarea
                                    name="prediction"
                                    value={formData.prediction}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Write the celestial insights here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-gold transition-colors resize-none"
                                ></textarea>
                            </div>

                            <Input
                                label="Prediction Date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />

                            <div className="pt-4">
                                <Button type="submit" variant="primary" className="px-10 py-4" disabled={loading}>
                                    {loading ? 'Consulting the Void...' : 'Cast Prediction'} <Send size={20} className="ml-2" />
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddHoroscope;
