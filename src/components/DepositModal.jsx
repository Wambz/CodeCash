import React, { useState } from 'react';
import { X, ArrowDownCircle, Loader2, Phone, CheckCircle, XCircle, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { initiateDeposit, pollTransactionStatus } from '../api/mpesaService';
import { useAuth } from '../context/AuthContext';
import NumericKeypad from './NumericKeypad';

function DepositModal({ onClose, onSuccess }) {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(''); // '', 'initiated', 'processing', 'success', 'failed'
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('deriv'); // 'deriv' or 'mt5'

    const EXCHANGE_RATE = 136.62;
    const MIN_DEPOSIT_USD = 3;

    const handleKeyPress = (key) => {
        if (key === '.' && amount.includes('.')) return;
        if (amount.length >= 8) return; // Limit length
        setAmount(prev => prev + key);
    };

    const handleDelete = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setAmount('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const usdAmount = parseFloat(amount);

        if (isNaN(usdAmount) || usdAmount < MIN_DEPOSIT_USD) {
            alert(`Minimum deposit amount is ${MIN_DEPOSIT_USD} USD`);
            return;
        }

        if (!phoneNumber) {
            alert('Please enter your M-Pesa phone number');
            return;
        }

        setLoading(true);
        setStatus('initiated');
        setMessage('Initiating STK Push request...');

        // Convert to KES for M-Pesa
        const kesAmount = Math.ceil(usdAmount * EXCHANGE_RATE);

        try {
            // Step 1: Initiate STK Push
            // Note: passing kesAmount to backend, as M-Pesa expects KES
            const result = await initiateDeposit(phoneNumber, kesAmount, user?.id || 1);

            if (result.success) {
                setStatus('processing');
                setMessage('Check your phone and enter M-Pesa PIN...');

                // Step 2: Poll for transaction status
                const transaction = await pollTransactionStatus(result.checkoutRequestId);

                if (transaction.status === 'success') {
                    setStatus('success');
                    setMessage(`Deposit of $${usdAmount} (${kesAmount} KES) successful!`);
                    setTimeout(() => {
                        if (onSuccess) onSuccess(usdAmount);
                        onClose();
                    }, 2000);
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

    const kesEquivalent = amount ? (parseFloat(amount) * EXCHANGE_RATE).toFixed(2) : '0';

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
                <h3 className="text-lg font-normal">Deposit</h3>
            </div>

            {/* Main Content - Scrollable to prevent overlap */}
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 overflow-y-auto">

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
                            <span className="text-xs font-medium">1 USD = {EXCHANGE_RATE} KES</span>
                            <RefreshCw className="w-3 h-3 opacity-50" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                        <ArrowLeftRight className="w-4 h-4 text-gray-600 rotate-90" />
                        <span className="text-xl font-medium text-gray-400">{Number(kesEquivalent).toLocaleString()}</span>
                        <span className="text-xs text-gray-600 font-bold mt-1">KES</span>
                    </div>

                    {/* Phone Input */}
                    <div className="w-full mb-4">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 px-1">
                            <span>Phone Number</span>
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

                {/* Minimum Deposit Warning / Submit */}
                <div className="mt-auto mb-2">
                    <div className="text-center mb-3">
                        <p className="text-gray-400 text-xs">Minimum deposit amount is {MIN_DEPOSIT_USD} USD</p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !amount || !phoneNumber || parseFloat(amount) < MIN_DEPOSIT_USD}
                        className={`w-full py-3 rounded-3xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${loading || !amount || !phoneNumber || parseFloat(amount) < MIN_DEPOSIT_USD
                            ? 'bg-[#1c1c1e] text-gray-500 cursor-not-allowed'
                            : 'bg-[#ff0000] hover:bg-red-600 text-white shadow-red-900/20 active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Deposit Funds
                                <ArrowLeftRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Keypad Section - Fixed Grid */}
            <div className="bg-[#1c1c1e]/50 border-t border-white/5 pb-6 pt-2 shrink-0">
                <NumericKeypad
                    onKeyPress={handleKeyPress}
                    onDelete={handleDelete}
                    onClear={handleClear}
                />
            </div>
        </div>
    );
}

export default DepositModal;
