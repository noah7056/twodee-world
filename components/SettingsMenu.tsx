
import React, { useState, useEffect } from 'react';
import { Settings, Keybinds } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

interface SettingsMenuProps {
    settings: Settings;
    onSave: (newSettings: Settings) => void;
    onBack: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ settings, onSave, onBack }) => {
    const [localSettings, setLocalSettings] = useState<Settings>(settings);
    const [listeningKey, setListeningKey] = useState<keyof Keybinds | null>(null);

    const handleKeyChange = (keyAction: keyof Keybinds, newKey: string) => {
        setLocalSettings(prev => ({
            ...prev,
            keybinds: {
                ...prev.keybinds,
                [keyAction]: newKey.toLowerCase()
            }
        }));
        setListeningKey(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (listeningKey) {
                e.preventDefault();
                e.stopPropagation();
                handleKeyChange(listeningKey, e.key);
            }
        };

        if (listeningKey) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [listeningKey]);

    const handleSave = () => {
        onSave(localSettings);
        onBack();
    };

    const actionLabels: Record<keyof Keybinds, string> = {
        moveUp: "Move Up",
        moveDown: "Move Down",
        moveLeft: "Move Left",
        moveRight: "Move Right",
        inventory: "Inventory",
        run: "Sprint"
    };

    return (
        <div className="absolute inset-0 bg-stone-900 z-50 flex flex-col items-center py-12 text-white select-none font-serif">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615654060855-63510c4f828a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none"></div>
            
            <div className="z-10 w-full max-w-3xl px-6">
                <div className="flex items-center justify-between mb-8">
                     <button 
                        onClick={onBack}
                        className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors font-bold uppercase tracking-wider bg-stone-950/50 px-4 py-2 rounded-lg border border-stone-700"
                    >
                        <ArrowLeft size={20} /> Cancel
                    </button>
                    <h1 className="text-4xl font-bold text-stone-200 drop-shadow-md">Settings</h1>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-green-100 transition-colors font-bold uppercase tracking-wider px-6 py-2 rounded-lg border border-green-500 shadow-lg active:translate-y-1"
                    >
                        <Save size={20} /> Save & Close
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Visuals */}
                    <div className="bg-stone-800 p-6 rounded-xl border-4 border-stone-700 shadow-xl">
                        <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-stone-600 pb-2">Visuals</h2>
                        
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-bold text-stone-300">GUI Scale</label>
                                    <span className="text-amber-400 font-mono">{localSettings.guiScale.toFixed(1)}x</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="1.5" 
                                    step="0.1"
                                    value={localSettings.guiScale}
                                    onChange={e => setLocalSettings({...localSettings, guiScale: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                                <p className="text-xs text-stone-500 mt-1">Adjust the size of inventory and menus.</p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-bold text-stone-300">Camera Zoom</label>
                                    <span className="text-amber-400 font-mono">{localSettings.cameraZoom.toFixed(1)}x</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="1.5" 
                                    step="0.1"
                                    value={localSettings.cameraZoom}
                                    onChange={e => setLocalSettings({...localSettings, cameraZoom: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                                <p className="text-xs text-stone-500 mt-1">Adjust the in-game view distance.</p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-stone-800 p-6 rounded-xl border-4 border-stone-700 shadow-xl">
                         <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-stone-600 pb-2">Controls</h2>
                         
                         <div className="space-y-3">
                             {(Object.keys(localSettings.keybinds) as Array<keyof Keybinds>).map(action => (
                                 <div key={action} className="flex justify-between items-center bg-stone-900/40 p-3 rounded border border-stone-700/30">
                                     <span className="font-bold text-stone-300">{actionLabels[action]}</span>
                                     <button 
                                        onClick={() => setListeningKey(action)}
                                        className={`px-4 py-1 rounded font-mono font-bold border-2 transition-all min-w-[80px] text-center
                                            ${listeningKey === action 
                                                ? 'bg-amber-600 border-amber-400 text-white animate-pulse' 
                                                : 'bg-stone-950 border-stone-600 text-stone-400 hover:text-white hover:border-stone-400'
                                            }
                                        `}
                                     >
                                         {listeningKey === action ? 'PRESS KEY' : localSettings.keybinds[action].toUpperCase()}
                                     </button>
                                 </div>
                             ))}
                         </div>
                         <p className="text-xs text-stone-500 mt-4 text-center">Click a button to rebind. Press ESC to cancel.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsMenu;
