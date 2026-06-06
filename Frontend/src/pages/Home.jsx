import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Moon, Sun, Compass, Zap, Eye, Users, Award, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

import sign1 from '../assets/sign1.png';
import sign2 from '../assets/sign2.png';
import sign3 from '../assets/sign3.png';
import sign4 from '../assets/sign4.png';
import sign5 from '../assets/sign5.png';
import sign6 from '../assets/sign6.png';
import sign7 from '../assets/sign7.png';
import sign8 from '../assets/sign8.png';
import sign9 from '../assets/sign9.png';
import sign10 from '../assets/sign10.png';
import sign11 from '../assets/sign11.png';
import sign12 from '../assets/sign12.png';
const Home = () => {
    const { user } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const horoscopes = [
        { sign: 'Aries', date: 'Mar 21 - Apr 19', icon: '♈' },
        { sign: 'Taurus', date: 'Apr 20 - May 20', icon: '♉' },
        { sign: 'Gemini', date: 'May 21 - Jun 20', icon: '♊' },
        { sign: 'Cancer', date: 'Jun 21 - Jul 22', icon: '♋' },
        { sign: 'Leo', date: 'Jul 23 - Aug 22', icon: '♌' },
        { sign: 'Virgo', date: 'Aug 23 - Sep 22', icon: '♍' },
    ];

    const services = [
        { title: 'Horoscope Reading', desc: 'Detailed daily, weekly, and monthly insights based on your zodiac.', icon: <Sun className="text-gold" size={32} /> },
        { title: 'Birth Chart Analysis', desc: 'Understand your life purpose through the celestial alignment at your birth.', icon: <Compass className="text-gold" size={32} /> },
        { title: 'Palm Reading', desc: 'Unveil the secrets written in the palms of your hands with our experts.', icon: <Zap className="text-gold" size={32} /> },
        { title: 'Astrology Consultation', desc: 'One-on-one sessions with world-class spiritual guides.', icon: <Eye className="text-gold" size={32} /> },
    ];

    // Array of zodiac image paths
    const zodiacImages = [
        sign1,
        sign2,
        sign3,
        sign4,
        sign5,
        sign6,
        sign7,
        sign8,
        sign9,
        sign10,
        sign11,
        sign12,
    ];

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === zodiacImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 2000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [zodiacImages.length]);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Background Overlay */}
                <div className="absolute inset-0 bg-mystic-gradient z-0"></div>
                <div className="absolute inset-0 opacity-30 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-6">
                            ✨ Discover Your Cosmic Path
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold font-outfit leading-tight mb-6">
                            Discover Your <br />
                            <span className="gold-text-gradient">Destiny</span> in Stars
                        </h1>
                        <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                            Unlock the secrets of the universe with Astro.lk. Get personalized horoscope readings and professional spiritual guidance to navigate your life's journey.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/register'}>
                                <Button variant="primary" className="px-10 py-4 text-lg">
                                    {user ? 'View Dashboard' : 'Start Journey'}
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="outline" className="px-10 py-4 text-lg">Get Consultation</Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="hidden lg:flex justify-center"
                    >
                        <div className="relative w-[600px] h-[600px]">

                            <div className="absolute inset-15 border border-gold/10 rounded-full animate-spin-slow"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                    className="w-120-120 glass-morphism rounded-full flex items-center justify-center border-gold/30 shadow-gold overflow-hidden"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={currentImageIndex}
                                            src={zodiacImages[currentImageIndex]}
                                            alt={`Zodiac sign ${currentImageIndex + 1}`}
                                            className="w-full h-full object-cover"
                                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
                                            transition={{
                                                duration: 0.9,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </AnimatePresence>
                                </motion.div>
                            </div>

                            {/* Decorative dots indicator */}
                            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {zodiacImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-6 h-6 rounded-full transition-all duration-300 ${index === currentImageIndex
                                            ? 'w-6 bg-gold'
                                            : 'bg-gold/30 hover:bg-gold/50'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Horoscope Preview Section */}
            <section className="py-24 bg-mystic-dark">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4">Daily Horoscope</h2>
                        <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
                        <p className="text-white/60">Choose your sign to see what the stars have in store for you today.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {horoscopes.map((h, idx) => (
                            <motion.div
                                key={h.sign}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="text-center group cursor-pointer hover:border-gold/50">
                                    <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">{h.icon}</span>
                                    <h4 className="text-gold font-bold mb-1">{h.sign}</h4>
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest">{h.date}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div className="text-left">
                            <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4">Our Sacred Services</h2>
                            <p className="text-white/60 max-w-xl">We provide professional astrology and spiritual services tailored to help you find clarity and balance.</p>
                        </div>
                        <Button variant="outline">View All Services</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((s, idx) => (
                            <motion.div
                                key={s.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full flex flex-col items-start gap-4">
                                    <div className="p-3 bg-gold/10 rounded-2xl">
                                        {s.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">{s.title}</h3>
                                    <p className="text-white/50 text-sm leading-relaxed mb-4">
                                        {s.desc}
                                    </p>
                                    <button className="text-gold text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all mt-auto">
                                        Learn More <span>→</span>
                                    </button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats/Highlight Section */}
            <section className="py-20 glass-morphism border-y border-gold/10">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <h4 className="text-4xl font-bold font-outfit gold-text-gradient mb-2">25K+</h4>
                        <p className="text-white/50 text-sm tracking-widest uppercase">Happy Seekers</p>
                    </div>
                    <div>
                        <h4 className="text-4xl font-bold font-outfit gold-text-gradient mb-2">50+</h4>
                        <p className="text-white/50 text-sm tracking-widest uppercase">Expert Astrologers</p>
                    </div>
                    <div>
                        <h4 className="text-4xl font-bold font-outfit gold-text-gradient mb-2">10M+</h4>
                        <p className="text-white/50 text-sm tracking-widest uppercase">Predictions Made</p>
                    </div>
                    <div>
                        <h4 className="text-4xl font-bold font-outfit gold-text-gradient mb-2">99%</h4>
                        <p className="text-white/50 text-sm tracking-widest uppercase">Accuracy Rate</p>
                    </div>
                </div>
            </section>

            {/* Expert Review Section */}
            <section className="py-24 bg-mystic-dark relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gold/10 rounded-full blur-[100px]" />
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-6">
                                ✨ Expert Review Service
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-6 leading-tight">
                                Get a Personal Reading<br />from <span className="gold-text-gradient">Certified Experts</span>
                            </h2>
                            <p className="text-white/60 text-lg mb-8 leading-relaxed">
                                Our verified astrologers provide in-depth analysis of your birth chart covering career, relationships, life forecasts, financial guidance, health tendencies, and more.
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-10">
                                {[
                                    '✨ Personal Horoscope Reading',
                                    '💼 Career & Business Guidance',
                                    '💝 Relationship Compatibility',
                                    '🔮 Life Forecasts',
                                    '💰 Financial Astrology',
                                    '📅 Electional Astrology',
                                ].map(item => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-white/60">
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/register">
                                <Button variant="primary" className="px-8 py-3 flex items-center gap-2">
                                    Get Expert Review <ChevronRight size={16} />
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            className="space-y-4">
                            {[
                                { icon: Star, title: 'Detailed PDF Birth Chart Report', desc: 'Comprehensive analysis delivered as a beautifully formatted PDF.' },
                                { icon: BookOpen, title: 'Annual Forecast Report', desc: 'Month-by-month predictions for the year ahead based on your chart.' },
                                { icon: Users, title: 'Compatibility Reports', desc: 'Deep dive into relationship dynamics with any person in your life.' },
                                { icon: Award, title: 'Lucky Dates Calendar', desc: 'Personalised calendar of your most auspicious dates for major decisions.' },
                            ].map((item, i) => (
                                <motion.div key={item.title}
                                    initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                                    className="flex gap-4 glass-morphism rounded-2xl p-4 border border-white/10 hover:border-gold/20 transition-all">
                                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <item.icon size={18} className="text-gold" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                                        <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Become an Expert Advertisement */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="relative overflow-hidden rounded-[32px] border border-gold/20 bg-gradient-to-br from-gold/5 via-transparent to-gold/5 p-10 md:p-14">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-4">
                                    ⭐ We're Hiring Experts
                                </span>
                                <h3 className="text-3xl md:text-4xl font-bold font-outfit text-white mb-4">
                                    Are You an Experienced <span className="gold-text-gradient">Astrologer?</span>
                                </h3>
                                <p className="text-white/60 mb-4 max-w-xl">
                                    Join the Astro.lk expert team and share your cosmic knowledge with thousands of seekers. Set your own schedule, build your reputation, and make a meaningful impact.
                                </p>
                                <p className="text-white/40 text-sm mb-6 max-w-xl">
                                    Complete our detailed application covering your qualifications, services, verification, and profile — reviewed within 48 hours.
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-8">
                                    <span className="flex items-center gap-1.5"><Users size={14} className="text-gold" /> 25,000+ Active Users</span>
                                    <span className="flex items-center gap-1.5"><Star size={14} className="text-gold" /> Flexible Schedule</span>
                                    <span className="flex items-center gap-1.5"><Award size={14} className="text-gold" /> Build Your Profile</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link to="/become-expert">
                                        <Button variant="primary" className="px-8 py-3">Submit Application Form</Button>
                                    </Link>
                                    <Link to="/expert-status">
                                        <Button variant="outline" className="px-8 py-3">Track My Application</Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0">
                                {[
                                    { label: 'Reviews Given', value: '1,200+' },
                                    { label: 'Expert Astrologers', value: '50+' },
                                    { label: 'Avg. Rating', value: '4.9 ★' },
                                    { label: 'Response Time', value: '< 48h' },
                                ].map(s => (
                                    <div key={s.label} className="glass-morphism rounded-2xl p-4 text-center border border-white/10 w-28">
                                        <p className="text-xl font-bold gold-text-gradient">{s.value}</p>
                                        <p className="text-white/40 text-xs mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 container mx-auto px-6">
                <div className="gold-border-gradient rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold font-outfit mb-8 max-w-3xl mx-auto leading-tight">
                            Ready to Begin Your <span className="gold-text-gradient">Celestial</span> Journey?
                        </h2>
                        <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto">
                            Join thousands of others who have found their path through the stars. Your personal reading is just a few clicks away.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Button variant="primary" className="px-12 py-4 text-xl">Get Started Now</Button>
                            <Button variant="outline" className="px-12 py-4 text-xl">Contact Experts</Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;