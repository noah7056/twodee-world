import { useEffect, useRef } from 'react';

export const useInput = (disabled: boolean) => {
    const keysPressed = useRef<Record<string, boolean>>({});
    const mouse = useRef({ x: 0, y: 0, leftDown: false, rightDown: false });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (disabled) return;
            keysPressed.current[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
             keysPressed.current[e.key.toLowerCase()] = false;
        };
        
        const handleMouseMove = (e: MouseEvent) => { 
            mouse.current.x = e.clientX; 
            mouse.current.y = e.clientY; 
        };
        const handleMouseDown = (e: MouseEvent) => {
            if (disabled) return;
            if (e.button === 0) mouse.current.leftDown = true;
            if (e.button === 2) mouse.current.rightDown = true;
        };
        const handleMouseUp = (e: MouseEvent) => {
            if (e.button === 0) mouse.current.leftDown = false;
            if (e.button === 2) mouse.current.rightDown = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        // Prevent context menu on right click for game interaction
        window.addEventListener('contextmenu', e => e.preventDefault());

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [disabled]);

    // Reset inputs when disabled (e.g. opening inventory)
    useEffect(() => {
        if (disabled) {
            keysPressed.current = {};
            mouse.current.leftDown = false;
            mouse.current.rightDown = false;
        }
    }, [disabled]);

    return { keysPressed, mouse };
};