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
            const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
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
            console.error("API Login failed, using mock fallback:", error);
            // Fallback for demo/dev if DB isn't set up yet
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (email && password) {
                        const mockUser = {
                            id: '1',
                            email: email,
                            name: email.split('@')[0],
                        };
                        setUser(mockUser);
                        localStorage.setItem('codecash_user', JSON.stringify(mockUser));
                        resolve(mockUser);
                    } else {
                        reject(new Error('Invalid credentials'));
                    }
                }, 800);
            });
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
                await fetch('http://127.0.0.1:5000/api/auth/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, ...updates })
                });
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
