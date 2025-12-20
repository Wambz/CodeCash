import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Signup Prompted:", formData);
        // Add actual signup logic here later
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-[480px] mx-auto shadow-2xl bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display">
            {/* Background Pattern/Gradient Accents */}
            <div className="fixed top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 p-6 flex flex-col">

                {/* Header Section */}
                <header className="flex flex-col items-center justify-center pt-4 pb-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src="/logo.png" alt="CODECASH Logo" className="w-full h-full object-contain transform -rotate-6 filter drop-shadow-md" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">CODECASH</span>
                    </div>

                    {/* Illustration */}
                    <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-white/5 relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent z-10"></div>
                        <img
                            className="w-full h-full object-cover opacity-80"
                            alt="Abstract 3D finance illustration"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPgl3IzmrXDCyzL0O8p85X9GdSVPNnYBrrIBfWwOnEJc9EeL0ZFPHByHQIm41ThNhYA6m6JQbXPjgI2UVNz-J_aC5njBuHPaVEDx5vDn2IZyL-CCpnUMRrLwFa8wxPK32KAFk4RufhV7sl09cwS6C9xx7uJdMhwvJRyrcHNw2wxvm7tw2J5rme2ATpkIux5xijRvm8rMFj3d1rPvXKRS-IaMCpzSe1Lheg269mmf-_ufDHcTznsBpqR65ebLBAlo5yzdbVsf1fxDM"
                        />
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold leading-tight mb-2">Create Account</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Join the fastest M-Pesa to Deriv exchange platform.</p>
                    </div>
                </header>

                {/* Sign Up Form */}
                <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">mail</span>
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary h-14 pl-12 pr-4 transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    {/* M-Pesa Number Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">M-Pesa Number</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">phone_iphone</span>
                            </div>
                            <input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary h-14 pl-12 pr-4 transition-all"
                                placeholder="+254 7XX XXX XXX"
                            />
                        </div>
                    </div>

                    {/* Deriv / MT5 Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Deriv / MT5 CR Number</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">account_balance_wallet</span>
                            </div>
                            <input
                                id="crNumber"
                                type="text"
                                value={formData.crNumber}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary h-14 pl-12 pr-4 transition-all"
                                placeholder="e.g. CR123456"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">lock</span>
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary h-14 pl-12 pr-12 transition-all"
                                placeholder="Create a strong password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                            >
                                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3 mt-2 px-1">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={formData.terms}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-600 bg-[#1E1E1E] text-primary focus:ring-primary focus:ring-offset-background-dark"
                            />
                        </div>
                        <label htmlFor="terms" className="text-sm text-gray-400">
                            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                        </label>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-red-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/40 active:scale-[0.98] transition-all duration-200 mt-2 flex items-center justify-center gap-2 group"
                    >
                        <span>Sign Up</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </form>

                {/* Footer Login Link */}
                <div className="mt-8 text-center pb-6">
                    <p className="text-gray-400 text-sm">
                        Already have an account?
                        <a href="#" className="text-primary font-semibold hover:text-red-400 transition-colors ml-1" onClick={(e) => { e.preventDefault(); navigate('/'); /* Assuming login is home for now or dedicated login page */ }}>Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
