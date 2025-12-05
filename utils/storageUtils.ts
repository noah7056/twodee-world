

import { SaveData, SaveMeta, Settings } from "../types";
import { getRandomConfig } from "./gameUtils";
import { DEFAULT_SETTINGS } from "../constants";

const STORAGE_PREFIX = 'twodee_save_';
const SETTINGS_KEY = 'twodee_settings';

export const getSaveKey = (id: number) => `${STORAGE_PREFIX}${id}`;

export const listSaves = (): (SaveMeta | null)[] => {
    const saves: (SaveMeta | null)[] = [];
    for (let i = 1; i <= 3; i++) {
        const raw = localStorage.getItem(getSaveKey(i));
        if (raw) {
            try {
                const data = JSON.parse(raw) as SaveData;
                saves.push(data.meta);
            } catch (e) {
                console.error("Failed to parse save", i, e);
                saves.push(null);
            }
        } else {
            saves.push(null);
        }
    }
    return saves;
};

export const loadSave = (id: number): SaveData | null => {
    const raw = localStorage.getItem(getSaveKey(id));
    if (!raw) return null;
    try {
        const data = JSON.parse(raw) as SaveData;
        // Migration for older saves: Add accessory slot if missing
        if (!data.player.equipment.accessory) {
            data.player.equipment.accessory = null;
        }
        // Migration: Add bag slot
        if (!data.player.equipment.bag) {
            data.player.equipment.bag = null;
        }
        return data;
    } catch (e) {
        console.error("Failed to load save", id, e);
        return null;
    }
};

export const saveGame = (id: number, data: SaveData) => {
    try {
        // Update lastPlayed
        data.meta.lastPlayed = Date.now();
        // Use replacer to exclude terrainCache from being saved as {}
        const serialized = JSON.stringify(data, (key, value) => {
            if (key === 'terrainCache') return undefined;
            return value;
        });
        localStorage.setItem(getSaveKey(id), serialized);
    } catch (e) {
        console.error("Failed to save game", id, e);
    }
};

export const deleteSave = (id: number) => {
    localStorage.removeItem(getSaveKey(id));
};

export const createSave = (id: number, name: string): SaveData => {
    // Returns a skeleton save. The game engine will populate the world chunks on first load.
    // The App component will populate player stats.
    const meta: SaveMeta = {
        id,
        name,
        lastPlayed: Date.now()
    };
    
    // We return a "Partial" state that prompts the engines to init defaults
    // But logically, we construct the full object structure here with defaults
    // to be safe, although mostly empty.
    const newSave: SaveData = {
        meta,
        player: {
            x: 0, y: 0,
            health: 100, stamina: 100,
            inventory: Array(24).fill(null),
            equipment: { head: null, body: null, accessory: null, bag: null },
            rotation: 0,
            poisonTimer: 0
        },
        world: {
            chunks: {}, // Empty chunks trigger generation
            saplings: [],
            seedConfig: getRandomConfig() // Generate specific seed for this world
        },
        camera: { x: 0, y: 0 }
    };
    
    // FORCE SAVE TO DISK IMMEDIATELY
    // This ensures loadSave() in App.tsx finds it.
    saveGame(id, newSave);
    
    return newSave;
};

export const renameSave = (id: number, newName: string) => {
    const data = loadSave(id);
    if (data) {
        data.meta.name = newName;
        saveGame(id, data);
    }
};

// --- Settings Storage ---

export const loadSettings = (): Settings => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    try {
        const loaded = JSON.parse(raw);
        // Merge with defaults in case new settings were added in updates
        return { ...DEFAULT_SETTINGS, ...loaded, keybinds: { ...DEFAULT_SETTINGS.keybinds, ...loaded.keybinds } };
    } catch (e) {
        console.error("Failed to load settings", e);
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = (settings: Settings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings", e);
    }
};