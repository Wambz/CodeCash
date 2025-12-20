import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, Plus, BarChart2, User } from 'lucide-react';

function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-900 pb-2 pt-2 px-6 flex justify-between items-end z-50">
            {/* Home */}
            <button
                onClick={() => navigate('/dashboard')}
                className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-red-500' : 'text-gray-500'}`}
            >
                <Home className="w-6 h-6" />
                <span className="text-[10px] font-medium">Home</span>
            </button>

            {/* Wallet */}
            <button
                onClick={() => navigate('/wallet')}
                className={`flex flex-col items-center gap-1 ${isActive('/wallet') ? 'text-red-500' : 'text-gray-500'}`}
            >
                <Wallet className="w-6 h-6" />
                <span className="text-[10px] font-medium">Wallet</span>
            </button>

            {/* Deposit - Prominent */}
            <div className="relative -top-5">
                <button
                    onClick={() => navigate('/deposit')}
                    className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/40 border-4 border-black active:scale-95 transition-transform"
                >
                    <Plus className="w-7 h-7 text-white" />
                </button>
            </div>

            {/* Activity */}
            <button
                onClick={() => navigate('/history')}
                className={`flex flex-col items-center gap-1 ${isActive('/history') ? 'text-red-500' : 'text-gray-500'}`}
            >
                <BarChart2 className="w-6 h-6" />
                <span className="text-[10px] font-medium">Activity</span>
            </button>

            {/* Profile */}
            <button
                onClick={() => navigate('/profile')}
                className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-red-500' : 'text-gray-500'}`}
            >
                <User className="w-6 h-6" />
                <span className="text-[10px] font-medium">Profile</span>
            </button>
        </div>
    );
}

export default BottomNavigation;
