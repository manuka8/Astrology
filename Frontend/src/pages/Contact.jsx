import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add success animation or feedback logic here
        alert('Thank you for reaching out! The stars are aligning to send your message.');
    };

    const contactInfo = [
        { icon: <Mail className="text-gold" />, label: 'Email', value: 'hello@astro.lk' },
        { icon: <Phone className="text-gold" />, label: 'Phone', value: '+94 11 123 4567' },
        { icon: <MapPin className="text-gold" />, label: 'Sanctum', value: '123 Celestial Path, Colombo, LK' },
    ];

    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold font-outfit mb-6">Contact <span className="gold-text-gradient">Our Experts</span></h1>
                    <p className="text-white/60 max-w-xl mx-auto">Have questions about your reading or need personalized guidance? Our spiritual advisors are here to help.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Information */}
                    <div className="col-span-1 space-y-8">
                        {contactInfo.map((info, idx) => (
                            <motion.div
                                key={info.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="flex items-center gap-6 border-white/5 group">
                                    <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        {info.icon}
                                    </div>
                                    <div>
                                        <p className="text-gold/60 text-xs uppercase tracking-widest font-bold mb-1">{info.label}</p>
                                        <p className="text-white font-medium">{info.value}</p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}

                        <Card className="bg-gold-gradient text-mystic p-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <MessageCircle fill="currentColor" /> Live Support
                            </h3>
                            <p className="text-mystic/80 text-sm mb-6 leading-relaxed font-medium">
                                Need instant answers? Our concierge team is available 24/7 for urgent spiritual requests.
                            </p>
                            <Button variant="glass" className="bg-mystic/10 text-mystic border-mystic/20 w-full font-bold">
                                Start Live Chat
                            </Button>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="col-span-1 lg:col-span-2">
                        <Card className="p-8 md:p-12 border-gold/10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input
                                        label="Full Name"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <Input
                                    label="Subject"
                                    name="subject"
                                    placeholder="What is your cosmic query?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-gold-light/80 text-sm font-medium ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        rows="5"
                                        placeholder="Describe your journey or questions here..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300 resize-none"
                                    ></textarea>
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <Button type="submit" variant="primary" className="w-full md:w-auto px-12 py-4 text-lg">
                                        Send Message <Send size={20} className="ml-2" />
                                    </Button>
                                </motion.div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
