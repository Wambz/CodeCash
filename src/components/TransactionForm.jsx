import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Loader2, AlertCircle } from 'lucide-react';

function TransactionForm({ onSubmit, loading }) {
    const [type, setType] = useState('deposit');
    const [amount, setAmount] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) {
            alert('Please enter a valid positive amount');
            return;
        }
        setShowConfirm(true);
    };

    const confirmTransaction = () => {
        const num = parseFloat(amount);
        onSubmit(type, num);
        setAmount('');
        setShowConfirm(false);
    };

    return (
        <section className="animate-fade-in">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                    <span className="text-white">New </span>
                    <span className="text-red-600">Transaction</span>
                </h2>
                <p className="text-gray-400">Transfer funds between accounts</p>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-red-900/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Transaction Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Transaction Type
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setType('deposit')}
                                disabled={loading}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${type === 'deposit'
                                        ? 'border-green-500 bg-green-500/10 glow-green'
                                        : 'border-gray-700 bg-gray-900/50 hover:border-green-500/50'
                                    }`}
                            >
                                <ArrowDownCircle className={`w-6 h-6 mx-auto mb-2 ${type === 'deposit' ? 'text-green-500' : 'text-gray-400'
                                    }`} />
                                <p className={`font-semibold ${type === 'deposit' ? 'text-green-500' : 'text-gray-400'
                                    }`}>
                                    Deposit
                                </p>
                                <p className="text-xs text-gray-500 mt-1">M-Pesa → Deriv</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('withdraw')}
                                disabled={loading}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${type === 'withdraw'
                                        ? 'border-red-500 bg-red-500/10 glow-red'
                                        : 'border-gray-700 bg-gray-900/50 hover:border-red-500/50'
                                    }`}
                            >
                                <ArrowUpCircle className={`w-6 h-6 mx-auto mb-2 ${type === 'withdraw' ? 'text-red-500' : 'text-gray-400'
                                    }`} />
                                <p className={`font-semibold ${type === 'withdraw' ? 'text-red-500' : 'text-gray-400'
                                    }`}>
                                    Withdraw
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Deriv → M-Pesa</p>
                            </button>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Amount (USD)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                $
                            </span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black border border-gray-700 text-white text-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                disabled={loading}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full px-6 py-4 gradient-red hover:opacity-90 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 glow-red flex items-center justify-center gap-2"
                        disabled={loading || !amount}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowUpCircle className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Security Notice */}
                <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                        <p className="font-medium text-yellow-500 mb-1">Security Notice</p>
                        <p className="text-gray-400">All transactions are encrypted and processed securely. Never share your credentials.</p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-effect rounded-2xl p-6 max-w-md w-full border border-red-900/20 animate-slide-up">
                        <h3 className="text-xl font-bold mb-4">Confirm Transaction</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Type:</span>
                                <span className="font-semibold capitalize">{type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Amount:</span>
                                <span className="font-semibold text-green-500">${parseFloat(amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">From:</span>
                                <span className="font-semibold">{type === 'deposit' ? 'M-Pesa' : 'Deriv'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">To:</span>
                                <span className="font-semibold">{type === 'deposit' ? 'Deriv' : 'M-Pesa'}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmTransaction}
                                className="flex-1 px-4 py-3 gradient-red hover:opacity-90 rounded-xl text-white font-semibold transition-all glow-red"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default TransactionForm;
