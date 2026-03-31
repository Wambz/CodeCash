import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Minus, ArrowRight, Flag } from 'lucide-react';
import Dashboard from '../components/Dashboard';
import TransactionModal from '../components/TransactionModal';
import BottomNavigation from '../components/BottomNavigation';
import DerivConnectModal from '../components/DerivConnectModal';
import { getBalances } from '../api/derivService';

function DashboardPage() {
    const [balances, setBalances] = useState(() => {
        const saved = localStorage.getItem('codecash_balances');
        return saved ? JSON.parse(saved) : { mpesa: 0, deriv: 0 };
    });
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('codecash_history');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('codecash_balances', JSON.stringify(balances));
    }, [balances]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTransactionTab, setActiveTransactionTab] = useState(null);
    const [showDerivConnectModal, setShowDerivConnectModal] = useState(false);

    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch Deriv Balances (Real or Mock based on token)
            // Use user's token if available
            let balanceData = await getBalances(user?.derivToken);

            // 2. Fetch Real M-Pesa Balance from Backend
            if (user?.id) {
                try {
                    const walletRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wallet/${user.id}`);
                    const walletData = await walletRes.json();
                    if (walletData.success) {
                        // Overwrite the mock M-Pesa balance from derivService
                        balanceData.mpesa = walletData.wallet.balance;
                    }
                } catch (e) {
                    console.error("Failed to fetch wallet balance", e);
                }
            }

            if (balanceData.error) {
                setError(balanceData.error);
                // Still set balances to avoid null reference, but error state will take precedence in UI
                setBalances(balanceData);
            } else {
                setBalances(balanceData);
                setError(null);
            }

            // 3. Fetch History
            if (user?.id) {
                try {
                    const historyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/${user.id}`);
                    const historyData = await historyRes.json();
                    if (historyData.success) {
                        setHistory(historyData.history);
                    }
                } catch (e) {
                    console.log("Failed to fetch API history, using local");
                }
            }
        } catch (error) {
            console.error("Dashboard fetch error", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            // Check if user has Deriv token
            if (!user.derivToken) {
                // If no token, show connect modal
                // But only if we are not loading initial auth
                setShowDerivConnectModal(true);
            }
            fetchAllData();
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('codecash_history', JSON.stringify(history));
    }, [history]);

    // Format helper
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-24 font-[Inter]">

            {/* Header */}
            <div className="pt-8 px-6 mb-6 flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-sm mb-1">Good Morning</p>
                    <h1 className="text-2xl font-bold text-white">Welcome Back, {user?.name?.split(' ')[0] || 'User'}</h1>
                </div>
                <div onClick={() => navigate('/profile')} className="relative cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white">
                        <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505]"></div>
                </div>
            </div>

            <main className="px-5">
                {/* Hero Balance Card */}
                <div className="mb-8">
                    <Dashboard balances={balances} loading={loading} error={error} />
                </div>

                {/* Big Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Deposit - Green/Emerald Gradient */}
                    <button
                        onClick={() => setActiveTransactionTab('deposit')}
                        className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-[24px] h-32 flex flex-col items-center justify-center gap-3 shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-[0.96] transition-all duration-300"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-[20px] transform translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                        
                        <div className="relative w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300 shadow-inner border border-white/10">
                            <Plus className="w-6 h-6 text-white group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
                        </div>
                        <span className="relative text-white font-bold text-lg tracking-wide group-hover:translate-y-0.5 transition-transform duration-300 text-shadow-sm">Deposit</span>
                    </button>

                    {/* Withdraw - Orange/Rose Gradient */}
                    <button
                        onClick={() => setActiveTransactionTab('withdraw')}
                        className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-rose-500 rounded-[24px] h-32 flex flex-col items-center justify-center gap-3 shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_40px_rgba(249,115,22,0.5)] hover:-translate-y-1 active:scale-[0.96] transition-all duration-300"
                    >
                        {/* Decorative background element */}
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-[20px] transform -translate-x-1/3 translate-y-1/3 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                        
                        <div className="relative w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300 shadow-inner border border-white/10">
                            <Minus className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" strokeWidth={3} />
                        </div>
                        <span className="relative text-white font-bold text-lg tracking-wide group-hover:translate-y-0.5 transition-transform duration-300 text-shadow-sm">Withdraw</span>
                    </button>
                </div>

                {/* Recent Transactions */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Recent Transactions</h3>
                        <button onClick={() => navigate('/history')} className="text-red-500 text-sm font-medium">View all</button>
                    </div>

                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <p className="text-gray-600 text-sm text-center py-4">No recent transactions</p>
                        ) : (
                            history.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-[#1c1c1e] rounded-[20px] active:scale-98 transition-transform">
                                    <div className="flex items-center gap-4">
                                        {/* Icon Container */}
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                                            {/* Mock Flag or Icon */}
                                            {item.type === 'deposit' ? (
                                                <div className="flex flex-col items-center justify-center w-full h-full bg-white relative">
                                                    {/* Kenya Flag Stripes */}
                                                    <div className="w-full h-[30%] bg-black"></div>
                                                    <div className="w-full h-[5%] bg-white"></div>
                                                    <div className="w-full h-[30%] bg-[#BB133E]"></div>
                                                    <div className="w-full h-[5%] bg-white"></div>
                                                    <div className="w-full h-[30%] bg-[#006600]"></div>

                                                    {/* Center Shield (simplified) */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-4 h-6 bg-[#BB133E] rounded-full border border-black flex items-center justify-center overflow-hidden">
                                                            <div className="w-0.5 h-full bg-white rotate-45"></div>
                                                            <div className="w-0.5 h-full bg-white -rotate-45"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                    USA
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-bold text-white text-[15px] mb-0.5">
                                                {item.type === 'deposit' ? 'Deposit to M-Pesa' : 'Withdraw from Deriv'}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {formatTime(item.timestamp)} • ID: #TRX{8829 + idx}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={`font-bold text-[15px] mb-1 ${item.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.type === 'deposit' ? '+' : '-'}${item.amount.toFixed(2)}
                                        </p>
                                        <div className={`text-[10px] px-2 py-0.5 rounded-md inline-block font-medium ${item.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {item.status === 'success' ? 'Completed' : 'Processing'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <BottomNavigation />

            {/* Modals */}
            {activeTransactionTab && (
                <TransactionModal
                    initialTab={activeTransactionTab}
                    onClose={() => setActiveTransactionTab(null)}
                    onSuccess={async (amount) => {
                        await fetchAllData();
                    }}
                    balances={balances}
                />
            )}

            {showDerivConnectModal && (
                <DerivConnectModal
                    onClose={() => setShowDerivConnectModal(false)}
                    onSuccess={async (token) => {
                        // Token is verified by modal
                        // Save to user profile via AuthContext (which updates Firestore)
                        await updateUser({ derivToken: token });
                        // Reload data
                        await fetchAllData();
                        setShowDerivConnectModal(false);
                    }}
                />
            )}
        </div>
    );
}

export default DashboardPage;
