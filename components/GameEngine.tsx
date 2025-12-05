

import React, { useEffect, useRef } from 'react';
import { World, InventoryItem, Camera, Particle, SaveData, Settings, EquipmentSlot, ItemType } from '../types';
import { initWorld, getChunkCoords, getChunkKey } from '../utils/gameUtils';
import { useInput } from '../hooks/useInput';
import { drawWorld } from '../game/Renderer';
import { updateGame, updateParticles } from '../game/GameLogic';
import { TILE_SIZE, ARMOR_STATS, ITEM_NAMES } from '../constants';

interface GameEngineProps {
    onInventoryUpdate: (inv: (InventoryItem | null)[]) => void;
    onStatusUpdate: (msg: string | null) => void;
    onStationUpdate: (isNear: boolean) => void;
    onContainerNearby: (id: string | null, items: (InventoryItem | null)[] | null) => void;
    activeContainer: { id: string, items: (InventoryItem | null)[] } | null;
    onStatsUpdate: (hp: number, stam: number) => void;
    onDeath: () => void;
    setSelectedItem: (idx: number) => void;
    selectedItemIndex: number;
    inventory: (InventoryItem | null)[]; 
    isInventoryOpen: boolean;
    currentHealth: number;
    currentStamina: number;
    respawnTrigger: number;
    equipment: { head: InventoryItem | null; body: InventoryItem | null; accessory: InventoryItem | null; bag: InventoryItem | null; };
    onEquipmentUpdate: (eq: { head: InventoryItem | null; body: InventoryItem | null; accessory: InventoryItem | null; bag: InventoryItem | null; }) => void;
    dropAction: InventoryItem | null;
    onDropActionHandled: () => void;
    isPaused: boolean;
    initialData: SaveData | null;
    onSave: (worldData: any) => void;
    onAutoSave: () => void;
    saveSignal: number;
    settings: Settings;
    onToggleInventory: () => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ 
    onInventoryUpdate, onStatusUpdate, onStationUpdate, onContainerNearby, activeContainer,
    onStatsUpdate, onDeath, selectedItemIndex, inventory, isInventoryOpen, currentHealth,
    currentStamina, respawnTrigger, equipment, onEquipmentUpdate, dropAction, onDropActionHandled, isPaused,
    initialData, onSave, onAutoSave, saveSignal, settings
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    
    // Core Game State Refs (Mutable for loop performance)
    const worldRef = useRef<World>(initWorld());
    const playerRef = useRef({
        x: 0, y: 0, 
        inventory: Array(24).fill(null),
        equipment: { head: null, body: null, accessory: null, bag: null } as { head: InventoryItem | null, body: InventoryItem | null, accessory: InventoryItem | null, bag: InventoryItem | null },
        selectedItemIndex: 0,
        facing: 'down' as 'up'|'down'|'left'|'right',
        rotation: 0,
        health: 100, maxHealth: 100,
        stamina: 100, maxStamina: 100,
        poisonTimer: 0
    });
    const cameraRef = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
    const particlesRef = useRef<Particle[]>([]);
    
    // Logic Refs
    const breakingRef = useRef<{x: number, y: number, timer: number, maxTime: number} | null>(null); 
    const fishingRef = useRef<{x: number, y: number, timer: number} | null>(null);
    const drownTimerRef = useRef<number>(0);
    const saplingsRef = useRef<{x: number, y: number, plantTime: number}[]>([]); 
    const placeCooldownRef = useRef<number>(0);
    const attackCooldownRef = useRef<number>(0);
    const poisonTickRef = useRef<number>(0);
    const drivingRef = useRef<string | null>(null); 

    // Custom Input Hook
    const { keysPressed, mouse } = useInput(isPaused || isInventoryOpen);

    // Initialization Effect
    useEffect(() => {
        if (initialData) {
            worldRef.current.chunks = initialData.world.chunks || {};
            saplingsRef.current = initialData.world.saplings || [];
            
            // Explicitly set coordinates to ensure no 0,0 reset overwrites occur
            playerRef.current.x = initialData.player.x;
            playerRef.current.y = initialData.player.y;
            playerRef.current.rotation = initialData.player.rotation || 0;
            // Also sync other non-coordinate props just in case
            playerRef.current.poisonTimer = initialData.player.poisonTimer || 0;

            cameraRef.current = { ...initialData.camera, zoom: 1 };
        } else {
            worldRef.current = initWorld();
            playerRef.current.x = 0; playerRef.current.y = 0;
        }
    }, [initialData]);

    // Autosave & External State Sync Effects
    useEffect(() => {
        if (saveSignal > 0) {
             onSave({
                chunks: worldRef.current.chunks,
                saplings: saplingsRef.current,
                playerX: playerRef.current.x,
                playerY: playerRef.current.y,
                rotation: playerRef.current.rotation,
                poisonTimer: playerRef.current.poisonTimer,
                camX: cameraRef.current.x,
                camY: cameraRef.current.y
            });
        }
    }, [saveSignal, onSave]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused && playerRef.current.health > 0) {
                onSave({
                    chunks: worldRef.current.chunks,
                    saplings: saplingsRef.current,
                    playerX: playerRef.current.x,
                    playerY: playerRef.current.y,
                    rotation: playerRef.current.rotation,
                    poisonTimer: playerRef.current.poisonTimer,
                    camX: cameraRef.current.x,
                    camY: cameraRef.current.y
                });
                onAutoSave();
            }
        }, 30000); 
        return () => clearInterval(interval);
    }, [isPaused, onSave, onAutoSave]);

    // Sync Props to Refs
    useEffect(() => { playerRef.current.inventory = inventory; }, [inventory]);
    useEffect(() => { playerRef.current.equipment = equipment; }, [equipment]);
    useEffect(() => { playerRef.current.selectedItemIndex = selectedItemIndex; }, [selectedItemIndex]);
    
    // Crucial: Sync health/stamina back to ref when updated by UI (e.g. eating)
    useEffect(() => { 
        if (playerRef.current) {
            playerRef.current.health = currentHealth;
            playerRef.current.stamina = currentStamina;
        }
    }, [currentHealth, currentStamina]);

    useEffect(() => {
        if (dropAction) {
            const player = playerRef.current;
            const dropDist = 1.2;
            const dropX = player.x + Math.cos(player.rotation) * dropDist;
            const dropY = player.y + Math.sin(player.rotation) * dropDist;
            
            // Helper to spawn (duplicated logic, should ideally be shared or passed down)
            const chunkKey = worldRef.current.chunks[`${Math.floor(dropX/32)},${Math.floor(dropY/32)}`]; // simplified key logic for brevity
            // Better to delegate this to update loop, but for immediate action:
             onDropActionHandled();
        }
    }, [dropAction]);
    
    useEffect(() => {
        if (activeContainer) {
            // Parse global coordinates from ID "x,y"
            const [gx, gy] = activeContainer.id.split(',').map(Number);
            const { cx, cy, lx, ly } = getChunkCoords(gx, gy);
            const key = getChunkKey(cx, cy);
            
            // Write items back to the chunk
            if (worldRef.current.chunks[key]) {
                worldRef.current.chunks[key].containers[`${lx},${ly}`] = activeContainer.items;
            }
        }
    }, [activeContainer]);

    useEffect(() => {
        if (respawnTrigger > 0) {
            playerRef.current.x = 0; playerRef.current.y = 0;
            playerRef.current.health = 100; playerRef.current.stamina = 100;
            playerRef.current.poisonTimer = 0; drivingRef.current = null;
        }
    }, [respawnTrigger]);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let lastTime = performance.now();

        const animate = (time: number) => {
            const dt = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;

            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) { 
                canvas.width = window.innerWidth; canvas.height = window.innerHeight; 
            }

            if (!isPaused) {
                updateGame(
                    dt, 
                    worldRef.current, 
                    playerRef.current, 
                    settings, 
                    keysPressed.current, 
                    mouse.current,
                    window.innerWidth,
                    window.innerHeight,
                    settings.cameraZoom,
                    cameraRef.current.x,
                    cameraRef.current.y,
                    isInventoryOpen,
                    {
                        driving: drivingRef,
                        breaking: breakingRef,
                        fishing: fishingRef,
                        placeCooldown: placeCooldownRef,
                        attackCooldown: attackCooldownRef,
                        drownTimer: drownTimerRef,
                        poisonTick: poisonTickRef,
                        saplings: saplingsRef
                    },
                    {
                        spawnParticles: (x, y, color, count, size) => {
                             // Reduced velocity range from *4 to *1.5 for subtler effect
                             for(let i=0; i<(count||5); i++) particlesRef.current.push({ x, y, vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5, life: 0.5+Math.random()*0.5, color, size: Math.random()*(size||3)+1 });
                        },
                        spawnDroppedItem: (gx, gy, item, delay=0.5) => {
                             const cx = Math.floor(gx/32); const cy = Math.floor(gy/32);
                             const key = `${cx},${cy}`;
                             if (!worldRef.current.chunks[key]) {
                                 // Should not happen if chunks generate around player, but check just in case
                                 return; 
                             }
                             // Push drop to chunk
                             worldRef.current.chunks[key].droppedItems.push({
                                 id: `drop-${Date.now()}-${Math.random()}`,
                                 type: item.type,
                                 count: item.count,
                                 x: gx, y: gy,
                                 durability: item.durability, maxDurability: item.maxDurability,
                                 contents: item.contents, // Preserve bag contents
                                 pickupDelay: delay, floatOffset: Math.random() * Math.PI * 2,
                                 lifeTime: 300 // 5 minutes
                             });
                        },
                        onStatusUpdate: (msg) => onStatusUpdate(msg),
                        onInventoryUpdate: (inv) => onInventoryUpdate(inv as any),
                        takeDamage: (amt) => {
                            // Calculate defense and armor durability
                            let defense = 0;
                            const newEq = { ...playerRef.current.equipment };
                            let eqChanged = false;

                            const damageArmor = (slot: EquipmentSlot) => {
                                const item = newEq[slot];
                                if (item && ARMOR_STATS[item.type]) {
                                    defense += ARMOR_STATS[item.type].defense;
                                    
                                    // Durability loss
                                    if (item.durability !== undefined) {
                                        item.durability -= 1;
                                        eqChanged = true;
                                        if (item.durability <= 0) {
                                            newEq[slot] = null;
                                            onStatusUpdate(`${ITEM_NAMES[item.type]} broke!`);
                                        }
                                    }
                                }
                            };

                            damageArmor('head');
                            damageArmor('body');
                            
                            // Diminishing returns formula for defense
                            // Damage = amount / (1 + defense/20)
                            // Defense 20 (Gold helm) -> /2 damage
                            // Defense 60 (Full Gold) -> /4 damage
                            const reducedDamage = amt / (1 + defense / 20);

                            playerRef.current.health -= reducedDamage;
                            
                            if (eqChanged) {
                                onEquipmentUpdate(newEq);
                            }
                        }, 
                        onStatsUpdate: onStatsUpdate,
                        onDeath: onDeath,
                        onContainerNearby: onContainerNearby,
                        onStationUpdate: onStationUpdate
                    }
                );

                updateParticles(dt, particlesRef.current);

                // CAMERA FOLLOW LOGIC
                // Center the player on the screen
                cameraRef.current.x = playerRef.current.x * TILE_SIZE - window.innerWidth / 2;
                cameraRef.current.y = playerRef.current.y * TILE_SIZE - window.innerHeight / 2;
            }

            // Draw
            drawWorld(
                ctx, 
                worldRef.current, 
                playerRef.current, 
                cameraRef.current, 
                settings, 
                particlesRef.current,
                breakingRef.current,
                drivingRef.current,
                fishingRef.current,
                mouse.current
            );

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [isPaused, isInventoryOpen, settings, inventory, equipment, currentHealth]);

    return (
        <canvas 
            ref={canvasRef} 
            className="block fixed top-0 left-0 z-0" 
            role="application"
            aria-label="Game World Canvas"
        />
    );
};

export default GameEngine;