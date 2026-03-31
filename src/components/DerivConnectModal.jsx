import React, { useState } from 'react';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import { initializeDerivAPI, getBalances } from '../api/derivService';

function DerivConnectModal({ onClose, onSuccess }) {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConnect = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Initialize API with new token
            // This will throw if connection/auth fails
            await initializeDerivAPI(token);

            // 2. Verify by fetching balance
            const balanceData = await getBalances(token);

            if (balanceData.error) {
                throw new Error(balanceData.error);
            }

            // 3. Success!
            onSuccess(token);
        } catch (err) {
            console.error("Connection failed:", err);
            setError(err.message || "Failed to connect to Deriv account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1c1c1e] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Connect Deriv</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleConnect} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Deriv API Token</label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="e.g. 8Hj..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                            required
                        />
                        <p className="text-xs text-gray-500">
                            You can find your API token in Deriv Settings &gt; API Token.
                            Create a token with <b>Read</b> and <b>Trade</b> scopes.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Connect Account
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DerivConnectModal;
