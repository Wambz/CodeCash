import React, { useState } from 'react';
import { X, Phone, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

function AddPaymentModal({ onClose, onAdd }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phoneNumber) return;

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setSuccess(true);

        setTimeout(() => {
            onAdd({
                type: 'M-Pesa',
                id: `**** ${phoneNumber.slice(-4)}`,
                phone: phoneNumber
            });
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col animate-slide-up font-[Inter]">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-all text-gray-400"
                >
                    <X className="w-8 h-8" />
                </button>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Add Payment Method</h3>
                    <p className="text-xs text-red-500 font-medium tracking-wider uppercase">Link Account</p>
                </div>
                <div className="w-10" />
            </div>

            {/* Content */}
            <div className="flex-1 px-6 flex flex-col pt-10">
                {!success ? (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Connect M-Pesa</h2>
                            <p className="text-gray-400 text-sm">Enter your phone number to link your M-Pesa account for seamless transactions.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/5 focus-within:border-red-500/50 transition-all">
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 block">Phone Number</label>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <input
                                        type="tel"
                                        placeholder="07..."
                                        className="bg-transparent border-none outline-none text-white text-lg w-full"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pb-10">
                            <button
                                onClick={handleSubmit}
                                disabled={!phoneNumber || loading}
                                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${phoneNumber && !loading ? 'bg-red-600 text-white active:scale-95 shadow-lg shadow-red-900/20' : 'bg-gray-800 text-gray-500'
                                    }`}
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Link Account
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Account Linked!</h2>
                        <p className="text-gray-400">Your M-Pesa account has been successfully linked to your wallet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddPaymentModal;
