import React from 'react';
import { Clock, CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

function TransactionHistory({ history }) {
    // Helper to safely parse date
    const formatDate = (dateInput) => {
        try {
            const date = new Date(dateInput);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    };

    return (
        <section className="animate-fade-in">
            <div className="glass-effect rounded-2xl p-6 border border-gray-800">
                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No transactions yet</p>
                        <p className="text-gray-500 text-sm mt-2">Your transaction history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {history.map((item, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl border border-white/5 transition-all duration-300 hover:bg-white/5 ${item.status === 'success'
                                    ? 'bg-green-500/5'
                                    : 'bg-red-500/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.status === 'success'
                                            ? 'bg-green-500/20'
                                            : 'bg-red-500/20'
                                            }`}>
                                            {item.type === 'deposit' ? (
                                                <ArrowDownCircle className={`w-5 h-5 ${item.status === 'success' ? 'text-green-500' : 'text-red-500'
                                                    }`} />
                                            ) : (
                                                <ArrowUpCircle className={`w-5 h-5 ${item.status === 'success' ? 'text-green-500' : 'text-red-500'
                                                    }`} />
                                            )}
                                        </div>

                                        {/* Transaction Details */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-white capitalize">
                                                    {item.type}
                                                </p>
                                                {item.status === 'success' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {item.type === 'deposit' ? 'M-Pesa → Deriv' : 'Deriv → M-Pesa'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount and Time */}
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${item.status === 'success' ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                            {item.status === 'success' ? '+' : '-'}${item.amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(item.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default TransactionHistory;
