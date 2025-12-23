import React from 'react';
import { MoreVertical, Wallet, TrendingUp, Loader2 } from 'lucide-react';

function Dashboard({ balances, loading, error }) {
    return (
        <section className="animate-fade-in w-full">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="w-full bg-red-900/20 border border-red-500/30 rounded-[32px] p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-red-400 font-medium mb-1">Connection Issue</p>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    {error.includes("Token") && (
                        <p className="text-xs text-gray-500 mb-4 bg-black/30 p-2 rounded">
                            Add <span className="text-yellow-500">VITE_DERIV_API_TOKEN</span> to your .env file
                        </p>
                    )}
                    <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                        Retry Connection
                    </button>
                    {/* Fallback option */}
                    <button onClick={() => {
                        // Temp force demo mode
                        const demoData = { deriv: 2500.50, mpesa: 1000, isDemo: true };
                        // This won't persist but helps development
                        window.dispatchEvent(new CustomEvent('force_demo_update'));
                    }} className="mt-4 text-xs text-gray-600 hover:text-gray-400 underline">
                        Use Demo Data
                    </button>
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
                                <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center gap-2 bg-[#3a1a1a]/50 px-3 py-1.5 rounded-lg border border-red-900/30">
                                        <Wallet className="w-3.5 h-3.5 text-gray-300" />
                                        <span className="text-xs text-white/90 font-medium">Deriv Account</span>
                                    </div>
                                    {balances?.isDemo && (
                                        <div className="inline-flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/30">
                                            <span className="text-xs text-yellow-500 font-bold">DEMO</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button className="text-gray-400 p-1 hover:bg-white/5 rounded-full transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Balance Amount */}
                        <div className="mb-6 relative z-10">
                            <h2 className="text-4xl font-bold text-white tracking-tight">
                                ${balances.deriv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            {balances?.isDemo && <p className="text-yellow-500/50 text-xs mt-1">Mock Balance</p>}
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
