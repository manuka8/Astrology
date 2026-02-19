import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Heart, Shield, Sparkles } from 'lucide-react';
import Card from '../components/UI/Card';

const About = () => {
    const values = [
        { title: 'Authenticity', desc: 'Our readings are rooted in ancient wisdom and modern astronomical precision.', icon: <Award className="text-gold" /> },
        { title: 'Compassion', desc: 'We provide guidance with empathy and understanding for every individual.', icon: <Heart className="text-gold" /> },
        { title: 'Privacy', desc: 'Your spiritual journey is personal; we ensure complete confidentiality.', icon: <Shield className="text-gold" /> },
        { title: 'Excellence', desc: 'Working with the world\'s most renowned spiritual experts.', icon: <Sparkles className="text-gold" /> },
    ];

    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-6">
                {/* Mission & Vision */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold font-outfit mb-8">
                            Guiding Souls Through the <span className="gold-text-gradient">Cosmos</span>
                        </h1>
                        <p className="text-white/70 text-lg leading-relaxed mb-6">
                            Founded in 2020, Astro.lk was born from a desire to bridge the gap between ancient astrological wisdom and the modern seeker's needs. We believe that the stars don't dictate your fate, but rather provide a map to help you navigate it.
                        </p>
                        <p className="text-white/70 text-lg leading-relaxed">
                            Our mission is to empower individuals with personalized cosmic insights that inspire growth, clarity, and spiritual fulfillment.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="flex flex-col gap-4 p-8 border-gold/10">
                            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                                <Target className="text-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gold">Our Mission</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                To illuminate the human journey with the profound wisdom of the stars.
                            </p>
                        </Card>
                        <Card className="flex flex-col gap-4 p-8 border-gold/10">
                            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                                <Eye className="text-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gold">Our Vision</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                To become the world's most trusted companion on the path to spiritual awakening.
                            </p>
                        </Card>
                    </div>
                </div>

                {/* Values Section */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4">Our Core Values</h2>
                        <div className="h-1 w-20 bg-gold mx-auto rounded-full mb-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v, idx) => (
                            <motion.div
                                key={v.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="text-center h-full border-white/5 hover:border-gold/20">
                                    <div className="w-14 h-14 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        {v.icon}
                                    </div>
                                    <h4 className="text-xl font-bold mb-4">{v.title}</h4>
                                    <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Expertise Section */}
                <div className="py-20 bg-gold/5 rounded-[40px] px-12 md:px-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-8 max-w-2xl mx-auto">Ancient Wisdom Meets <span className="gold-text-gradient">Modern Precision</span></h2>
                        <p className="text-white/70 text-lg mb-12 max-w-3xl mx-auto">
                            Our team consists of certified Vedic astrologers, palmists, and spiritual consultants with decades of combined experience. We utilize advanced planetary tracking algorithms alongside traditional interpretation techniques to provide the most accurate readings possible.
                        </p>
                        <div className="flex justify-center gap-12">
                            <div className="text-center">
                                <p className="text-gold text-2xl font-bold">15+</p>
                                <p className="text-white/40 text-xs uppercase">Years Experience</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gold text-2xl font-bold">100%</p>
                                <p className="text-white/40 text-xs uppercase">Privacy Secure</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gold text-2xl font-bold">24/7</p>
                                <p className="text-white/40 text-xs uppercase">Expert Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
