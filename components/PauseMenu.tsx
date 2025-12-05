
import React from 'react';
import { Settings } from 'lucide-react';

interface PauseMenuProps {
    onResume: () => void;
    onHowToPlay: () => void;
    onSettings: () => void;
    onQuit: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onHowToPlay, onSettings, onQuit }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center select-none font-serif">
            {/* Wooden Board Container */}
            <div className="relative bg-amber-900 border-4 border-amber-950 p-8 rounded shadow-2xl w-80 text-center">
                {/* Nails details */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-stone-400 rounded-full shadow-inner border border-stone-600"></div>
                <div className="absolute top-2 right-2 w-3 h-3 bg-stone-400 rounded-full shadow-inner border border-stone-600"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-stone-400 rounded-full shadow-inner border border-stone-600"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-stone-400 rounded-full shadow-inner border border-stone-600"></div>

                <h2 className="text-4xl font-bold text-amber-100 mb-6 drop-shadow-md" style={{ textShadow: '2px 2px 0 #451a03' }}>Paused</h2>
                
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={onResume}
                        className="bg-amber-600 hover:bg-amber-500 text-amber-50 py-3 rounded border-2 border-amber-400 border-b-amber-800 shadow-md font-bold text-lg active:translate-y-1 active:border-b-2 transition-all"
                    >
                        Resume Game
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={onHowToPlay}
                            className="flex-1 bg-stone-600 hover:bg-stone-500 text-stone-100 py-3 rounded border-2 border-stone-400 border-b-stone-800 shadow-md font-bold text-lg active:translate-y-1 active:border-b-2 transition-all"
                        >
                            Help
                        </button>
                         <button 
                            onClick={onSettings}
                            className="bg-stone-700 hover:bg-stone-600 text-stone-300 px-4 rounded border-2 border-stone-500 border-b-stone-900 shadow-md font-bold active:translate-y-1 active:border-b-2 transition-all"
                        >
                            <Settings size={24} />
                        </button>
                    </div>
                    
                    <div className="h-px bg-amber-950/50 my-1"></div>
                    <button 
                        onClick={onQuit}
                        className="bg-red-800 hover:bg-red-700 text-red-100 py-3 rounded border-2 border-red-600 border-b-red-950 shadow-md font-bold text-lg active:translate-y-1 active:border-b-2 transition-all"
                    >
                        Save & Quit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PauseMenu;
