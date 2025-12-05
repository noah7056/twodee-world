

import { World, Player, Entity, EntityType, DroppedItem, TileType, ItemType, InventoryItem, Settings, Particle } from '../types';
import { 
    TILE_SIZE, CHUNK_SIZE, PLAYER_SPEED, RUN_SPEED_MULTIPLIER, WATER_SPEED_MULTIPLIER, 
    COBWEB_SPEED_MULTIPLIER, SNOW_SPEED_MULTIPLIER, STAMINA_DRAIN_RATE, DROWN_DELAY, DROWN_DAMAGE, POISON_CONFIG, 
    BUSH_DAMAGE, CACTUS_DAMAGE, BOAT_STATS, MAX_STACK_SIZE, ITEM_NAMES, COLORS, 
    COLLIDABLE_TILES, INTERACTABLE_TILES, BREAK_TIMES, TOOL_CONFIG, COW_STATS, 
    SNAKE_STATS, SCORPION_STATS, SPIDER_STATS, POISON_SPIDER_STATS, CONTAINER_SIZE, GROWTH_TIME,
    CHARM_CONFIG, ARROW_STATS, SNOWBALL_STATS, RABBIT_STATS, POISON_ARROW_STATS, POISON_SNAKE_STATS
} from '../constants';
import { getChunkCoords, getChunkKey, generateChunk, dist } from '../utils/gameUtils';

// Helper to access world
const getTileAt = (world: World, gx: number, gy: number) => {
    const { key, lx, ly } = getChunkCoords(gx, gy);
    return world.chunks[key]?.tiles[ly][lx] ?? null;
};
const getObjectAt = (world: World, gx: number, gy: number) => {
    const { key, lx, ly } = getChunkCoords(gx, gy);
    return world.chunks[key]?.objects[`${lx},${ly}`];
};
const getContainerAt = (world: World, gx: number, gy: number) => {
    const { key, lx, ly } = getChunkCoords(gx, gy);
    return world.chunks[key]?.containers[`${lx},${ly}`];
};
const setTileAt = (world: World, gx: number, gy: number, type: number) => {
    const { key, lx, ly } = getChunkCoords(gx, gy);
    if (world.chunks[key]) {
        world.chunks[key].tiles[ly][lx] = type;
        world.chunks[key].terrainCache = null;
    }
};
const setObjectAt = (world: World, gx: number, gy: number, type: number) => {
    const { key, lx, ly } = getChunkCoords(gx, gy);
    if (world.chunks[key]) world.chunks[key].objects[`${lx},${ly}`] = type;
};
const removeObjectAt = (world: World, gx: number, gy: number) => {
    const { key, lx, ly } = getChunkCoords(gx, gy);
    if (world.chunks[key]) delete world.chunks[key].objects[`${lx},${ly}`];
};
const setContainerAt = (world: World, gx: number, gy: number, items: (InventoryItem | null)[]) => {
    const { key, lx, ly } = getChunkCoords(gx, gy);
    if (world.chunks[key]) world.chunks[key].containers[`${lx},${ly}`] = items;
};
const removeContainerAt = (world: World, gx: number, gy: number) => {
    const { key, lx, ly } = getChunkCoords(gx, gy);
    if (world.chunks[key]) delete world.chunks[key].containers[`${lx},${ly}`];
};

const checkCollision = (world: World, x: number, y: number) => {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    const tile = getTileAt(world, tileX, tileY);
    const obj = getObjectAt(world, tileX, tileY);
    if (tile === null) return true; 
    if (tile === TileType.WATER) return false;
    // Allow walking through these
    if (obj === TileType.CLAM || obj === TileType.SAPLING || obj === TileType.PINE_SAPLING || obj === TileType.BUSH_SAPLING || obj === TileType.BUSH || obj === TileType.TALL_GRASS || obj === TileType.COBWEB || obj === TileType.WHEAT_CROP || obj === TileType.WHEAT_PLANT || obj === TileType.SNOW_PILE || obj === TileType.SNOW_BLOCK) return false;
    return COLLIDABLE_TILES.includes(tile) || (obj !== undefined && COLLIDABLE_TILES.includes(obj));
};

interface UpdateCallbacks {
    spawnParticles: (x: number, y: number, color: string, count?: number, size?: number) => void;
    spawnDroppedItem: (gx: number, gy: number, item: InventoryItem, delay?: number) => void;
    onStatusUpdate: (msg: string) => void;
    onInventoryUpdate: (inv: (InventoryItem | null)[]) => void;
    takeDamage: (amount: number) => void;
    onStatsUpdate: (hp: number, stam: number) => void;
    onDeath: () => void;
    onContainerNearby: (id: string | null, items: (InventoryItem | null)[] | null) => void;
    onStationUpdate: (isNear: boolean) => void;
}

export const updateParticles = (deltaTime: number, particles: Particle[]) => {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= deltaTime;
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
};

export const updateGame = (
    deltaTime: number,
    world: World,
    player: Player,
    settings: Settings,
    keys: Record<string, boolean>,
    mouse: { x: number, y: number, leftDown: boolean, rightDown: boolean },
    screenW: number,
    screenH: number,
    zoom: number,
    camX: number,
    camY: number,
    isInventoryOpen: boolean,
    refs: {
        driving: { current: string | null },
        breaking: { current: {x: number, y: number, timer: number, maxTime: number} | null },
        fishing: { current: {x: number, y: number, timer: number} | null },
        placeCooldown: { current: number },
        attackCooldown: { current: number },
        drownTimer: { current: number },
        poisonTick: { current: number },
        saplings: { current: any[] }
    },
    callbacks: UpdateCallbacks
) => {
    if (player.health <= 0) {
        // Drop inventory on death
        player.inventory.forEach(item => { if (item) callbacks.spawnDroppedItem(player.x, player.y, item); });
        if (player.equipment.head) callbacks.spawnDroppedItem(player.x, player.y, player.equipment.head);
        if (player.equipment.body) callbacks.spawnDroppedItem(player.x, player.y, player.equipment.body);
        if (player.equipment.accessory) callbacks.spawnDroppedItem(player.x, player.y, player.equipment.accessory);
        refs.driving.current = null;
        callbacks.onDeath();
        return;
    }

    // --- Dynamic Chunk Management (Zoom Adaptive) ---
    const { cx, cy } = getChunkCoords(player.x, player.y);
    // Calculate how many chunks fit on screen based on zoom
    // screenW / zoom = visible world pixels. 
    // Divide by (CHUNK_SIZE * TILE_SIZE) to get chunks.
    // Add 1 for buffer.
    const chunksRadiusX = Math.ceil((screenW / zoom) / (CHUNK_SIZE * TILE_SIZE) / 2) + 1;
    const chunksRadiusY = Math.ceil((screenH / zoom) / (CHUNK_SIZE * TILE_SIZE) / 2) + 1;
    
    // Clamp to minimum 1 to ensure at least 3x3 is generated
    const rX = Math.max(1, chunksRadiusX);
    const rY = Math.max(1, chunksRadiusY);

    for (let dy = -rY; dy <= rY; dy++) {
        for (let dx = -rX; dx <= rX; dx++) {
            const key = getChunkKey(cx + dx, cy + dy);
            if (!world.chunks[key]) world.chunks[key] = generateChunk(cx + dx, cy + dy);
        }
    }

    // --- Player Movement Input ---
    let dx = 0, dy = 0;
    if (!isInventoryOpen) {
        if (keys[settings.keybinds.moveUp]) dy -= 1;
        if (keys[settings.keybinds.moveDown]) dy += 1;
        if (keys[settings.keybinds.moveLeft]) dx -= 1;
        if (keys[settings.keybinds.moveRight]) dx += 1;

        if (keys[settings.keybinds.run] && refs.driving.current) {
            refs.driving.current = null;
            player.x += 1.0; 
            callbacks.onStatusUpdate("Exited Boat");
        }

        const angle = Math.atan2(mouse.y - screenH/2, mouse.x - screenW/2);
        player.rotation = angle;
        const deg = (angle * 180) / Math.PI;
        if (deg >= -45 && deg < 45) player.facing = 'right';
        else if (deg >= 45 && deg < 135) player.facing = 'down';
        else if (deg >= -135 && deg < -45) player.facing = 'up';
        else player.facing = 'left';
    }

    const isDriving = !!refs.driving.current;
    let isMoving = (dx !== 0 || dy !== 0) && !isDriving;
    // Fix: Ensure we drain stamina if running
    const isRunning = keys[settings.keybinds.run] && player.stamina > 0 && isMoving && !isDriving;
    
    // Cancel Fishing if moving
    if (isMoving && refs.fishing.current) {
        refs.fishing.current = null;
        callbacks.onStatusUpdate("Fishing cancelled");
    }

    // --- Player Status & Physics ---
    const tileUnder = getTileAt(world, Math.floor(player.x), Math.floor(player.y));
    const objUnder = getObjectAt(world, Math.floor(player.x), Math.floor(player.y));
    const isWater = tileUnder === TileType.WATER;

    let speed = PLAYER_SPEED;
    if (isRunning) { 
        speed *= RUN_SPEED_MULTIPLIER; 
        player.stamina = Math.max(0, player.stamina - (STAMINA_DRAIN_RATE * deltaTime)); 
    } 

    // Apply Charm Speed Buff
    if (player.equipment.accessory?.type === ItemType.CHARM) {
        speed *= CHARM_CONFIG.speedMultiplier;
    }

    if (isWater && !isDriving) {
        speed *= WATER_SPEED_MULTIPLIER;
        refs.drownTimer.current += deltaTime;
        if (refs.drownTimer.current > DROWN_DELAY) { 
            callbacks.takeDamage(DROWN_DAMAGE * deltaTime); 
            if (Math.random() < 0.1) callbacks.onStatusUpdate("Drowning!"); 
        }
    } else { refs.drownTimer.current = 0; }

    // Environmental Effects
    if (objUnder === TileType.COBWEB) {
        speed *= COBWEB_SPEED_MULTIPLIER;
    }
    if (objUnder === TileType.SNOW_PILE || objUnder === TileType.SNOW_BLOCK) {
        speed *= SNOW_SPEED_MULTIPLIER;
    }
    if (objUnder === TileType.BUSH) {
        speed *= 0.6; // Slow down in bushes
        if (isMoving) {
            callbacks.takeDamage(BUSH_DAMAGE * deltaTime);
        }
    }
    
    // Cactus Damage (Solid block, so check proximity instead of "under")
    const checkCactusDamage = () => {
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        for (let y = py - 1; y <= py + 1; y++) {
            for (let x = px - 1; x <= px + 1; x++) {
                if (getObjectAt(world, x, y) === TileType.CACTUS) {
                    // Check bounding box intersection slightly larger than 1.0
                    const distToCactus = dist(player.x, player.y, x + 0.5, y + 0.5);
                    if (distToCactus < 0.8) { // 0.8 is roughly player radius (0.25) + block radius (0.5) + small epsilon
                        callbacks.takeDamage(CACTUS_DAMAGE * deltaTime);
                    }
                }
            }
        }
    };
    checkCactusDamage();

    if (player.poisonTimer > 0) {
        player.poisonTimer -= deltaTime; 
        refs.poisonTick.current += deltaTime;
        if (refs.poisonTick.current >= 1.0) { 
            callbacks.takeDamage(POISON_CONFIG.damagePerSecond); 
            callbacks.spawnParticles(player.x, player.y, '#a855f7', 4, 3); 
            refs.poisonTick.current = 0; 
        }
    }

    if (isMoving) {
        const length = Math.sqrt(dx*dx + dy*dy); 
        dx /= length; dy /= length;
        const nextX = player.x + dx * speed * deltaTime; 
        const nextY = player.y + dy * speed * deltaTime;
        if (!checkCollision(world, nextX, player.y)) player.x = nextX;
        if (!checkCollision(world, player.x, nextY)) player.y = nextY;
    }

    // --- Boat Physics ---
    for(let dy=-rY; dy<=rY; dy++) {
        for(let dx=-rX; dx<=rX; dx++) {
            const key = getChunkKey(cx+dx, cy+dy);
            const chunk = world.chunks[key];
            if(chunk) {
                for(const ent of chunk.entities) {
                    if (ent.type === EntityType.BOAT) {
                        if (ent.vx === undefined) ent.vx = 0; if (ent.vy === undefined) ent.vy = 0;
                        if (ent.id === refs.driving.current && !isInventoryOpen) {
                            let ax = 0; let ay = 0;
                            if (keys[settings.keybinds.moveUp]) ay -= 1;
                            if (keys[settings.keybinds.moveDown]) ay += 1;
                            if (keys[settings.keybinds.moveLeft]) ax -= 1;
                            if (keys[settings.keybinds.moveRight]) ax += 1;
                            if (ax !== 0 || ay !== 0) {
                                const len = Math.sqrt(ax*ax + ay*ay); ax /= len; ay /= len;
                                ent.vx += ax * BOAT_STATS.acceleration * deltaTime; ent.vy += ay * BOAT_STATS.acceleration * deltaTime;
                            }
                        }
                        ent.vx *= BOAT_STATS.friction; ent.vy *= BOAT_STATS.friction;
                        const nextX = ent.x + ent.vx * deltaTime; const nextY = ent.y + ent.vy * deltaTime;
                        const tileNextX = getTileAt(world, Math.floor(nextX), Math.floor(ent.y));
                        if (tileNextX === TileType.WATER) ent.x = nextX; else ent.vx = 0;
                        const tileNextY = getTileAt(world, Math.floor(ent.x), Math.floor(nextY));
                        if (tileNextY === TileType.WATER) ent.y = nextY; else ent.vy = 0;
                        if (Math.abs(ent.vx) > 0.1) ent.facing = ent.vx > 0 ? 'right' : 'left';
                        if (ent.id === refs.driving.current) { player.x = ent.x; player.y = ent.y; }
                    }
                }
            }
        }
    }

    // --- Interactions (Breaking/Placing/Fishing) ---
    if (!isInventoryOpen) {
        const targetX = ((mouse.x - (screenW/2)) / zoom + (screenW/2) + camX) / TILE_SIZE;
        const targetY = ((mouse.y - (screenH/2)) / zoom + (screenH/2) + camY) / TILE_SIZE;

        if (mouse.leftDown) {
            handleBreaking(deltaTime, targetX, targetY, world, player, refs, callbacks);
        } else {
            refs.breaking.current = null;
        }

        if (refs.placeCooldown.current > 0) refs.placeCooldown.current -= deltaTime;
        if (mouse.rightDown && refs.placeCooldown.current <= 0) {
            const placed = handlePlacing(targetX, targetY, world, player, refs, callbacks);
            if (placed) refs.placeCooldown.current = 0.5; // Slight delay for placement
        }
    } else {
        refs.breaking.current = null;
    }

    // --- Fishing Logic ---
    if (refs.fishing.current) {
        refs.fishing.current.timer += deltaTime;
        const fishDuration = 4.0; // Seconds to catch
        if (refs.fishing.current.timer >= fishDuration) {
            // Fish Caught
            const catchType = Math.random() > 0.5 ? ItemType.SALMON : ItemType.COD;
            const fx = refs.fishing.current.x + 0.5;
            const fy = refs.fishing.current.y + 0.5;
            callbacks.spawnDroppedItem(player.x, player.y, { type: catchType, count: 1 });
            callbacks.spawnParticles(fx, fy, '#60a5fa', 10, 3);
            callbacks.onStatusUpdate(`Caught a ${ITEM_NAMES[catchType]}!`);
            
            // Rod Durability
            const selectedItem = player.inventory[player.selectedItemIndex];
            if (selectedItem && selectedItem.type === ItemType.FISHING_ROD) {
                 const newInv = [...player.inventory];
                 const newItem = { ...selectedItem, durability: (selectedItem.durability || 1) - 1 };
                 if (newItem.durability <= 0) { 
                     newInv[player.selectedItemIndex] = null; 
                     callbacks.onStatusUpdate(`Fishing Rod broke!`); 
                 } else {
                     newInv[player.selectedItemIndex] = newItem;
                 }
                 callbacks.onInventoryUpdate(newInv);
            }
            refs.fishing.current = null;
        }
    }

    // --- Sapling/Crop Growth ---
    const now = Date.now();
    for (let i = refs.saplings.current.length - 1; i >= 0; i--) {
        const sapling = refs.saplings.current[i];
        if (now - sapling.plantTime > GROWTH_TIME) {
            const obj = getObjectAt(world, sapling.x, sapling.y);
            let grown = false;
            let newObj = null;

            if (obj === TileType.SAPLING) newObj = TileType.TREE;
            else if (obj === TileType.PINE_SAPLING) newObj = TileType.PINE_TREE;
            else if (obj === TileType.BUSH_SAPLING) newObj = TileType.BUSH;
            else if (obj === TileType.WHEAT_CROP) newObj = TileType.WHEAT_PLANT;

            if (newObj) {
                // Check if blocked by something new (though it shouldn't be since sapling is there)
                setObjectAt(world, sapling.x, sapling.y, newObj);
                callbacks.spawnParticles(sapling.x + 0.5, sapling.y + 0.5, '#4ade80', 5, 2);
                grown = true;
            }

            if (grown) {
                refs.saplings.current.splice(i, 1);
            }
        }
    }

    // --- Entities Update & Item Pickup ---
    updateEntities(deltaTime, world, player, refs, callbacks, rX, rY);

    // --- Environment Check ---
    const px = Math.floor(player.x); const py = Math.floor(player.y);
    let foundChest: string | null = null;
    let foundStation = false;
    for (let cy = py - 1; cy <= py + 1; cy++) {
        for (let cx = px - 1; cx <= px + 1; cx++) {
            const obj = getObjectAt(world, cx, cy);
            if (obj === TileType.CHEST) foundChest = `${cx},${cy}`;
            if (obj === TileType.CRAFTING_STATION) foundStation = true;
        }
    }
    callbacks.onContainerNearby(foundChest, foundChest ? (getContainerAt(world, ...foundChest.split(',').map(Number) as [number, number]) || null) : null);
    callbacks.onStationUpdate(foundStation);

    // Sync Stats back to UI
    callbacks.onStatsUpdate(player.health, player.stamina);
};

const handleBreaking = (dt: number, targetX: number, targetY: number, world: World, player: Player, refs: any, callbacks: UpdateCallbacks) => {
    const tileX = Math.floor(targetX);
    const tileY = Math.floor(targetY);
    
    // Reach Calculation
    const baseReach = 3.0;
    const reachBonus = player.equipment.accessory?.type === ItemType.CHARM ? CHARM_CONFIG.reachBonus : 0;
    const maxReach = baseReach + reachBonus;

    const selectedItem = player.inventory[player.selectedItemIndex];

    // --- PROJECTILES (BOW / SNOWBALL) ---
    const isBow = selectedItem && selectedItem.type === ItemType.BOW;
    const isSnowball = selectedItem && selectedItem.type === ItemType.SNOWBALL;

    if (isBow || isSnowball) {
        // Cooldown for projectiles
        const now = Date.now();
        if (now - refs.attackCooldown.current < 500) return; // 0.5s Fire rate
        refs.attackCooldown.current = now;

        // Determine ammo
        let ammoIdx = -1;
        let ammoType: ItemType | null = null;
        
        if (isBow) {
            // Check for Poison Arrows first (as an upgrade/variant)
            // Or prioritize normal arrow? Logic: Check what we have.
            // Let's look for poison arrows first, then regular arrows.
            const poisonArrowIdx = player.inventory.findIndex(i => i && i.type === ItemType.POISON_ARROW && i.count > 0);
            const arrowIdx = player.inventory.findIndex(i => i && i.type === ItemType.ARROW && i.count > 0);

            if (poisonArrowIdx !== -1) {
                ammoIdx = poisonArrowIdx;
                ammoType = ItemType.POISON_ARROW;
            } else if (arrowIdx !== -1) {
                ammoIdx = arrowIdx;
                ammoType = ItemType.ARROW;
            } else {
                 if (refs.breaking.current === null && Math.random() < 0.05) callbacks.onStatusUpdate("No Arrows!");
                 refs.breaking.current = null;
                 return;
            }
        } else {
             // For snowball, the item itself is ammo
             ammoIdx = player.selectedItemIndex;
             ammoType = ItemType.SNOWBALL;
        }

        // Consume Ammo
        const ammoStack = player.inventory[ammoIdx];
        if (ammoStack) {
            const newInv = [...player.inventory];
            newInv[ammoIdx] = { ...ammoStack, count: ammoStack.count - 1 };
            if (newInv[ammoIdx]!.count <= 0) newInv[ammoIdx] = null;
            callbacks.onInventoryUpdate(newInv);

            // Spawn Projectile
            const { cx, cy } = getChunkCoords(player.x, player.y);
            const key = getChunkKey(cx, cy);
            if (world.chunks[key]) {
                 const angle = Math.atan2(targetY - player.y, targetX - player.x);
                 let entityType = EntityType.SNOWBALL;
                 if (ammoType === ItemType.ARROW) entityType = EntityType.ARROW;
                 if (ammoType === ItemType.POISON_ARROW) entityType = EntityType.POISON_ARROW;

                 const stats = entityType === EntityType.SNOWBALL ? SNOWBALL_STATS : 
                               entityType === EntityType.POISON_ARROW ? POISON_ARROW_STATS : ARROW_STATS;
                 
                 world.chunks[key].entities.push({
                     id: `proj-${Date.now()}-${Math.random()}`,
                     type: entityType,
                     x: player.x,
                     y: player.y,
                     vx: Math.cos(angle) * stats.speed,
                     vy: Math.sin(angle) * stats.speed,
                     rotation: angle,
                     health: 1, maxHealth: 1, 
                     state: 'idle', stateTimer: 0, facing: 'right', drownTimer: 0
                 });
                 callbacks.spawnParticles(player.x + Math.cos(angle), player.y + Math.sin(angle), isBow ? '#E5E7EB' : '#F8FAFC', 3, 1);
            }
        }
        return; // Don't do other breaking if shooting
    }


    // Check entities interaction (Melee)
    const { cx, cy } = getChunkCoords(player.x, player.y);
    for(let dy=-1; dy<=1; dy++) {
        for(let dx=-1; dx<=1; dx++) {
            const key = getChunkKey(cx+dx, cy+dy);
            const chunk = world.chunks[key];
            if(chunk) {
                for(let i=chunk.entities.length-1; i>=0; i--) {
                    const ent = chunk.entities[i];
                    if (ent.id === refs.driving.current) continue;
                    if (ent.type === EntityType.ARROW || ent.type === EntityType.POISON_ARROW || ent.type === EntityType.SNOWBALL) continue; 
                    
                    // Apply expanded reach
                    if (dist(ent.x, ent.y, targetX, targetY) < 0.8 && dist(player.x, player.y, ent.x, ent.y) < maxReach) {
                        const now = Date.now();
                        if (now - refs.attackCooldown.current < 400) return;
                        refs.attackCooldown.current = now;
                        
                        let damage = 3;
                        if (selectedItem && TOOL_CONFIG[selectedItem.type as keyof typeof TOOL_CONFIG]) {
                            const toolConf = TOOL_CONFIG[selectedItem.type as keyof typeof TOOL_CONFIG];
                            if (toolConf.attackDamage) damage = toolConf.attackDamage;
                        }
                        
                        ent.health -= damage;
                        if (ent.type === EntityType.COW || ent.type === EntityType.RABBIT) { ent.state = 'flee'; ent.stateTimer = 2.0; } 
                        else if (ent.type === EntityType.SNAKE || ent.type === EntityType.POISON_SNAKE || ent.type === EntityType.SCORPION || ent.type === EntityType.SPIDER || ent.type === EntityType.POISON_SPIDER) { ent.state = 'chase'; ent.stateTimer = 5.0; }
                        
                        callbacks.spawnParticles(ent.x, ent.y, ent.type === EntityType.BOAT ? '#854d0e' : '#ef4444', 2, 2);
                        
                        // Universal Durability Loss on Hit
                        if (selectedItem && selectedItem.durability !== undefined) {
                             const newInv = [...player.inventory];
                             const newItem = { ...selectedItem, durability: selectedItem.durability - 1 };
                             if (newItem.durability <= 0) { 
                                 newInv[player.selectedItemIndex] = null; 
                                 callbacks.onStatusUpdate(`${ITEM_NAMES[selectedItem.type]} broke!`); 
                             } else {
                                 newInv[player.selectedItemIndex] = newItem;
                             }
                             callbacks.onInventoryUpdate(newInv);
                        }

                        if (ent.health <= 0) {
                            chunk.entities.splice(i, 1);
                            callbacks.spawnParticles(ent.x, ent.y, ent.type === EntityType.BOAT ? '#854d0e' : '#991b1b', 4, 3);
                            if (ent.type === EntityType.COW) {
                                if (Math.random() < COW_STATS.dropRateMeat) callbacks.spawnDroppedItem(ent.x, ent.y, { type: ItemType.RAW_BEEF, count: 1 });
                                if (Math.random() < COW_STATS.dropRateLeather) callbacks.spawnDroppedItem(ent.x, ent.y, { type: ItemType.LEATHER, count: 1 });
                            } else if (ent.type === EntityType.SNAKE) {
                                // Normal snake drops nothing or maybe meat? Assuming nothing/generic as per user request to differentiate
                            } else if (ent.type === EntityType.POISON_SNAKE) {
                                if (Math.random() < POISON_SNAKE_STATS.dropRateFang) callbacks.spawnDroppedItem(ent.x, ent.y, { type: ItemType.SNAKE_FANG, count: 1 });
                            } else if (ent.type === EntityType.BOAT) {
                                callbacks.spawnDroppedItem(ent.x, ent.y, { type: ItemType.BOAT, count: 1 });
                            } else if (ent.type === EntityType.RABBIT) {
                                if (Math.random() < RABBIT_STATS.dropRateLeg) callbacks.spawnDroppedItem(ent.x, ent.y, { type: ItemType.RABBIT_LEG, count: 1 });
                            }
                        }
                        return;
                    }
                }
            }
        }
    }

    if (dist(player.x, player.y, targetX, targetY) > maxReach) { refs.breaking.current = null; return; }

    const objectType = getObjectAt(world, tileX, tileY);
    const tileType = getTileAt(world, tileX, tileY);
    if (tileType === null) return;

    let targetType: number | null = null;
    if (objectType !== undefined) targetType = objectType; 
    else if (INTERACTABLE_TILES.includes(tileType)) targetType = tileType;

    if (targetType !== null) {
        // Tool validation logic
        const isPick = selectedItem && (selectedItem.type.includes('PICKAXE'));
        const isAxe = selectedItem && (selectedItem.type.includes('AXE'));
        const isSword = selectedItem && (selectedItem.type.includes('SWORD'));
        const isHardObject = [TileType.WALL_WOOD, TileType.WALL_STONE, TileType.CRAFTING_STATION, TileType.CHEST, TileType.GOLD_ORE].includes(targetType);

        if (isHardObject) {
             let validTool = false;
             if (targetType === TileType.WALL_STONE && isPick) validTool = true;
             if ((targetType === TileType.WALL_WOOD || targetType === TileType.CRAFTING_STATION || targetType === TileType.CHEST || targetType === TileType.FLOOR_WOOD) && isAxe) validTool = true;
             
             // Gold Ore Requirement: Iron Pickaxe or better (Including Gold Pickaxe if available)
             if (targetType === TileType.GOLD_ORE) {
                 if (selectedItem && (selectedItem.type === ItemType.IRON_PICKAXE || selectedItem.type === ItemType.GOLD_PICKAXE)) {
                     validTool = true;
                 } else {
                     if (refs.breaking.current === null) callbacks.onStatusUpdate("Need an Iron Pickaxe!");
                     refs.breaking.current = null;
                     return;
                 }
             }

             if (!validTool && targetType !== TileType.GOLD_ORE) {
                 if (refs.breaking.current === null) callbacks.onStatusUpdate("Need the correct tool!");
                 refs.breaking.current = null;
                 return;
             }
        }

        if (!refs.breaking.current || refs.breaking.current.x !== tileX || refs.breaking.current.y !== tileY) {
            const requiredTime = BREAK_TIMES[targetType] || 1.0;
            let speedMultiplier = 1.0;
            // Tool speed logic...
             if (selectedItem) {
                 if (targetType === TileType.TREE || targetType === TileType.PINE_TREE || targetType === TileType.CACTUS || targetType === TileType.WALL_WOOD || targetType === TileType.FLOOR_WOOD) {
                     if (selectedItem.type === ItemType.WOOD_AXE) speedMultiplier = 1.5;
                     if (selectedItem.type === ItemType.STONE_AXE) speedMultiplier = 2.0;
                     if (selectedItem.type === ItemType.IRON_AXE) speedMultiplier = 3.0;
                     if (selectedItem.type === ItemType.GOLD_AXE) speedMultiplier = 4.0;
                 }
                 if (targetType === TileType.ROCK || targetType === TileType.IRON_ORE || targetType === TileType.GOLD_ORE || targetType === TileType.WALL_STONE || targetType === TileType.FLOOR_STONE) {
                     if (selectedItem.type === ItemType.WOOD_PICKAXE) speedMultiplier = 1.5;
                     if (selectedItem.type === ItemType.STONE_PICKAXE) speedMultiplier = 2.0;
                     if (selectedItem.type === ItemType.IRON_PICKAXE) speedMultiplier = 3.0;
                     if (selectedItem.type === ItemType.GOLD_PICKAXE) speedMultiplier = 4.0;
                 }
                 if (targetType === TileType.COBWEB && isSword) speedMultiplier = 5.0; 
                 if ((targetType === TileType.SNOW_PILE || targetType === TileType.SNOW_BLOCK)) speedMultiplier = 5.0; // Snow is easy to break
            }
            refs.breaking.current = { x: tileX, y: tileY, timer: 0, maxTime: requiredTime / speedMultiplier };
        }

        refs.breaking.current.timer += dt;
        if (Math.random() < 0.1) callbacks.spawnParticles(targetX, targetY, COLORS[targetType] || '#fff', 1, 2);
        
        if (refs.breaking.current.timer >= refs.breaking.current.maxTime) {
            // Finish Breaking Logic
            const drops: { type: ItemType, count: number }[] = [];
            
            // Calculate Yield Bonus from Tool
            const yieldBonus = (selectedItem && TOOL_CONFIG[selectedItem.type]) ? TOOL_CONFIG[selectedItem.type].yieldBonus : 1;

            // --- DROPS LOGIC ---
            if (targetType === TileType.TREE) { 
                drops.push({ type: ItemType.WOOD, count: 1 * yieldBonus }); 
                drops.push({ type: ItemType.SAPLING, count: Math.floor(Math.random() * 3) + 1 });
            }
            else if (targetType === TileType.PINE_TREE) {
                drops.push({ type: ItemType.WOOD, count: 1 * yieldBonus }); 
                drops.push({ type: ItemType.PINE_SAPLING, count: Math.floor(Math.random() * 3) + 1 });
            }
            else if (targetType === TileType.ROCK) drops.push({ type: ItemType.STONE, count: 1 * yieldBonus });
            else if (targetType === TileType.IRON_ORE) drops.push({ type: ItemType.IRON, count: 1 * yieldBonus });
            else if (targetType === TileType.GOLD_ORE) drops.push({ type: ItemType.GOLD, count: 1 * yieldBonus });
            else if (targetType === TileType.BUSH) drops.push({ type: ItemType.BERRY, count: 1 });
            else if (targetType === TileType.CLAM) drops.push({ type: ItemType.CLAM, count: 1 });
            else if (targetType === TileType.TALL_GRASS) { 
                if (Math.random() < 0.2) drops.push({ type: ItemType.PLANT_FIBER, count: 1 }); 
            }
            else if (targetType === TileType.SAPLING) drops.push({ type: ItemType.SAPLING, count: 1 });
            else if (targetType === TileType.PINE_SAPLING) drops.push({ type: ItemType.PINE_SAPLING, count: 1 });
            else if (targetType === TileType.BUSH_SAPLING) drops.push({ type: ItemType.BERRY_SEED, count: 1 });
            else if (targetType === TileType.WHEAT_PLANT) drops.push({ type: ItemType.WHEAT, count: 1 }, { type: ItemType.WHEAT_SEEDS, count: Math.floor(Math.random()*2)+1 });
            else if (targetType === TileType.COBWEB) {
                if (isSword) drops.push({ type: ItemType.COBWEB, count: 1 });
            }
            else if (targetType === TileType.SNOW_PILE || targetType === TileType.SNOW_BLOCK) {
                 drops.push({ type: ItemType.SNOWBALL, count: Math.floor(Math.random()*3) + 1 });
            }
            else if (targetType === TileType.CHEST) {
                drops.push({ type: ItemType.CHEST_ITEM, count: 1 });
                const contents = getContainerAt(world, tileX, tileY);
                if (contents) { contents.forEach(item => { if (item) drops.push(item); }); removeContainerAt(world, tileX, tileY); }
            }
            else if (targetType === TileType.WALL_WOOD) drops.push({ type: ItemType.WALL_WOOD_ITEM, count: 1 }); 
            else if (targetType === TileType.WALL_STONE) drops.push({ type: ItemType.WALL_STONE_ITEM, count: 1 });
            else if (targetType === TileType.CRAFTING_STATION) drops.push({ type: ItemType.CRAFTING_STATION_ITEM, count: 1 });
            else if (targetType === TileType.FLOOR_WOOD) drops.push({ type: ItemType.FLOOR_WOOD_ITEM, count: 1 });
            else if (targetType === TileType.FLOOR_STONE) drops.push({ type: ItemType.FLOOR_STONE_ITEM, count: 1 });
            else if (targetType === TileType.CACTUS) drops.push({ type: ItemType.CACTUS, count: 1 });

            // Reduce durability on break
            if (selectedItem && selectedItem.durability !== undefined) {
                 const newInv = [...player.inventory];
                 const newItem = { ...selectedItem, durability: selectedItem.durability - 1 };
                 if (newItem.durability <= 0) { 
                     newInv[player.selectedItemIndex] = null; 
                     callbacks.onStatusUpdate(`${ITEM_NAMES[selectedItem.type]} broke!`); 
                 } else {
                     newInv[player.selectedItemIndex] = newItem;
                 }
                 callbacks.onInventoryUpdate(newInv);
            }

            for (const drop of drops) {
                callbacks.spawnDroppedItem(tileX + 0.5, tileY + 0.5, drop, 0.2);
            }
            
            const hasObject = getObjectAt(world, tileX, tileY) !== undefined;
            if (hasObject) {
                removeObjectAt(world, tileX, tileY);
                // Remove from saplings list if needed
                refs.saplings.current = refs.saplings.current.filter(s => s.x !== tileX || s.y !== tileY);
            } else if (targetType === TileType.FLOOR_WOOD || targetType === TileType.FLOOR_STONE) {
                setTileAt(world, tileX, tileY, TileType.GRASS);
            }
            // Lower particle count on break (2 instead of 4)
            callbacks.spawnParticles(tileX + 0.5, tileY + 0.5, COLORS[targetType] || '#fff', 2, 2);

            refs.breaking.current = null;
        }
    } else {
        refs.breaking.current = null;
    }
};

const handlePlacing = (targetX: number, targetY: number, world: World, player: Player, refs: any, callbacks: UpdateCallbacks) => {
    const tileX = Math.floor(targetX);
    const tileY = Math.floor(targetY);
    
    // Reach Calculation
    const baseReach = 3.0;
    const reachBonus = player.equipment.accessory?.type === ItemType.CHARM ? CHARM_CONFIG.reachBonus : 0;
    const maxReach = baseReach + reachBonus;

    if (dist(player.x, player.y, targetX, targetY) > maxReach) return false;
    
    // Check boat entry
    const { cx, cy } = getChunkCoords(targetX, targetY);
    for(let dy=-1; dy<=1; dy++) {
        for(let dx=-1; dx<=1; dx++) {
            const key = getChunkKey(cx+dx, cy+dy);
            const chunk = world.chunks[key];
            if(chunk) {
                for(const ent of chunk.entities) {
                    if (ent.type === EntityType.BOAT && dist(ent.x, ent.y, targetX, targetY) < 1.0) {
                        refs.driving.current = ent.id;
                        player.x = ent.x; player.y = ent.y;
                        callbacks.onStatusUpdate("Driving Boat");
                        return true; 
                    }
                }
            }
        }
    }

    const selectedItem = player.inventory[player.selectedItemIndex];
    if (!selectedItem) return false;

    const tileType = getTileAt(world, tileX, tileY);
    const objectType = getObjectAt(world, tileX, tileY);

    // Fishing Logic
    if (selectedItem.type === ItemType.FISHING_ROD && tileType === TileType.WATER) {
        if (!refs.fishing.current) {
            refs.fishing.current = { x: tileX, y: tileY, timer: 0 };
            callbacks.spawnParticles(tileX+0.5, tileY+0.5, '#60a5fa', 5, 2);
            return true;
        }
    }
    
    // Placement logic
    let success = false;
    let particleColor = '#fff';

    if (selectedItem.type === ItemType.FLOOR_WOOD_ITEM && tileType !== TileType.WATER && tileType !== TileType.FLOOR_WOOD) {
        setTileAt(world, tileX, tileY, TileType.FLOOR_WOOD); success = true; particleColor = COLORS[TileType.FLOOR_WOOD];
    } else if (selectedItem.type === ItemType.FLOOR_STONE_ITEM && tileType !== TileType.WATER && tileType !== TileType.FLOOR_STONE) {
        setTileAt(world, tileX, tileY, TileType.FLOOR_STONE); success = true; particleColor = COLORS[TileType.FLOOR_STONE];
    } else if (!objectType) {
        if (selectedItem.type === ItemType.BOAT && tileType === TileType.WATER) {
            const { key } = getChunkCoords(tileX, tileY);
            if (world.chunks[key]) {
                world.chunks[key].entities.push({
                    id: `boat-${Date.now()}-${Math.random()}`,
                    type: EntityType.BOAT,
                    x: targetX, y: targetY, vx: 0, vy: 0,
                    health: BOAT_STATS.maxHealth, maxHealth: BOAT_STATS.maxHealth,
                    state: 'idle', stateTimer: 0, facing: 'left', drownTimer: 0
                });
                success = true; particleColor = '#854d0e';
            }
        } else if (tileType !== TileType.WATER) {
            let newObjType;
            // Sapling Logic Update: Allow planting on Grass AND Snow
            const canPlantSapling = tileType === TileType.GRASS || tileType === TileType.SNOW;

            if (selectedItem.type === ItemType.WALL_WOOD_ITEM) newObjType = TileType.WALL_WOOD;
            if (selectedItem.type === ItemType.WALL_STONE_ITEM) newObjType = TileType.WALL_STONE;
            if (selectedItem.type === ItemType.CRAFTING_STATION_ITEM) newObjType = TileType.CRAFTING_STATION;
            if (selectedItem.type === ItemType.CHEST_ITEM) { newObjType = TileType.CHEST; setContainerAt(world, tileX, tileY, Array(CONTAINER_SIZE).fill(null)); }
            
            if (selectedItem.type === ItemType.SAPLING && canPlantSapling) { 
                newObjType = TileType.SAPLING; 
                refs.saplings.current.push({ x: tileX, y: tileY, plantTime: Date.now() }); 
            }
            if (selectedItem.type === ItemType.PINE_SAPLING && canPlantSapling) { 
                newObjType = TileType.PINE_SAPLING; 
                refs.saplings.current.push({ x: tileX, y: tileY, plantTime: Date.now(), isPine: true }); 
            }
            
            if (selectedItem.type === ItemType.CACTUS && tileType === TileType.SAND) newObjType = TileType.CACTUS;
            if (selectedItem.type === ItemType.WHEAT_SEEDS && tileType === TileType.GRASS) { newObjType = TileType.WHEAT_CROP; refs.saplings.current.push({ x: tileX, y: tileY, plantTime: Date.now(), isWheat: true }); }
            if (selectedItem.type === ItemType.BERRY_SEED && (tileType === TileType.GRASS || tileType === TileType.SNOW)) { newObjType = TileType.BUSH_SAPLING; refs.saplings.current.push({ x: tileX, y: tileY, plantTime: Date.now() }); }
            if (selectedItem.type === ItemType.COBWEB) { newObjType = TileType.COBWEB; }
            if (selectedItem.type === ItemType.SNOW_BLOCK) { newObjType = TileType.SNOW_BLOCK; }
            
            if (newObjType) {
                setObjectAt(world, tileX, tileY, newObjType);
                success = true;
                particleColor = COLORS[newObjType] || '#fff';
            }
        }
    }

    if (success) {
        callbacks.spawnParticles(tileX + 0.5, tileY + 0.5, particleColor);
        const newInv = [...player.inventory];
        const newItem = { ...selectedItem, count: selectedItem.count - 1 };
        if (newItem.count <= 0) newInv[player.selectedItemIndex] = null;
        else newInv[player.selectedItemIndex] = newItem;
        callbacks.onInventoryUpdate(newInv);
        return true;
    }
    return false;
};

// --- Full Entity Logic Implementation ---
const isTileCompatible = (entType: EntityType, tile: number | null) => {
    if (tile === null) return false;
    // Removed strict biome restrictions for free wandering
    return true;
};

const processEntityBehavior = (ent: Entity, player: Player, world: World, dt: number, callbacks: UpdateCallbacks, refs: any) => {
    // 1. State Machine Updates
    ent.stateTimer -= dt;
    const distToPlayer = dist(ent.x, ent.y, player.x, player.y);
    const isAggressive = [EntityType.SNAKE, EntityType.POISON_SNAKE, EntityType.SCORPION, EntityType.SPIDER, EntityType.POISON_SPIDER].includes(ent.type);
    const detectionRange = isAggressive ? 6.0 : 4.0;
    
    // Define preferred biomes for "Home Seeking" behavior
    let preferredTile: TileType | null = null;
    if (ent.type === EntityType.COW || ent.type === EntityType.SNAKE || ent.type === EntityType.POISON_SNAKE) preferredTile = TileType.GRASS;
    if (ent.type === EntityType.SCORPION) preferredTile = TileType.SAND;
    if (ent.type === EntityType.SPIDER || ent.type === EntityType.POISON_SPIDER) preferredTile = TileType.MOUNTAIN;
    if (ent.type === EntityType.RABBIT) preferredTile = TileType.SNOW;

    if (ent.state === 'idle') {
        if (ent.stateTimer <= 0) {
            ent.state = 'wander';
            ent.stateTimer = Math.random() * 3 + 1;
            
            // Leashing Logic: If not on preferred tile, bias target towards it
            let forceBiomeSeek = false;
            if (preferredTile !== null) {
                const currentTile = getTileAt(world, Math.floor(ent.x), Math.floor(ent.y));
                if (currentTile !== preferredTile) {
                    forceBiomeSeek = true;
                }
            }

            // Attempt to find a valid target
            let found = false;
            // Search attempts
            for(let i=0; i<5; i++) {
                const range = forceBiomeSeek ? 10 : 6;
                const potentialX = ent.x + (Math.random() - 0.5) * range;
                const potentialY = ent.y + (Math.random() - 0.5) * range;
                const tile = getTileAt(world, Math.floor(potentialX), Math.floor(potentialY));
                
                // If seeking biome, only accept preferred tile. Otherwise accept any compatible.
                let valid = isTileCompatible(ent.type, tile);
                if (forceBiomeSeek && tile !== preferredTile) valid = false;
                
                if (valid) {
                     ent.targetX = potentialX;
                     ent.targetY = potentialY;
                     found = true;
                     break;
                }
            }
            
            if (!found && forceBiomeSeek) {
                // If can't find biome nearby, just wander randomly to try to get out
                ent.targetX = ent.x + (Math.random() - 0.5) * 8;
                ent.targetY = ent.y + (Math.random() - 0.5) * 8;
            } else if (!found) {
                 ent.state = 'idle';
                 ent.stateTimer = 1.0; 
            }
        }
        if (isAggressive && distToPlayer < detectionRange && !refs.driving.current) {
            ent.state = 'chase';
            ent.stateTimer = 5.0;
        }
    } else if (ent.state === 'wander') {
        if (ent.stateTimer <= 0 || (ent.targetX && dist(ent.x, ent.y, ent.targetX, ent.targetY) < 0.2)) {
            ent.state = 'idle';
            ent.stateTimer = Math.random() * 2 + 1;
            ent.targetX = undefined; // Clear target when idle
        }
        if (isAggressive && distToPlayer < detectionRange && !refs.driving.current) {
            ent.state = 'chase';
            ent.stateTimer = 5.0;
        }
    } else if (ent.state === 'chase') {
        ent.targetX = player.x;
        ent.targetY = player.y;
        if (distToPlayer > detectionRange * 1.5 || refs.driving.current) {
            ent.state = 'idle'; // Give up
        }
        // Attack logic
        // Use a slightly larger range (0.8) to ensure attacks feel responsive
        if (distToPlayer < 0.8) {
             const now = Date.now();
             if (!ent.attackCooldown || now - ent.attackCooldown > 1000) {
                 const dmg = ent.type === EntityType.POISON_SPIDER ? POISON_SPIDER_STATS.damage : 
                             ent.type === EntityType.SNAKE || ent.type === EntityType.POISON_SNAKE ? SNAKE_STATS.damage :
                             ent.type === EntityType.SCORPION ? SCORPION_STATS.damage : 5;
                 callbacks.takeDamage(dmg);
                 ent.attackCooldown = now;
                 
                 // Apply Poison (Fixed: Scorpions also poison now, and it is 100% chance)
                 if (ent.type === EntityType.POISON_SPIDER || ent.type === EntityType.SCORPION || ent.type === EntityType.POISON_SNAKE) {
                     player.poisonTimer = POISON_CONFIG.duration;
                     callbacks.onStatusUpdate("You are poisoned!");
                 }
             }
        }
    } else if (ent.state === 'flee') {
        if (ent.stateTimer <= 0) {
            ent.state = 'idle';
        }
        // Run away from player
        const dx = ent.x - player.x;
        const dy = ent.y - player.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len > 0) {
            ent.targetX = ent.x + (dx/len) * 5;
            ent.targetY = ent.y + (dy/len) * 5;
        }
    }

    // 2. Movement Physics
    let moveSpeed = 0;
    if (ent.type === EntityType.COW) moveSpeed = ent.state === 'flee' ? COW_STATS.fleeSpeed : COW_STATS.speed;
    else if (ent.type === EntityType.RABBIT) moveSpeed = ent.state === 'flee' ? RABBIT_STATS.fleeSpeed : RABBIT_STATS.speed;
    else if (ent.type === EntityType.SNAKE || ent.type === EntityType.POISON_SNAKE) moveSpeed = SNAKE_STATS.speed;
    else if (ent.type === EntityType.SCORPION) moveSpeed = SCORPION_STATS.speed;
    else if (ent.type.includes('SPIDER')) moveSpeed = SPIDER_STATS.speed;
    
    if (ent.state === 'idle') moveSpeed = 0;

    // Apply knockback sliding if any velocity exists (from projectiles)
    if (ent.vx || ent.vy) {
         ent.vx = (ent.vx || 0) * 0.9; // Friction
         ent.vy = (ent.vy || 0) * 0.9;
         if (Math.abs(ent.vx) < 0.1) ent.vx = 0;
         if (Math.abs(ent.vy) < 0.1) ent.vy = 0;
         
         ent.x += ent.vx * dt;
         ent.y += ent.vy * dt;
    }

    if (moveSpeed > 0 && ent.targetX !== undefined && ent.targetY !== undefined) {
        const dx = ent.targetX - ent.x;
        const dy = ent.targetY - ent.y;
        const distToTarget = Math.sqrt(dx*dx + dy*dy);
        
        if (distToTarget > 0.1) {
            const moveX = (dx / distToTarget) * moveSpeed * dt;
            const moveY = (dy / distToTarget) * moveSpeed * dt;
            
            // Biome & Collision Check
            // We check the tile directly ahead. If it's invalid biome, we stop.
            const nextTileX = getTileAt(world, Math.floor(ent.x + moveX), Math.floor(ent.y));
            const nextTileY = getTileAt(world, Math.floor(ent.x), Math.floor(ent.y + moveY));
            
            const canMoveX = checkCollision(world, ent.x + moveX, ent.y) === false && isTileCompatible(ent.type, nextTileX);
            const canMoveY = checkCollision(world, ent.x, ent.y + moveY) === false && isTileCompatible(ent.type, nextTileY);

            // Apply Snow Slowness to entities
            const objUnder = getObjectAt(world, Math.floor(ent.x), Math.floor(ent.y));
            const speedMod = (objUnder === TileType.SNOW_PILE || objUnder === TileType.SNOW_BLOCK) ? SNOW_SPEED_MULTIPLIER : 1.0;

            if (canMoveX) ent.x += moveX * speedMod;
            if (canMoveY) ent.y += moveY * speedMod;
            
            // If completely blocked by biome or collision while wandering, pick new state
            if (!canMoveX && !canMoveY && ent.state === 'wander') {
                ent.state = 'idle';
                ent.stateTimer = 0.5;
            }

            ent.facing = dx > 0 ? 'right' : 'left';
        }
    }
};

const updateEntities = (dt: number, world: World, player: Player, refs: any, callbacks: UpdateCallbacks, rX: number, rY: number) => {
    const { cx, cy } = getChunkCoords(player.x, player.y);
    // Iterate over visible chunks plus buffer to process entities
    for(let dy=-rY; dy<=rY; dy++) {
        for(let dx=-rX; dx<=rX; dx++) {
            const key = getChunkKey(cx+dx, cy+dy);
            const chunk = world.chunks[key];
            if(!chunk) continue;

            // Dropped Items
            for(let i = chunk.droppedItems.length - 1; i >= 0; i--) {
                const item = chunk.droppedItems[i];
                item.pickupDelay -= dt; item.lifeTime -= dt;
                if (item.lifeTime <= 0) { chunk.droppedItems.splice(i, 1); continue; }
                
                if (item.pickupDelay <= 0 && dist(player.x, player.y, item.x, item.y) < 0.8) {
                    let pickedUp = false;
                    const inv = player.inventory; 
                    
                    // Try to stack
                    for (let j = 0; j < inv.length; j++) {
                        const slot = inv[j];
                        if (slot && slot.type === item.type && !slot.durability && !item.durability) {
                            const space = MAX_STACK_SIZE - slot.count;
                            const add = Math.min(space, item.count);
                            if (add > 0) { 
                                inv[j] = { ...slot, count: slot.count + add }; 
                                item.count -= add; 
                                if (item.count <= 0) pickedUp = true; 
                            }
                        }
                        if (pickedUp) break;
                    }
                    // Try to fill empty
                    if (!pickedUp && item.count > 0) {
                        const emptyIdx = inv.findIndex(s => s === null);
                        if (emptyIdx >= 0) { 
                            inv[emptyIdx] = { 
                                type: item.type, 
                                count: item.count, 
                                durability: item.durability, 
                                maxDurability: item.maxDurability 
                            }; 
                            pickedUp = true; 
                        }
                    }

                    if (pickedUp) {
                        chunk.droppedItems.splice(i, 1);
                        callbacks.onInventoryUpdate([...inv]); 
                        callbacks.onStatusUpdate(`Picked up ${ITEM_NAMES[item.type]}`);
                        callbacks.spawnParticles(player.x, player.y, '#ffffff', 2, 2);
                    }
                }
            }

            // Mobs
            const entities = chunk.entities;
            for(let i=entities.length-1; i>=0; i--) {
                const ent = entities[i];
                if (ent.type === EntityType.BOAT) continue; // Boats handled in main loop

                if (ent.type === EntityType.ARROW || ent.type === EntityType.POISON_ARROW || ent.type === EntityType.SNOWBALL) {
                    // Projectile Logic
                    if (ent.vx === undefined) ent.vx = 0;
                    if (ent.vy === undefined) ent.vy = 0;
                    
                    const nextX = ent.x + ent.vx * dt;
                    const nextY = ent.y + ent.vy * dt;

                    // Wall Collision
                    if (checkCollision(world, nextX, nextY)) {
                        // Hit wall, drop item if arrow
                        if (ent.type === EntityType.ARROW || ent.type === EntityType.POISON_ARROW) {
                            const dropType = ent.type === EntityType.POISON_ARROW ? ItemType.POISON_ARROW : ItemType.ARROW;
                            callbacks.spawnDroppedItem(ent.x, ent.y, { type: dropType, count: 1 });
                        }
                        callbacks.spawnParticles(ent.x, ent.y, '#9CA3AF', 3, 1);
                        entities.splice(i, 1);
                        continue;
                    }
                    
                    ent.x = nextX;
                    ent.y = nextY;

                    // Entity Collision
                    let hit = false;
                    for(let j=entities.length-1; j>=0; j--) {
                        const target = entities[j];
                        if (target === ent) continue;
                        if (target.type === EntityType.BOAT || target.type === EntityType.ARROW || target.type === EntityType.POISON_ARROW || target.type === EntityType.SNOWBALL) continue;
                        
                        if (dist(ent.x, ent.y, target.x, target.y) < 0.5) {
                            // HIT!
                            const damage = ent.type === EntityType.ARROW ? ARROW_STATS.damage : 
                                           ent.type === EntityType.POISON_ARROW ? POISON_ARROW_STATS.damage : SNOWBALL_STATS.damage;
                            
                            target.health -= damage;
                            
                            // Apply Knockback
                            if (ent.type === EntityType.SNOWBALL) {
                                const angle = Math.atan2(ent.vy, ent.vx);
                                target.vx = Math.cos(angle) * SNOWBALL_STATS.knockback;
                                target.vy = Math.sin(angle) * SNOWBALL_STATS.knockback;
                            }

                            // Aggro
                            if (target.type === EntityType.COW || target.type === EntityType.RABBIT) { target.state = 'flee'; target.stateTimer = 2.0; } 
                            else if (target.type === EntityType.SNAKE || target.type === EntityType.POISON_SNAKE || target.type === EntityType.SCORPION || target.type === EntityType.SPIDER || target.type === EntityType.POISON_SPIDER) { target.state = 'chase'; target.stateTimer = 5.0; }

                            callbacks.spawnParticles(target.x, target.y, '#ef4444', 3, 2);
                            
                            // Apply Poison if Poison Arrow
                            if (ent.type === EntityType.POISON_ARROW) {
                                // Entities don't have separate poison logic implemented fully yet (only player has poisonTimer in state),
                                // but we can simulate it or just let the arrow be extra damage for now.
                                // If we want entities to be poisoned, we'd need to add poisonTimer to Entity interface.
                                // For now, Poison Arrow just deals different damage/effect. 
                                // Let's add simple direct damage bonus or visual effect.
                                callbacks.spawnParticles(target.x, target.y, '#4ADE80', 5, 2); // Poison splash
                            }

                            if (target.health <= 0) {
                                entities.splice(j, 1);
                                if (i > j) i--; // Adjust arrow index if we removed something before it
                                callbacks.spawnParticles(target.x, target.y, '#991b1b', 4, 3);
                                // ... drop logic
                                if (target.type === EntityType.COW) {
                                    if (Math.random() < COW_STATS.dropRateMeat) callbacks.spawnDroppedItem(target.x, target.y, { type: ItemType.RAW_BEEF, count: 1 });
                                    if (Math.random() < COW_STATS.dropRateLeather) callbacks.spawnDroppedItem(target.x, target.y, { type: ItemType.LEATHER, count: 1 });
                                } else if (target.type === EntityType.SNAKE) {
                                    // Nothing
                                } else if (target.type === EntityType.POISON_SNAKE) {
                                    if (Math.random() < POISON_SNAKE_STATS.dropRateFang) callbacks.spawnDroppedItem(target.x, target.y, { type: ItemType.SNAKE_FANG, count: 1 });
                                } else if (target.type === EntityType.RABBIT) {
                                    if (Math.random() < RABBIT_STATS.dropRateLeg) callbacks.spawnDroppedItem(target.x, target.y, { type: ItemType.RABBIT_LEG, count: 1 });
                                }
                            }
                            
                            hit = true;
                            break;
                        }
                    }

                    if (hit) {
                        entities.splice(i, 1);
                        continue;
                    }
                    
                    // Lifetime/Distance check
                    ent.health -= dt; 
                    if (ent.health <= -1.0) { 
                         // Drop item when out of range (Arrows only)
                         if (ent.type === EntityType.ARROW || ent.type === EntityType.POISON_ARROW) {
                            const dropType = ent.type === EntityType.POISON_ARROW ? ItemType.POISON_ARROW : ItemType.ARROW;
                            callbacks.spawnDroppedItem(ent.x, ent.y, { type: dropType, count: 1 });
                         }
                         entities.splice(i, 1);
                         continue;
                    }
                } else {
                    processEntityBehavior(ent, player, world, dt, callbacks, refs);
                }
                
                // Keep entity in correct chunk
                const currentChunkKey = getChunkKey(Math.floor(ent.x/CHUNK_SIZE), Math.floor(ent.y/CHUNK_SIZE));
                if (currentChunkKey !== key) {
                    const newChunk = world.chunks[currentChunkKey];
                    if (newChunk) { 
                        newChunk.entities.push(ent); 
                        entities.splice(i, 1); 
                    } else { 
                        ent.x -= (ent.x % 1); 
                    }
                }
            }
        }
    }
};