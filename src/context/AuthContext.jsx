import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in (from localStorage)
        const savedUser = localStorage.getItem('codecash_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const signIn = async (email, password) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('codecash_user', JSON.stringify(data.user));
                localStorage.setItem('codecash_token', data.token);
                return data.user;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error("API Login failed:", error);
            throw error;
        }
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem('codecash_user');
        localStorage.removeItem('codecash_token');
    };

    const updateUser = async (updates) => {
        try {
            // Optimistic update
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem('codecash_user', JSON.stringify(updatedUser));

            if (user?.id) {
                const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
                const response = await fetch(`${API_URL}/api/auth/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, ...updates })
                });

                const data = await response.json();
                if (!data.success) {
                    console.error("Backend update failed:", data.message);
                    // Revert optimistic update if needed, but for now just log
                }
            }
        } catch (error) {
            console.error("Failed to sync update to backend", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
