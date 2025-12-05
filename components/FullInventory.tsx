

import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, ItemType, Recipe, EquipmentSlot, RecipeCategory } from '../types';
import { RECIPES, ITEM_NAMES, INVENTORY_SIZE, CONTAINER_SIZE, BACKPACK_SIZE } from '../constants';
import { X, Hammer, Box, Shield, HardHat, Search, Filter, Sparkles, Briefcase } from 'lucide-react';
import ItemGraphic from './ItemGraphic';
import ItemTooltip from './ItemTooltip';

interface FullInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: (InventoryItem | null)[];
  containerItems: (InventoryItem | null)[] | null;
  onCraft: (item: ItemType) => void;
  onInventoryAction: (context: 'player' | 'container' | 'equip' | 'backpack', index: number | string, button: number) => void;
  nearStation: boolean;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  equipment: { head: InventoryItem | null, body: InventoryItem | null, accessory: InventoryItem | null, bag: InventoryItem | null };
  cursorStack: InventoryItem | null;
  onDropCursor: () => void;
}

const FullInventory: React.FC<FullInventoryProps> = ({ 
    isOpen, onClose, inventory, containerItems, onCraft, onInventoryAction, nearStation,
    health, maxHealth, stamina, maxStamina, equipment, cursorStack, onDropCursor
}) => {
  const [hoverItem, setHoverItem] = useState<{ item: InventoryItem, x: number, y: number } | null>(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<RecipeCategory | 'all'>('all');

  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
        if (cursorRef.current) {
            cursorRef.current.style.left = `${e.clientX}px`;
            cursorRef.current.style.top = `${e.clientY}px`;
        }
    };
    if (isOpen) {
        window.addEventListener('mousemove', handleWindowMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [isOpen]);

  // Reset filters when opening
  useEffect(() => {
      if (isOpen) {
          setSearchQuery("");
          setActiveFilter('all');
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const canCraft = (recipe: Recipe) => {
    return recipe.ingredients.every(ing => {
      const totalCount = inventory.reduce((acc, item) => {
          if (item && item.type === ing.type) return acc + item.count;
          return acc;
      }, 0);
      return totalCount >= ing.count;
    });
  };

  const handleSlotMouseDown = (e: React.MouseEvent, context: 'player' | 'container' | 'equip' | 'backpack', index: number | string) => {
      e.stopPropagation();
      e.preventDefault();
      onInventoryAction(context, index, e.button);
  };

  const handleMouseMove = (e: React.MouseEvent, item: InventoryItem | null) => {
      if (item && !cursorStack) {
          setHoverItem({ item, x: e.clientX, y: e.clientY });
      } else {
          setHoverItem(null);
      }
  };

  const renderSlot = (item: InventoryItem | null, index: number, context: 'player' | 'container' | 'backpack') => (
      <div 
          key={`${context}-${index}`}
          onMouseDown={(e) => handleSlotMouseDown(e, context, index)}
          onMouseMove={(e) => handleMouseMove(e, item)}
          onMouseLeave={() => setHoverItem(null)}
          className={`aspect-square bg-stone-900 rounded border border-stone-600 flex items-center justify-center relative hover:bg-stone-800 transition cursor-pointer select-none shadow-inner`}
      >
          {item && (
              <>
                  <ItemGraphic type={item.type} size={48} className="pointer-events-none" />
                  {item.count > 1 && (
                      <span className="absolute bottom-1 right-2 text-xs font-bold text-white bg-black/50 px-1.5 rounded pointer-events-none">
                          {item.count}
                      </span>
                  )}
                  {item.durability !== undefined && item.maxDurability && (
                      <div className="absolute bottom-1 left-2 h-1 w-8 bg-stone-700 rounded-full overflow-hidden pointer-events-none">
                          <div className="h-full bg-green-500" style={{ width: `${(item.durability/item.maxDurability)*100}%` }}></div>
                      </div>
                  )}
              </>
          )}
      </div>
  );

  const renderEquipSlot = (slot: EquipmentSlot, icon: React.ReactNode) => {
      const item = equipment[slot];
      return (
          <div 
              onMouseDown={(e) => handleSlotMouseDown(e, 'equip', slot)}
              onMouseMove={(e) => handleMouseMove(e, item)}
              onMouseLeave={() => setHoverItem(null)}
              className="w-16 h-16 bg-stone-900 border-2 border-stone-600 rounded flex items-center justify-center relative cursor-pointer shadow-inner hover:bg-stone-800 transition"
          >
              {!item && <div className="text-stone-700 pointer-events-none">{icon}</div>}
              {item && (
                  <div className="w-full h-full flex items-center justify-center pointer-events-none">
                      <ItemGraphic type={item.type} size={48} />
                  </div>
              )}
          </div>
      );
  };

  // --- Filter Logic ---
  const filteredRecipes = RECIPES.filter(recipe => {
      if (recipe.requiresStation && !nearStation) return false;
      
      // Filter by Tab
      if (activeFilter !== 'all' && recipe.category !== activeFilter) return false;

      // Filter by Search
      if (searchQuery) {
          const name = ITEM_NAMES[recipe.result] || recipe.result;
          return name.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
  });

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none font-serif">
      
      {/* Click outside detection for dropping items */}
      <div className="absolute inset-0" onMouseDown={() => cursorStack && onDropCursor()} />

      {/* Main Container */}
      <div className="bg-stone-800 border-4 border-stone-600 rounded-lg w-full max-w-6xl h-auto max-h-[95vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative z-10" onMouseDown={e => e.stopPropagation()}>
        
        {/* Decorative Corners */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-stone-500 rounded-full border border-black shadow-inner pointer-events-none z-20"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-stone-500 rounded-full border border-black shadow-inner pointer-events-none z-20"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-stone-500 rounded-full border border-black shadow-inner pointer-events-none z-20"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-stone-500 rounded-full border border-black shadow-inner pointer-events-none z-20"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-amber-500 z-20 transition-colors"><X size={28}/></button>

        {/* Left: Player Stats & Equipment & Container */}
        <div className="w-full md:w-1/3 bg-stone-900/50 p-6 flex flex-col border-r-4 border-stone-600 overflow-y-auto min-h-[300px]">
           {/* Stats Section */}
           <div className="flex flex-col items-center mb-6 border-b-2 border-stone-700 pb-6 shrink-0">
               <div className="w-24 h-24 md:w-32 md:h-32 bg-stone-800 rounded-full border-4 border-stone-600 flex items-center justify-center relative mb-4 shadow-lg">
                   <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-lg">
                       <circle cx="20" cy="50" r="10" fill="#fca5a5" stroke="#000" strokeWidth="2" />
                       <circle cx="80" cy="50" r="10" fill="#fca5a5" stroke="#000" strokeWidth="2" />
                       <circle cx="50" cy="50" r="25" fill="#fca5a5" stroke="#000" strokeWidth="2" />
                       {equipment.body && (
                           <g>
                               <circle cx="50" cy="50" r="25" 
                                   fill={equipment.body.type === ItemType.ARMOR_IRON ? '#9CA3AF' : '#C2410C'} 
                                   stroke={equipment.body.type === ItemType.ARMOR_IRON ? '#4B5563' : '#7C2D12'}
                                   strokeWidth="2"
                               />
                               <rect x="25" y="48" width="50" height="4" fill={equipment.body.type === ItemType.ARMOR_IRON ? '#374151' : '#7C2D12'} />
                               <path d="M30 40H70" stroke={equipment.body.type === ItemType.ARMOR_IRON ? '#4B5563' : '#7C2D12'} strokeWidth="2" />
                           </g>
                       )}
                       {equipment.head && (
                           <g>
                               <path d="M78 50 A 28 28 0 0 1 22 50 L 22 50 Z" 
                                   fill={equipment.head.type === ItemType.HELMET_IRON ? '#D1D5DB' : '#C2410C'}
                                   stroke={equipment.head.type === ItemType.HELMET_IRON ? '#4B5563' : '#7C2D12'}
                                   strokeWidth="2"
                               />
                               <path d="M22 50 A 28 28 0 0 1 78 50" 
                                   fill={equipment.head.type === ItemType.HELMET_IRON ? '#E5E7EB' : '#EA580C'}
                                   stroke={equipment.head.type === ItemType.HELMET_IRON ? '#4B5563' : '#7C2D12'}
                                   strokeWidth="2"
                               />
                           </g>
                       )}
                   </svg>
               </div>
               <div className="w-full space-y-2">
                   <div className="flex justify-between text-stone-400 text-sm font-bold">
                       <span>Health</span>
                       <span className="text-green-500">{Math.floor(health)}/{maxHealth}</span>
                   </div>
                   <div className="w-full h-3 bg-stone-950 rounded border border-stone-700 overflow-hidden relative">
                       <div className="h-full bg-green-600" style={{ width: `${(health/maxHealth)*100}%` }}></div>
                       {/* Glossy effect */}
                       <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 pointer-events-none"></div>
                   </div>
                   <div className="flex justify-between text-stone-400 text-sm font-bold mt-2">
                       <span>Stamina</span>
                       <span className="text-yellow-500">{Math.floor(stamina)}/{maxStamina}</span>
                   </div>
                   <div className="w-full h-3 bg-stone-950 rounded border border-stone-700 overflow-hidden relative">
                       <div className="h-full bg-yellow-600" style={{ width: `${(stamina/maxStamina)*100}%` }}></div>
                       <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 pointer-events-none"></div>
                   </div>
               </div>
           </div>

           {/* Equipment Section */}
           <div className="flex flex-col items-center gap-4 mb-8 shrink-0">
               <h3 className="text-stone-500 font-bold uppercase text-sm tracking-wider">Equipment</h3>
               <div className="flex gap-4">
                   {renderEquipSlot('head', <HardHat size={32} />)}
                   {renderEquipSlot('body', <Shield size={32} />)}
               </div>
               <div className="flex gap-4">
                   {renderEquipSlot('accessory', <Sparkles size={32} />)}
                   {renderEquipSlot('bag', <Briefcase size={32} />)}
               </div>
           </div>

           {/* Container Grid (if open) */}
           {containerItems && (
               <div className="flex-1 border-t-2 border-stone-700 pt-6">
                   <h2 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2 drop-shadow-md">
                       <Box size={24} /> Chest
                   </h2>
                   <div className="grid grid-cols-4 gap-2 bg-stone-950/30 p-2 rounded-lg border border-stone-700">
                       {Array.from({length: CONTAINER_SIZE}).map((_, i) => renderSlot(containerItems[i], i, 'container'))}
                   </div>
               </div>
           )}
        </div>

        {/* Center: Player Inventory */}
        <div className="w-full md:w-1/3 p-6 bg-stone-800 flex flex-col border-r-4 border-stone-600 min-h-[300px]">
            <h2 className="text-3xl font-bold text-stone-200 mb-6 shrink-0 drop-shadow-md border-b-2 border-stone-700 pb-2">Inventory</h2>
            
            <div className="grid grid-cols-4 gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-stone-900/20 p-2 rounded-lg border border-stone-700/50">
                {Array.from({length: INVENTORY_SIZE}).map((_, i) => renderSlot(inventory[i], i, 'player'))}
            </div>

            {/* Backpack Expansion */}
            {equipment.bag && equipment.bag.contents && (
                <div className="mt-4 pt-4 border-t-2 border-stone-700">
                    <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                         <Briefcase size={16} /> Backpack Storage
                    </h3>
                    <div className="grid grid-cols-4 gap-2 bg-stone-950/30 p-2 rounded-lg border border-stone-700">
                        {Array.from({length: BACKPACK_SIZE}).map((_, i) => 
                            renderSlot(equipment.bag!.contents![i], i, 'backpack')
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Right: Crafting */}
        <div className="w-full md:w-1/3 bg-stone-800 p-6 flex flex-col min-h-[300px]">
            <h2 className="text-3xl font-bold text-stone-200 mb-4 flex items-center gap-2 shrink-0 drop-shadow-md border-b-2 border-stone-700 pb-2">
                <Hammer size={28} className="text-amber-500"/> 
                {nearStation ? "Station Crafting" : "Hand Crafting"}
            </h2>

            {/* Filter & Search Bar */}
            <div className="mb-4 space-y-3 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-600 rounded py-2 pl-9 pr-4 text-sm text-stone-200 focus:outline-none focus:border-amber-500 placeholder-stone-600"
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {(['all', 'gear', 'block', 'food', 'misc'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1 rounded text-xs font-bold capitalize whitespace-nowrap transition-colors border
                                ${activeFilter === filter 
                                    ? 'bg-amber-600 text-stone-100 border-amber-800 shadow-inner' 
                                    : 'bg-stone-700 text-stone-400 border-stone-600 hover:bg-stone-600 hover:text-stone-200'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar bg-stone-900/20 p-2 rounded-lg border border-stone-700/50">
                {filteredRecipes.length === 0 ? (
                    <div className="text-center text-stone-600 mt-10">
                        <Filter className="mx-auto mb-2 opacity-50" size={32}/>
                        <p>No recipes found.</p>
                    </div>
                ) : (
                    filteredRecipes.map((recipe, idx) => {
                        const craftable = canCraft(recipe);
                        return (
                            <div key={idx} className={`p-3 rounded border flex flex-col gap-2 transition-colors ${craftable ? 'bg-stone-700 border-stone-500 hover:bg-stone-600' : 'bg-stone-900/50 border-stone-800 opacity-60'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1 bg-stone-950 rounded border border-stone-800">
                                            <ItemGraphic type={recipe.result} size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-200 text-sm">
                                                {ITEM_NAMES[recipe.result] || recipe.result} 
                                                {recipe.count > 1 ? ` x${recipe.count}` : ''}
                                            </h3>
                                        </div>
                                    </div>
                                    <button 
                                        disabled={!craftable}
                                        onClick={() => onCraft(recipe.result)}
                                        className={`px-3 py-1 rounded font-bold text-xs border-b-2 active:border-b-0 active:translate-y-px transition-all ${craftable ? 'bg-amber-600 hover:bg-amber-500 text-stone-100 border-amber-800 shadow-md' : 'bg-stone-800 text-stone-600 border-stone-900 cursor-not-allowed'}`}
                                    >
                                        CRAFT
                                    </button>
                                </div>
                                <div className="flex gap-2 text-[10px] text-stone-400 flex-wrap">
                                    {recipe.ingredients.map((ing, i) => {
                                         const haveCount = inventory.reduce((acc, item) => item && item.type === ing.type ? acc + item.count : acc, 0);
                                         const hasEnough = haveCount >= ing.count;
                                         return (
                                             <span key={i} className={`px-1.5 py-0.5 rounded border ${hasEnough ? "bg-green-900/30 text-green-400 border-green-900" : "bg-red-900/30 text-red-400 border-red-900"}`}>
                                                 {ing.count} {ITEM_NAMES[ing.type] || ing.type}
                                             </span>
                                         );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </div>
      
      {/* Hover Tooltip Layer */}
      {hoverItem && !cursorStack && (
          <ItemTooltip item={hoverItem.item} x={hoverItem.x} y={hoverItem.y} />
      )}

      {/* Floating Cursor Item */}
      {cursorStack && (
          <div 
             ref={cursorRef}
             className="fixed z-[100] pointer-events-none"
             style={{ transform: 'translate(-50%, -50%)' }}
          >
              <div className="relative">
                 <ItemGraphic type={cursorStack.type} size={56} className="filter drop-shadow-xl" />
                 <span className="absolute bottom-0 right-0 text-sm font-bold text-white bg-black/70 px-1 rounded border border-white/20">
                     {cursorStack.count}
                 </span>
              </div>
          </div>
      )}
    </div>
  );
};

export default FullInventory;