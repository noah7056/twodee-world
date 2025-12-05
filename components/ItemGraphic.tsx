

import React from 'react';
import { ItemType } from '../types';

interface ItemGraphicProps {
    type: ItemType;
    size?: number;
    className?: string;
}

const ItemGraphic: React.FC<ItemGraphicProps> = ({ type, size = 48, className = "" }) => {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {type === ItemType.WOOD && (
                <g>
                    <rect x="12" y="8" width="24" height="32" rx="2" fill="#5D4037" />
                    <path d="M12 12H36" stroke="#8D6E63" strokeWidth="2"/>
                    <path d="M12 20H36" stroke="#8D6E63" strokeWidth="2"/>
                    <path d="M12 28H36" stroke="#8D6E63" strokeWidth="2"/>
                    <circle cx="18" cy="16" r="1.5" fill="#3E2723" />
                    <circle cx="30" cy="30" r="1.5" fill="#3E2723" />
                </g>
            )}

            {type === ItemType.STONE && (
                <path d="M10 24L16 12L32 8L40 20L36 36L20 40L8 32Z" fill="#78716C" stroke="#44403C" strokeWidth="2"/>
            )}

            {type === ItemType.IRON && (
                <g>
                    <path d="M10 24L16 12L32 8L40 20L36 36L20 40L8 32Z" fill="#57534E" stroke="#292524" strokeWidth="2"/>
                    <circle cx="18" cy="20" r="3" fill="#F87171" />
                    <circle cx="30" cy="18" r="2.5" fill="#F87171" />
                    <circle cx="26" cy="30" r="3" fill="#F87171" />
                </g>
            )}

            {type === ItemType.GOLD && (
                <g>
                    <path d="M10 24L16 12L32 8L40 20L36 36L20 40L8 32Z" fill="#57534E" stroke="#292524" strokeWidth="2"/>
                    <circle cx="18" cy="20" r="3" fill="#FBBF24" />
                    <circle cx="30" cy="18" r="2.5" fill="#FBBF24" />
                    <circle cx="26" cy="30" r="3" fill="#FBBF24" />
                </g>
            )}

            {type === ItemType.BERRY && (
                <g>
                    <circle cx="24" cy="24" r="8" fill="#EF4444" />
                    <circle cx="16" cy="30" r="7" fill="#EF4444" />
                    <circle cx="32" cy="30" r="7" fill="#EF4444" />
                    <path d="M24 24L24 10" stroke="#4ADE80" strokeWidth="3" />
                    <path d="M24 16L14 10" stroke="#4ADE80" strokeWidth="3" />
                    <path d="M24 16L34 10" stroke="#4ADE80" strokeWidth="3" />
                </g>
            )}

            {type === ItemType.BERRY_SEED && (
                <g>
                    <circle cx="20" cy="24" r="3" fill="#FCA5A5" stroke="#EF4444" />
                    <circle cx="28" cy="28" r="3" fill="#FCA5A5" stroke="#EF4444" />
                    <circle cx="26" cy="18" r="3" fill="#FCA5A5" stroke="#EF4444" />
                    <circle cx="16" cy="32" r="2" fill="#FCA5A5" stroke="#EF4444" />
                </g>
            )}

            {type === ItemType.WHEAT_SEEDS && (
                <g>
                    <ellipse cx="20" cy="24" rx="2" ry="4" fill="#FEF08A" stroke="#EAB308" />
                    <ellipse cx="28" cy="28" rx="2" ry="4" fill="#FEF08A" stroke="#EAB308" />
                    <ellipse cx="26" cy="18" rx="2" ry="4" fill="#FEF08A" stroke="#EAB308" />
                    <ellipse cx="16" cy="32" rx="2" ry="4" fill="#FEF08A" stroke="#EAB308" />
                </g>
            )}

            {type === ItemType.WHEAT && (
                <g>
                    <path d="M24 42V10" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
                    <path d="M24 14L18 18" stroke="#EAB308" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M24 20L30 24" stroke="#EAB308" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M24 26L18 30" stroke="#EAB308" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M24 32L30 36" stroke="#EAB308" strokeWidth="2" strokeLinecap="round"/>
                </g>
            )}

            {type === ItemType.BREAD && (
                <g>
                    <path d="M8 24 C8 14, 16 10, 24 10 C 32 10, 40 14, 40 24 L 40 32 C 40 36, 36 38, 24 38 C 12 38, 8 36, 8 32 Z" fill="#D97706" stroke="#92400E" strokeWidth="2" />
                    <path d="M14 20C18 16, 30 16, 34 20" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 28C16 24, 32 24, 36 28" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
                </g>
            )}

            {/* AXES */}
            {(type === ItemType.WOOD_AXE || type === ItemType.STONE_AXE || type === ItemType.IRON_AXE || type === ItemType.GOLD_AXE) && (
                <g transform="rotate(45 24 24)">
                    <rect x="22" y="10" width="4" height="30" fill="#8D6E63" />
                    <path d="M24 10L14 14V22L24 26V10Z" 
                        fill={type === ItemType.GOLD_AXE ? "#FBBF24" : type === ItemType.IRON_AXE ? "#E5E7EB" : type === ItemType.STONE_AXE ? "#9CA3AF" : "#A16207"} 
                        stroke={type === ItemType.GOLD_AXE ? "#D97706" : type === ItemType.IRON_AXE ? "#9CA3AF" : type === ItemType.STONE_AXE ? "#4B5563" : "#713F12"}
                    />
                    <path d="M24 10L34 14V22L24 26V10Z" 
                        fill={type === ItemType.GOLD_AXE ? "#FBBF24" : type === ItemType.IRON_AXE ? "#E5E7EB" : type === ItemType.STONE_AXE ? "#9CA3AF" : "#A16207"}
                        stroke={type === ItemType.GOLD_AXE ? "#D97706" : type === ItemType.IRON_AXE ? "#9CA3AF" : type === ItemType.STONE_AXE ? "#4B5563" : "#713F12"}
                    />
                </g>
            )}

            {/* PICKAXES */}
            {(type === ItemType.WOOD_PICKAXE || type === ItemType.STONE_PICKAXE || type === ItemType.IRON_PICKAXE || type === ItemType.GOLD_PICKAXE) && (
                <g transform="rotate(45 24 24)">
                    <rect x="22" y="10" width="4" height="30" fill="#8D6E63" />
                    <path d="M12 14Q24 8 36 14L34 18Q24 12 14 18Z" 
                        fill={type === ItemType.GOLD_PICKAXE ? "#FBBF24" : type === ItemType.IRON_PICKAXE ? "#E5E7EB" : type === ItemType.STONE_PICKAXE ? "#9CA3AF" : "#A16207"}
                        stroke={type === ItemType.GOLD_PICKAXE ? "#D97706" : type === ItemType.IRON_PICKAXE ? "#9CA3AF" : type === ItemType.STONE_PICKAXE ? "#4B5563" : "#713F12"}
                    />
                </g>
            )}

            {(type === ItemType.WOOD_SWORD || type === ItemType.STONE_SWORD || type === ItemType.IRON_SWORD || type === ItemType.GOLD_SWORD) && (
                <g transform="rotate(45 24 24)">
                    <rect x="22" y="12" width="4" height="24" fill="#8D6E63" />
                    <circle cx="24" cy="36" r="3" fill="#4B5563" />
                    <rect x="16" y="10" width="16" height="4" fill="#4B5563" rx="1"/>
                    
                    {type === ItemType.WOOD_SWORD && (
                        <g>
                             <path d="M24 8L20 12H28L24 8Z" fill="#A16207" />
                             <rect x="20" y="-8" width="8" height="20" fill="#A16207" />
                             <path d="M20 -8L24 -14L28 -8H20Z" fill="#A16207" />
                        </g>
                    )}
                    
                    {type === ItemType.STONE_SWORD && (
                        <g>
                             <path d="M24 8L20 12H28L24 8Z" fill="#9CA3AF" />
                             <rect x="20" y="-8" width="8" height="20" fill="#9CA3AF" />
                             <path d="M20 -8L24 -14L28 -8H20Z" fill="#9CA3AF" />
                        </g>
                    )}

                    {type === ItemType.IRON_SWORD && (
                        <g>
                            <path d="M24 8L20 12H28L24 8Z" fill="#9CA3AF" />
                            <path d="M20 12H28L24 4L20 12Z" fill="#D1D5DB" />
                            <rect x="20" y="-8" width="8" height="20" fill="#D1D5DB" />
                            <path d="M20 -8L24 -14L28 -8H20Z" fill="#D1D5DB" />
                        </g>
                    )}

                    {type === ItemType.GOLD_SWORD && (
                        <g>
                            <path d="M24 8L20 12H28L24 8Z" fill="#FBBF24" />
                            <path d="M20 12H28L24 4L20 12Z" fill="#FCD34D" />
                            <rect x="20" y="-8" width="8" height="20" fill="#FCD34D" />
                            <path d="M20 -8L24 -14L28 -8H20Z" fill="#FCD34D" />
                        </g>
                    )}
                </g>
            )}

            {type === ItemType.WALL_WOOD_ITEM && (
                <g>
                    <rect x="10" y="8" width="28" height="32" fill="#78350F" stroke="#451a03" strokeWidth="2"/>
                    <line x1="10" y1="16" x2="38" y2="16" stroke="#451a03" strokeWidth="2"/>
                    <line x1="10" y1="24" x2="38" y2="24" stroke="#451a03" strokeWidth="2"/>
                    <line x1="10" y1="32" x2="38" y2="32" stroke="#451a03" strokeWidth="2"/>
                    <circle cx="16" cy="20" r="1.5" fill="#451a03"/>
                </g>
            )}

            {type === ItemType.FLOOR_WOOD_ITEM && (
                <g>
                    <rect x="8" y="8" width="32" height="32" fill="#B45309" stroke="#78350F" strokeWidth="2"/>
                    <line x1="8" y1="18" x2="40" y2="18" stroke="#78350F" strokeWidth="2"/>
                    <line x1="8" y1="28" x2="40" y2="28" stroke="#78350F" strokeWidth="2"/>
                </g>
            )}

            {type === ItemType.FLOOR_STONE_ITEM && (
                <g>
                    <rect x="8" y="8" width="32" height="32" fill="#57534E" stroke="#292524" strokeWidth="2"/>
                    <path d="M8 8H40V40H8V8Z" fill="#57534E" />
                    <path d="M20 8V40" stroke="#44403C" strokeWidth="1" />
                    <path d="M30 8V40" stroke="#44403C" strokeWidth="1" />
                    <path d="M8 20H40" stroke="#44403C" strokeWidth="1" />
                    <path d="M8 30H40" stroke="#44403C" strokeWidth="1" />
                    <path d="M12 12H16V16H12V12Z" fill="#44403C" />
                    <path d="M28 28H32V32H28V28Z" fill="#44403C" />
                </g>
            )}

            {type === ItemType.WALL_STONE_ITEM && (
                <g>
                    <rect x="8" y="8" width="32" height="32" fill="#44403C" stroke="#1C1917" strokeWidth="2"/>
                    <line x1="8" y1="18" x2="40" y2="18" stroke="#1C1917" strokeWidth="2"/>
                    <line x1="8" y1="28" x2="40" y2="28" stroke="#1C1917" strokeWidth="2"/>
                    <line x1="24" y1="18" x2="24" y2="28" stroke="#1C1917" strokeWidth="2"/>
                </g>
            )}

            {type === ItemType.CRAFTING_STATION_ITEM && (
                <g>
                    <rect x="10" y="20" width="28" height="20" fill="#9F1239" stroke="#881337" strokeWidth="2"/>
                    <rect x="6" y="16" width="36" height="8" fill="#E11D48" stroke="#9F1239" strokeWidth="2"/>
                    <circle cx="24" cy="30" r="4" fill="#881337"/>
                </g>
            )}

            {type === ItemType.CHEST_ITEM && (
                <g>
                    <rect x="8" y="14" width="32" height="24" fill="#854D0E" stroke="#422006" strokeWidth="2"/>
                    <rect x="21" y="20" width="6" height="8" fill="#FCD34D" stroke="#B45309"/>
                    <path d="M8 14H40V20H8V14Z" fill="#A16207" stroke="#422006"/>
                </g>
            )}

            {type === ItemType.SAPLING && (
                <g>
                    <path d="M24 40V24" stroke="#15803D" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M24 24Q14 24 14 14" stroke="#4ADE80" strokeWidth="3" fill="none" />
                    <path d="M24 24Q34 24 34 14" stroke="#4ADE80" strokeWidth="3" fill="none" />
                    <circle cx="14" cy="14" r="3" fill="#22C55E"/>
                    <circle cx="34" cy="14" r="3" fill="#22C55E"/>
                </g>
            )}

            {type === ItemType.CLAM && (
                <g>
                    <path d="M12 28C12 18 36 18 36 28C36 32 30 36 24 36C18 36 12 32 12 28Z" fill="#FCE7F3" stroke="#FBCFE8" strokeWidth="2"/>
                    <path d="M24 36L18 26" stroke="#FBCFE8" strokeWidth="1"/>
                    <path d="M24 36L24 24" stroke="#FBCFE8" strokeWidth="1"/>
                    <path d="M24 36L30 26" stroke="#FBCFE8" strokeWidth="1"/>
                </g>
            )}

            {(type === ItemType.HELMET_LEATHER || type === ItemType.HELMET_IRON || type === ItemType.HELMET_GOLD) && (
                <g>
                     <path d="M8 26V20C8 12 16 6 24 6C32 6 40 12 40 20V26" 
                        stroke={type === ItemType.HELMET_GOLD ? "#B45309" : type === ItemType.HELMET_IRON ? "#4B5563" : "#7C2D12"} 
                        strokeWidth="4" 
                        fill={type === ItemType.HELMET_GOLD ? "#FCD34D" : type === ItemType.HELMET_IRON ? "#9CA3AF" : "#C2410C"}
                    />
                     <rect x="22" y="6" width="4" height="20" 
                        fill={type === ItemType.HELMET_GOLD ? "#FEF3C7" : type === ItemType.HELMET_IRON ? "#D1D5DB" : "#EA580C"} 
                    />
                </g>
            )}

            {(type === ItemType.ARMOR_LEATHER || type === ItemType.ARMOR_IRON || type === ItemType.ARMOR_GOLD) && (
                <g>
                    <path d="M12 10H36L40 20V38H8V20L12 10Z" 
                        fill={type === ItemType.ARMOR_GOLD ? "#FCD34D" : type === ItemType.ARMOR_IRON ? "#9CA3AF" : "#C2410C"} 
                        stroke={type === ItemType.ARMOR_GOLD ? "#B45309" : type === ItemType.ARMOR_IRON ? "#4B5563" : "#7C2D12"} 
                        strokeWidth="2"
                    />
                    <path d="M24 10V38" 
                        stroke={type === ItemType.ARMOR_GOLD ? "#D97706" : type === ItemType.ARMOR_IRON ? "#6B7280" : "#7C2D12"} 
                        strokeWidth="2"
                    />
                </g>
            )}

            {type === ItemType.CACTUS && (
                <g>
                    <rect x="20" y="10" width="8" height="34" rx="2" fill="#16A34A" stroke="#14532D" strokeWidth="2"/>
                    <path d="M12 18H20" stroke="#14532D" strokeWidth="2"/>
                    <path d="M12 18V26" stroke="#16A34A" strokeWidth="6"/>
                    <path d="M28 24H36" stroke="#14532D" strokeWidth="2"/>
                    <path d="M36 24V16" stroke="#16A34A" strokeWidth="6"/>
                </g>
            )}

            {type === ItemType.RAW_BEEF && (
                <g>
                     <path d="M10 28C10 34 16 38 24 38C32 38 38 34 38 28C38 22 34 14 24 10C14 14 10 22 10 28Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2"/>
                     <path d="M18 24Q24 20 30 24" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round"/>
                     <path d="M20 30Q24 26 28 30" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round"/>
                </g>
            )}

            {type === ItemType.LEATHER && (
                <g>
                    <path d="M12 12C12 8 20 4 24 4C28 4 36 8 36 12C36 16 40 20 40 24C40 32 32 40 24 44C16 40 8 32 8 24C8 20 12 16 12 12Z" fill="#C2410C" stroke="#7C2D12" strokeWidth="2"/>
                </g>
            )}

            {type === ItemType.PLANT_FIBER && (
                <g>
                    <path d="M24 40C24 40 16 20 12 10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                    <path d="M24 40C24 40 24 18 24 8" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                    <path d="M24 40C24 40 32 20 36 10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                    <path d="M24 40C24 40 18 24 16 14" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
                    <path d="M24 40C24 40 30 24 32 14" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
                </g>
            )}

            {type === ItemType.SNAKE_FANG && (
                <g>
                    <path d="M20 14 C 20 14, 28 14, 28 14 C 32 14, 34 20, 30 30 C 26 40, 24 44, 24 44 C 24 44, 22 40, 18 30 C 14 20, 16 14, 20 14 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2"/>
                </g>
            )}

            {type === ItemType.COBWEB && (
                <g>
                    <path d="M8 8L40 40M40 8L8 40M24 4V44M4 24H44" stroke="#E5E7EB" strokeWidth="1" />
                    <path d="M18 18L30 18L30 30L18 30Z" stroke="#E5E7EB" strokeWidth="1" fill="none" transform="rotate(45 24 24)" />
                    <circle cx="24" cy="24" r="8" stroke="#E5E7EB" strokeWidth="1" fill="none" />
                </g>
            )}

            {type === ItemType.BOAT && (
                <g>
                    <path d="M8 18 Q24 6 40 18 L36 34 Q24 40 12 34 Z" fill="#854d0e" stroke="#5D4037" strokeWidth="2" />
                    <rect x="16" y="24" width="16" height="4" fill="#5D4037" />
                </g>
            )}

            {type === ItemType.RUBY && (
                <g>
                    <path d="M16 12 L32 12 L40 20 L24 38 L8 20 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
                    <path d="M16 12 L24 22 M32 12 L24 22 M8 20 L24 22 M40 20 L24 22 M24 22 L24 38" stroke="#B91C1C" strokeWidth="1" />
                    <path d="M20 14 L28 14" stroke="#FECACA" strokeWidth="1" opacity="0.5" />
                </g>
            )}

            {type === ItemType.CHARM && (
                <g>
                    {/* Chain */}
                    <path d="M18 8 C 18 2, 30 2, 30 8 L 30 14 L 18 14 Z" stroke="#FBBF24" strokeWidth="2" fill="none" />
                    {/* Gem Holder */}
                    <circle cx="24" cy="24" r="14" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                    {/* Gem */}
                    <path d="M18 18 L30 18 L34 24 L24 36 L14 24 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
                    <path d="M24 36 L24 24 M18 18 L24 24 M30 18 L24 24" stroke="#991B1B" strokeWidth="1" opacity="0.5"/>
                </g>
            )}

            {type === ItemType.FISHING_ROD && (
                <g transform="rotate(45 24 24)">
                    <path d="M12 36 L 36 12" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
                    <path d="M36 12 L 36 24" stroke="#E5E7EB" strokeWidth="1" />
                    <circle cx="36" cy="26" r="2" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
                </g>
            )}

            {type === ItemType.SALMON && (
                <g>
                    <path d="M10 24 Q 24 16, 38 24 L 32 30 Q 24 24, 16 30 Z" fill="#F87171" stroke="#B91C1C" strokeWidth="2" />
                    <path d="M38 24 L 44 20 L 44 28 Z" fill="#F87171" stroke="#B91C1C" strokeWidth="1" />
                    <circle cx="16" cy="22" r="2" fill="#000" />
                </g>
            )}

            {type === ItemType.COD && (
                <g>
                    <path d="M10 24 Q 24 14, 38 24 L 32 32 Q 24 26, 16 32 Z" fill="#D1D5DB" stroke="#4B5563" strokeWidth="2" />
                    <path d="M38 24 L 44 20 L 44 28 Z" fill="#D1D5DB" stroke="#4B5563" strokeWidth="1" />
                    <circle cx="16" cy="22" r="2" fill="#000" />
                </g>
            )}

            {type === ItemType.STRING && (
                <g>
                    <path d="M20 10 Q 30 14, 16 20 Q 8 28, 24 30 Q 34 32, 28 40" stroke="#F3F4F6" strokeWidth="2" fill="none" />
                </g>
            )}

            {type === ItemType.BOW && (
                <g transform="rotate(-45 24 24)">
                    <path d="M16 12 Q 36 24, 16 36" stroke="#5D4037" strokeWidth="3" fill="none" />
                    <line x1="16" y1="12" x2="16" y2="36" stroke="#F3F4F6" strokeWidth="1" />
                </g>
            )}

            {type === ItemType.ARROW && (
                <g transform="rotate(45 24 24)">
                    <line x1="12" y1="24" x2="36" y2="24" stroke="#5D4037" strokeWidth="2" />
                    <path d="M32 20 L 36 24 L 32 28" stroke="#9CA3AF" strokeWidth="2" fill="none" />
                    <path d="M12 24 L 8 20 M 12 24 L 8 28" stroke="#F3F4F6" strokeWidth="2" />
                </g>
            )}

            {type === ItemType.POISON_ARROW && (
                <g transform="rotate(45 24 24)">
                    <line x1="12" y1="24" x2="36" y2="24" stroke="#5D4037" strokeWidth="2" />
                    <path d="M32 20 L 36 24 L 32 28" stroke="#22C55E" strokeWidth="2" fill="none" />
                    <path d="M12 24 L 8 20 M 12 24 L 8 28" stroke="#F3F4F6" strokeWidth="2" />
                    <circle cx="34" cy="24" r="1.5" fill="#4ADE80" />
                </g>
            )}

            {type === ItemType.SNOWBALL && (
                <g>
                    <circle cx="24" cy="24" r="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2"/>
                    <path d="M20 20 Q 24 16 28 20" stroke="#CBD5E1" strokeWidth="2" fill="none"/>
                </g>
            )}

            {type === ItemType.SNOW_BLOCK && (
                <g>
                    <rect x="8" y="8" width="32" height="32" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2"/>
                    <path d="M8 8H40V14H8V8Z" fill="#E2E8F0"/>
                </g>
            )}

            {type === ItemType.PINE_SAPLING && (
                <g>
                    <path d="M24 40V20" stroke="#064E3B" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M24 20L16 32H32L24 20Z" fill="#10B981" stroke="#065F46" strokeWidth="2"/>
                    <path d="M24 28L18 36H30L24 28Z" fill="#34D399" stroke="#065F46" strokeWidth="2"/>
                </g>
            )}

            {type === ItemType.RABBIT_LEG && (
                <g>
                    <path d="M14 16 Q 10 24, 16 36 Q 22 40, 30 36 L 36 12 Q 28 8, 14 16 Z" fill="#FCA5A5" stroke="#B91C1C" strokeWidth="2" />
                    <circle cx="34" cy="14" r="2" fill="#FEE2E2" />
                </g>
            )}

            {type === ItemType.BACKPACK && (
                <g>
                    <rect x="10" y="10" width="28" height="30" rx="4" fill="#854D0E" stroke="#422006" strokeWidth="2"/>
                    {/* Flap */}
                    <path d="M10 16 H 38 L 34 26 H 14 Z" fill="#A16207" stroke="#422006" strokeWidth="2" />
                    {/* Straps */}
                    <rect x="18" y="26" width="4" height="8" fill="#422006" rx="1"/>
                    <rect x="26" y="26" width="4" height="8" fill="#422006" rx="1"/>
                </g>
            )}
        </svg>
    );
};

export default ItemGraphic;