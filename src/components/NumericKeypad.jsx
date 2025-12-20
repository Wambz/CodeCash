import React from 'react';
import { Delete } from 'lucide-react';

function NumericKeypad({ onKeyPress, onDelete }) {
    const keys = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        '.', '0'
    ];

    return (
        <div className="grid grid-cols-3 gap-0 w-full mt-auto">
            {keys.map((key) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onKeyPress(key)}
                    className="h-20 text-3xl font-medium text-white transition-all active:bg-white/10 flex items-center justify-center outline-none focus:outline-none"
                >
                    {key}
                </button>
            ))}

            {/* Backspace Button */}
            <button
                type="button"
                onClick={onDelete}
                className="h-20 text-white/70 transition-all active:bg-white/10 flex items-center justify-center outline-none focus:outline-none"
            >
                <Delete className="w-8 h-8" />
            </button>
        </div>
    );
}

export default NumericKeypad;
