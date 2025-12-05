

import { Chunk, TileType, ItemType, EntityType, Player, Camera, Particle, Settings, World } from '../types';
import { CHUNK_SIZE, TILE_SIZE, COLORS } from '../constants';
import { getChunkCoords, getChunkKey } from '../utils/gameUtils';

// --- Helper: Draw a single item icon on canvas ---
export const drawItem = (ctx: CanvasRenderingContext2D, type: ItemType, x: number, y: number, offset: number) => {
    ctx.save();
    ctx.translate(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2 + offset);
    ctx.scale(0.6, 0.6);
    ctx.translate(-24, -24); 
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(24, 42, 10, 4, 0, 0, Math.PI*2); ctx.fill();

    drawItemSprite(ctx, type);
    
    ctx.restore();
};

// Internal sprite drawer (to be shared with Held Item rendering)
const drawItemSprite = (ctx: CanvasRenderingContext2D, type: ItemType) => {
    if ([ItemType.WOOD, ItemType.WALL_WOOD_ITEM, ItemType.FLOOR_WOOD_ITEM].includes(type)) { ctx.fillStyle = '#5D4037'; ctx.fillRect(12, 8, 24, 32); } 
    else if ([ItemType.STONE, ItemType.WALL_STONE_ITEM].includes(type)) { ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.moveTo(24, 8); ctx.lineTo(40, 24); ctx.lineTo(24, 40); ctx.lineTo(8, 24); ctx.fill(); } 
    else if (type === ItemType.IRON) { ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(24, 8); ctx.lineTo(40, 24); ctx.lineTo(24, 40); ctx.lineTo(8, 24); ctx.fill(); ctx.fillStyle = '#F87171'; ctx.beginPath(); ctx.arc(24, 24, 4, 0, Math.PI*2); ctx.fill(); } 
    else if (type === ItemType.GOLD) { ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(24, 8); ctx.lineTo(40, 24); ctx.lineTo(24, 40); ctx.lineTo(8, 24); ctx.fill(); ctx.fillStyle = '#FBBF24'; ctx.beginPath(); ctx.arc(24, 24, 4, 0, Math.PI*2); ctx.fill(); } 
    else if (type === ItemType.BERRY) { ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(24, 24, 8, 0, Math.PI*2); ctx.fill(); } 
    else if (type.includes('AXE') || type.includes('PICKAXE') || type.includes('SWORD')) { 
        ctx.fillStyle = type.includes('GOLD') ? '#FBBF24' : type.includes('IRON') ? '#E5E7EB' : type.includes('STONE') ? '#9CA3AF' : '#8D6E63'; 
        // Thicker handle/blade for better visibility in hand
        ctx.fillRect(18, 10, 12, 28); 
    } 
    else if (type === ItemType.RAW_BEEF) { ctx.fillStyle = '#991B1B'; ctx.fillRect(14, 14, 20, 20); } 
    else if (type === ItemType.LEATHER) { ctx.fillStyle = '#C2410C'; ctx.beginPath(); ctx.arc(24, 24, 10, 0, Math.PI*2); ctx.fill(); } 
    else if (type === ItemType.PLANT_FIBER) { ctx.strokeStyle = '#22C55E'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(16,32); ctx.lineTo(32,16); ctx.stroke(); } 
    else if (type === ItemType.SAPLING) { ctx.strokeStyle = '#22C55E'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(24, 36); ctx.lineTo(24, 12); ctx.stroke(); ctx.fillStyle = '#4ADE80'; ctx.beginPath(); ctx.arc(18, 18, 4, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(30, 22, 4, 0, Math.PI*2); ctx.fill(); } 
    else if (type === ItemType.BERRY_SEED) { ctx.fillStyle = '#FCA5A5'; ctx.beginPath(); ctx.arc(20, 24, 3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(28, 28, 3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(24, 18, 3, 0, Math.PI*2); ctx.fill(); } 
    else if (type === ItemType.CHEST_ITEM) { ctx.fillStyle = '#854D0E'; ctx.fillRect(8, 14, 32, 24); ctx.fillStyle = '#FCD34D'; ctx.fillRect(22, 22, 4, 6); } 
    else if (type === ItemType.CRAFTING_STATION_ITEM) { ctx.fillStyle = '#9F1239'; ctx.fillRect(10, 20, 28, 20); } 
    else if (type === ItemType.CACTUS) { ctx.fillStyle = '#16A34A'; ctx.fillRect(20, 10, 8, 30); } 
    else if (type === ItemType.CLAM) { ctx.fillStyle = '#FCE7F3'; ctx.beginPath(); ctx.arc(24, 28, 12, Math.PI, 0); ctx.fill(); } 
    else if (type === ItemType.SNAKE_FANG) { ctx.fillStyle = '#F3F4F6'; ctx.beginPath(); ctx.moveTo(20, 14); ctx.quadraticCurveTo(30, 30, 24, 44); ctx.quadraticCurveTo(18, 30, 20, 14); ctx.fill(); } 
    else if (type === ItemType.COBWEB) { ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(8,8); ctx.lineTo(40,40); ctx.moveTo(40,8); ctx.lineTo(8,40); ctx.stroke(); } 
    else if (type.includes('HELMET') || type.includes('ARMOR')) { ctx.fillStyle = type.includes('GOLD') ? '#FCD34D' : type.includes('IRON') ? '#9CA3AF' : '#C2410C'; ctx.fillRect(14, 14, 20, 20); } 
    else if (type === ItemType.BOAT) { ctx.fillStyle = '#854d0e'; ctx.beginPath(); ctx.moveTo(8, 18); ctx.quadraticCurveTo(24, 6, 40, 18); ctx.lineTo(36, 34); ctx.quadraticCurveTo(24, 40, 12, 34); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#5D4037'; ctx.fillRect(16, 24, 16, 4); } 
    else if (type === ItemType.WHEAT_SEEDS) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.ellipse(20, 24, 2, 4, 0, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(28, 28, 2, 4, 0, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(26, 18, 2, 4, 0, 0, Math.PI*2); ctx.fill(); } 
    else if (type === ItemType.WHEAT) { ctx.strokeStyle = '#EAB308'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(24,40); ctx.lineTo(24,10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(24,14); ctx.lineTo(18,18); ctx.stroke(); ctx.beginPath(); ctx.moveTo(24,20); ctx.lineTo(30,24); ctx.stroke(); } 
    else if (type === ItemType.BREAD) { ctx.fillStyle = '#D97706'; ctx.beginPath(); ctx.moveTo(10,24); ctx.quadraticCurveTo(24,10, 38,24); ctx.quadraticCurveTo(38,36, 24,36); ctx.quadraticCurveTo(10,36, 10,24); ctx.fill(); ctx.strokeStyle = '#FCD34D'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(16,20); ctx.lineTo(32,20); ctx.stroke(); } 
    else if (type === ItemType.FLOOR_STONE_ITEM) { ctx.fillStyle = '#57534E'; ctx.fillRect(8, 8, 32, 32); ctx.fillStyle = '#44403C'; ctx.fillRect(12, 12, 10, 10); ctx.fillRect(26, 12, 10, 10); ctx.fillRect(12, 26, 10, 10); ctx.fillRect(26, 26, 10, 10); }
    else if (type === ItemType.RUBY) { ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.moveTo(16,12); ctx.lineTo(32,12); ctx.lineTo(40,20); ctx.lineTo(24,38); ctx.lineTo(8,20); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#991B1B'; ctx.lineWidth = 2; ctx.stroke(); }
    else if (type === ItemType.CHARM) { ctx.fillStyle = '#FBBF24'; ctx.beginPath(); ctx.arc(24, 24, 10, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.moveTo(24, 18); ctx.lineTo(30, 24); ctx.lineTo(24, 30); ctx.lineTo(18, 24); ctx.fill(); }
    else if (type === ItemType.FISHING_ROD) { ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, 36); ctx.lineTo(36, 12); ctx.stroke(); ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(36, 12); ctx.lineTo(36, 24); ctx.stroke(); ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(36, 26, 2, 0, Math.PI*2); ctx.fill(); }
    else if (type === ItemType.SALMON) { ctx.fillStyle = '#F87171'; ctx.beginPath(); ctx.ellipse(24, 24, 14, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(34, 22, 1.5, 0, Math.PI*2); ctx.fill(); }
    else if (type === ItemType.COD) { ctx.fillStyle = '#D1D5DB'; ctx.beginPath(); ctx.ellipse(24, 24, 14, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(34, 22, 1.5, 0, Math.PI*2); ctx.fill(); }
    else if (type === ItemType.STRING) { ctx.strokeStyle = '#F3F4F6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20,10); ctx.quadraticCurveTo(30,14, 16,20); ctx.quadraticCurveTo(8,28, 24,30); ctx.quadraticCurveTo(34,32, 28,40); ctx.stroke(); }
    else if (type === ItemType.BOW) { ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(16,12); ctx.quadraticCurveTo(36,24, 16,36); ctx.stroke(); ctx.strokeStyle = '#F3F4F6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(16,12); ctx.lineTo(16,36); ctx.stroke(); }
    else if (type === ItemType.ARROW) { ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12,24); ctx.lineTo(36,24); ctx.stroke(); ctx.strokeStyle = '#9CA3AF'; ctx.beginPath(); ctx.moveTo(32,20); ctx.lineTo(36,24); ctx.lineTo(32,28); ctx.stroke(); }
    else if (type === ItemType.POISON_ARROW) { 
        ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12,24); ctx.lineTo(36,24); ctx.stroke(); 
        ctx.strokeStyle = '#22C55E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(32,20); ctx.lineTo(36,24); ctx.lineTo(32,28); ctx.stroke();
    }
    else if (type === ItemType.SNOWBALL) { ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(24, 24, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke(); }
    else if (type === ItemType.SNOW_BLOCK) { ctx.fillStyle = '#F1F5F9'; ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1; ctx.fillRect(8, 8, 32, 32); ctx.strokeRect(8, 8, 32, 32); }
    else if (type === ItemType.PINE_SAPLING) { ctx.fillStyle = '#10B981'; ctx.beginPath(); ctx.moveTo(24, 12); ctx.lineTo(12, 36); ctx.lineTo(36, 36); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#064E3B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(24, 36); ctx.lineTo(24, 42); ctx.stroke(); }
    else if (type === ItemType.RABBIT_LEG) { ctx.fillStyle = '#FCA5A5'; ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, 16); ctx.quadraticCurveTo(10, 24, 16, 36); ctx.quadraticCurveTo(22, 40, 30, 36); ctx.lineTo(36, 12); ctx.quadraticCurveTo(28, 8, 14, 16); ctx.fill(); ctx.stroke(); }
    else if (type === ItemType.BACKPACK) {
         ctx.fillStyle = '#854D0E'; ctx.strokeStyle = '#422006'; ctx.lineWidth = 2;
         ctx.fillRect(12, 12, 24, 24); ctx.strokeRect(12, 12, 24, 24);
         ctx.fillStyle = '#A16207'; ctx.beginPath(); ctx.moveTo(12, 16); ctx.lineTo(36, 16); ctx.lineTo(32, 24); ctx.lineTo(16, 24); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    else { ctx.fillStyle = '#60A5FA'; ctx.fillRect(16, 16, 16, 16); }
};

// --- Render Chunk Terrain to Cache ---
export const renderChunkTerrain = (chunk: Chunk, cx: number, cy: number): HTMLCanvasElement | null => {
    if (chunk.terrainCache instanceof HTMLCanvasElement) return chunk.terrainCache;

    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_SIZE * TILE_SIZE;
    canvas.height = CHUNK_SIZE * TILE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            const tile = chunk.tiles[ly][lx];
            const gx = cx * CHUNK_SIZE + lx;
            const gy = cy * CHUNK_SIZE + ly;
            const tx = lx * TILE_SIZE;
            const ty = ly * TILE_SIZE;

            if (tile === TileType.GRASS) {
                ctx.fillStyle = COLORS[TileType.GRASS];
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                const h = (Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453123) % 1;
                ctx.fillStyle = '#22c55e'; 
                if (h > 0.3) ctx.fillRect(tx + (h*20)%30 + 5, ty + (h*50)%30 + 5, 2, 4);
                if (h > 0.5) ctx.fillRect(tx + (h*40)%20 + 20, ty + (h*80)%20 + 20, 2, 3);
                if (h > 0.7) ctx.fillRect(tx + (h*10)%25 + 10, ty + (h*30)%25 + 10, 2, 4);
            } else if (tile === TileType.WATER) {
                ctx.fillStyle = COLORS[TileType.WATER];
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                // Add water texture/waves
                ctx.fillStyle = '#3b82f6';
                const h = (Math.sin(gx * 10 + gy * 20) * 12345) % 1;
                if (h > 0.5) {
                    ctx.beginPath();
                    ctx.arc(tx + TILE_SIZE/2, ty + TILE_SIZE/2, 4, 0, Math.PI*2);
                    ctx.fill();
                }
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.moveTo(tx, ty + 10);
                ctx.quadraticCurveTo(tx + TILE_SIZE/2, ty, tx + TILE_SIZE, ty + 10);
                ctx.stroke();
            } else if (tile === TileType.SAND) {
                ctx.fillStyle = COLORS[TileType.SAND];
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                const h = (Math.sin(gx * 89.231 + gy * 23.412) * 12931.231) % 1;
                if (h > 0.5) {
                    ctx.fillStyle = '#eab308'; 
                    ctx.fillRect(tx + (h*30)%35 + 2, ty + (h*60)%35 + 2, 2, 2);
                    if (h > 0.75) ctx.fillRect(tx + (h*15)%40 + 5, ty + (h*90)%40 + 5, 1, 1);
                }
            } else if (tile === TileType.MOUNTAIN) {
                ctx.fillStyle = COLORS[TileType.MOUNTAIN];
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                const h = (Math.sin(gx * 45.123 + gy * 98.765) * 65432.123) % 1;
                ctx.fillStyle = '#44403c'; 
                ctx.strokeStyle = '#292524';
                ctx.lineWidth = 1;
                if (h > 0.6) {
                    ctx.beginPath();
                    ctx.moveTo(tx + (h*20)%40, ty + (h*50)%40);
                    ctx.lineTo(tx + (h*20)%40 + 5, ty + (h*50)%40 + 5);
                    ctx.stroke();
                }
                if (h < 0.2) ctx.fillRect(tx + (h*80)%40, ty + (h*10)%40, 3, 3);
            } else if (tile === TileType.SNOW) {
                ctx.fillStyle = COLORS[TileType.SNOW];
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                const h = (Math.sin(gx * 12.345 + gy * 67.890) * 54321.123) % 1;
                if (h > 0.5) {
                    ctx.fillStyle = '#e2e8f0'; 
                    ctx.fillRect(tx + (h*25)%35 + 2, ty + (h*45)%35 + 2, 2, 2);
                }
            } else if (tile === TileType.FLOOR_WOOD) {
                ctx.fillStyle = COLORS[TileType.FLOOR_WOOD];
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#92400e';
                ctx.lineWidth = 1;
                ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
                ctx.beginPath(); ctx.moveTo(tx, ty+TILE_SIZE/2); ctx.lineTo(tx+TILE_SIZE, ty+TILE_SIZE/2); ctx.stroke();
            } else if (tile === TileType.FLOOR_STONE) {
                ctx.fillStyle = COLORS[TileType.FLOOR_STONE];
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#44403C';
                ctx.fillRect(tx + 4, ty + 4, 12, 12);
                ctx.fillRect(tx + 24, ty + 4, 20, 12);
                ctx.fillRect(tx + 4, ty + 24, 20, 20);
                ctx.fillRect(tx + 28, ty + 24, 16, 16);
            }
        }
    }
    
    chunk.terrainCache = canvas;
    return canvas;
};

// --- Main Draw Function ---
export const drawWorld = (
    ctx: CanvasRenderingContext2D,
    world: World,
    player: Player,
    camera: Camera,
    settings: Settings,
    particles: Particle[],
    breakingAction: {x: number, y: number, timer: number, maxTime: number} | null,
    drivingId: string | null,
    fishingState: { x: number, y: number, timer: number } | null,
    mouse: { x: number, y: number }
) => {
    const { width, height } = ctx.canvas;
    const time = performance.now() / 1000;
    const zoom = settings.cameraZoom;

    // Clear Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    
    // Zoom & Center Camera
    ctx.translate(width/2, height/2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width/2, -height/2);
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));

    // Calculate visible range
    const startCol = Math.floor(camera.x / TILE_SIZE);
    const endCol = startCol + (width / zoom / TILE_SIZE) + 2;
    const startRow = Math.floor(camera.y / TILE_SIZE);
    const endRow = startRow + (height / zoom / TILE_SIZE) + 2;

    const startCX = Math.floor(startCol / CHUNK_SIZE);
    const endCX = Math.floor(endCol / CHUNK_SIZE);
    const startCY = Math.floor(startRow / CHUNK_SIZE);
    const endCY = Math.floor(endRow / CHUNK_SIZE);

    for (let cy = startCY; cy <= endCY; cy++) {
        for (let cx = startCX; cx <= endCX; cx++) {
            const chunk = world.chunks[getChunkKey(cx, cy)];
            if (!chunk) continue;

            // 1. Terrain Layer
            const terrainImg = renderChunkTerrain(chunk, cx, cy);
            if (terrainImg) {
                ctx.drawImage(terrainImg, cx * CHUNK_SIZE * TILE_SIZE, cy * CHUNK_SIZE * TILE_SIZE);
            }

            // 2. Objects Layer
            for (let ly = 0; ly < CHUNK_SIZE; ly++) {
                const gy = cy * CHUNK_SIZE + ly;
                if (gy < startRow || gy > endRow) continue;

                for (let lx = 0; lx < CHUNK_SIZE; lx++) {
                    const gx = cx * CHUNK_SIZE + lx;
                    if (gx < startCol || gx > endCol) continue;

                    const tx = gx * TILE_SIZE;
                    const ty = gy * TILE_SIZE;
                    const obj = chunk.objects[`${lx},${ly}`];

                    if (obj !== undefined) {
                        let localSeed = (gx * 73856093) ^ (gy * 19349663); 
                        const rng = () => { localSeed = (localSeed * 9301 + 49297) % 233280; return localSeed / 233280; };
                        
                        if (obj === TileType.TREE) {
                            ctx.fillStyle = '#4a3728'; ctx.fillRect(tx + TILE_SIZE*0.4, ty + TILE_SIZE*0.5, TILE_SIZE*0.2, TILE_SIZE*0.4);
                            const greenBase = [34, 197, 94]; 
                            const drawLeaf = (ox: number, oy: number, r: number) => { ctx.beginPath(); ctx.arc(tx + TILE_SIZE*ox, ty + TILE_SIZE*oy, TILE_SIZE*r, 0, Math.PI*2); ctx.fillStyle = `rgb(${greenBase[0]}, ${greenBase[1] + (rng()*20-10)}, ${greenBase[2]})`; ctx.fill(); };
                            drawLeaf(0.3, 0.4, 0.35); drawLeaf(0.7, 0.4, 0.35); drawLeaf(0.5, 0.2, 0.4);
                        } else if (obj === TileType.PINE_TREE) {
                            ctx.fillStyle = '#4a3728'; ctx.fillRect(tx + TILE_SIZE*0.4, ty + TILE_SIZE*0.6, TILE_SIZE*0.2, TILE_SIZE*0.3);
                            ctx.fillStyle = '#064e3b';
                            // Pine tree triangle structure
                            ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2, ty + 10); ctx.lineTo(tx + TILE_SIZE*0.8, ty + TILE_SIZE*0.7); ctx.lineTo(tx + TILE_SIZE*0.2, ty + TILE_SIZE*0.7); ctx.fill();
                            ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2, ty + 5); ctx.lineTo(tx + TILE_SIZE*0.7, ty + TILE_SIZE*0.5); ctx.lineTo(tx + TILE_SIZE*0.3, ty + TILE_SIZE*0.5); ctx.fill();
                            ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2, ty); ctx.lineTo(tx + TILE_SIZE*0.6, ty + TILE_SIZE*0.3); ctx.lineTo(tx + TILE_SIZE*0.4, ty + TILE_SIZE*0.3); ctx.fill();
                        } else if (obj === TileType.ROCK) {
                            ctx.fillStyle = '#57534e'; ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE*0.2, ty + TILE_SIZE*0.8); ctx.lineTo(tx + TILE_SIZE*0.1, ty + TILE_SIZE*0.4); ctx.lineTo(tx + TILE_SIZE*0.4, ty + TILE_SIZE*0.1); ctx.lineTo(tx + TILE_SIZE*0.8, ty + TILE_SIZE*0.2); ctx.lineTo(tx + TILE_SIZE*0.9, ty + TILE_SIZE*0.7); ctx.lineTo(tx + TILE_SIZE*0.6, ty + TILE_SIZE*0.9); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
                        } else if (obj === TileType.IRON_ORE) {
                            ctx.fillStyle = '#44403c'; ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE*0.2, ty + TILE_SIZE*0.8); ctx.lineTo(tx + TILE_SIZE*0.1, ty + TILE_SIZE*0.4); ctx.lineTo(tx + TILE_SIZE*0.5, ty + TILE_SIZE*0.1); ctx.lineTo(tx + TILE_SIZE*0.9, ty + TILE_SIZE*0.5); ctx.lineTo(tx + TILE_SIZE*0.7, ty + TILE_SIZE*0.9); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f87171'; 
                            const drawSpot = (ox: number, oy: number) => { ctx.beginPath(); ctx.arc(tx + TILE_SIZE*ox, ty + TILE_SIZE*oy, 3, 0, Math.PI*2); ctx.fill(); };
                            drawSpot(0.4, 0.4); drawSpot(0.6, 0.3); drawSpot(0.5, 0.7);
                        } else if (obj === TileType.GOLD_ORE) {
                            ctx.fillStyle = '#44403c'; ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE*0.2, ty + TILE_SIZE*0.8); ctx.lineTo(tx + TILE_SIZE*0.1, ty + TILE_SIZE*0.4); ctx.lineTo(tx + TILE_SIZE*0.5, ty + TILE_SIZE*0.1); ctx.lineTo(tx + TILE_SIZE*0.9, ty + TILE_SIZE*0.5); ctx.lineTo(tx + TILE_SIZE*0.7, ty + TILE_SIZE*0.9); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FBBF24'; 
                            const drawSpot = (ox: number, oy: number) => { ctx.beginPath(); ctx.arc(tx + TILE_SIZE*ox, ty + TILE_SIZE*oy, 3, 0, Math.PI*2); ctx.fill(); };
                            drawSpot(0.4, 0.4); drawSpot(0.6, 0.3); drawSpot(0.5, 0.7);
                        } else if (obj === TileType.CRAFTING_STATION) {
                            ctx.fillStyle = '#9f1239'; ctx.fillRect(tx + 4, ty + 12, TILE_SIZE - 8, TILE_SIZE - 16); ctx.fillStyle = '#e11d48'; ctx.fillRect(tx + 2, ty + 10, TILE_SIZE - 4, 10); ctx.fillStyle = 'white'; ctx.font = '16px serif'; ctx.fillText('⚒️', tx + 12, ty + 35);
                        } else if (obj === TileType.WALL_WOOD) {
                            ctx.fillStyle = '#78350f'; ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE); ctx.fillStyle = '#451a03'; ctx.fillRect(tx + 4, ty + 4, 2, TILE_SIZE-8); ctx.fillRect(tx + TILE_SIZE/2 - 1, ty + 4, 2, TILE_SIZE-8); ctx.fillRect(tx + TILE_SIZE-6, ty + 4, 2, TILE_SIZE-8); ctx.fillRect(tx, ty + 10, TILE_SIZE, 2); ctx.fillRect(tx, ty + TILE_SIZE-12, TILE_SIZE, 2);
                        } else if (obj === TileType.WALL_STONE) {
                            ctx.fillStyle = '#44403c'; ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE); ctx.fillStyle = '#292524'; ctx.fillRect(tx, ty+10, TILE_SIZE, 2); ctx.fillRect(tx, ty+24, TILE_SIZE, 2); ctx.fillRect(tx, ty+38, TILE_SIZE, 2); ctx.fillRect(tx+10, ty, 2, 10); ctx.fillRect(tx+24, ty+12, 2, 12); ctx.fillRect(tx+8, ty+26, 2, 12);
                        } else if (obj === TileType.CHEST) {
                            ctx.fillStyle = '#854d0e'; ctx.fillRect(tx + 6, ty + 10, TILE_SIZE - 12, TILE_SIZE - 16); ctx.strokeStyle = '#422006'; ctx.lineWidth = 2; ctx.strokeRect(tx + 6, ty + 10, TILE_SIZE - 12, TILE_SIZE - 16); ctx.fillStyle = '#fcd34d'; ctx.fillRect(tx + TILE_SIZE/2 - 3, ty + TILE_SIZE/2, 6, 8);
                        } else if (obj === TileType.SAPLING) {
                            ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2, ty + TILE_SIZE - 5); ctx.quadraticCurveTo(tx + TILE_SIZE/2 + 5, ty + TILE_SIZE/2, tx + TILE_SIZE/2 + 10, ty + TILE_SIZE/2 - 5); ctx.moveTo(tx + TILE_SIZE/2, ty + TILE_SIZE - 5); ctx.quadraticCurveTo(tx + TILE_SIZE/2 - 5, ty + TILE_SIZE/2, tx + TILE_SIZE/2 - 10, ty + TILE_SIZE/2 - 5); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke();
                        } else if (obj === TileType.PINE_SAPLING) {
                             ctx.fillStyle = '#10B981'; ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2, ty + TILE_SIZE*0.4); ctx.lineTo(tx + TILE_SIZE*0.3, ty + TILE_SIZE*0.8); ctx.lineTo(tx + TILE_SIZE*0.7, ty + TILE_SIZE*0.8); ctx.fill(); ctx.strokeStyle = '#064E3B'; ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2, ty + TILE_SIZE*0.8); ctx.lineTo(tx + TILE_SIZE/2, ty + TILE_SIZE*0.9); ctx.stroke();
                        } else if (obj === TileType.BUSH_SAPLING) {
                            ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(tx + TILE_SIZE/2, ty + TILE_SIZE - 8, 4, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2, ty + TILE_SIZE - 5); ctx.quadraticCurveTo(tx + TILE_SIZE/2 + 3, ty + TILE_SIZE - 12, tx + TILE_SIZE/2 + 6, ty + TILE_SIZE - 15); ctx.moveTo(tx + TILE_SIZE/2, ty + TILE_SIZE - 5); ctx.quadraticCurveTo(tx + TILE_SIZE/2 - 3, ty + TILE_SIZE - 12, tx + TILE_SIZE/2 - 6, ty + TILE_SIZE - 15); ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.stroke();
                        } else if (obj === TileType.WHEAT_CROP) {
                            ctx.strokeStyle = '#86efac'; ctx.lineWidth = 2; for(let i=-2; i<=2; i++) { ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2, ty + TILE_SIZE - 2); ctx.lineTo(tx + TILE_SIZE/2 + i*3, ty + TILE_SIZE - 10 - Math.abs(i)); ctx.stroke(); }
                        } else if (obj === TileType.WHEAT_PLANT) {
                            ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; for(let i=-3; i<=3; i+=2) { ctx.beginPath(); ctx.moveTo(tx + TILE_SIZE/2 + i*2, ty + TILE_SIZE - 2); ctx.lineTo(tx + TILE_SIZE/2 + i*3, ty + TILE_SIZE - 20 - (rng()*10)); ctx.stroke(); ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.ellipse(tx + TILE_SIZE/2 + i*3, ty + TILE_SIZE - 24, 2, 4, 0, 0, Math.PI*2); ctx.fill(); }
                        } else if (obj === TileType.CLAM) {
                            ctx.fillStyle = '#fce7f3'; const cx = tx + TILE_SIZE/2; const cy = ty + TILE_SIZE/2 + 5; ctx.beginPath(); ctx.arc(cx, cy, 12, Math.PI, 0); ctx.bezierCurveTo(cx+12, cy+5, cx-12, cy+5, cx-12, cy); ctx.fill(); ctx.strokeStyle = '#fbcfe8'; ctx.lineWidth = 1; ctx.stroke(); ctx.beginPath(); for(let i=1; i<4; i++) { const ang = Math.PI + (Math.PI/4) * i; ctx.moveTo(cx, cy+4); ctx.lineTo(cx + Math.cos(ang)*10, cy + Math.sin(ang)*10); } ctx.stroke();
                        } else if (obj === TileType.BUSH) {
                            const greenBase = [21, 128, 61]; const drawBushLeaf = (ox: number, oy: number, r: number) => { ctx.beginPath(); ctx.arc(tx + TILE_SIZE*ox, ty + TILE_SIZE*oy, TILE_SIZE*r, 0, Math.PI*2); ctx.fillStyle = `rgb(${greenBase[0]}, ${greenBase[1] + (rng()*30)}, ${greenBase[2]})`; ctx.fill(); };
                            drawBushLeaf(0.3, 0.7, 0.25); drawBushLeaf(0.7, 0.7, 0.25); drawBushLeaf(0.5, 0.5, 0.3); drawBushLeaf(0.2, 0.5, 0.2); drawBushLeaf(0.8, 0.5, 0.2); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(tx + TILE_SIZE*0.4, ty + TILE_SIZE*0.5, 3, 0, Math.PI*2); ctx.arc(tx + TILE_SIZE*0.6, ty + TILE_SIZE*0.45, 3, 0, Math.PI*2); ctx.arc(tx + TILE_SIZE*0.5, ty + TILE_SIZE*0.6, 3, 0, Math.PI*2); ctx.fill();
                        } else if (obj === TileType.CACTUS) {
                            ctx.fillStyle = '#16a34a'; ctx.fillRect(tx + TILE_SIZE*0.4, ty + TILE_SIZE*0.2, TILE_SIZE*0.2, TILE_SIZE*0.7); ctx.fillRect(tx + TILE_SIZE*0.2, ty + TILE_SIZE*0.35, TILE_SIZE*0.2, TILE_SIZE*0.1); ctx.fillRect(tx + TILE_SIZE*0.2, ty + TILE_SIZE*0.25, TILE_SIZE*0.1, TILE_SIZE*0.2); ctx.fillRect(tx + TILE_SIZE*0.6, ty + TILE_SIZE*0.45, TILE_SIZE*0.2, TILE_SIZE*0.1); ctx.fillRect(tx + TILE_SIZE*0.7, ty + TILE_SIZE*0.35, TILE_SIZE*0.1, TILE_SIZE*0.2);
                        } else if (obj === TileType.TALL_GRASS) {
                            ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; const h1 = (rng() * 10) + 15; const h2 = (rng() * 10) + 10; const h3 = (rng() * 10) + 18; ctx.beginPath(); ctx.moveTo(tx + 10, ty + 38); ctx.quadraticCurveTo(tx + 5, ty + 38 - h1/2, tx + 8, ty + 38 - h1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(tx + 24, ty + 40); ctx.quadraticCurveTo(tx + 28, ty + 40 - h2/2, tx + 20, ty + 40 - h2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(tx + 36, ty + 36); ctx.quadraticCurveTo(tx + 42, ty + 36 - h3/2, tx + 40, ty + 36 - h3); ctx.stroke();
                        } else if (obj === TileType.COBWEB) {
                            ctx.strokeStyle = 'rgba(229, 231, 235, 0.6)'; ctx.lineWidth = 1; ctx.beginPath(); for(let r=4; r<=20; r+=6) { ctx.moveTo(tx + TILE_SIZE/2 + r, ty + TILE_SIZE/2); ctx.arc(tx + TILE_SIZE/2, ty + TILE_SIZE/2, r, 0, Math.PI*2); } for(let a=0; a<Math.PI*2; a+=Math.PI/4) { ctx.moveTo(tx + TILE_SIZE/2, ty + TILE_SIZE/2); ctx.lineTo(tx + TILE_SIZE/2 + Math.cos(a)*20, ty + TILE_SIZE/2 + Math.sin(a)*20); } ctx.stroke();
                        } else if (obj === TileType.SNOW_PILE || obj === TileType.SNOW_BLOCK) {
                            ctx.fillStyle = '#F1F5F9'; ctx.beginPath(); ctx.ellipse(tx + TILE_SIZE/2, ty + TILE_SIZE*0.7, TILE_SIZE*0.4, TILE_SIZE*0.2, 0, 0, Math.PI*2); ctx.fill();
                            ctx.fillStyle = '#E2E8F0'; ctx.beginPath(); ctx.ellipse(tx + TILE_SIZE/2 - 5, ty + TILE_SIZE*0.65, TILE_SIZE*0.2, TILE_SIZE*0.1, 0, 0, Math.PI*2); ctx.fill();
                        } else {
                            ctx.fillStyle = COLORS[obj] || '#ff00ff'; ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                        }
                    }

                    // Breaking Animation
                    if (breakingAction && breakingAction.x === gx && breakingAction.y === gy) {
                        const pct = Math.min(breakingAction.timer / breakingAction.maxTime, 1.0);
                        const shakeX = (Math.random() - 0.5) * 4 * pct;
                        const shakeY = (Math.random() - 0.5) * 4 * pct;
                        ctx.save();
                        ctx.translate(shakeX, shakeY);
                        ctx.beginPath();
                        ctx.arc(gx * TILE_SIZE + TILE_SIZE/2, gy * TILE_SIZE + TILE_SIZE/2, 10, -Math.PI/2, (-Math.PI/2) + (Math.PI * 2 * pct));
                        ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.stroke();
                        ctx.restore();
                    }
                }
            }

            // 3. Dropped Items
            if (chunk.droppedItems) {
                for (const item of chunk.droppedItems) {
                     const offset = Math.sin(time * 5 + item.floatOffset) * 3; 
                     drawItem(ctx, item.type, item.x, item.y, offset);
                }
            }

            // 4. Entities
            for (const ent of chunk.entities) {
                const ex = ent.x * TILE_SIZE;
                const ey = ent.y * TILE_SIZE;
                
                if (ent.type === EntityType.ARROW || ent.type === EntityType.POISON_ARROW) {
                    const isPoison = ent.type === EntityType.POISON_ARROW;
                    // Draw Arrow
                    ctx.save();
                    ctx.translate(ex, ey);
                    // Rotate based on velocity or stored rotation
                    ctx.rotate(ent.rotation || 0);
                    
                    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 2; 
                    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke(); 
                    // Head
                    ctx.strokeStyle = isPoison ? '#22C55E' : '#9CA3AF'; 
                    ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(12, 0); ctx.lineTo(8, 4); ctx.stroke();
                    if (isPoison) { ctx.fillStyle = '#4ADE80'; ctx.beginPath(); ctx.arc(10, 0, 1.5, 0, Math.PI*2); ctx.fill(); }
                    
                    // Fletching
                    ctx.strokeStyle = '#F3F4F6';
                    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-16, -4); ctx.moveTo(-12, 0); ctx.lineTo(-16, 4); ctx.stroke();
                    
                    ctx.restore();
                }
                else if (ent.type === EntityType.SNOWBALL) {
                     ctx.save(); ctx.translate(ex, ey);
                     ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1;
                     ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                     ctx.restore();
                }
                else if (ent.type === EntityType.BOAT) {
                    ctx.fillStyle = '#854d0e'; ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 3;
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
                    const facingMultiplier = ent.facing === 'right' ? 1 : -1;
                    ctx.save(); ctx.translate(ex, ey); ctx.scale(facingMultiplier, 1);
                    ctx.beginPath(); ctx.moveTo(-22, -6); ctx.quadraticCurveTo(0, 16, 22, -6); ctx.lineTo(16, 6); ctx.quadraticCurveTo(0, 20, -16, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
                    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
                    ctx.fillStyle = '#5D4037'; ctx.fillRect(-7, 0, 14, 4);
                    if (ent.id !== drivingId) { ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 6, 14, 0, Math.PI, false); ctx.stroke(); }
                    ctx.restore();
                } else if (ent.type === EntityType.COW) {
                    ctx.fillStyle = '#4B2515'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
                    const facingMultiplier = ent.facing === 'right' ? 1 : -1;
                    ctx.save(); ctx.translate(ex, ey); ctx.scale(facingMultiplier, 1); 
                    ctx.fillRect(-16, -12, 32, 24); ctx.strokeRect(-16, -12, 32, 24);
                    ctx.fillStyle = '#fff'; ctx.fillRect(-10, -8, 8, 8); ctx.fillRect(4, -5, 6, 6);
                    ctx.fillStyle = '#4B2515'; ctx.fillRect(16, -16, 16, 16); ctx.strokeRect(16, -16, 16, 16);
                    ctx.fillStyle = '#ddd'; ctx.fillRect(18, -20, 3, 4); ctx.fillRect(27, -20, 3, 4);
                    ctx.fillStyle = '#29140A'; ctx.fillRect(-14, 12, 6, 8); ctx.fillRect(8, 12, 6, 8);
                    ctx.restore();
                } else if (ent.type === EntityType.RABBIT) {
                    ctx.fillStyle = '#F4F4F5'; ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 1;
                    const facingMultiplier = ent.facing === 'right' ? 1 : -1;
                    ctx.save(); ctx.translate(ex, ey); ctx.scale(facingMultiplier, 1); 
                    // Body
                    ctx.beginPath(); ctx.ellipse(0, 4, 10, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                    // Head
                    ctx.beginPath(); ctx.ellipse(8, -4, 6, 5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                    // Ears
                    ctx.fillStyle = '#F4F4F5'; 
                    ctx.beginPath(); ctx.ellipse(6, -12, 2, 6, -0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.ellipse(10, -12, 2, 6, 0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                    // Eye
                    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(10, -5, 1, 0, Math.PI*2); ctx.fill();
                    ctx.restore();
                } else if (ent.type === EntityType.SNAKE || ent.type === EntityType.POISON_SNAKE) {
                    const isPoison = ent.type === EntityType.POISON_SNAKE;
                    ctx.strokeStyle = isPoison ? '#047857' : '#14532D'; // Dark green vs Emerald
                    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                    const facingMultiplier = ent.facing === 'right' ? 1 : -1;
                    ctx.save(); ctx.translate(ex, ey); ctx.scale(facingMultiplier, 1);
                    const wiggle = Math.sin(time * 10 + ent.x * 5) * 3;
                    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(-5, wiggle, 0, 0); ctx.quadraticCurveTo(5, -wiggle, 12, 0); ctx.stroke();
                    // Head
                    ctx.fillStyle = isPoison ? '#10B981' : '#166534'; 
                    ctx.beginPath(); ctx.ellipse(14, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
                    // Tongue
                    if (Math.sin(time * 15) > 0.5) { ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(22, -2); ctx.moveTo(18, 0); ctx.lineTo(22, 2); ctx.stroke(); }
                    
                    if (isPoison) {
                         ctx.fillStyle = '#34D399'; ctx.beginPath(); ctx.arc(14, -1, 1, 0, Math.PI*2); ctx.fill();
                    }

                    ctx.restore();
                } else if (ent.type === EntityType.SCORPION) {
                    ctx.fillStyle = '#78350F'; ctx.strokeStyle = '#451a03';
                    const facingMultiplier = ent.facing === 'right' ? 1 : -1;
                    ctx.save(); ctx.translate(ex, ey); ctx.scale(facingMultiplier, 1);
                    ctx.beginPath(); ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-15, -10, -5, -15); ctx.stroke();
                    ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(-5, -15, 2, 0, Math.PI * 2); ctx.fill();
                    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(4, 12); ctx.moveTo(0, 5); ctx.lineTo(-4, 12); ctx.moveTo(4, 4); ctx.lineTo(8, 10); ctx.moveTo(-4, 4); ctx.lineTo(-8, 10); ctx.stroke();
                    ctx.fillStyle = '#92400E'; ctx.beginPath(); ctx.ellipse(12, 4, 4, 2, 0.5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(12, -4, 4, 2, -0.5, 0, Math.PI*2); ctx.fill();
                    ctx.restore();
                } else if (ent.type === EntityType.SPIDER || ent.type === EntityType.POISON_SPIDER) {
                    const isPoison = ent.type === EntityType.POISON_SPIDER;
                    ctx.fillStyle = isPoison ? '#4C1D95' : '#171717'; 
                    ctx.save(); ctx.translate(ex, ey);
                    ctx.beginPath(); ctx.ellipse(0, 4, 8, 10, 0, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(0, -6, 5, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = isPoison ? '#4ADE80' : '#DC2626'; 
                    ctx.beginPath(); ctx.arc(-2, -8, 1.5, 0, Math.PI*2); ctx.arc(2, -8, 1.5, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = '#171717'; ctx.lineWidth = 2;
                    for(let i=0; i<4; i++) { ctx.beginPath(); ctx.moveTo(-4, 2 + i*2); ctx.lineTo(-12, -2 + i*3); ctx.lineTo(-16, 6 + i*3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, 2 + i*2); ctx.lineTo(12, -2 + i*3); ctx.lineTo(16, 6 + i*3); ctx.stroke(); }
                    if (isPoison) { ctx.fillStyle = '#A78BFA'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, 8); ctx.lineTo(-3, 8); ctx.fill(); }
                    ctx.restore();
                }

                if (ent.type !== EntityType.BOAT && ent.type !== EntityType.ARROW && ent.type !== EntityType.POISON_ARROW && ent.type !== EntityType.SNOWBALL && ent.health < ent.maxHealth) {
                    ctx.fillStyle = 'red'; ctx.fillRect(ex - 15, ey - 30, 30, 4);
                    ctx.fillStyle = 'lime'; ctx.fillRect(ex - 15, ey - 30, (ent.health / ent.maxHealth) * 30, 4);
                }
            }
        }
    }

    // 5. Draw Player
    const screenPx = player.x * TILE_SIZE; const screenPy = player.y * TILE_SIZE;
    ctx.save(); ctx.translate(screenPx, screenPy); ctx.rotate(player.rotation + Math.PI/2); 

    // Helper to draw backpack
    const drawBackpack = () => {
        if (player.equipment.bag && player.equipment.bag.type === ItemType.BACKPACK) {
            ctx.fillStyle = '#854D0E'; ctx.strokeStyle = '#422006'; ctx.lineWidth = 1;
            // Shifted Y to positive (Back area)
            ctx.fillRect(-TILE_SIZE*0.2, TILE_SIZE*0.1, TILE_SIZE*0.4, TILE_SIZE*0.2);
            ctx.strokeRect(-TILE_SIZE*0.2, TILE_SIZE*0.1, TILE_SIZE*0.4, TILE_SIZE*0.2);
            // Straps visual (hints)
            ctx.fillStyle = '#422006';
            ctx.fillRect(-TILE_SIZE*0.22, TILE_SIZE*0.05, 4, TILE_SIZE*0.25);
            ctx.fillRect(TILE_SIZE*0.22 - 4, TILE_SIZE*0.05, 4, TILE_SIZE*0.25);
        }
    };

    // Layering Logic:
    // If NOT facing 'up' (Front Visible), draw Backpack FIRST (Behind Body)
    if (player.facing !== 'up') {
        drawBackpack();
    }

    // Body
    ctx.fillStyle = '#fca5a5'; 
    if (player.equipment.body) ctx.fillStyle = player.equipment.body.type === ItemType.ARMOR_GOLD ? '#FCD34D' : player.equipment.body.type === ItemType.ARMOR_IRON ? '#9CA3AF' : '#C2410C';
    ctx.beginPath(); ctx.arc(0, 0, TILE_SIZE * 0.25, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    // Armor details
    if (player.equipment.body) { 
        ctx.strokeStyle = player.equipment.body.type === ItemType.ARMOR_GOLD ? '#B45309' : player.equipment.body.type === ItemType.ARMOR_IRON ? '#4B5563' : '#7C2D12'; 
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-TILE_SIZE*0.25, 0); ctx.lineTo(TILE_SIZE*0.25, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-TILE_SIZE*0.2, -TILE_SIZE*0.1); ctx.lineTo(TILE_SIZE*0.2, -TILE_SIZE*0.1); ctx.stroke(); 
    }
    
    // If facing 'up' (Back Visible), draw Backpack AFTER Body but BEFORE Head
    if (player.facing === 'up') {
        drawBackpack();
    }
    
    // Draw Held Item (Moved to front/side, and drawn AFTER body so it layers on top if overlapping)
    const heldItem = player.inventory[player.selectedItemIndex];
    if (heldItem) {
        ctx.save();
        // Positioned at negative Y (Front), slightly right
        ctx.translate(TILE_SIZE * 0.35, -TILE_SIZE * 0.3); 
        ctx.rotate(Math.PI / 4); // Angled forward
        ctx.scale(0.5, 0.5); 
        ctx.translate(-24, -24); 
        drawItemSprite(ctx, heldItem.type);
        ctx.restore();
    }

    // Hands (Drawn last to be "holding" the item or in front of body)
    ctx.fillStyle = '#fca5a5'; 
    ctx.beginPath(); ctx.arc(-TILE_SIZE * 0.25, -TILE_SIZE * 0.1, TILE_SIZE * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // Left Hand
    ctx.beginPath(); ctx.arc(TILE_SIZE * 0.25, -TILE_SIZE * 0.1, TILE_SIZE * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // Right Hand

    // Head (Drawn on top of everything)
    if (player.equipment.head) { 
        const isIron = player.equipment.head.type === ItemType.HELMET_IRON;
        const isGold = player.equipment.head.type === ItemType.HELMET_GOLD;
        ctx.fillStyle = isGold ? '#FCD34D' : isIron ? '#D1D5DB' : '#C2410C'; 
        ctx.strokeStyle = isGold ? '#B45309' : isIron ? '#4B5563' : '#7C2D12'; 
        ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, TILE_SIZE * 0.28, 0, Math.PI); ctx.lineTo(-TILE_SIZE*0.28, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, TILE_SIZE * 0.28, Math.PI, 0); 
        ctx.fillStyle = isGold ? '#FEF3C7' : isIron ? '#E5E7EB' : '#EA580C'; 
        ctx.fill(); ctx.stroke(); 
    }
    
    // Charm visual
    if (player.equipment.accessory && player.equipment.accessory.type === ItemType.CHARM) {
        ctx.fillStyle = '#EF4444'; ctx.strokeStyle = '#FBBF24'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, TILE_SIZE*0.15, 3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }
    
    ctx.restore();

    // 5.5 Fishing Line
    if (fishingState) {
        ctx.beginPath();
        ctx.moveTo(screenPx, screenPy);
        const bobberX = fishingState.x * TILE_SIZE + TILE_SIZE/2;
        const bobberY = fishingState.y * TILE_SIZE + TILE_SIZE/2;
        
        // Curved line for effect (Reduced curve height from -50 to -20)
        const cx = (screenPx + bobberX) / 2;
        const cy = Math.min(screenPx, bobberY) - 20; 
        
        ctx.quadraticCurveTo(cx, cy, bobberX, bobberY);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bobber
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bobberX, bobberY - 2, 4, 0, Math.PI, true);
        ctx.fill();
        
        // Ripple effect if waiting
        if (Math.sin(time * 10) > 0.5) {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bobberX, bobberY, 6 + Math.sin(time*10)*2, 0, Math.PI*2);
            ctx.stroke();
        }
    }

    // 6. Mouse Cursor Outline
    const mouseWorldX = Math.floor(((mouse.x - width/2)/zoom + width/2 + camera.x) / TILE_SIZE);
    const mouseWorldY = Math.floor(((mouse.y - height/2)/zoom + height/2 + camera.y) / TILE_SIZE);
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
    ctx.strokeRect(mouseWorldX * TILE_SIZE, mouseWorldY * TILE_SIZE, TILE_SIZE, TILE_SIZE);

    // 7. Particles
    particles.forEach(p => { ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.beginPath(); ctx.arc(p.x * TILE_SIZE, p.y * TILE_SIZE, p.size, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1.0; });

    ctx.restore();
};