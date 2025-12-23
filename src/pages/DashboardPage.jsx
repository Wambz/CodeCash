import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Minus, ArrowRight, Flag } from 'lucide-react';
import Dashboard from '../components/Dashboard';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import BottomNavigation from '../components/BottomNavigation';
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
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                // Fetch Balances
                const balanceData = await getBalances();
                setBalances(balanceData);
                setError(null); // Clear any previous errors

                // Fetch History
                if (user?.id) {
                    try {
                        const historyRes = await fetch(`http://127.0.0.1:5000/api/transactions/${user.id}`);
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
        }
        fetchData();
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
                    {/* Deposit - Red */}
                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="bg-red-600 rounded-[24px] h-32 flex flex-col items-center justify-center gap-3 shadow-lg shadow-red-900/20 active:scale-98 transition-transform"
                    >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <Plus className="w-6 h-6 text-red-600" strokeWidth={3} />
                        </div>
                        <span className="text-white font-bold text-lg tracking-wide">Deposit</span>
                    </button>

                    {/* Withdraw - Dark */}
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="bg-[#1c1c1e] rounded-[24px] h-32 flex flex-col items-center justify-center gap-3 border border-white/5 active:scale-98 transition-transform"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                            <Minus className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-white font-bold text-lg tracking-wide">Withdraw</span>
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
                                                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                                                    <div className="w-full h-1/3 bg-black"></div>
                                                    <div className="w-full h-1/3 bg-red-600 flex items-center justify-center">
                                                        <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
                                                    </div>
                                                    <div className="w-full h-1/3 bg-green-600"></div>
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
            {showDepositModal && (
                <DepositModal
                    onClose={() => setShowDepositModal(false)}
                    onSuccess={async (amount) => {
                        const data = await getBalances();
                        setBalances(data);
                        // Refetch History from API
                        if (user?.id) {
                            try {
                                const historyRes = await fetch(`http://127.0.0.1:5000/api/transactions/${user.id}`);
                                const historyData = await historyRes.json();
                                if (historyData.success) {
                                    setHistory(historyData.history);
                                }
                            } catch (e) {
                                // Fallback
                                setHistory(prev => [{ type: 'deposit', amount, status: 'success', timestamp: new Date().toISOString() }, ...prev]);
                            }
                        }
                    }}
                />
            )}
            {showWithdrawModal && (
                <WithdrawModal
                    onClose={() => setShowWithdrawModal(false)}
                    onSuccess={async (amount) => {
                        const data = await getBalances();
                        setBalances(data);
                        setHistory(prev => [{ type: 'withdraw', amount, status: 'success', timestamp: new Date().toISOString() }, ...prev]);
                    }}
                />
            )}
        </div>
    );
}

export default DashboardPage;
