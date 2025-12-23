import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';

function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        crNumber: '',
        password: '',
        terms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.email || !formData.phone || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (!formData.terms) {
            setError('Please accept the Terms of Service and Privacy Policy');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.email.split('@')[0], // Use email prefix as name
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Registration successful - navigate to login or dashboard
                alert('Account created successfully! Please log in.');
                navigate('/');
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-display">
            {/* Background Effects */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">

                {/* Header Section */}
                <div className="text-center mb-8">
                    {/* Logo */}
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-4 cursor-pointer hover:scale-105 transition-transform bg-white/5 rounded-full ring-1 ring-white/10 shadow-lg shadow-red-900/20" onClick={() => navigate('/')}>
                        <Wallet className="w-10 h-10 text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">
                        Create Account
                    </h1>
                    <p className="text-gray-400 text-sm">Join the fastest M-Pesa to Deriv exchange.</p>
                </div>

                {/* Sign Up Form */}
                <div className="glass-effect rounded-2xl p-8 border border-white/10">
                    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>

                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 group-focus-within:text-red-500 transition-colors">mail</span>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 text-white placeholder-gray-600 rounded-xl border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 h-12 pl-11 pr-4 transition-all text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* M-Pesa Number Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 ml-1">M-Pesa Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 group-focus-within:text-red-500 transition-colors">phone_iphone</span>
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 text-white placeholder-gray-600 rounded-xl border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 h-12 pl-11 pr-4 transition-all text-sm"
                                    placeholder="+254 7XX XXX XXX"
                                />
                            </div>
                        </div>

                        {/* Deriv / MT5 Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 ml-1">Deriv / MT5 CR Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 group-focus-within:text-red-500 transition-colors">account_balance_wallet</span>
                                </div>
                                <input
                                    id="crNumber"
                                    type="text"
                                    value={formData.crNumber}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 text-white placeholder-gray-600 rounded-xl border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 h-12 pl-11 pr-4 transition-all text-sm"
                                    placeholder="e.g. CR123456"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 group-focus-within:text-red-500 transition-colors">lock</span>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 text-white placeholder-gray-600 rounded-xl border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 h-12 pl-11 pr-12 transition-all text-sm"
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 mt-1 px-1">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-600 bg-black/50 text-red-600 focus:ring-red-500 focus:ring-offset-black"
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-gray-400">
                                I agree to the <a href="#" className="text-red-500 hover:text-red-400 hover:underline">Terms of Service</a> and <a href="#" className="text-red-500 hover:text-red-400 hover:underline">Privacy Policy</a>.
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-900/20 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-red hover:opacity-90 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all duration-200 mt-2 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign Up</span>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account?
                            <a href="#" className="text-red-500 font-semibold hover:text-red-400 transition-colors ml-1" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Sign In</a>
                        </p>
                    </div>
                </div>

                {/* Footer Copyright */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    © 2025 CODECASH. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default SignupPage;
