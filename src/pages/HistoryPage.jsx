import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet } from 'lucide-react';
import TransactionHistory from '../components/TransactionHistory';

function HistoryPage() {
    const navigate = useNavigate();

    // Get history from localStorage or use empty array
    const [history] = React.useState(() => {
        const saved = localStorage.getItem('codecash_history');
        return saved ? JSON.parse(saved) : [];
    });

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="glass-effect border-b border-red-900/20 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-lg transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 gradient-red rounded-lg flex items-center justify-center glow-red">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                <span className="text-white">CODE</span>
                                <span className="text-red-600">CASH</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2">
                        <span className="text-white">Transaction </span>
                        <span className="text-red-600">History</span>
                    </h2>
                    <p className="text-gray-400">View all your past transactions</p>
                </div>

                <TransactionHistory history={history} />
            </main>
        </div>
    );
}

export default HistoryPage;
