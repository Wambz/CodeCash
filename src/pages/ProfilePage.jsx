import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, LogOut, ChevronRight, Shield, Bell, CircleHelp, Settings, X, Phone, Lock, MoreHorizontal, CheckCircle, Save } from 'lucide-react';

function ProfilePage() {
    const navigate = useNavigate();
    const { user, signOut, updateUser } = useAuth();
    const [timeRange, setTimeRange] = useState('daily');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'mt5', 'phone', 'password', 'help', 'settings'
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        console.log("PROFILE PAGE MOUNTED - V3 (Icon Fix)");
        const fetchHistory = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/transactions/${user.id}`);
                const data = await response.json();
                if (data.success) {
                    setHistory(data.history);
                }
            } catch (error) {
                console.error("Failed to fetch history in Profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const handleLogout = () => {
        signOut();
        navigate('/');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Aggregate data for chart
    const getChartData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map(day => ({ day, deposits: 0, withdrawals: 0 }));

        try {
            if (!Array.isArray(history)) return data;

            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);

            history.forEach(item => {
                if (!item || !item.timestamp) return;

                const itemDate = new Date(item.timestamp);
                if (isNaN(itemDate.getTime())) return; // Skip invalid dates

                if (itemDate >= startOfWeek) {
                    const dayIdx = itemDate.getDay();
                    // Ensure dayIdx is within bounds (0-6)
                    if (dayIdx >= 0 && dayIdx < 7 && data[dayIdx]) {
                        if (item.type === 'deposit') {
                            data[dayIdx].deposits += Number(item.amount) || 0;
                        } else if (item.type === 'withdraw') {
                            data[dayIdx].withdrawals += Number(item.amount) || 0;
                        }
                    }
                }
            });

            // Reorder to start from Monday
            const ordered = [...data.slice(1), data[0]];
            return ordered;
        } catch (err) {
            console.error("Error calculating chart data:", err);
            return data; // Return empty data on crash
        }
    };

    const chartData = getChartData();
    const maxVal = Math.max(...chartData.map(d => Math.max(d.deposits, d.withdrawals)), 100);

    const totalDeposits = Array.isArray(history) ? history.filter(h => h.type === 'deposit').reduce((sum, h) => sum + (Number(h.amount) || 0), 0) : 0;
    const totalWithdrawals = Array.isArray(history) ? history.filter(h => h.type === 'withdraw').reduce((sum, h) => sum + (Number(h.amount) || 0), 0) : 0;
    const totalProfit = totalDeposits - totalWithdrawals;

    const generateArea = (data, key) => {
        if (data.length === 0) return "";
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 50 - (d[key] / maxVal) * 40;
            return `${x},${y}`;
        }).join(' ');
        return `M0,50 L${points} L100,50 Z`;
    };

    const generatePath = (data, key) => {
        if (data.length === 0) return "";
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 50 - (d[key] / maxVal) * 40;
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ');
    };

    const MenuItem = ({ icon: Icon, label, subLabel, onClick, textColor = "text-white", iconColor = "text-gray-400", bgColor = "bg-[#1c1c1e]" }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 ${bgColor} border border-white/5 rounded-2xl mb-3 hover:bg-white/5 transition-all active:scale-98`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="text-left">
                    <span className={`font-medium block ${textColor}`}>{label}</span>
                    {subLabel && <span className="text-xs text-gray-500">{subLabel}</span>}
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
    );

    const Modal = ({ title, onClose, children }) => (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className="w-full sm:w-[400px] bg-[#1c1c1e] rounded-t-[30px] sm:rounded-[30px] p-6 pb-10 border-t border-white/10 relative z-10 pointer-events-auto animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-y-auto custom-scrollbar font-[Inter] pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl px-6 py-5 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-all active:scale-95">
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Account Profile</h1>
                </div>
                <button onClick={() => setActiveModal('settings')} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-all">
                    <Settings className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="px-6 py-8">
                {/* User Info Card - Premium Redesign */}
                <div className="bg-gradient-to-br from-[#1c1c1e] to-[#141415] rounded-[2.5rem] p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 blur-[80px] rounded-full group-hover:bg-red-600/20 transition-all duration-1000"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/5 blur-[80px] rounded-full"></div>

                    <div className="relative flex flex-col items-center">
                        <div className="relative mb-6" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-3xl p-1 bg-gradient-to-tr from-red-600 via-red-500 to-purple-600 transition-transform group-hover:scale-105 duration-500">
                                <img
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`}
                                    alt="avatar"
                                    className="w-full h-full object-cover bg-gray-900 rounded-[22px]"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-red-600 p-2 rounded-xl border-4 border-[#1c1c1e] shadow-xl active:scale-90 transition-all cursor-pointer">
                                <Save className="w-4 h-4 text-white" />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>

                        <div className="text-center">
                            <h2 className="text-3xl font-black text-white mb-1 tracking-tight">{user?.name || "John Doe"}</h2>
                            <p className="text-gray-500 font-medium mb-4">{user?.email || "johndoe@example.com"}</p>

                            <div className="flex items-center justify-center gap-3">
                                <span className="bg-green-500/10 text-green-500 text-[10px] px-3 py-1 rounded-full font-black border border-green-500/20 tracking-widest uppercase">KYC Verified</span>
                                <span className="bg-white/5 text-gray-400 text-[10px] px-3 py-1 rounded-full font-mono border border-white/5">ID: CR-492811</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Card - High Impact Analytics */}
                <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/10 shadow-2xl p-8 mb-10">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Performance Index</span>
                            <h3 className={`text-4xl font-black tracking-tighter ${totalProfit >= 0 ? 'text-white' : 'text-red-500'}`}>
                                ${Math.abs(totalProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${totalProfit >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {totalProfit >= 0 ? '▲' : '▼'} {((Math.abs(totalProfit) / (totalDeposits || 1)) * 100).toFixed(1)}%
                                </div>
                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">vs Last Week</span>
                            </div>
                        </div>

                        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                            <button onClick={() => setTimeRange('daily')} className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${timeRange === 'daily' ? 'bg-[#2a2a2c] text-white shadow-xl translate-y-[-1px]' : 'text-gray-600'}`}>DAY</button>
                            <button onClick={() => setTimeRange('monthly')} className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${timeRange === 'monthly' ? 'bg-[#2a2a2c] text-white shadow-xl translate-y-[-1px]' : 'text-gray-600'}`}>MONTH</button>
                        </div>
                    </div>

                    {/* Pro Chart with Legend */}
                    <div className="relative mb-10">
                        <div className="flex gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deposits</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Withdraws</span>
                            </div>
                        </div>

                        <div className="h-48 w-full relative">
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                                <defs>
                                    <linearGradient id="areaGreen" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="areaRed" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines (More subtle) */}
                                {[0, 10, 20, 30, 40, 50].map(y => (
                                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                                ))}

                                {/* Area Fills */}
                                <path d={generateArea(chartData, 'deposits')} fill="url(#areaGreen)" className="opacity-50" />
                                <path d={generateArea(chartData, 'withdrawals')} fill="url(#areaRed)" className="opacity-40" />

                                {/* Main Lines */}
                                <path
                                    d={generatePath(chartData, 'deposits')}
                                    fill="none"
                                    stroke="#22c55e"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                                />
                                <path
                                    d={generatePath(chartData, 'withdrawals')}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                                />

                                {/* Interactive Points (only on ends) */}
                                <circle cx="100" cy={50 - (chartData[chartData.length - 1].deposits / maxVal) * 40} r="3" fill="#22c55e" stroke="#1c1c1e" strokeWidth="2" />
                                <circle cx="100" cy={50 - (chartData[chartData.length - 1].withdrawals / maxVal) * 40} r="3" fill="#ef4444" stroke="#1c1c1e" strokeWidth="2" />
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="flex justify-between text-[10px] text-gray-600 mt-6 font-black tracking-widest uppercase px-1">
                                {chartData.map((d, i) => <span key={i} className={i === chartData.length - 1 ? 'text-white' : ''}>{d.day}</span>)}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - High Contrast */}
                    <div className="grid grid-cols-2 gap-4 mt-12">
                        <div className="bg-black/30 border border-white/5 rounded-[1.5rem] p-5 hover:bg-black/50 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-all">
                                    <Save className="w-4 h-4 text-green-500" />
                                </div>
                                <span className="text-[10px] font-black text-green-500 tracking-widest group-hover:translate-x-1 transition-transform">IN</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold block mb-1">Total Deposits</span>
                            <p className="text-xl font-bold text-white">${totalDeposits.toLocaleString()}</p>
                        </div>
                        <div className="bg-black/30 border border-white/5 rounded-[1.5rem] p-5 hover:bg-black/50 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-all">
                                    <LogOut className="w-4 h-4 text-red-500" />
                                </div>
                                <span className="text-[10px] font-black text-red-500 tracking-widest group-hover:translate-x-1 transition-transform">OUT</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold block mb-1">Total Withdraws</span>
                            <p className="text-xl font-bold text-white">${totalWithdrawals.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <h3 className="text-xs font-bold text-gray-500 mb-4 px-2 tracking-wider uppercase">Account Settings</h3>
                <div className="space-y-3">
                    <MenuItem
                        icon={MoreHorizontal}
                        label="Change MT5 Account"
                        subLabel="Manage trading accounts"
                        iconColor="text-purple-400"
                        onClick={() => setActiveModal('mt5')}
                    />
                    <MenuItem
                        icon={Phone}
                        label="Change Phone Number"
                        subLabel="+254 7** *** **89"
                        iconColor="text-purple-400"
                        onClick={() => setActiveModal('phone')}
                    />
                    <MenuItem
                        icon={Lock}
                        label="Change Password"
                        subLabel="Update your security"
                        iconColor="text-purple-400"
                        onClick={() => setActiveModal('password')}
                    />
                    <MenuItem
                        icon={CircleHelp}
                        label="Help & Feedback"
                        subLabel="FAQs and support"
                        iconColor="text-purple-400"
                        onClick={() => setActiveModal('help')}
                    />
                    <MenuItem
                        icon={Settings}
                        label="Other Settings"
                        subLabel="Preferences and options"
                        iconColor="text-purple-400"
                        onClick={() => setActiveModal('settings')}
                    />
                </div>

                {/* Sign Out */}
                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 bg-[#1c1c1e] border border-red-900/20 rounded-2xl hover:bg-red-900/10 transition-all active:scale-98 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-900/10 flex items-center justify-center group-hover:bg-red-900/20 transition-colors">
                                <LogOut className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="text-left">
                                <span className="font-medium block text-red-500">Sign Out</span>
                                <span className="text-xs text-gray-500">Securely log out of your account</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-900/50 group-hover:text-red-500 transition-colors" />
                    </button>

                    <div className="mt-8 text-center pb-8 opacity-50">
                        <p className="text-[10px] text-gray-600 tracking-widest uppercase">CodeCash V2.4.0</p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activeModal === 'mt5' && (
                <Modal title="Change MT5 Account" onClose={() => setActiveModal(null)}>
                    <div className="space-y-4">
                        <input type="text" placeholder="MT5 Account ID" className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-red-500 transition-all" />
                        <button className="w-full bg-red-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-all">
                            <Save className="w-5 h-5" /> Save Changes
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === 'phone' && (
                <Modal title="Change Phone Number" onClose={() => setActiveModal(null)}>
                    <div className="space-y-4">
                        <input type="tel" placeholder="New Phone Number" className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-red-500 transition-all" />
                        <button className="w-full bg-red-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-all">
                            <Save className="w-5 h-5" /> Update Phone
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === 'password' && (
                <Modal title="Change Password" onClose={() => setActiveModal(null)}>
                    <div className="space-y-4">
                        <input type="password" placeholder="Current Password" className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-red-500 transition-all" />
                        <input type="password" placeholder="New Password" className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-red-500 transition-all" />
                        <button className="w-full bg-red-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-all">
                            <Save className="w-5 h-5" /> Update Password
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === 'help' && (
                <Modal title="Help & Feedback" onClose={() => setActiveModal(null)}>
                    <div className="space-y-4">
                        <p className="text-gray-400 text-sm">Have a question or feedback? Let us know.</p>
                        <textarea placeholder="Your message here..." className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-red-500 transition-all h-32"></textarea>
                        <button className="w-full bg-red-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-all">
                            <Save className="w-5 h-5" /> Send Message
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === 'settings' && (
                <Modal title="Other Settings" onClose={() => setActiveModal(null)}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl">
                            <span>Push Notifications</span>
                            <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl">
                            <span>Email Updates</span>
                            <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ProfilePage;
