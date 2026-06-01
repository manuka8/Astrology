import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Plans from './pages/Plans';

// User Dashboard pages
import UserDashboard from './pages/Dashboard/UserDashboard';
import MyMembers from './pages/Dashboard/MyMembers';
import HoroscopeManagement from './pages/Dashboard/HoroscopeManagement';
import HoroscopeMatching from './pages/Dashboard/HoroscopeMatching';
import DailyPredictions from './pages/Dashboard/DailyPredictions';
import MonthlyPredictions from './pages/Dashboard/MonthlyPredictions';
import YearlyPredictions from './pages/Dashboard/YearlyPredictions';
import Subscription from './pages/Dashboard/Subscription';
import Profile from './pages/Dashboard/Profile';
import Notifications from './pages/Dashboard/Notifications';

// Admin pages
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import AdminUsers from './pages/Dashboard/AdminUsers';
import AdminPlans from './pages/Dashboard/AdminPlans';
import AdminHoroscopes from './pages/Dashboard/AdminHoroscopes';
import AdminNotifications from './pages/Dashboard/AdminNotifications';
import AdminArticles from './pages/Dashboard/AdminArticles';
import AdminContacts from './pages/Dashboard/AdminContacts';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-mystic">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
};

const PublicLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-mystic text-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
    </div>
);

function App() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                <Route path="/plans" element={<PublicLayout><Plans /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
                <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />

                {/* User Dashboard */}
                <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
                <Route path="/dashboard/members" element={<PrivateRoute><MyMembers /></PrivateRoute>} />
                <Route path="/dashboard/horoscopes" element={<PrivateRoute><HoroscopeManagement /></PrivateRoute>} />
                <Route path="/dashboard/matching" element={<PrivateRoute><HoroscopeMatching /></PrivateRoute>} />
                <Route path="/dashboard/predictions/daily" element={<PrivateRoute><DailyPredictions /></PrivateRoute>} />
                <Route path="/dashboard/predictions/monthly" element={<PrivateRoute><MonthlyPredictions /></PrivateRoute>} />
                <Route path="/dashboard/predictions/yearly" element={<PrivateRoute><YearlyPredictions /></PrivateRoute>} />
                <Route path="/dashboard/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />
                <Route path="/dashboard/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/dashboard/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
                <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
                <Route path="/admin/plans" element={<PrivateRoute adminOnly><AdminPlans /></PrivateRoute>} />
                <Route path="/admin/horoscopes" element={<PrivateRoute adminOnly><AdminHoroscopes /></PrivateRoute>} />
                <Route path="/admin/notifications" element={<PrivateRoute adminOnly><AdminNotifications /></PrivateRoute>} />
                <Route path="/admin/articles" element={<PrivateRoute adminOnly><AdminArticles /></PrivateRoute>} />
                <Route path="/admin/contacts" element={<PrivateRoute adminOnly><AdminContacts /></PrivateRoute>} />

                {/* Legacy redirects */}
                <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
                <Route path="/horoscopes/add" element={<Navigate to="/dashboard/horoscopes" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
