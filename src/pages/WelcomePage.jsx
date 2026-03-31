import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, Loader2, Shield, ArrowLeft, RefreshCw } from 'lucide-react';

function WelcomePage() {
    const [view, setView] = useState('login'); // 'login', 'otp', 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');

    // OTP states
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const otpInputRefs = useRef([]);

    // Forgot/Reset states
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds

    const { signIn, resetPassword, verifyOtp, resendOtp, cancelTwoFactor, pendingTwoFactor, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // If pendingTwoFactor changes to true, switch to OTP view
    useEffect(() => {
        if (pendingTwoFactor && view !== 'otp') {
            setView('otp');
        }
    }, [pendingTwoFactor]);

    // OTP countdown timer
    useEffect(() => {
        if (view === 'otp' && otpTimer > 0) {
            const interval = setInterval(() => {
                setOtpTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [view, otpTimer]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const interval = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendCooldown]);

    // Focus first OTP input when view changes to 'otp'
    useEffect(() => {
        if (view === 'otp' && otpInputRefs.current[0]) {
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        }
    }, [view]);

    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (value && index === 5 && newDigits.every(d => d !== '')) {
            handleVerifyOtp(newDigits.join(''));
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const newDigits = pasted.split('');
            setOtpDigits(newDigits);
            otpInputRefs.current[5]?.focus();
            // Auto-submit
            handleVerifyOtp(pasted);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn(email, password);
            if (result.requiresOtp) {
                setMaskedEmail(result.maskedEmail || email);
                setView('otp');
                setOtpDigits(['', '', '', '', '', '']);
                setOtpTimer(300);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (code) => {
        const otpCode = code || otpDigits.join('');
        if (otpCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await verifyOtp(otpCode);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
            // Clear OTP inputs on error
            setOtpDigits(['', '', '', '', '', '']);
            otpInputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const result = await resendOtp();
            setSuccessMessage('New verification code sent!');
            setResendCooldown(30);
            setOtpTimer(300);
            setOtpDigits(['', '', '', '', '', '']);
            otpInputRefs.current[0]?.focus();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = async () => {
        await cancelTwoFactor();
        setView('login');
        setError('');
        setSuccessMessage('');
        setOtpDigits(['', '', '', '', '', '']);
        setPassword('');
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSuccessMessage('');

        try {
            await resetPassword(email);
            setSuccessMessage('Password reset email sent! Check your inbox.');
            setTimeout(() => setView('login'), 3000);
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
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

                    {/* ===== LOGIN VIEW ===== */}
                    {view === 'login' && (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-white">Sign In</h2>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

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
                        </>
                    )}

                    {/* ===== OTP VERIFICATION VIEW ===== */}
                    {view === 'otp' && (
                        <div className="text-center">
                            {/* Shield Icon with Pulse Animation */}
                            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                                <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                                <div className="absolute inset-0 bg-red-600/10 rounded-full"></div>
                                <Shield className="w-10 h-10 text-red-500 relative z-10" />
                            </div>

                            <h2 className="text-2xl font-bold mb-2 text-white">2-Step Verification</h2>
                            <p className="text-gray-400 text-sm mb-1">
                                Enter the 6-digit code sent to
                            </p>
                            <p className="text-white font-medium text-sm mb-6">
                                {maskedEmail || email}
                            </p>

                            {/* Timer */}
                            {otpTimer > 0 ? (
                                <div className="mb-6">
                                    <span className="text-xs text-gray-500">Code expires in </span>
                                    <span className={`text-sm font-mono font-bold ${otpTimer <= 60 ? 'text-red-500' : 'text-green-500'}`}>
                                        {formatTimer(otpTimer)}
                                    </span>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <span className="text-sm text-red-500 font-medium">Code expired</span>
                                </div>
                            )}

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

                            {/* OTP Input Grid */}
                            <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
                                {otpDigits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpInputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-black/80 text-white 
                                            focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200
                                            ${digit ? 'border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'border-gray-700'}
                                            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500'}`}
                                        disabled={loading}
                                        autoComplete="one-time-code"
                                    />
                                ))}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={() => handleVerifyOtp()}
                                className="w-full px-6 py-3 gradient-red hover:opacity-90 rounded-xl text-white font-semibold disabled:opacity-50 transition-all duration-300 glow-red flex items-center justify-center gap-2 mb-4"
                                disabled={loading || otpDigits.some(d => d === '')}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        <span>Verify Code</span>
                                    </>
                                )}
                            </button>

                            {/* Resend & Back buttons */}
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={handleBackToLogin}
                                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                                    disabled={loading}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Back</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className={`flex items-center gap-1 text-sm transition-colors ${
                                        resendCooldown > 0
                                            ? 'text-gray-600 cursor-not-allowed'
                                            : 'text-red-500 hover:text-red-400'
                                    }`}
                                    disabled={loading || resendCooldown > 0}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span>
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                    </span>
                                </button>
                            </div>

                            {/* Dev hint */}
                            <p className="text-[10px] text-gray-700 mt-6">
                                Check backend console for the verification code
                            </p>
                        </div>
                    )}

                    {/* ===== FORGOT PASSWORD VIEW ===== */}
                    {view === 'forgot' && (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-white">Reset Password</h2>

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

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <p className="text-sm text-gray-400 mb-4">Enter your email and we'll send you a password reset link.</p>
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
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                                </button>
                                <button type="button" onClick={() => { setView('login'); setError(''); }} className="w-full text-sm text-gray-500 hover:text-gray-300 mt-2">
                                    Back to Sign In
                                </button>
                            </form>
                        </>
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
