import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMeApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('astroUser');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed.user || parsed);
            getMeApi()
                .then(res => {
                    const fresh = { ...parsed, user: res.data };
                    localStorage.setItem('astroUser', JSON.stringify(fresh));
                    setUser(res.data);
                })
                .catch(() => {
                    localStorage.removeItem('astroUser');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (data) => {
        localStorage.setItem('astroUser', JSON.stringify(data));
        setUser(data.user || data);
    };

    const logout = () => {
        localStorage.removeItem('astroUser');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await getMeApi();
            const stored = JSON.parse(localStorage.getItem('astroUser') || '{}');
            const updated = { ...stored, user: res.data };
            localStorage.setItem('astroUser', JSON.stringify(updated));
            setUser(res.data);
        } catch (e) {}
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
