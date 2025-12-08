

import React, { useRef, useEffect } from 'react';
import { World, TileType, ItemType } from '../types';
import { CHUNK_SIZE, COLORS } from '../constants';
import { getChunkCoords, getChunkKey } from '../utils/gameUtils';

interface MinimapProps {
    world: World;
    playerX: number;
    playerY: number;
    deathLocation: { x: number, y: number, time: number } | null;
    size?: number;
}

const DEATH_MARKER_DURATION = 5 * 60 * 1000; // 5 minutes in ms

// Helper to clamp position to minimap edge with margin
const clampToEdge = (x: number, y: number, size: number, margin: number = 8): { x: number, y: number, clamped: boolean } => {
    const minBound = margin;
    const maxBound = size - margin;

    let clampedX = x;
    let clampedY = y;
    let clamped = false;

    if (x < minBound || x > maxBound || y < minBound || y > maxBound) {
        clamped = true;
        // Project to edge - find intersection with border
        const centerX = size / 2;
        const centerY = size / 2;
        const dx = x - centerX;
        const dy = y - centerY;

        if (dx === 0 && dy === 0) {
            return { x, y, clamped: false };
        }

        // Find the scale factor to reach the edge
        const scaleX = dx !== 0 ? (dx > 0 ? (maxBound - centerX) / dx : (minBound - centerX) / dx) : Infinity;
        const scaleY = dy !== 0 ? (dy > 0 ? (maxBound - centerY) / dy : (minBound - centerY) / dy) : Infinity;
        const scale = Math.min(Math.abs(scaleX), Math.abs(scaleY));

        clampedX = centerX + dx * scale;
        clampedY = centerY + dy * scale;

        // Extra clamp just to be safe
        clampedX = Math.max(minBound, Math.min(maxBound, clampedX));
        clampedY = Math.max(minBound, Math.min(maxBound, clampedY));
    }

    return { x: clampedX, y: clampedY, clamped };
};

const Minimap: React.FC<MinimapProps> = ({ world, playerX, playerY, deathLocation, size = 150 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const mapRadius = 40; // Tiles to show in each direction
        const tileSize = size / (mapRadius * 2);

        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, size, size);

        // Draw tiles around player
        for (let dy = -mapRadius; dy < mapRadius; dy++) {
            for (let dx = -mapRadius; dx < mapRadius; dx++) {
                const worldX = Math.floor(playerX) + dx;
                const worldY = Math.floor(playerY) + dy;

                const { cx, cy, lx, ly } = getChunkCoords(worldX, worldY);
                const key = getChunkKey(cx, cy);
                const chunk = world.chunks[key];

                if (chunk) {
                    const tile = chunk.tiles[ly]?.[lx];
                    const obj = chunk.objects[`${lx},${ly}`];

                    // Get tile color
                    let color = COLORS[tile] || '#1a1a1a';

                    // Override with object color for mountains/trees
                    if (obj === TileType.TREE || obj === TileType.PINE_TREE) {
                        color = '#166534';
                    } else if (obj === TileType.ROCK || obj === TileType.IRON_ORE || obj === TileType.GOLD_ORE) {
                        color = '#57534e';
                    }

                    const screenX = (dx + mapRadius) * tileSize;
                    const screenY = (dy + mapRadius) * tileSize;

                    ctx.fillStyle = color;
                    ctx.fillRect(screenX, screenY, tileSize + 0.5, tileSize + 0.5);
                }
            }
        }

        // Draw spawn point indicator (always at 0,0) - with edge clamping
        const rawSpawnX = (0 - Math.floor(playerX) + mapRadius) * tileSize;
        const rawSpawnY = (0 - Math.floor(playerY) + mapRadius) * tileSize;
        const spawn = clampToEdge(rawSpawnX, rawSpawnY, size);

        // Draw house icon for spawn
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.moveTo(spawn.x, spawn.y - 4);
        ctx.lineTo(spawn.x + 4, spawn.y);
        ctx.lineTo(spawn.x + 4, spawn.y + 4);
        ctx.lineTo(spawn.x - 4, spawn.y + 4);
        ctx.lineTo(spawn.x - 4, spawn.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 1;
        ctx.stroke();

        // If spawn is clamped (off-screen), draw a triangle pointer towards it
        if (spawn.clamped) {
            const angle = Math.atan2(rawSpawnY - size / 2, rawSpawnX - size / 2);
            ctx.save();
            ctx.translate(spawn.x, spawn.y);
            ctx.rotate(angle);
            ctx.fillStyle = '#22C55E';
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(0, -4);
            ctx.lineTo(0, 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Draw death location if within 5 minutes
        if (deathLocation && Date.now() - deathLocation.time < DEATH_MARKER_DURATION) {
            const rawDeathX = (Math.floor(deathLocation.x) - Math.floor(playerX) + mapRadius) * tileSize;
            const rawDeathY = (Math.floor(deathLocation.y) - Math.floor(playerY) + mapRadius) * tileSize;
            const death = clampToEdge(rawDeathX, rawDeathY, size);

            // Draw skull icon for death
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(death.x, death.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#991B1B';
            ctx.lineWidth = 1;
            ctx.stroke();

            // X eyes
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(death.x - 3, death.y - 2);
            ctx.lineTo(death.x - 1, death.y);
            ctx.moveTo(death.x - 1, death.y - 2);
            ctx.lineTo(death.x - 3, death.y);
            ctx.moveTo(death.x + 1, death.y - 2);
            ctx.lineTo(death.x + 3, death.y);
            ctx.moveTo(death.x + 3, death.y - 2);
            ctx.lineTo(death.x + 1, death.y);
            ctx.stroke();

            // If death is clamped (off-screen), draw a triangle pointer towards it
            if (death.clamped) {
                const angle = Math.atan2(rawDeathY - size / 2, rawDeathX - size / 2);
                ctx.save();
                ctx.translate(death.x, death.y);
                ctx.rotate(angle);
                ctx.fillStyle = '#EF4444';
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(2, -4);
                ctx.lineTo(2, 4);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        // Draw player dot in center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();

    }, [world, playerX, playerY, deathLocation, size]);

    return (
        <div className="fixed bottom-24 left-4 z-20 pointer-events-none">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={size}
                    height={size}
                    className="rounded-lg border-2 border-stone-600 shadow-lg"
                    style={{ imageRendering: 'pixelated' }}
                />
                {/* Legend */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-white/70">Spawn</span>
                    </div>
                    {deathLocation && Date.now() - deathLocation.time < DEATH_MARKER_DURATION && (
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-white/70">Death</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Minimap;
