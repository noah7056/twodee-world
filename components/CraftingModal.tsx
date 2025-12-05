import React from 'react';
import { ItemType, InventoryItem, Recipe } from '../types';
import { RECIPES } from '../constants';
import { X } from 'lucide-react';
import ItemGraphic from './ItemGraphic';

interface CraftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: (InventoryItem | null)[];
  onCraft: (item: ItemType) => void;
}

const CraftingModal: React.FC<CraftingModalProps> = ({ isOpen, onClose, inventory, onCraft }) => {
  if (!isOpen) return null;

  const canCraft = (recipe: Recipe) => {
    return recipe.ingredients.every(ing => {
      const have = inventory.find(i => i && i.type === ing.type);
      return have && have.count >= ing.count;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Crafting</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
          {RECIPES.map((recipe, idx) => {
            const craftable = canCraft(recipe);
            return (
              <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${craftable ? 'bg-gray-800 border-gray-600 hover:bg-gray-750' : 'bg-gray-800/50 border-gray-800 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    <ItemGraphic type={recipe.result} size={48} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{recipe.result}</h3>
                    <p className="text-xs text-gray-400 mb-1">{recipe.description}</p>
                    <div className="flex gap-2 text-xs text-gray-300">
                        {recipe.ingredients.map((ing, i) => (
                             <span key={i} className={inventory.find(inv=>inv && inv.type===ing.type && inv.count >= ing.count) ? "text-green-400" : "text-red-400"}>
                                 {ing.count}x {ing.type}
                             </span>
                        ))}
                    </div>
                  </div>
                </div>
                <button 
                    disabled={!craftable}
                    onClick={() => onCraft(recipe.result)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm ${craftable ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    CRAFT
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CraftingModal;