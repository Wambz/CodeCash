import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, Loader2 } from 'lucide-react';

function WelcomePage() {
    const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot/Reset states
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSuccessMessage('');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                setSuccessMessage(data.message);
                if (data.debug_token) {
                    console.log("DEBUG: Reset Token is", data.debug_token);
                }
                setTimeout(() => setView('reset'), 2000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to request reset token');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: resetToken, newPassword })
            });
            const data = await res.json();

            if (data.success) {
                setSuccessMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    setView('login');
                    setSuccessMessage('');
                    setPassword('');
                }, 2000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                        <img src="/logo.png" alt="CODECASH Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-white">CODE</span>
                        <span className="text-red-600">CASH</span>
                    </h1>
                    <p className="text-gray-400">Secure M-Pesa & Deriv Transactions</p>
                </div>

                {/* Form Container */}
                <div className="glass-effect rounded-2xl p-8 border border-red-900/20">
                    <h2 className="text-2xl font-bold mb-6 text-white">
                        {view === 'login' ? 'Sign In' : view === 'forgot' ? 'Reset Password' : 'Set New Password'}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
                            {successMessage}
                        </div>
                    )}

                    {view === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black border border-gray-700 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        placeholder="your@email.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black border border-gray-700 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-3 gradient-red hover:opacity-90 rounded-xl text-white font-semibold disabled:opacity-50 transition-all duration-300 glow-red flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                            </button>

                            <div className="flex justify-between items-center mt-4">
                                <button type="button" onClick={() => { setView('forgot'); setError(''); }} className="text-sm text-gray-400 hover:text-white">
                                    Forgot Password?
                                </button>
                                <button type="button" onClick={() => navigate('/signup')} className="text-sm text-red-500 font-semibold hover:text-red-400">
                                    Sign Up
                                </button>
                            </div>
                        </form>
                    )}

                    {view === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <p className="text-sm text-gray-400 mb-4">Enter your email and we'll send you a verification token.</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black border border-gray-700 text-white focus:border-red-500 focus:outline-none"
                                        placeholder="your@email.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-3 gradient-red hover:opacity-90 rounded-xl text-white font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Token'}
                            </button>
                            <button type="button" onClick={() => { setView('login'); setError(''); }} className="w-full text-sm text-gray-500 hover:text-gray-300 mt-2">
                                Back to Sign In
                            </button>
                        </form>
                    )}

                    {view === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <p className="text-sm text-gray-400 mb-4">Check your email (console) for the token.</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Verification Token</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={resetToken}
                                        onChange={(e) => setResetToken(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black border border-gray-700 text-white focus:border-red-500 focus:outline-none tracking-widest text-center font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black border border-gray-700 text-white focus:border-red-500 focus:outline-none"
                                        placeholder="New Password"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-3 gradient-red hover:opacity-90 rounded-xl text-white font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                            </button>
                            <button type="button" onClick={() => { setView('login'); setError(''); }} className="w-full text-sm text-gray-500 hover:text-gray-300 mt-2">
                                Cancel
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    © 2025 CODECASH. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default WelcomePage;
