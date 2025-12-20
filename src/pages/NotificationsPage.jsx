import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Filter } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';

function NotificationsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, unread, system

    // Mock Notifications Data
    const notifications = [
        {
            id: 1,
            type: 'success',
            title: 'Deposit Successful',
            message: 'Your deposit of $1,500.00 via M-Pesa has been successfully processed.',
            time: '2 mins ago',
            read: false
        },
        {
            id: 2,
            type: 'info',
            title: 'System Maintenance',
            message: 'Scheduled maintenance will occur on Sunday at 2:00 AM UTC. Services may be briefly interrupted.',
            time: '1 hour ago',
            read: true
        },
        {
            id: 3,
            type: 'warning',
            title: 'Security Alert',
            message: 'New login detected from Nairobi, Kenya. If this wasn\'t you, please change your password immediately.',
            time: 'Yesterday',
            read: true
        },
        {
            id: 4,
            type: 'default',
            title: 'Welcome to CodeCash',
            message: 'Thanks for joining! Verify your identity to unlock higher transaction limits.',
            time: '2 days ago',
            read: true
        }
    ];

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        return true;
    });

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="glass-effect border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold">Notifications</h1>
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center bg-red-600/20 rounded-xl">
                            <Bell className="w-5 h-5 text-red-500" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Filters */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === 'all'
                            ? 'bg-white text-black'
                            : 'bg-gray-900 text-gray-400 border border-gray-800'
                            }`}
                    >
                        All Notifications
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === 'unread'
                            ? 'bg-white text-black'
                            : 'bg-gray-900 text-gray-400 border border-gray-800'
                            }`}
                    >
                        Unread
                    </button>
                    <button
                        className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-900 text-gray-400 border border-gray-800 flex items-center gap-2"
                    >
                        <Filter className="w-3 h-3" />
                        Filters
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4 animate-slide-up">
                    {filteredNotifications.map((notification) => (
                        <NotificationItem key={notification.id} {...notification} />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default NotificationsPage;
