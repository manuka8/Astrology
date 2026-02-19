import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogIn, Star } from 'lucide-react';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', formData);
        alert('Login feature is coming soon! Reach out to the stars for patience.');
    };

    return (
        <div className="min-h-screen pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-[100px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md px-6 relative z-10"
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                        <Star className="text-gold group-hover:rotate-180 transition-transform duration-500" size={32} fill="currentColor" />
                        <span className="text-3xl font-bold font-outfit gold-text-gradient">Astro.lk</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-mystic mb-2">Welcome Back</h2>
                    <p className="text-mystic/50">Log in to view your personalized horoscope.</p>
                </div>

                <Card className="p-8 md:p-10 border-gold/10 bg-white shadow-premium">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <div className="space-y-1">
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <div className="text-right">
                                <a href="#" className="text-xs text-gold/60 hover:text-gold transition-colors">Forgot password?</a>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full py-4 text-lg">
                            Unlock Your Destiny <LogIn size={20} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-mystic/5 text-center">
                        <p className="text-mystic/40 text-sm">
                            New to Astro.lk?{' '}
                            <Link to="/register" className="text-gold hover:text-gold-light font-bold transition-colors">
                                Create an Account
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
