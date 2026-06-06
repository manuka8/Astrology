import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getMeApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const applyUser = (userData) => {
        setUser(userData);
    };

    useEffect(() => {
        const stored = localStorage.getItem('astroUser');
        if (stored) {
            const parsed = JSON.parse(stored);
            applyUser(parsed.user || parsed);
            getMeApi()
                .then(res => {
                    const fresh = { ...parsed, user: res.data };
                    localStorage.setItem('astroUser', JSON.stringify(fresh));
                    applyUser(res.data);
                })
                .catch(() => {
                    localStorage.removeItem('astroUser');
                    applyUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (data) => {
        localStorage.setItem('astroUser', JSON.stringify(data));
        applyUser(data.user || data);
    };

    const logout = () => {
        localStorage.removeItem('astroUser');
        applyUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await getMeApi();
            const stored = JSON.parse(localStorage.getItem('astroUser') || '{}');
            const updated = { ...stored, user: res.data };
            localStorage.setItem('astroUser', JSON.stringify(updated));
            applyUser(res.data);
        } catch (e) {}
    };

    // Returns true if the current user has the given permission.
    // super_admin always returns true.
    // admin returns true for everything except 'roles.manage'.
    // Other users check their permissions array.
    const hasPermission = useCallback((permission) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        if (user.role === 'admin') return permission !== 'roles.manage';
        return Array.isArray(user.permissions) && user.permissions.includes(permission);
    }, [user]);

    // Returns true if user can access the admin panel at all
    const isAdminUser = useCallback(() => {
        if (!user) return false;
        return user.role === 'super_admin' || user.role === 'admin' || !!user.custom_role_id;
    }, [user]);

    const isExpert = useCallback(() => user?.role === 'expert', [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser, hasPermission, isAdminUser, isExpert }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
