
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import ItemGraphic from './ItemGraphic';
import ItemTooltip from './ItemTooltip';

interface InventoryBarProps {
  inventory: (InventoryItem | null)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onMoveItem: (fromIdx: number, toIdx: number) => void;
  onUseItem: (idx: number) => void;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
}

const InventoryBar: React.FC<InventoryBarProps> = ({ 
    inventory, selectedIndex, onSelect, onMoveItem, onUseItem,
    health, maxHealth, stamina, maxStamina 
}) => {
  const slots = 8; // Hotbar slots
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [hoverItem, setHoverItem] = useState<{ item: InventoryItem, x: number, y: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null) return;
    onMoveItem(draggedIdx, targetIndex);
    setDraggedIdx(null);
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      onUseItem(index);
  };

  const handleMouseMove = (e: React.MouseEvent, item: InventoryItem | null) => {
      if (item) {
          setHoverItem({ item, x: e.clientX, y: e.clientY });
      } else {
          setHoverItem(null);
      }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2">
      {/* HUD Bars */}
      <div className="flex w-full justify-between px-1 mb-1 gap-4">
          <div className="flex-1 h-3 bg-black/60 rounded-full border border-white/20 overflow-hidden relative group">
              <div 
                  className="absolute top-0 left-0 h-full bg-red-500"
                  style={{ width: `${(health / maxHealth) * 100}%` }}
              />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-white drop-shadow-md whitespace-nowrap">
                  HP {Math.floor(health)}/{maxHealth}
              </span>
          </div>
          <div className="flex-1 h-3 bg-black/60 rounded-full border border-white/20 overflow-hidden relative group">
               <div 
                   className="absolute top-0 left-0 h-full bg-yellow-500"
                   style={{ width: `${(stamina / maxStamina) * 100}%` }}
               />
               <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-black drop-shadow-md whitespace-nowrap">
                   STM {Math.floor(stamina)}/{maxStamina}
               </span>
          </div>
      </div>

      {/* Inventory Slots */}
      <div className="bg-black/80 backdrop-blur-md p-2 rounded-xl flex gap-2 border border-white/20 shadow-2xl">
        {Array.from({ length: slots }).map((_, i) => {
          const item = inventory[i];
          const isSelected = i === selectedIndex;
          
          let durabilityPercent = 0;
          if (item && item.durability !== undefined && item.maxDurability) {
              durabilityPercent = (item.durability / item.maxDurability) * 100;
          }

          return (
            <div
              key={i}
              onClick={() => onSelect(i)}
              onContextMenu={(e) => handleContextMenu(e, i)}
              draggable={!!item}
              onDragStart={(e) => !!item && handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
              onMouseMove={(e) => handleMouseMove(e, item)}
              onMouseLeave={() => setHoverItem(null)}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 flex items-center justify-center relative cursor-pointer transition-all
                ${isSelected ? 'border-yellow-400 bg-white/10 scale-105' : 'border-white/20 hover:border-white/50 bg-black/40'}
                ${draggedIdx === i ? 'opacity-50' : ''}
              `}
            >
              {item && (
                <>
                  <ItemGraphic type={item.type} size={40} className="filter drop-shadow-md pointer-events-none" />
                  {item.count > 1 && (
                      <span className="absolute bottom-1 right-1 text-xs font-bold text-white bg-black/50 px-1 rounded pointer-events-none">
                        {item.count}
                      </span>
                  )}
                  
                  {/* Durability Bar */}
                  {item.durability !== undefined && (
                      <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-700 rounded-full overflow-hidden pointer-events-none">
                          <div 
                              className={`h-full ${durabilityPercent > 50 ? 'bg-green-500' : durabilityPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                              style={{ width: `${durabilityPercent}%` }}
                          />
                      </div>
                  )}
                </>
              )}
              <span className="absolute top-0.5 left-1 text-[8px] text-white/50 pointer-events-none">{i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoverItem && (
          <ItemTooltip item={hoverItem.item} x={hoverItem.x} y={hoverItem.y} />
      )}
    </div>
  );
};

export default InventoryBar;
