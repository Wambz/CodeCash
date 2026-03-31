import React, { useState } from 'react';
import { X, Loader2, Phone, CheckCircle, XCircle, ArrowLeftRight, RefreshCw, ExternalLink, ArrowRight, Shield, Info } from 'lucide-react';
import { initiateDerivDeposit, pollTransactionStatus } from '../api/mpesaService';
import { useAuth } from '../context/AuthContext';
import NumericKeypad from './NumericKeypad';

const CODECASH_RATE = 133.00;  // Fixed KSH per USD rate
const DERIV_RATE_EST = 130.00; // Estimated Deriv rate (for fee display only)
const MIN_DEPOSIT_USD = 3;
const DERIV_DEPOSIT_URL = 'https://app.deriv.com/cashier/deposit?account=USD';

function DepositModal({ onClose, onSuccess }) {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1=Enter Amount, 2=Processing, 3=Success (Redirect to Deriv)
    const [status, setStatus] = useState(''); // '', 'initiated', 'processing', 'success', 'failed'
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('deriv'); // 'deriv' or 'mt5'

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

    const usdAmount = parseFloat(amount) || 0;
    const kesAmount = Math.ceil(usdAmount * CODECASH_RATE);
    const estimatedFeePerUSD = CODECASH_RATE - DERIV_RATE_EST;
    const estimatedTotalFee = Math.round(usdAmount * estimatedFeePerUSD);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (usdAmount < MIN_DEPOSIT_USD) {
            alert(`Minimum deposit amount is ${MIN_DEPOSIT_USD} USD`);
            return;
        }

        if (!phoneNumber) {
            alert('Please enter your M-Pesa phone number');
            return;
        }

        setLoading(true);
        setStep(2);
        setStatus('initiated');
        setMessage('Sending payment request to your phone...');

        try {
            // Step 1: Initiate STK Push via new deriv-deposit endpoint
            const result = await initiateDerivDeposit(phoneNumber, usdAmount, user?.id || 1);

            if (result.success) {
                setStatus('processing');
                setMessage('Enter your M-Pesa PIN to confirm payment...');

                // Step 2: Poll for transaction status
                // We now wait for 'completed' (Deriv success) or 'deriv-failed' (M-Pesa success, Deriv fail)
                const transaction = await pollTransactionStatus(result.checkoutRequestId);

                if (transaction.status === 'completed') {
                    // M-Pesa + Deriv Success
                    setStatus('success');
                    setStep(3);
                    setMessage(`Deposit Successful! $${usdAmount} added to Deriv.`);
                    if (onSuccess) onSuccess(usdAmount);
                } else if (transaction.status === 'deriv-failed') {
                    // M-Pesa Success, Deriv Failed
                    setStatus('partial-success');
                    setStep(3);
                    setMessage(`Payment received, but automated deposit failed.`);
                } else if (transaction.status === 'success') {
                    // Catch-all for basic success if backend hasn't updated to completed/deriv-failed yet
                    // This shouldn't happen if backend is fast, but just in case
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

    const handleDerivRedirect = () => {
        window.open(DERIV_DEPOSIT_URL, '_blank');
    };

    const handleRetry = () => {
        setStep(1);
        setStatus('');
        setMessage('');
        setLoading(false);
    };

    // ========== STEP 3: SUCCESS / PARTIAL SUCCESS ==========
    if (step === 3) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col font-display text-white">
                {/* Header */}
                <div className="relative p-4 text-center">
                    <button onClick={onClose} className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/10 transition-all text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-lg font-normal">Deposit Complete</h3>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">

                    {status === 'success' ? (
                        <>
                            {/* Success Icon */}
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 animate-pulse">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Deposit Successful!</h2>
                            <p className="text-gray-400 text-center mb-6">
                                ${usdAmount.toFixed(2)} has been deposited to your Deriv account.
                            </p>

                            <div className="w-full bg-[#1c1c1e] rounded-2xl p-5 border border-white/5 mb-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Amount Paid</span>
                                    <span className="text-white font-bold">KSH {kesAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Deposited</span>
                                    <span className="text-green-400 font-bold">${usdAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-3xl font-bold text-lg bg-[#ff0000] hover:bg-red-600 text-white shadow-lg shadow-red-900/30 active:scale-95 transition-all text-center"
                            >
                                Done
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Partial Success / Fallback */}
                            <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
                                <Info className="w-12 h-12 text-yellow-500" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Manual Action Needed</h2>
                            <p className="text-gray-400 text-center mb-6">
                                We received your KSH {kesAmount}, but the automated Deriv deposit failed. Please click below to complete the deposit manually.
                            </p>

                            <button
                                onClick={handleDerivRedirect}
                                className="w-full py-4 rounded-3xl font-bold text-lg bg-[#ff0000] hover:bg-red-600 text-white shadow-lg shadow-red-900/30 active:scale-95 transition-all flex items-center justify-center gap-3 mb-3"
                            >
                                Deposit to Deriv
                                <ExternalLink className="w-5 h-5" />
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-3xl font-bold text-lg bg-[#1c1c1e] hover:bg-white/5 text-white border border-white/10 transition-all text-center"
                            >
                                Close
                            </button>
                        </>
                    )}

                </div>
            </div>
        );
    }

    // ========== STEP 1 & 2: ENTER AMOUNT / PROCESSING ==========
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col animate-slide-up font-display text-white">
            {/* Header */}
            <div className="relative p-4 text-center">
                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/10 transition-all text-gray-400"
                >
                    <X className="w-6 h-6" />
                </button>
                <h3 className="text-lg font-normal">Deposit to Deriv</h3>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 overflow-y-auto">

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-5">
                    {[
                        { num: 1, label: 'Amount' },
                        { num: 2, label: 'Pay' },
                        { num: 3, label: 'Deriv' }
                    ].map((s, i) => (
                        <React.Fragment key={s.num}>
                            {i > 0 && <div className={`w-8 h-0.5 ${step >= s.num ? 'bg-red-500' : 'bg-gray-700'}`} />}
                            <div className="flex items-center gap-1.5">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.num ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span className={`text-xs font-medium ${step >= s.num ? 'text-white' : 'text-gray-600'}`}>
                                    {s.label}
                                </span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* Target Selector */}
                <div className="flex justify-center mb-4">
                    <div className="flex items-center bg-[#1c1c1e] rounded-xl p-1 border border-white/10">
                        <button
                            onClick={() => setTarget('deriv')}
                            className={`px-8 py-2 rounded-lg text-sm font-medium transition-all ${target === 'deriv' ? 'bg-[#ff0000] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            Deriv
                        </button>
                        <button
                            onClick={() => setTarget('mt5')}
                            className={`px-8 py-2 rounded-lg text-sm font-medium transition-all ${target === 'mt5' ? 'bg-[#ff0000] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            MT5
                        </button>
                    </div>
                </div>

                {/* Status Message */}
                {status && (
                    <div className={`mb-4 p-3 rounded-2xl flex items-center gap-3 ${status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        status === 'failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                        {status === 'success' && <CheckCircle className="w-5 h-5" />}
                        {status === 'failed' && <XCircle className="w-5 h-5" />}
                        {(status === 'initiated' || status === 'processing') && <Loader2 className="w-5 h-5 animate-spin" />}
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}

                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Amount Display */}
                    <div className="flex flex-col items-center mb-2">
                        <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-medium tracking-tight ${amount ? 'text-white' : 'text-gray-600'}`}>
                                {amount || '0.00'}
                            </span>
                            <span className="text-xl text-gray-500 font-medium">USD</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-gray-400">
                            <span className="text-xs font-medium">1 USD = {CODECASH_RATE} KES</span>
                            <Shield className="w-3 h-3 text-green-500 opacity-70" />
                            <span className="text-[10px] text-green-500/70">Fixed Rate</span>
                        </div>
                    </div>

                    {/* KSH Conversion Display */}
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowLeftRight className="w-4 h-4 text-gray-600 rotate-90" />
                        <span className="text-xl font-medium text-gray-400">{kesAmount.toLocaleString()}</span>
                        <span className="text-xs text-gray-600 font-bold mt-1">KES</span>
                    </div>

                    {/* Fee Breakdown (only shown when amount is entered) */}
                    {usdAmount >= MIN_DEPOSIT_USD && (
                        <div className="w-full bg-[#1c1c1e] rounded-2xl p-4 border border-white/5 mb-4 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">M-Pesa Payment</span>
                                <span className="text-white font-medium">KSH {kesAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">You Deposit to Deriv</span>
                                <span className="text-green-400 font-medium">${usdAmount.toFixed(2)} USD</span>
                            </div>
                            <div className="border-t border-white/5 pt-2 flex justify-between items-center text-sm">
                                <span className="text-gray-500">Service Fee</span>
                                <span className="text-gray-400 font-medium">~KSH {estimatedTotalFee.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Phone Input */}
                    <div className="w-full mb-4">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 px-1">
                            <span>M-Pesa Phone Number</span>
                        </div>
                        <div className="w-full bg-[#1c1c1e] rounded-2xl p-1 border border-white/5 focus-within:border-[#ff0000]/50 transition-colors">
                            <div className="flex items-center gap-3 px-4 py-2">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-green-500" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="07..."
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full bg-transparent text-white font-medium focus:outline-none text-lg"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit / Retry */}
                <div className="mt-auto mb-2">
                    <div className="text-center mb-3">
                        <p className="text-gray-400 text-xs">Minimum deposit is {MIN_DEPOSIT_USD} USD</p>
                    </div>

                    {status === 'failed' ? (
                        <button
                            onClick={handleRetry}
                            className="w-full py-3 rounded-3xl font-bold text-lg bg-[#1c1c1e] text-white border border-white/10 hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Try Again
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !amount || !phoneNumber || usdAmount < MIN_DEPOSIT_USD}
                            className={`w-full py-3 rounded-3xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${loading || !amount || !phoneNumber || usdAmount < MIN_DEPOSIT_USD
                                ? 'bg-[#1c1c1e] text-gray-500 cursor-not-allowed'
                                : 'bg-[#ff0000] hover:bg-red-600 text-white shadow-red-900/20 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Pay KSH {kesAmount.toLocaleString()}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Keypad Section */}
            {!loading && step === 1 && (
                <div className="bg-[#1c1c1e]/50 border-t border-white/5 pb-6 pt-2 shrink-0">
                    <NumericKeypad
                        onKeyPress={handleKeyPress}
                        onDelete={handleDelete}
                        onClear={handleClear}
                    />
                </div>
            )}
        </div>
    );
}

export default DepositModal;
