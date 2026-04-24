import { Menu, X, Star, User, LogOut, LayoutDashboard } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './UI/Button';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'py-3 bg-mystic-dark/80 backdrop-blur-lg border-b border-gold/20 shadow-lg' : 'py-6 bg-transparent'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="text-gold"
                    >
                        <Star size={28} fill="currentColor" />
                    </motion.div>
                    <span className="text-2xl font-bold font-outfit gold-text-gradient tracking-wider">
                        Astro.lk
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`relative text-sm font-medium tracking-wide transition-colors hover:text-gold ${location.pathname === link.path ? 'text-gold' : 'text-white/80'}`}
                        >
                            {link.name}
                            {location.pathname === link.path && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold"
                                />
                            )}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 ml-4">
                        {!user ? (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="text-sm">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" className="text-sm py-2 px-6">Register</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-gold hover:text-white transition-colors">
                                    {user.role === 'admin' ? <LayoutDashboard size={20} /> : <User size={20} />}
                                    <span className="text-sm font-bold uppercase tracking-wider">{user.name.split(' ')[0]}</span>
                                </Link>
                                <Button variant="ghost" className="text-sm p-2" onClick={logout}>
                                    <LogOut size={20} />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-gold p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-mystic-dark border-b border-gold/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-lg font-medium ${location.pathname === link.path ? 'text-gold' : 'text-white/80'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-4 mt-2">
                                {!user ? (
                                    <>
                                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full">Login</Button>
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="primary" className="w-full">Register</Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                                {user.role === 'admin' ? <LayoutDashboard size={20} /> : <User size={20} />}
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-red-400" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                                            <LogOut size={20} /> Logout
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
