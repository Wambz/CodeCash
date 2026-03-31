import React, { useState, useEffect } from 'react';
import { X, Loader2, Phone, CheckCircle, XCircle, ArrowRight, Shield, ArrowDownUp, Info, ExternalLink, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { initiateDerivDeposit, initiateWithdrawal, pollTransactionStatus } from '../api/mpesaService';
import { useAuth } from '../context/AuthContext';
import NumericKeypad from './NumericKeypad';

const CODECASH_RATE = 133.00;  // Fixed KSH per USD rate for deposits
const DERIV_RATE_EST = 130.00; // Estimated Deriv rate
const EXCHANGE_RATE_WITHDRAW = 126.72; // KES per USD for withdrawals
const MIN_DEPOSIT_USD = 3;
const DERIV_DEPOSIT_URL = 'https://app.deriv.com/cashier/deposit?account=USD';

const PRESET_AMOUNTS = [10, 50, 100];

function TransactionModal({ onClose, onSuccess, balances, initialTab = 'deposit' }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(initialTab); // 'deposit' or 'withdraw'
    const [amount, setAmount] = useState(''); // USD for deposit, KES for withdraw
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = Input, 2 = Processing, 3 = Result
    const [status, setStatus] = useState(''); // '', 'initiated', 'processing', 'success', 'failed', 'partial-success'
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('deriv'); // 'deriv' or 'mt5' for deposit, also for withdraw source

    const isDeposit = activeTab === 'deposit';

    // Conversions
    const usdAmount = parseFloat(amount) || 0;
    const kesDepositAmount = Math.ceil(usdAmount * CODECASH_RATE);
    
    // Withdraw conversions
    const kesWithdrawAmount = parseFloat(amount) || 0;
    const usdWithdrawEquivalent = (kesWithdrawAmount / EXCHANGE_RATE_WITHDRAW).toFixed(2);
    
    const getAvailableBalance = () => {
        if (!balances) return 0;
        return target === 'deriv' ? balances.deriv : balances.mt5 || 0;
    };
    const availableBalance = getAvailableBalance();

    const handleKeyPress = (key) => {
        if (key === '.' && amount.includes('.')) return;
        if (amount.length >= 8) return;
        setAmount(prev => prev + key);
    };

    const handleDelete = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setAmount('');
    };

    const handlePresetSelect = (preset) => {
        if (isDeposit) {
            setAmount(preset.toString());
        } else {
            // Preset amounts represent USD, but withdraw amount is in KES
            setAmount((preset * EXCHANGE_RATE_WITHDRAW).toFixed(0).toString());
        }
    };

    const handleTabSwitch = (tab) => {
        if (loading) return;
        setActiveTab(tab);
        setAmount('');
        setStatus('');
        setMessage('');
        setStep(1);
    };
    
    // Smooth reset
    const handleRetry = () => {
        setStep(1);
        setStatus('');
        setMessage('');
        setLoading(false);
    };

    const submitDeposit = async () => {
        if (usdAmount < MIN_DEPOSIT_USD) {
            alert(`Minimum deposit amount is ${MIN_DEPOSIT_USD} USD`);
            return;
        }

        setLoading(true);
        setStep(2);
        setStatus('initiated');
        setMessage('Sending payment request to your phone...');

        try {
            const result = await initiateDerivDeposit(phoneNumber, usdAmount, user?.id || 1);

            if (result.success) {
                setStatus('processing');
                setMessage('Enter your M-Pesa PIN to confirm payment...');

                const transaction = await pollTransactionStatus(result.checkoutRequestId);

                if (transaction.status === 'completed') {
                    setStatus('success');
                    setStep(3);
                    setMessage(`Deposit Successful! $${usdAmount.toFixed(2)} added.`);
                    if (onSuccess) onSuccess(usdAmount);
                } else if (transaction.status === 'deriv-failed') {
                    setStatus('partial-success');
                    setStep(3);
                    setMessage(`Payment received, but automated deposit failed.`);
                } else if (transaction.status === 'success') {
                    setStatus('success');
                    setStep(3);
                    setMessage(`Payment received.`);
                } else if (transaction.status === 'failed') {
                    setStatus('failed');
                    setMessage(transaction.resultDesc || 'Transaction failed. Please try again.');
                } else {
                    setStatus('failed');
                    setMessage('Transaction timeout. Please check your M-Pesa messages.');
                }
            }
        } catch (error) {
            setStatus('failed');
            setMessage(error.message || 'Failed to initiate deposit');
        } finally {
            setLoading(false);
        }
    };

    const submitWithdraw = async () => {
        const usdRequired = parseFloat(usdWithdrawEquivalent);

        if (isNaN(kesWithdrawAmount) || kesWithdrawAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (usdRequired > availableBalance) {
            alert(`Insufficient funds. You need $${usdRequired.toFixed(2)} but have $${availableBalance.toFixed(2)}`);
            return;
        }

        setLoading(true);
        setStep(2);
        setStatus('initiated');
        setMessage('Initiating withdrawal...');

        try {
            const result = await initiateWithdrawal(phoneNumber, usdRequired, user?.id || 1);

            if (result.success) {
                setStatus('processing');
                setMessage('Processing withdrawal...');

                const transaction = await pollTransactionStatus(result.conversationId);

                if (transaction.status === 'success') {
                    setStatus('success');
                    setStep(3);
                    setMessage(`Successfully withdrew $${usdRequired.toFixed(2)} (${kesWithdrawAmount} KES)`);
                    setTimeout(() => {
                        if (onSuccess) onSuccess(usdRequired);
                        onClose();
                    }, 2000);
                } else if (transaction.status === 'failed') {
                    setStatus('failed');
                    setMessage(transaction.resultDesc || 'Transaction failed.');
                } else {
                    setStatus('failed');
                    setMessage('Transaction timeout.');
                }
            }
        } catch (error) {
            setStatus('failed');
            setMessage(error.message || 'Failed to initiate withdrawal');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phoneNumber) {
            alert('Please enter your M-Pesa phone number');
            return;
        }
        if (isDeposit) {
            await submitDeposit();
        } else {
            await submitWithdraw();
        }
    };

    const handleDerivRedirect = () => {
        window.open(DERIV_DEPOSIT_URL, '_blank');
    };

    // Calculate disabled state for button
    const isSubmitDisabled = loading || !amount || !phoneNumber || 
        (isDeposit ? usdAmount < MIN_DEPOSIT_USD : parseFloat(usdWithdrawEquivalent) > availableBalance);

    // Dynamic styles based on active tab
    const primaryColor = isDeposit ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-rose-500';
    const primaryTextColor = isDeposit ? 'text-green-600' : 'text-orange-600';
    const primaryBgHover = isDeposit ? 'hover:from-green-600 hover:to-emerald-700' : 'hover:from-orange-600 hover:to-rose-600';
    const shadowColor = isDeposit ? 'shadow-green-900/30' : 'shadow-orange-900/30';

    return (
        <div className="fixed inset-0 z-50 flex flex-col font-display bg-[#0A192F] animate-fade-in">
            {/* Header Area (Deep Blue) */}
            <div className="pt-12 pb-6 px-6 relative flex flex-col items-center justify-center shrink-0">
                <button
                    onClick={onClose}
                    className="absolute left-6 top-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>
                
                {/* Tab Switcher */}
                <div className="bg-white/10 p-1 rounded-full flex gap-1 backdrop-blur-md shadow-lg mb-4">
                    <button
                        onClick={() => handleTabSwitch('deposit')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                            isDeposit ? 'bg-white text-gray-900 shadow-md transform scale-100' : 'text-white/70 hover:text-white scale-95'
                        }`}
                        disabled={loading && step > 1}
                    >
                        <ArrowDownToLine className="w-4 h-4" />
                        Deposit
                    </button>
                    <button
                        onClick={() => handleTabSwitch('withdraw')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                            !isDeposit ? 'bg-white text-gray-900 shadow-md transform scale-100' : 'text-white/70 hover:text-white scale-95'
                        }`}
                        disabled={loading && step > 1}
                    >
                        <ArrowUpFromLine className="w-4 h-4" />
                        Withdraw
                    </button>
                </div>
            </div>

            {/* Sliding White Card */}
            <div className="flex-1 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden relative transition-transform duration-500 transform translate-y-0">
                {/* Scrollable Content inside Card */}
                <div className="flex-1 overflow-y-auto w-full px-6 pt-8 pb-4 flex flex-col items-center relative">
                    
                    {step === 3 ? (
                        /* ================= STEP 3: RESULT ================= */
                        <div className="w-full flex flex-col items-center justify-center h-full animate-fade-in">
                            {status === 'success' ? (
                                <>
                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${primaryColor} flex items-center justify-center mb-6 shadow-xl ${shadowColor} animate-bounce-subtle`}>
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Success!</h2>
                                    <p className="text-gray-500 text-center mb-8 font-medium">
                                        {isDeposit 
                                            ? `$${usdAmount.toFixed(2)} has been deposited to your Deriv account.`
                                            : `Successfully withdrew $${parseFloat(usdWithdrawEquivalent).toFixed(2)}.`}
                                    </p>
                                    
                                    <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Amount {isDeposit ? 'Paid' : 'Received'}</span>
                                            <span className="text-gray-900 font-bold text-lg">KSH {isDeposit ? kesDepositAmount.toLocaleString() : kesWithdrawAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-gray-200 w-full" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">USD {isDeposit ? 'Deposited' : 'Withdrawn'}</span>
                                            <span className={`${primaryTextColor} font-black text-xl`}>${isDeposit ? usdAmount.toFixed(2) : parseFloat(usdWithdrawEquivalent).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className={`w-full py-4 rounded-full font-bold text-lg bg-gray-900 hover:bg-black text-white active:scale-95 transition-all text-center`}
                                    >
                                        Done
                                    </button>
                                </>
                            ) : status === 'partial-success' ? (
                                <>
                                    <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mb-6 border-4 border-yellow-50">
                                        <Info className="w-12 h-12 text-yellow-500" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 text-center">Action Needed</h2>
                                    <p className="text-gray-500 text-center mb-8 font-medium">
                                        We received KSH {kesDepositAmount}, but the automated Deriv deposit failed. Please click below to complete it manually.
                                    </p>
                                    
                                    <button
                                        onClick={handleDerivRedirect}
                                        className={`w-full py-4 rounded-full font-bold text-lg bg-gradient-to-r ${primaryColor} text-white shadow-xl ${shadowColor} active:scale-95 transition-all flex items-center justify-center gap-2 mb-4`}
                                    >
                                        Deposit to Deriv
                                        <ExternalLink className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 rounded-full font-bold text-lg bg-gray-100 hover:bg-gray-200 text-gray-900 transition-all text-center active:scale-95"
                                    >
                                        Close
                                    </button>
                                </>
                            ) : null}
                        </div>
                    ) : (

                        /* ================= STEP 1 & 2: INPUT & PROCESSING ================= */
                        <div className="w-full flex-1 flex flex-col animate-fade-in relative z-10 w-full max-w-sm">
                            
                            {/* Platform Target Selector */}
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center bg-gray-100/80 p-1.5 rounded-full border border-gray-200">
                                    <button
                                        onClick={() => setTarget('deriv')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${target === 'deriv' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        disabled={loading}
                                    >
                                        Deriv
                                    </button>
                                    <button
                                        onClick={() => setTarget('mt5')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${target === 'mt5' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        disabled={loading}
                                    >
                                        MT5
                                    </button>
                                </div>
                            </div>

                            {/* Status Processing Indicator */}
                            {status && step === 2 && (
                                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-4 ${
                                    status === 'failed' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}>
                                    {status === 'failed' ? <XCircle className="w-6 h-6 shrink-0" /> : <Loader2 className="w-6 h-6 animate-spin shrink-0" />}
                                    <span className="text-sm font-semibold">{message}</span>
                                </div>
                            )}

                            {/* Main Amount Area */}
                            <div className="flex flex-col items-center mb-8">
                                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">
                                    {isDeposit ? 'Deposit Amount' : 'Withdraw Amount'}
                                </span>
                                
                                <div className="flex items-baseline gap-2 justify-center w-full overflow-hidden">
                                    <span className={`text-xl font-bold ${isDeposit && amount ? 'text-gray-900' : !isDeposit ? 'text-gray-400' : 'text-gray-300'}`}>
                                        {isDeposit ? '$' : ''}
                                    </span>
                                    <span className={`text-6xl font-black tracking-tighter truncate max-w-full ${amount ? 'text-gray-900' : 'text-gray-300'}`}>
                                        {amount || '0'}
                                    </span>
                                    <span className={`text-xl font-bold ${!isDeposit && amount ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {!isDeposit ? 'KES' : ''}
                                    </span>
                                </div>
                                <div className="h-1 w-16 bg-gray-200 rounded-full mt-2 mb-3"></div>
                                
                                {/* Equivalent Amount & Rate */}
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                        <ArrowDownUp className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="text-lg font-bold text-gray-500">
                                            {isDeposit ? `KES ${kesDepositAmount.toLocaleString()}` : `$ ${usdWithdrawEquivalent}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <span className="text-[11px] font-bold text-gray-500 uppercase">
                                            1 USD = {isDeposit ? CODECASH_RATE : EXCHANGE_RATE_WITHDRAW} KES
                                        </span>
                                        {isDeposit && <Shield className="w-3.5 h-3.5 text-green-500" />}
                                    </div>
                                </div>
                                
                                {!isDeposit && (
                                    <div className="mt-4 text-center">
                                        <span className="text-xs font-semibold text-gray-400">Available: </span>
                                        <span className="text-sm font-bold text-gray-900">${availableBalance.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Preset Buttons (Only show on Step 1) */}
                            {!loading && step === 1 && (
                                <div className="flex justify-center gap-3 mb-8 w-full">
                                    {PRESET_AMOUNTS.map(preset => (
                                        <button
                                            key={preset}
                                            onClick={() => handlePresetSelect(preset)}
                                            className="flex-1 py-3 px-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-2xl text-base font-bold text-gray-700 transition-colors border border-gray-100"
                                        >
                                            ${preset}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Phone Input */}
                            <div className="w-full mb-6">
                                <label className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-2 px-1">
                                    M-Pesa Number
                                </label>
                                <div className="w-full bg-white rounded-2xl p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 focus-within:border-gray-300 focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#006600]/10 flex items-center justify-center shrink-0 ml-1">
                                        <Phone className="w-5 h-5 text-[#006600]" />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="07..."
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-transparent text-gray-900 font-bold focus:outline-none text-xl placeholder-gray-300 pr-4"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-auto pointer-events-auto shrink-0 mb-4">
                                {status === 'failed' ? (
                                    <button
                                        onClick={handleRetry}
                                        className="w-full py-4 rounded-full font-bold text-lg bg-gray-100 text-gray-900 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        Try Again
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitDisabled}
                                        className={`w-full py-4 px-6 rounded-full font-black text-lg transition-all flex items-center justify-between group ${
                                            isSubmitDisabled
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : `bg-gradient-to-r ${primaryColor} ${primaryBgHover} text-white shadow-xl ${shadowColor} active:scale-[0.98]`
                                        }`}
                                    >
                                        <span>
                                            {loading ? 'Processing...' : (isDeposit ? 'Confirm Deposit' : 'Confirm Withdraw')}
                                        </span>
                                        {!loading && !isSubmitDisabled && (
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                <ArrowRight className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Keypad integrated into the card (hidden while loading/failed) */}
                {!loading && step === 1 && (
                    <div className="w-full bg-gray-50/80 border-t border-gray-100 pt-3 pb-6 shrink-0 z-20">
                        <NumericKeypad
                            onKeyPress={handleKeyPress}
                            onDelete={handleDelete}
                            onClear={handleClear}
                            theme="light"
                        />
                    </div>
                )}
            </div>
            
            <style jsx="true">{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export default TransactionModal;
