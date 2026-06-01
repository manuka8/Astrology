import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, BookOpen, GitCompare, Sun, Calendar, Star,
    CreditCard, UserCircle, Bell, LogOut, ChevronLeft, ChevronRight,
    Shield, FileText, MessageSquare, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const userMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'My Members', path: '/dashboard/members' },
    { icon: BookOpen, label: 'Horoscopes', path: '/dashboard/horoscopes' },
    { icon: GitCompare, label: 'Horoscope Matching', path: '/dashboard/matching' },
    { icon: Sun, label: 'Daily Predictions', path: '/dashboard/predictions/daily' },
    { icon: Calendar, label: 'Monthly Predictions', path: '/dashboard/predictions/monthly' },
    { icon: Star, label: 'Yearly Predictions', path: '/dashboard/predictions/yearly' },
    { icon: CreditCard, label: 'Subscription', path: '/dashboard/subscription' },
    { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
    { icon: UserCircle, label: 'Profile', path: '/dashboard/profile' },
];

const adminMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Plans', path: '/admin/plans' },
    { icon: BookOpen, label: 'Horoscopes', path: '/admin/horoscopes' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: FileText, label: 'Articles', path: '/admin/articles' },
    { icon: MessageSquare, label: 'Contacts', path: '/admin/contacts' },
    { icon: UserCircle, label: 'Profile', path: '/dashboard/profile' },
];

export default function Sidebar({ isAdmin = false }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const menu = isAdmin ? adminMenu : userMenu;

    const handleLogout = () => { logout(); navigate('/login'); };
    const planColors = { free: 'text-gray-400', premium: 'text-blue-400', platinum: 'text-gold' };

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3 }}
            className="h-screen bg-mystic-dark border-r border-white/10 flex flex-col fixed left-0 top-0 z-40 overflow-hidden"
        >
            <div className="p-4 flex items-center gap-3 border-b border-white/10">
                <div className="w-9 h-9 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star size={18} className="text-gold" fill="currentColor" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-lg font-bold font-outfit gold-text-gradient whitespace-nowrap">
                            {isAdmin ? 'Admin Panel' : 'Astro.lk'}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {!collapsed && (
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center overflow-hidden">
                            {user?.profile_photo
                                ? <img src={`http://localhost:5000${user.profile_photo}`} alt="" className="w-full h-full object-cover" />
                                : <UserCircle size={24} className="text-gold" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className={`text-xs capitalize ${planColors[user?.membership_plan] || 'text-gray-400'}`}>
                                {isAdmin ? '⚡ Admin' : `✦ ${user?.membership_plan}`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
                {menu.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                ${active ? 'bg-gold/20 text-gold border border-gold/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                            <item.icon size={18} className={`flex-shrink-0 ${active ? 'text-gold' : 'group-hover:text-gold transition-colors'}`} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="text-sm font-medium whitespace-nowrap">{item.label}</motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-2 border-t border-white/10 space-y-0.5">
                {isAdmin && (
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
                        <Zap size={18} className="flex-shrink-0" />
                        {!collapsed && <span className="text-sm">User View</span>}
                    </Link>
                )}
                {!isAdmin && user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
                        <Shield size={18} className="flex-shrink-0" />
                        {!collapsed && <span className="text-sm">Admin Panel</span>}
                    </Link>
                )}
                <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
                    <LogOut size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="text-sm">Logout</span>}
                </button>
            </div>

            <button onClick={() => setCollapsed(!collapsed)}
                className="absolute top-4 -right-3 w-6 h-6 bg-mystic-dark border border-gold/30 rounded-full flex items-center justify-center text-gold hover:bg-gold/20 transition-colors z-50">
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </motion.aside>
    );
}
