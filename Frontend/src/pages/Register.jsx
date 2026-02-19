import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus, Star } from 'lucide-react';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registration attempt:', formData);
        alert('Account creation is brewing in the cosmic cauldron. Check back soon!');
    };

    return (
        <div className="min-h-screen pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-gold/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold/5 rounded-full blur-[120px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg px-6 relative z-10"
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                        <Star className="text-gold group-hover:rotate-180 transition-transform duration-500" size={32} fill="currentColor" />
                        <span className="text-3xl font-bold font-outfit gold-text-gradient">Astro.lk</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-white mb-2">Join the Celestial Circle</h2>
                    <p className="text-white/50">Start your spiritual journey today.</p>
                </div>

                <Card className="p-8 md:p-10 border-gold/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Date of Birth"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex items-start gap-3 text-white/40 text-xs mb-4">
                            <input type="checkbox" id="terms" required className="mt-1 accent-gold" />
                            <label htmlFor="terms">
                                I agree to the <a href="#" className="underline text-gold/70 hover:text-gold">Terms of Service</a> and <a href="#" className="underline text-gold/70 hover:text-gold">Privacy Policy</a>.
                            </label>
                        </div>

                        <Button type="submit" variant="primary" className="w-full py-4 text-lg">
                            Begin Journey <UserPlus size={20} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-white/40 text-sm">
                            Already a member?{' '}
                            <Link to="/login" className="text-gold hover:text-gold-light font-bold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Register;
