import React from 'react';
import { X, ScanLine, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ScanPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center">
            {/* Close */}
            <button
                onClick={() => navigate('/dashboard')}
                className="absolute top-6 right-6 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center z-50 border border-white/10"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Camera Viewfinder Mock */}
            <div className="w-full h-full absolute inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>

                {/* Scanner Frame */}
                <div className="absolute w-64 h-64 border-2 border-red-500 rounded-3xl relative z-10 flex items-center justify-center animate-pulse">
                    <div className="w-60 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(255,0,0,0.8)] absolute animate-scan"></div>
                </div>

                {/* Overlay Text */}
                <div className="absolute bottom-24 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">
                    <p className="font-medium text-sm flex items-center gap-2">
                        <ScanLine className="w-4 h-4 text-red-500" />
                        Align QR code within frame
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ScanPage;
