
import React, { useState, useEffect } from 'react';
import { SaveMeta } from '../types';
import { listSaves, createSave, deleteSave, renameSave } from '../utils/storageUtils';
import { Trash2, Edit2, Play, Plus, ArrowLeft, AlertTriangle, Save } from 'lucide-react';

interface WorldSelectMenuProps {
    onBack: () => void;
    onSelectWorld: (slotId: number) => void;
}

const WorldSelectMenu: React.FC<WorldSelectMenuProps> = ({ onBack, onSelectWorld }) => {
    const [saves, setSaves] = useState<(SaveMeta | null)[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ idx: number, name: string } | null>(null);

    useEffect(() => {
        refreshSaves();
    }, []);

    const refreshSaves = () => {
        setSaves(listSaves());
    };

    const handleCreate = (slotIndex: number) => {
        const id = slotIndex + 1;
        createSave(id, `World ${id}`);
        refreshSaves();
    };

    const requestDelete = (e: React.MouseEvent, slotIndex: number, name: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteTarget({ idx: slotIndex, name });
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            deleteSave(deleteTarget.idx + 1);
            setDeleteTarget(null);
            refreshSaves();
        }
    };

    const cancelDelete = () => {
        setDeleteTarget(null);
    };

    const startRename = (slotIndex: number, currentName: string) => {
        setEditingId(slotIndex);
        setEditName(currentName);
    };

    const finishRename = (slotIndex: number) => {
        if (editName.trim()) {
            renameSave(slotIndex + 1, editName.trim());
            refreshSaves();
        }
        setEditingId(null);
    };

    return (
        <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center z-50 text-white select-none font-serif">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615654060855-63510c4f828a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
             
             <div className="z-10 w-full max-w-3xl px-6">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-stone-400 hover:text-amber-400 mb-6 transition-colors font-bold uppercase tracking-wider bg-stone-950/50 px-4 py-2 rounded-lg border border-stone-700"
                >
                    <ArrowLeft size={20} /> Back to Title
                </button>

                <h1 className="text-5xl font-bold mb-8 text-center text-amber-500 drop-shadow-[0_4px_0_rgba(0,0,0,1)]" style={{ textShadow: '2px 2px 0 #451a03' }}>
                    Select World
                </h1>

                <div className="grid gap-6">
                    {saves.map((save, idx) => (
                        <div key={idx} className="relative group">
                            {/* Card Background */}
                            <div className="absolute inset-0 bg-stone-800 rounded-xl border-b-4 border-stone-950 shadow-xl transform transition-transform group-hover:-translate-y-1"></div>
                            
                            <div className="relative p-5 flex items-center justify-between h-28 border-2 border-stone-600 rounded-xl bg-stone-800">
                                {save ? (
                                    <>
                                        <div className="flex flex-col flex-1 pl-2">
                                            {editingId === idx ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        autoFocus
                                                        className="bg-stone-950 border-2 border-amber-600 rounded px-3 py-1 text-2xl font-bold text-amber-100 outline-none w-full max-w-[200px]"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && finishRename(idx)}
                                                        onBlur={() => finishRename(idx)}
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                    <button onMouseDown={() => finishRename(idx)} className="text-green-500 hover:text-green-400"><Save size={24}/></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl font-bold text-stone-200 drop-shadow-md">{save.name}</span>
                                                    <button onClick={() => startRename(idx, save.name)} className="text-stone-500 hover:text-amber-400 p-1 transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                            <span className="text-sm text-stone-500 mt-1 font-mono">
                                                Last Played: {new Date(save.lastPlayed).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={(e) => requestDelete(e, idx, save.name)}
                                                className="p-3 rounded-lg bg-stone-900 hover:bg-red-900/50 text-stone-600 hover:text-red-400 border-2 border-stone-700 hover:border-red-800 transition-all shadow-inner"
                                                title="Delete World"
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                            <button 
                                                onClick={() => onSelectWorld(idx + 1)}
                                                className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-amber-50 font-bold text-xl shadow-[0_4px_0_#78350f] active:shadow-none active:translate-y-1 border-2 border-amber-400 border-b-amber-800 flex items-center gap-2 transition-all"
                                            >
                                                <Play size={24} fill="currentColor" /> Play
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col pl-4">
                                            <span className="text-2xl font-bold text-stone-600 italic">Empty Slot {idx + 1}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleCreate(idx)}
                                            className="px-6 py-3 rounded-lg bg-stone-700 hover:bg-green-700 text-stone-400 hover:text-green-100 font-bold text-lg border-2 border-stone-600 hover:border-green-500 border-dashed flex items-center gap-2 transition-all"
                                        >
                                            <Plus size={24} /> Create New World
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* DELETE MODAL */}
             {deleteTarget && (
                 <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                     <div className="bg-stone-800 border-4 border-stone-600 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                         <div className="flex items-center gap-4 text-red-500 mb-6 border-b-2 border-stone-700 pb-4">
                             <AlertTriangle size={40} />
                             <h2 className="text-3xl font-bold text-stone-200">Delete World?</h2>
                         </div>
                         
                         <p className="text-stone-300 mb-8 text-lg leading-relaxed">
                             Are you sure you want to delete <span className="font-bold text-amber-500">"{deleteTarget.name}"</span>?
                             <br/>
                             <span className="text-red-400 text-sm block mt-2 font-bold bg-red-950/30 p-2 rounded border border-red-900/50">
                                 Warning: This action is permanent.
                             </span>
                         </p>

                         <div className="flex justify-end gap-4">
                             <button 
                                 onClick={cancelDelete}
                                 className="px-6 py-3 rounded-lg bg-stone-600 hover:bg-stone-500 text-white font-bold border-b-4 border-stone-800 active:border-b-0 active:translate-y-1 transition-all"
                             >
                                 Cancel
                             </button>
                             <button 
                                 onClick={confirmDelete}
                                 className="px-6 py-3 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold shadow-lg flex items-center gap-2 border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all"
                             >
                                 <Trash2 size={20} /> Delete Forever
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default WorldSelectMenu;
