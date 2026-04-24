import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    User,
    Star,
    PlusCircle,
    Settings,
    LogOut,
    Shield,
    Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: user?.role === 'admin' ? '/admin' : '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'My Profile', path: '/profile', icon: <User size={20} /> },
        { name: 'Add Horoscope', path: '/horoscopes/add', icon: <PlusCircle size={20} /> },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ name: 'User Management', path: '/admin/users', icon: <Shield size={20} /> });
    }

    return (
        <div className="w-64 min-h-screen bg-mystic-dark border-r border-gold/10 pt-32 pb-10 flex flex-col fixed left-0 top-0 z-40">
            <div className="px-6 mb-10">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gold/5 border border-gold/10">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{user?.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-gold/60">{user?.role}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-grow px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-gold text-mystic-dark font-bold shadow-gold'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        {item.icon}
                        <span className="text-sm">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="px-4 mt-auto">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
                >
                    <LogOut size={20} />
                    <span className="text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
