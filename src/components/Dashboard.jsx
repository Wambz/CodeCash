import React from 'react';
import { MoreVertical, Wallet, TrendingUp, Loader2 } from 'lucide-react';

function Dashboard({ balances, loading }) {
    return (
        <section className="animate-fade-in w-full">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
            ) : (
                <div className="w-full">
                    {/* Main Balance Card */}
                    <div className="w-full bg-gradient-to-br from-[#2a0a0a] via-[#1a0505] to-black rounded-[32px] p-6 relative overflow-hidden border border-red-900/10">
                        {/* Background Blob Effect */}
                        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="text-gray-400 text-xs tracking-wider uppercase font-medium mb-3">TOTAL BALANCE</h3>
                                <div className="inline-flex items-center gap-2 bg-[#3a1a1a]/50 px-3 py-1.5 rounded-lg border border-red-900/30">
                                    <Wallet className="w-3.5 h-3.5 text-gray-300" />
                                    <span className="text-xs text-white/90 font-medium">Deriv Account</span>
                                </div>
                            </div>
                            <button className="text-gray-400 p-1">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Balance Amount */}
                        <div className="mb-6 relative z-10">
                            <h2 className="text-4xl font-bold text-white tracking-tight">
                                ${balances.deriv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                        </div>

                        {/* Footer / Stats */}
                        <div className="flex items-center gap-2 relative z-10">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-green-500 text-sm font-medium">+2.5% today</span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Dashboard;
