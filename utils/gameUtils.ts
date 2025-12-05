

import { TileType, Chunk, World, EntityType, Entity, WorldSeedConfig, InventoryItem, ItemType } from "../types";
import { CHUNK_SIZE, COW_STATS, SNAKE_STATS, SCORPION_STATS, SPIDER_STATS, POISON_SPIDER_STATS, CONTAINER_SIZE, RABBIT_STATS, POISON_SNAKE_STATS } from "../constants";

export const dist = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

// --- World Randomization Configuration ---
// This config is now dynamic and can be set when loading a game.
let currentConfig: WorldSeedConfig = {
    seed: Math.random() * 10000,
    seedY: Math.random() * 10000,
    rotation: Math.random() * Math.PI * 2,
    tempOffset: 0,
    mountainOffset: 0
};

export const setWorldConfig = (config: WorldSeedConfig) => {
    currentConfig = config;
};

export const getRandomConfig = (): WorldSeedConfig => ({
    seed: Math.random() * 10000,
    seedY: Math.random() * 10000,
    rotation: Math.random() * Math.PI * 2,
    tempOffset: (Math.random() - 0.5) * 0.15, // +/- 0.075 bias to temperature
    mountainOffset: (Math.random() - 0.5) * 0.1 // +/- 0.05 bias to mountain density
});

// Simple pseudo-random hash based on coordinates
const hash = (x: number, y: number) => {
    let h = Math.sin(x * 12.9898 + y * 78.233 + currentConfig.seed) * 43758.5453123;
    return h - Math.floor(h);
};

// Simple multi-frequency noise for terrain
// Added 'offset' to generate different maps (elevation, temperature)
const noise = (x: number, y: number, offset: number = 0) => {
    const scale1 = 0.05;
    const scale2 = 0.02;
    
    const COS_R = Math.cos(currentConfig.rotation);
    const SIN_R = Math.sin(currentConfig.rotation);
    
    // Apply World Rotation to input coordinates
    // This ensures "North" is different in every seed
    const rx = x * COS_R - y * SIN_R;
    const ry = x * SIN_R + y * COS_R;

    // Use distinct seeds for X and Y to prevent diagonal symmetry
    const xo = rx + offset + currentConfig.seed;
    const yo = ry + offset + currentConfig.seedY;

    let val = Math.sin(xo * scale1) * Math.cos(yo * scale1);
    val += Math.sin(xo * scale2 + yo * scale2) * 0.5;
    val += Math.cos(xo * 0.1 + yo * 0.1) * 0.2;
    return val; 
};

export const getChunkKey = (cx: number, cy: number) => `${cx},${cy}`;

export const getGlobalCoords = (cx: number, cy: number, lx: number, ly: number) => {
    return { x: cx * CHUNK_SIZE + lx, y: cy * CHUNK_SIZE + ly };
};

export const getChunkCoords = (gx: number, gy: number) => {
    const cx = Math.floor(gx / CHUNK_SIZE);
    const cy = Math.floor(gy / CHUNK_SIZE);
    // Correct modulo for negative numbers
    const lx = ((gx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const ly = ((gy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return { cx, cy, lx, ly, key: getChunkKey(cx, cy) };
};

const generateSpiderChestLoot = (): (InventoryItem | null)[] => {
    const loot: (InventoryItem | null)[] = Array(CONTAINER_SIZE).fill(null);
    const potentialLoot = [
        { type: ItemType.IRON_SWORD, chance: 0.1, min: 1, max: 1 },
        { type: ItemType.IRON_PICKAXE, chance: 0.1, min: 1, max: 1 },
        { type: ItemType.IRON_AXE, chance: 0.1, min: 1, max: 1 },
        { type: ItemType.ARMOR_IRON, chance: 0.05, min: 1, max: 1 },
        { type: ItemType.HELMET_IRON, chance: 0.05, min: 1, max: 1 },
        { type: ItemType.SNAKE_FANG, chance: 0.4, min: 1, max: 3 },
        { type: ItemType.COBWEB, chance: 0.5, min: 2, max: 8 },
        { type: ItemType.BREAD, chance: 0.3, min: 1, max: 2 },
        { type: ItemType.RUBY, chance: 0.15, min: 1, max: 2 },
        { type: ItemType.IRON, chance: 0.25, min: 1, max: 4 },
        { type: ItemType.ARROW, chance: 0.4, min: 5, max: 15 },
        { type: ItemType.POISON_ARROW, chance: 0.1, min: 5, max: 10 }
    ];

    potentialLoot.forEach(entry => {
        if (Math.random() < entry.chance) {
            // Find random empty slot
            let slot = Math.floor(Math.random() * CONTAINER_SIZE);
            // Simple linear probe to find empty slot
            for(let i=0; i<CONTAINER_SIZE; i++) {
                if (loot[slot] === null) {
                    const count = Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min;
                    loot[slot] = { type: entry.type, count };
                    break;
                }
                slot = (slot + 1) % CONTAINER_SIZE;
            }
        }
    });

    return loot;
};

export const generateChunk = (cx: number, cy: number): Chunk => {
  const tiles: number[][] = [];
  const objects: Record<string, number> = {};
  const containers: Record<string, (InventoryItem | null)[]> = {};
  const entities: Entity[] = [];

  for (let y = 0; y < CHUNK_SIZE; y++) {
    const row: number[] = [];
    for (let x = 0; x < CHUNK_SIZE; x++) {
        const gx = cx * CHUNK_SIZE + x;
        const gy = cy * CHUNK_SIZE + y;
        
        // Base Noise Generation
        let elevation = noise(gx, gy, 0);
        // Temperature Noise (Large scale for biomes)
        let temperature = noise(gx * 0.5, gy * 0.5, 5000); 
        // Vegetation Density (Medium scale)
        const vegetation = noise(gx, gy, 9999);
        // Mountain Noise (Increased frequency for smaller mountains)
        let mountains = noise(gx * 1.0, gy * 1.0, 20000);
        
        // --- Spawn Area Blending ---
        // Ensure the area around 0,0 is always safe Grass/Plains by blending noise values
        // towards "ideal" states. This logic happens in unrotated space to guarantee safe start.
        const distToSpawn = Math.sqrt(gx * gx + gy * gy);
        const spawnRadius = 20;
        
        if (distToSpawn < spawnRadius) {
            const blendFactor = 1 - (distToSpawn / spawnRadius); // 1.0 at center, 0.0 at edge
            
            // Push elevation towards 0.5 (Land)
            elevation = elevation * (1 - blendFactor) + 0.5 * blendFactor;
            
            // Push mountains towards -1.0 (No mountains)
            mountains = mountains * (1 - blendFactor) + (-1.0) * blendFactor;
            
            // Push temperature towards 0.0 (Plains)
            temperature = temperature * (1 - blendFactor) + 0.0 * blendFactor;
        }

        // Apply Random Global Offsets to Biome Thresholds
        const isDesert = (temperature + currentConfig.tempOffset) > 0.2; 
        const isTaiga = (temperature + currentConfig.tempOffset) < -0.3; // Taiga Threshold
        const isMountain = (mountains + currentConfig.mountainOffset) > 0.55; 
        const isSpawn = distToSpawn < 5; 

        let tile = TileType.GRASS;
        
        if (elevation > 0.8) {
            tile = TileType.WATER;
        } else if (elevation > 0.65) {
            // Shoreline
            if (isMountain) {
                // Cliffs in mountains, no beach
                tile = TileType.MOUNTAIN;
            } else if (isTaiga) {
                tile = TileType.SNOW; // Frozen shore
            } else {
                tile = TileType.SAND; // Beach
            }
        } else {
            // Land
            if (isMountain) tile = TileType.MOUNTAIN;
            else if (isTaiga) tile = TileType.SNOW;
            else if (isDesert) tile = TileType.SAND;
            else tile = TileType.GRASS;
        }
        
        row.push(tile);

        // Object Generation
        const key = `${x},${y}`;
        const h = hash(gx, gy);
        
        // Don't spawn objects in the very center to avoid getting stuck
        if (!isSpawn) {
            if (tile === TileType.MOUNTAIN) {
                // Spider Nest Logic
                const nestNoise = noise(gx * 0.6, gy * 0.6, 8888);
                const isSpiderNest = nestNoise > 0.15; 

                // 1. Standard Mountain Resources (Priority)
                if (h < 0.1) objects[key] = TileType.ROCK;
                else if (h < 0.25) objects[key] = TileType.IRON_ORE;
                // Rare Gold Ore
                else if (h < 0.28) objects[key] = TileType.GOLD_ORE;
                
                // 2. Chests in Spider Nests
                else if (isSpiderNest && h > 0.985) {
                    objects[key] = TileType.CHEST;
                    containers[key] = generateSpiderChestLoot();
                }

                // 3. Cobwebs (Only in empty space in nests)
                else if (isSpiderNest && h < 0.65) { 
                    objects[key] = TileType.COBWEB;
                }

                // 4. Spiders (Groups)
                if (isSpiderNest && h > 0.95 && h <= 0.985) { 
                     const groupSize = Math.floor(Math.random() * 2) + 2; // 2 to 3
                     for(let i=0; i<groupSize; i++) {
                        const offX = (Math.random() - 0.5) * 2;
                        const offY = (Math.random() - 0.5) * 2;
                        const isPoison = Math.random() > 0.7; // 30% poison chance in group
                        
                        entities.push({
                            id: `spider-${gx}-${gy}-${i}-${Math.random()}`,
                            type: isPoison ? EntityType.POISON_SPIDER : EntityType.SPIDER,
                            x: gx + 0.5 + offX,
                            y: gy + 0.5 + offY,
                            health: isPoison ? POISON_SPIDER_STATS.maxHealth : SPIDER_STATS.maxHealth,
                            maxHealth: isPoison ? POISON_SPIDER_STATS.maxHealth : SPIDER_STATS.maxHealth,
                            state: 'idle',
                            stateTimer: Math.random() * 5 + 2,
                            facing: Math.random() > 0.5 ? 'left' : 'right',
                            drownTimer: 0
                        });
                     }
                }

            } else if (tile === TileType.GRASS) {
                // Plains Objects
                if (vegetation > 0.3) {
                    // Dense
                    if (h < 0.1) objects[key] = TileType.TREE;
                    else if (h < 0.13) objects[key] = TileType.ROCK;
                    else if (h < 0.16) objects[key] = TileType.BUSH;

                    // Snakes in grassy areas (Groups)
                    if (vegetation > 0.4 && h > 0.99) {
                        const groupSize = Math.floor(Math.random() * 2) + 1; // 1 to 2
                        for(let i=0; i<groupSize; i++) {
                            const offX = (Math.random() - 0.5) * 1.5;
                            const offY = (Math.random() - 0.5) * 1.5;
                            const isPoison = Math.random() < 0.3; // 30% chance of poison snake
                            
                            entities.push({
                                id: `snake-${gx}-${gy}-${i}-${Math.random()}`,
                                type: isPoison ? EntityType.POISON_SNAKE : EntityType.SNAKE,
                                x: gx + 0.5 + offX,
                                y: gy + 0.5 + offY,
                                health: isPoison ? POISON_SNAKE_STATS.maxHealth : SNAKE_STATS.maxHealth,
                                maxHealth: isPoison ? POISON_SNAKE_STATS.maxHealth : SNAKE_STATS.maxHealth,
                                state: 'idle',
                                stateTimer: Math.random() * 5 + 2,
                                facing: Math.random() > 0.5 ? 'left' : 'right',
                                drownTimer: 0
                            });
                        }
                    }
                } else {
                    // Sparse / Meadow
                    if (h < 0.02) objects[key] = TileType.TREE; 
                    else if (h < 0.03) objects[key] = TileType.ROCK;
                    else if (h < 0.3) objects[key] = TileType.TALL_GRASS; 
                }
                
                // Very rare iron on grass
                if (!objects[key] && h > 0.998) {
                     objects[key] = TileType.IRON_ORE;
                }

                // Cows
                if (h > 0.992 && h < 0.996) { 
                    entities.push({
                        id: `cow-${gx}-${gy}-${Math.random()}`,
                        type: EntityType.COW,
                        x: gx + 0.5,
                        y: gy + 0.5,
                        health: COW_STATS.maxHealth,
                        maxHealth: COW_STATS.maxHealth,
                        state: 'idle',
                        stateTimer: Math.random() * 5 + 2,
                        facing: Math.random() > 0.5 ? 'left' : 'right',
                        drownTimer: 0
                    });
                }
            } else if (tile === TileType.SAND) {
                if (elevation > 0.65 && !isMountain && !isTaiga) {
                    // Beach Objects
                    if (h < 0.02) objects[key] = TileType.CLAM;
                } else if (isDesert) {
                    // Desert Land Objects
                    if (h < 0.03) objects[key] = TileType.CACTUS;
                    else if (h < 0.04) objects[key] = TileType.ROCK;

                    // Scorpions
                    if (h > 0.996) {
                        entities.push({
                            id: `scorpion-${gx}-${gy}-${Math.random()}`,
                            type: EntityType.SCORPION,
                            x: gx + 0.5,
                            y: gy + 0.5,
                            health: SCORPION_STATS.maxHealth,
                            maxHealth: SCORPION_STATS.maxHealth,
                            state: 'idle',
                            stateTimer: Math.random() * 5 + 2,
                            facing: Math.random() > 0.5 ? 'left' : 'right',
                            drownTimer: 0
                        });
                    }
                }
            } else if (tile === TileType.SNOW) {
                // Taiga Objects
                 if (vegetation > 0.2) {
                     if (h < 0.1) objects[key] = TileType.PINE_TREE;
                     else if (h < 0.12) objects[key] = TileType.ROCK;
                     else if (h < 0.16) objects[key] = TileType.BUSH; // Berries grow in taiga too
                     else if (h < 0.25) objects[key] = TileType.SNOW_PILE;
                 } else {
                     if (h < 0.02) objects[key] = TileType.PINE_TREE;
                     else if (h < 0.03) objects[key] = TileType.ROCK;
                     else if (h < 0.15) objects[key] = TileType.SNOW_PILE;
                 }

                 // Rabbits (More common than cows)
                 if (h > 0.99 && h < 0.996) {
                     entities.push({
                         id: `rabbit-${gx}-${gy}-${Math.random()}`,
                         type: EntityType.RABBIT,
                         x: gx + 0.5,
                         y: gy + 0.5,
                         health: RABBIT_STATS.maxHealth,
                         maxHealth: RABBIT_STATS.maxHealth,
                         state: 'idle',
                         stateTimer: Math.random() * 5 + 2,
                         facing: Math.random() > 0.5 ? 'left' : 'right',
                         drownTimer: 0
                     });
                 }
                 
                 // Cows in Taiga (Less common than in plains)
                 if (h > 0.997 && h < 0.999) { 
                    entities.push({
                        id: `cow-taiga-${gx}-${gy}-${Math.random()}`,
                        type: EntityType.COW,
                        x: gx + 0.5,
                        y: gy + 0.5,
                        health: COW_STATS.maxHealth,
                        maxHealth: COW_STATS.maxHealth,
                        state: 'idle',
                        stateTimer: Math.random() * 5 + 2,
                        facing: Math.random() > 0.5 ? 'left' : 'right',
                        drownTimer: 0
                    });
                }
            }
        }
    }
    tiles.push(row);
  }

  // Initialize terrainCache as null
  return { x: cx, y: cy, tiles, objects, containers, entities, droppedItems: [], terrainCache: null };
};

export const initWorld = (): World => {
    return { chunks: {} };
};