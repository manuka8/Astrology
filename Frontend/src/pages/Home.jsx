import React from 'react';
import { motion } from 'framer-motion';
import { Star, Moon, Sun, Compass, Zap, Eye, Users } from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const Home = () => {
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

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Background Overlay */}
                <div className="absolute inset-0 bg-mystic-gradient z-0"></div>
                <div className="absolute inset-0 opacity-20 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
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
                        <h1 className="text-5xl md:text-7xl font-bold font-outfit leading-tight mb-6 text-mystic">
                            Discover Your <br />
                            <span className="gold-text-gradient">Destiny</span> in Stars
                        </h1>
                        <p className="text-mystic/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                            Unlock the secrets of the universe with Astro.lk. Get personalized horoscope readings and professional spiritual guidance to navigate your life's journey.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="primary" className="px-10 py-4 text-lg">Read Horoscope</Button>
                            <Button variant="outline" className="px-10 py-4 text-lg">Get Consultation</Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="hidden lg:flex justify-center"
                    >
                        <div className="relative w-[500px] h-[500px]">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-gold/20 rounded-full flex items-center justify-center"
                            >
                                <div className="absolute top-0 text-gold/40 text-4xl rotate-0">♈</div>
                                <div className="absolute right-0 text-gold/40 text-4xl rotate-90">♋</div>
                                <div className="absolute bottom-0 text-gold/40 text-4xl rotate-180">♎</div>
                                <div className="absolute left-0 text-gold/40 text-4xl rotate-270">♑</div>
                            </motion.div>
                            <div className="absolute inset-10 border border-gold/10 rounded-full animate-spin-slow"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-64 h-64 glass-morphism rounded-full flex items-center justify-center border-gold/30 shadow-gold"
                                >
                                    <Star size={80} className="text-gold" fill="currentColor" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Horoscope Preview Section */}
            <section className="py-24 bg-mystic-light">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4 text-mystic">Daily Horoscope</h2>
                        <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
                        <p className="text-mystic/60">Choose your sign to see what the stars have in store for you today.</p>
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
                                <Card className="text-center group cursor-pointer hover:border-gold/50 bg-white">
                                    <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">{h.icon}</span>
                                    <h4 className="text-gold font-bold mb-1">{h.sign}</h4>
                                    <p className="text-mystic/40 text-[10px] uppercase tracking-widest leading-none mt-2">{h.date}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div className="text-left">
                            <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4 text-mystic">Our Sacred Services</h2>
                            <p className="text-mystic/60 max-w-xl">We provide professional astrology and spiritual services tailored to help you find clarity and balance.</p>
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
                                <Card className="h-full flex flex-col items-start gap-4 bg-mystic-light/30 border-none shadow-premium">
                                    <div className="p-3 bg-gold/10 rounded-2xl">
                                        {s.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-mystic group-hover:text-gold transition-colors">{s.title}</h3>
                                    <p className="text-mystic/50 text-sm leading-relaxed mb-4">
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
            <section className="py-20 bg-white border-y border-gold/10">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <h4 className="text-4xl font-bold font-outfit gold-text-gradient mb-2">25K+</h4>
                        <p className="text-mystic/40 text-sm tracking-widest uppercase">Happy Seekers</p>
                    </div>
                    <div>
                        <h4 className="text-4xl font-bold font-outfit gold-text-gradient mb-2">50+</h4>
                        <p className="text-mystic/40 text-sm tracking-widest uppercase">Expert Astrologers</p>
                    </div>
                    <div>
                        <h4 className="text-4xl font-bold font-outfit gold-text-gradient mb-2">10M+</h4>
                        <p className="text-mystic/40 text-sm tracking-widest uppercase">Predictions Made</p>
                    </div>
                    <div>
                        <h4 className="text-4xl font-bold font-outfit gold-text-gradient mb-2">99%</h4>
                        <p className="text-mystic/40 text-sm tracking-widest uppercase">Accuracy Rate</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 container mx-auto px-6">
                <div className="gold-border-gradient rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden group shadow-premium bg-white">
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold font-outfit mb-8 max-w-3xl mx-auto leading-tight text-mystic">
                            Ready to Begin Your <span className="gold-text-gradient">Celestial</span> Journey?
                        </h2>
                        <p className="text-mystic/60 text-lg mb-12 max-w-2xl mx-auto">
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
