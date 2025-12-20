import React, { useState } from 'react';
import { X, ArrowUpCircle, Loader2, Phone, CheckCircle, XCircle } from 'lucide-react';
import { initiateWithdrawal, pollTransactionStatus } from '../api/mpesaService';
import { useAuth } from '../context/AuthContext';
import NumericKeypad from './NumericKeypad';

function WithdrawModal({ onClose, onSuccess }) {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(''); // '', 'initiated', 'processing', 'success', 'failed'
    const [message, setMessage] = useState('');

    const handleKeyPress = (key) => {
        if (key === '.' && amount.includes('.')) return;
        if (amount.length >= 8) return; // Limit length
        setAmount(prev => prev + key);
    };

    const handleDelete = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const num = parseFloat(amount);

        if (isNaN(num) || num <= 0) {
            alert('Please enter a valid positive amount');
            return;
        }

        if (!phoneNumber) {
            alert('Please enter your M-Pesa phone number');
            return;
        }

        setLoading(true);
        setStatus('initiated');
        setMessage('Initiating B2C withdrawal...');

        try {
            // Step 1: Initiate B2C Transfer
            const result = await initiateWithdrawal(phoneNumber, num, user?.id || 1);

            if (result.success) {
                setStatus('processing');
                setMessage('Processing withdrawal. You will receive M-Pesa shortly...');

                // Step 2: Poll for transaction status
                const transaction = await pollTransactionStatus(result.conversationId);

                if (transaction.status === 'success') {
                    setStatus('success');
                    setMessage('Withdrawal successful! Check your M-Pesa messages.');
                    setTimeout(() => {
                        if (onSuccess) onSuccess(num);
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
            setMessage(error.message || 'Failed to initiate withdrawal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-all text-gray-400"
                >
                    <X className="w-8 h-8" />
                </button>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Withdraw Funds</h3>
                    <p className="text-xs text-red-500 font-medium">Deriv → M-Pesa</p>
                </div>
                <div className="w-10" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6">

                {/* Status Message */}
                {status && (
                    <div className={`mb-4 p-4 rounded-2xl flex items-center gap-3 ${status === 'success' ? 'bg-green-500/10 text-green-500' :
                        status === 'failed' ? 'bg-red-500/10 text-red-500' :
                            'bg-blue-500/10 text-blue-500'
                        }`}>
                        {status === 'success' && <CheckCircle className="w-6 h-6" />}
                        {status === 'failed' && <XCircle className="w-6 h-6" />}
                        {(status === 'initiated' || status === 'processing') && <Loader2 className="w-6 h-6 animate-spin" />}
                        <span className="font-medium">{message}</span>
                    </div>
                )}

                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Amount Display */}
                    <p className="text-gray-400 text-sm mb-4">Enter Amount</p>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl text-red-500 font-medium">$</span>
                        <span className={`text-7xl font-bold tracking-tight ${amount ? 'text-white' : 'text-gray-700'}`}>
                            {amount || '0'}
                        </span>
                    </div>

                    {/* Phone Input */}
                    <div className="w-full bg-gray-900/50 rounded-2xl p-1 border border-gray-800 focus-within:border-red-500/50 transition-colors mb-6">
                        <div className="flex items-center gap-3 px-4 py-2">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Phone className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Phone Number</label>
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

                {/* Submit Action */}
                <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 mb-4"
                    disabled={loading || !amount || !phoneNumber}
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            Confirm Withdrawal
                            <ArrowUpCircle className="w-6 h-6" />
                        </>
                    )}
                </button>
            </div>

            {/* Keypad Section */}
            <div className="bg-gray-900/30 pb-8 pt-2 rounded-t-3xl">
                <NumericKeypad
                    onKeyPress={handleKeyPress}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}

export default WithdrawModal;
