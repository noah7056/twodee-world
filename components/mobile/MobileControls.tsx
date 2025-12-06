import React from 'react';
import { VirtualJoystick } from './VirtualJoystick';
import { Sword, Briefcase, Zap } from 'lucide-react';

interface MobileControlsProps {
    onInput: (keys: Record<string, boolean>) => void;
    onToggleInventory: () => void;
    isInventoryOpen: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onInput, onToggleInventory, isInventoryOpen }) => {
    if (isInventoryOpen) return null; // Hide controls in inventory

    return (
        <>
            <VirtualJoystick onInput={onInput} />

            {/* Right Side Buttons */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50 pointer-events-auto">
                {/* Sprint Button (Hold) */}
                <button
                    className="w-16 h-16 bg-amber-600/80 rounded-full border-2 border-amber-400 flex items-center justify-center active:scale-95 transition-transform"
                    onTouchStart={() => onInput({ 'shift': true })}
                    onTouchEnd={() => onInput({ 'shift': false })}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <Zap className="text-white" size={32} />
                </button>

                {/* Inventory Toggle */}
                <button
                    onClick={onToggleInventory}
                    className="w-14 h-14 bg-stone-700/80 rounded-full border-2 border-stone-500 flex items-center justify-center active:scale-95 transition-transform"
                >
                    <Briefcase className="text-white" size={28} />
                </button>
            </div>
        </>
    );
};
