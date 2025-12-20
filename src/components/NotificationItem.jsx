import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

function NotificationItem({ type, title, message, time, read }) {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info': return <Info className="w-5 h-5 text-blue-500" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className={`p-4 rounded-2xl glass-effect border transition-all duration-300 ${read ? 'border-gray-800 bg-gray-900/20' : 'border-red-900/30 bg-red-900/5 glow-red'}`}>
            <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'success' ? 'bg-green-500/10' :
                    type === 'warning' ? 'bg-yellow-500/10' :
                        type === 'info' ? 'bg-blue-500/10' :
                            'bg-gray-800'
                    }`}>
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className={`font-semibold text-sm mb-1 ${read ? 'text-gray-300' : 'text-white'}`}>{title}</h4>
                        <span className="text-xs text-gray-500">{time}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
                </div>
            </div>
        </div>
    );
}

export default NotificationItem;
