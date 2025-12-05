
import React from 'react';
import { InventoryItem, Recipe } from '../types';
import { ITEM_NAMES, RECIPES } from '../constants';

interface ItemTooltipProps {
    item: InventoryItem;
    x: number;
    y: number;
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, x, y }) => {
    // Find recipe to get description if available
    const recipe = RECIPES.find(r => r.result === item.type);
    const description = recipe ? recipe.description : "";

    return (
        <div 
            className="fixed z-[100] bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl pointer-events-none w-48"
            style={{ top: y + 10, left: x + 10 }}
        >
            <h4 className="font-bold text-white text-sm mb-1">{ITEM_NAMES[item.type] || item.type}</h4>
            {description && (
                <p className="text-xs text-gray-400 italic mb-2">{description}</p>
            )}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                    <span>Count:</span>
                    <span className="text-white font-mono">{item.count}</span>
                </div>
                {item.durability !== undefined && item.maxDurability && (
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-gray-300">
                            <span>Durability:</span>
                            <span className="text-white font-mono">{item.durability}/{item.maxDurability}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                             <div 
                                className={`h-full ${item.durability / item.maxDurability > 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${(item.durability / item.maxDurability) * 100}%`}}
                             />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemTooltip;
