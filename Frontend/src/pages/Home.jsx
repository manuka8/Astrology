import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Moon, Sun, Compass, Zap, Eye, Users } from 'lucide-react';
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