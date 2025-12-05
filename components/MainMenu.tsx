
import React from 'react';
import { Settings } from 'lucide-react';

interface MainMenuProps {
    onPlay: () => void;
    onHowToPlay: () => void;
    onSettings: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onHowToPlay, onSettings }) => {
    return (
        <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center z-50 text-white select-none font-serif">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615654060855-63510c4f828a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            
            <div className="z-10 text-center flex flex-col items-center">
                {/* Title Card */}
                <div className="mb-12 relative">
                    <h1 className="text-8xl font-bold text-amber-500 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] tracking-wider" 
                        style={{ textShadow: '4px 4px 0px #78350f, 8px 8px 0px #000' }}>
                        Twodee World
                    </h1>
                    <div className="text-stone-400 text-2xl mt-4 font-bold tracking-widest uppercase drop-shadow-md bg-stone-900/80 px-4 py-1 rounded inline-block border border-stone-700">
                        Survival Sandbox
                    </div>
                </div>
                
                <div className="flex flex-col gap-4 w-72 mx-auto">
                    <button 
                        onClick={onPlay}
                        className="group relative bg-amber-700 hover:bg-amber-600 text-amber-100 py-4 px-6 rounded-lg font-bold text-2xl shadow-[0_6px_0_#451a03] active:shadow-[0_2px_0_#451a03] active:translate-y-1 transition-all border-2 border-amber-400 border-b-amber-900"
                    >
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent rounded-lg pointer-events-none"></div>
                        Play Game
                    </button>
                    
                    <button 
                        onClick={onHowToPlay}
                        className="group relative bg-stone-700 hover:bg-stone-600 text-stone-200 py-3 px-6 rounded-lg font-bold text-xl shadow-[0_6px_0_#1c1917] active:shadow-[0_2px_0_#1c1917] active:translate-y-1 transition-all border-2 border-stone-500 border-b-stone-900"
                    >
                         <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent rounded-lg pointer-events-none"></div>
                        How to Play
                    </button>

                    <button 
                        onClick={onSettings}
                        className="group relative bg-stone-800 hover:bg-stone-700 text-stone-300 py-3 px-6 rounded-lg font-bold text-xl shadow-[0_6px_0_#0c0a09] active:shadow-[0_2px_0_#0c0a09] active:translate-y-1 transition-all border-2 border-stone-600 border-b-stone-950 flex items-center justify-center gap-2"
                    >
                         <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent rounded-lg pointer-events-none"></div>
                         <Settings size={20} /> Settings
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-4 text-stone-600 font-bold text-sm bg-stone-900/50 px-3 py-1 rounded border border-stone-800">
                v1.3.0 - Settings Update
            </div>
        </div>
    );
};

export default MainMenu;
