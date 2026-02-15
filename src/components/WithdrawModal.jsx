import React, { useState } from 'react';
import { X, ArrowDownCircle, Loader2, Phone, CheckCircle, XCircle, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { initiateWithdrawal, pollTransactionStatus } from '../api/mpesaService';
import { useAuth } from '../context/AuthContext';
import NumericKeypad from './NumericKeypad';

function WithdrawModal({ onClose, onSuccess, balances }) {
    const { user } = useAuth();
    const [amount, setAmount] = useState(''); // KES Amount
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');
    const [source, setSource] = useState('deriv'); // 'deriv' or 'mt5'

    const EXCHANGE_RATE = 126.72; // KES per USD

    // Calculate USD equivalent
    const usdEquivalent = amount ? (parseFloat(amount) / EXCHANGE_RATE).toFixed(2) : '0.00';

    const getAvailableBalance = () => {
        if (!balances) return 0;
        return source === 'deriv' ? balances.deriv : balances.mt5 || 0;
    };

    const availableBalance = getAvailableBalance();

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
        const kesAmount = parseFloat(amount);
        const usdRequired = parseFloat(usdEquivalent);

        if (isNaN(kesAmount) || kesAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (usdRequired > availableBalance) {
            alert(`Insufficient funds. You need $${usdRequired} but have $${availableBalance}`);
            return;
        }

        if (!phoneNumber) {
            alert('Please enter your M-Pesa phone number');
            return;
        }

        setLoading(true);
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
                    setMessage(`Successfully withdrew $${usdRequired} (${kesAmount} KES)`);
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
                <h3 className="text-lg font-normal">Withdraw</h3>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-2 overflow-y-auto">

                {/* Source Selector */}
                <div className="flex flex-col items-center mb-6">
                    <span className="text-xs text-gray-500 font-medium mb-3">From</span>
                    <div className="flex items-center bg-[#1c1c1e] rounded-xl p-1 border border-white/10">
                        <button
                            onClick={() => setSource('deriv')}
                            className={`px-8 py-2 rounded-lg text-sm font-medium transition-all ${source === 'deriv' ? 'bg-[#ff0000] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            Deriv
                        </button>
                        <button
                            onClick={() => setSource('mt5')}
                            className={`px-8 py-2 rounded-lg text-sm font-medium transition-all ${source === 'mt5' ? 'bg-[#ff0000] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-white'}`}
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
                                {amount || '0'}
                            </span>
                            <span className="text-xl text-gray-500 font-medium">KES</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-gray-400">
                            <span className="text-xs font-medium">1 USD = {EXCHANGE_RATE} KES</span>
                            <div className="rotate-90">
                                <ArrowLeftRight className="w-3 h-3 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xl font-medium text-gray-400">{usdEquivalent}</span>
                        <span className="text-xs text-gray-600 font-bold mt-1">USD</span>
                    </div>

                    {/* Footer Warning / Available Balance */}
                    <div className="mb-4 p-3 bg-[#1c1c1e] rounded-2xl border border-white/5 w-full text-center">
                        <p className="text-gray-400 text-xs">
                            Available balance is <span className="text-white font-bold">{availableBalance ? Number(availableBalance).toFixed(2) : '0.00'} USD</span>
                        </p>
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

                {/* Submit */}
                <div className="mt-auto mb-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !amount || !phoneNumber || parseFloat(usdEquivalent) > availableBalance}
                        className={`w-full py-3 rounded-3xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${loading || !amount || !phoneNumber || parseFloat(usdEquivalent) > availableBalance
                                ? 'bg-[#1c1c1e] text-gray-500 cursor-not-allowed'
                                : 'bg-[#ff0000] hover:bg-red-600 text-white shadow-red-900/20 active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Withdraw Funds
                                <ArrowLeftRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Keypad Section */}
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

export default WithdrawModal;
