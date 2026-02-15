import React from 'react';
import { Delete } from 'lucide-react';

function NumericKeypad({ onKeyPress, onDelete, onClear }) {
    const keys = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        'C', '0'
    ];

    return (
        <div className="grid grid-cols-3 gap-0 w-full mt-auto">
            {keys.map((key) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => key === 'C' ? onClear && onClear() : onKeyPress(key)}
                    className={`h-16 text-3xl font-medium transition-all flex items-center justify-center outline-none focus:outline-none ${key === 'C' ? 'text-red-500 active:bg-red-500/20' : 'text-white active:bg-white/10'
                        }`}
                >
                    {key}
                </button>
            ))}

            {/* Backspace Button */}
            <button
                type="button"
                onClick={onDelete}
                className="h-16 text-red-500 transition-all active:bg-red-500/20 flex items-center justify-center outline-none focus:outline-none"
            >
                <Delete className="w-8 h-8" />
            </button>
        </div>
    );
}

export default NumericKeypad;
