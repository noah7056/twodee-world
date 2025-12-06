import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
    onInput: (keys: Record<string, boolean>) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onInput }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);

    // Joystick state
    const [stickPos, setStickPos] = useState({ x: 0, y: 0 });

    // Constants
    const SIZE = 120; // Container size
    const STICK_SIZE = 50;
    const RADIUS = SIZE / 2;
    const MAX_DIST = RADIUS - STICK_SIZE / 2;

    const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
        if (!isActive) return;
        const touch = e.touches[0];
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;

        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const clampedDist = Math.min(dist, MAX_DIST);
        const x = Math.cos(angle) * clampedDist;
        const y = Math.sin(angle) * clampedDist;

        setStickPos({ x, y });

        // Map to WASD
        // Angle 0 is Right, PI/2 is Down, PI is Left, -PI/2 is Up
        const keys: Record<string, boolean> = {
            w: false, a: false, s: false, d: false
        };

        const deg = (angle * 180) / Math.PI;

        // Threshold for diagonal overlap (e.g. W+D)
        if (deg > -157.5 && deg < -22.5) keys.w = true; // Up-ish
        if (deg > 22.5 && deg < 157.5) keys.s = true;   // Down-ish
        if (deg > 112.5 || deg < -112.5) keys.a = true; // Left-ish
        if (deg > -67.5 && deg < 67.5) keys.d = true;   // Right-ish

        onInput(keys);
    };

    const handleTouchEnd = () => {
        setIsActive(false);
        setStickPos({ x: 0, y: 0 });
        onInput({ w: false, a: false, s: false, d: false });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsActive(true);
        // Initial move logic
    };

    // Global touch events when active to preventing losing grip when sliding out of div
    useEffect(() => {
        if (isActive) {
            window.addEventListener('touchmove', handleTouchMove as any, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        } else {
            window.removeEventListener('touchmove', handleTouchMove as any);
            window.removeEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('touchmove', handleTouchMove as any);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isActive]);

    return (
        <div
            ref={containerRef}
            className="fixed bottom-24 left-8 w-[120px] h-[120px] bg-black/30 rounded-full border-2 border-white/20 backdrop-blur-sm touch-none z-50 flex items-center justify-center p-0 m-0"
            onTouchStart={handleTouchStart}
            style={{ touchAction: 'none' }} // Crucial for preventing scroll
        >
            {/* Center Stick */}
            <div
                ref={stickRef}
                className="w-[50px] h-[50px] bg-white/50 rounded-full shadow-lg pointer-events-none absolute"
                style={{
                    transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
                    transition: isActive ? 'none' : 'transform 0.2s ease-out'
                }}
            />
        </div>
    );
};
