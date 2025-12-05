
import React from 'react';
import { ArrowLeft, MousePointer2, Keyboard, BookOpen } from 'lucide-react';

interface HowToPlayProps {
    onBack: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
    return (
        <div className="absolute inset-0 bg-stone-900 z-50 flex flex-col items-center py-12 text-white overflow-y-auto select-none font-serif">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615654060855-63510c4f828a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none"></div>

            <div className="w-full max-w-5xl px-6 relative z-10">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-stone-400 hover:text-amber-400 mb-8 transition-colors font-bold uppercase tracking-wider bg-stone-950/50 px-4 py-2 rounded-lg border border-stone-700 inline-block"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="text-center mb-12">
                     <h1 className="text-6xl font-bold text-stone-200 drop-shadow-[0_4px_0_#1c1917]" style={{ textShadow: '4px 4px 0 #000' }}>
                        Survival Guide
                    </h1>
                    <div className="w-32 h-1 bg-amber-600 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="bg-stone-800 p-8 rounded-xl border-4 border-stone-700 shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-stone-600 rounded-t-lg opacity-50"></div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-amber-400 border-b-2 border-stone-700 pb-2">
                            <Keyboard size={32} /> Controls
                        </h2>
                        <ul className="space-y-4 text-stone-300">
                            {[
                                { label: "Move", key: "W A S D" },
                                { label: "Sprint", key: "Shift" },
                                { label: "Interact / Attack", key: "Left Click" },
                                { label: "Place / Use", key: "Right Click" },
                                { label: "Inventory", key: "E" },
                                { label: "Quick Select", key: "1 - 8" },
                                { label: "Pause", key: "ESC" },
                            ].map((item, i) => (
                                <li key={i} className="flex justify-between items-center bg-stone-900/50 p-3 rounded border border-stone-700/50">
                                    <span className="font-bold">{item.label}</span>
                                    <span className="font-mono font-bold bg-stone-950 px-3 py-1 rounded text-amber-100 border border-stone-700 shadow-sm">{item.key}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Gameplay Basics */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-amber-900/20 p-8 rounded-xl border-4 border-amber-900/50 shadow-2xl">
                             <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-green-400 border-b-2 border-amber-900/30 pb-2">
                                <MousePointer2 size={32} /> Basics
                            </h2>
                             <div className="space-y-4 text-stone-300 text-lg leading-relaxed">
                                <p>
                                    <strong className="text-amber-200">Gather:</strong> Punch trees for wood and rocks for stone. Craft an <span className="text-stone-100 bg-stone-700 px-1 rounded">Axe</span> or <span className="text-stone-100 bg-stone-700 px-1 rounded">Pickaxe</span> to work faster.
                                </p>
                                <p>
                                    <strong className="text-amber-200">Craft:</strong> Build a <span className="text-pink-400 font-bold">Crafting Station</span> to unlock better gear like Armor, Swords, and Walls.
                                </p>
                                <p>
                                    <strong className="text-amber-200">Survive:</strong> Eat berries, bread, or meat to heal. Don't let your health hit zero!
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-800 p-8 rounded-xl border-4 border-stone-700 shadow-2xl">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-blue-400 border-b-2 border-stone-700 pb-2">
                                <BookOpen size={32} /> Biomes
                            </h2>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-16 h-16 bg-green-600 rounded-lg border-2 border-green-800 shadow-inner shrink-0"></div>
                                    <div>
                                        <h3 className="text-green-400 font-bold text-xl">Plains</h3>
                                        <p className="text-sm text-stone-400">Safe, grassy lands. Cows and Snakes live here.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-16 h-16 bg-yellow-600 rounded-lg border-2 border-yellow-800 shadow-inner shrink-0"></div>
                                    <div>
                                        <h3 className="text-yellow-400 font-bold text-xl">Desert</h3>
                                        <p className="text-sm text-stone-400">Arid sand dunes. Watch out for Scorpions and Cactuses.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-16 h-16 bg-stone-600 rounded-lg border-2 border-stone-800 shadow-inner shrink-0"></div>
                                    <div>
                                        <h3 className="text-stone-400 font-bold text-xl">Mountains</h3>
                                        <p className="text-sm text-stone-400">Dangerous peaks full of Iron, Spiders, and Poison.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowToPlay;
