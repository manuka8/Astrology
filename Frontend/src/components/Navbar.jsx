import { Menu, X, Star, UserCircle, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Plans', path: '/plans' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [location]);

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-mystic-dark/80 backdrop-blur-lg border-b border-gold/20 shadow-lg' : 'py-5 bg-transparent'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="text-gold">
                        <Star size={24} fill="currentColor" />
                    </motion.div>
                    <span className="text-xl font-bold font-outfit gold-text-gradient tracking-wider">Astro.lk</span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path}
                            className={`relative text-sm font-medium tracking-wide transition-colors hover:text-gold ${location.pathname === link.path ? 'text-gold' : 'text-white/70'}`}>
                            {link.name}
                            {location.pathname === link.path && (
                                <motion.div layoutId="underline" className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold rounded-full" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Desktop auth */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                                {user.role === 'admin' ? <Shield size={15} className="text-gold" /> : <LayoutDashboard size={15} className="text-gold" />}
                                {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                            </Link>
                            <button onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                <LogOut size={15} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5">Sign In</Link>
                            <Link to="/register" className="text-sm px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-xl hover:bg-gold/30 transition-all font-medium">Get Started</Link>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/70 hover:text-white">
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-mystic-dark/95 backdrop-blur-lg border-t border-white/10 overflow-hidden">
                        <div className="container mx-auto px-6 py-4 space-y-2">
                            {navLinks.map(link => (
                                <Link key={link.path} to={link.path}
                                    className={`block py-2.5 text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-gold' : 'text-white/70 hover:text-white'}`}>
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-3 border-t border-white/10">
                                {user ? (
                                    <>
                                        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block py-2.5 text-sm text-gold font-medium">
                                            {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                                        </Link>
                                        <button onClick={handleLogout} className="block py-2.5 text-sm text-red-400">Logout</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="block py-2.5 text-sm text-white/70">Sign In</Link>
                                        <Link to="/register" className="block py-2.5 text-sm text-gold font-medium">Get Started →</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
