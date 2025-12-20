import React from 'react';
import { ArrowLeft, CreditCard, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import AddPaymentModal from '../components/AddPaymentModal';

function WalletPage() {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [paymentMethods, setPaymentMethods] = React.useState([
        { type: 'M-Pesa', id: '**** 6789', phone: '07123456789' }
    ]);

    // Mock balances for reuse
    const balances = { deriv: 500.00, mpesa: 12500.00 };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-[Inter] pb-24">
            <div className="flex items-center gap-4 mb-8 pt-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-full transition-all"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">My Wallet</h1>
            </div>

            {/* Reusing Dashboard Card */}
            <div className="mb-8">
                <Dashboard balances={balances} loading={false} />
            </div>

            {/* Payment Methods */}
            <div>
                <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
                <div className="space-y-4">
                    {paymentMethods.map((method, index) => (
                        <div key={index} className="bg-[#1c1c1e] p-4 rounded-2xl flex items-center justify-between border border-white/5 animate-slide-in">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                                    <span className="font-bold text-green-500">MP</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">{method.type}</h4>
                                    <p className="text-gray-400 text-xs">{method.id}</p>
                                </div>
                            </div>
                            <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">Linked</span>
                        </div>
                    ))}

                    {/* Add New */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full py-4 border border-dashed border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-900/50 transition-colors active:scale-98"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add Payment Method</span>
                    </button>
                </div>
            </div>

            {showAddModal && (
                <AddPaymentModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={(newMethod) => setPaymentMethods(prev => [...prev, newMethod])}
                />
            )}
        </div>
    );
}

export default WalletPage;
