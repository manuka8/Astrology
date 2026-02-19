import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Star } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-mystic-dark pt-20 pb-10 border-t border-gold/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6 group">
                            <Star className="text-gold group-hover:rotate-180 transition-transform duration-500" size={24} fill="currentColor" />
                            <span className="text-xl font-bold font-outfit gold-text-gradient">Astro.lk</span>
                        </Link>
                        <p className="text-white/60 italic leading-relaxed mb-6">
                            "The stars impulsively guide us, but we must choose our own path. Let the cosmos illuminate your journey."
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-white/40 hover:text-gold transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-white/40 hover:text-gold transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-white/40 hover:text-gold transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-white/40 hover:text-gold transition-colors"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-gold font-semibold mb-6">Quick Links</h4>
                        <ul className="flex flex-col gap-4 text-white/50">
                            <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
                            <li><Link to="/login" className="hover:text-gold transition-colors">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-gold font-semibold mb-6">Our Services</h4>
                        <ul className="flex flex-col gap-4 text-white/50">
                            <li className="hover:text-gold cursor-pointer transition-colors">Daily Horoscope</li>
                            <li className="hover:text-gold cursor-pointer transition-colors">Birth Chart Analysis</li>
                            <li className="hover:text-gold cursor-pointer transition-colors">Palm Reading</li>
                            <li className="hover:text-gold cursor-pointer transition-colors">Spiritual Consultation</li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-gold font-semibold mb-6">Newsletter</h4>
                        <p className="text-white/50 mb-4 text-sm">Subscribe to get daily cosmic insights.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold w-full"
                            />
                            <button className="bg-gold p-2 rounded-lg text-mystic hover:bg-gold-light transition-colors">
                                <Star size={18} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-white/30 text-sm">
                        © {currentYear} Astro.lk – All Rights Reserved
                    </p>
                    <div className="flex gap-8 text-white/30 text-sm">
                        <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
