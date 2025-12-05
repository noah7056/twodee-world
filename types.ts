

export enum TileType {
  GRASS = 0,
  WATER = 1,
  SAND = 2,
  TREE = 3,
  ROCK = 4,
  IRON_ORE = 5,
  BUSH = 6,
  WALL_WOOD = 100,
  FLOOR_WOOD = 101,
  WALL_STONE = 102,
  CRAFTING_STATION = 103,
  SAPLING = 104,
  CLAM = 105,
  CHEST = 106,
  BUSH_SAPLING = 107,
  CACTUS = 108,
  TALL_GRASS = 109,
  MOUNTAIN = 110,
  COBWEB = 111,
  WHEAT_CROP = 112,
  WHEAT_PLANT = 113,
  FLOOR_STONE = 114,
  GOLD_ORE = 115,
  SNOW = 116,
  PINE_TREE = 117,
  PINE_SAPLING = 118,
  SNOW_PILE = 119,
  SNOW_BLOCK = 120,
}

export enum ItemType {
  WOOD = 'WOOD',
  STONE = 'STONE',
  IRON = 'IRON',
  BERRY = 'BERRY',
  WOOD_AXE = 'WOOD_AXE',
  STONE_AXE = 'STONE_AXE',
  IRON_AXE = 'IRON_AXE',
  WOOD_PICKAXE = 'WOOD_PICKAXE',
  STONE_PICKAXE = 'STONE_PICKAXE',
  IRON_PICKAXE = 'IRON_PICKAXE',
  WOOD_SWORD = 'WOOD_SWORD',
  STONE_SWORD = 'STONE_SWORD',
  IRON_SWORD = 'IRON_SWORD',
  WALL_WOOD_ITEM = 'WALL_WOOD_ITEM',
  FLOOR_WOOD_ITEM = 'FLOOR_WOOD_ITEM',
  WALL_STONE_ITEM = 'WALL_STONE_ITEM',
  CRAFTING_STATION_ITEM = 'CRAFTING_STATION_ITEM',
  CHEST_ITEM = 'CHEST_ITEM',
  SAPLING = 'SAPLING',
  CLAM = 'CLAM',
  HELMET_LEATHER = 'HELMET_LEATHER',
  ARMOR_LEATHER = 'ARMOR_LEATHER',
  HELMET_IRON = 'HELMET_IRON',
  ARMOR_IRON = 'ARMOR_IRON',
  BERRY_SEED = 'BERRY_SEED',
  CACTUS = 'CACTUS',
  RAW_BEEF = 'RAW_BEEF',
  LEATHER = 'LEATHER',
  PLANT_FIBER = 'PLANT_FIBER',
  SNAKE_FANG = 'SNAKE_FANG',
  COBWEB = 'COBWEB',
  BOAT = 'BOAT',
  WHEAT_SEEDS = 'WHEAT_SEEDS',
  WHEAT = 'WHEAT',
  BREAD = 'BREAD',
  FLOOR_STONE_ITEM = 'FLOOR_STONE_ITEM',
  RUBY = 'RUBY',
  GOLD = 'GOLD',
  GOLD_AXE = 'GOLD_AXE',
  GOLD_PICKAXE = 'GOLD_PICKAXE',
  GOLD_SWORD = 'GOLD_SWORD',
  HELMET_GOLD = 'HELMET_GOLD',
  ARMOR_GOLD = 'ARMOR_GOLD',
  CHARM = 'CHARM',
  FISHING_ROD = 'FISHING_ROD',
  SALMON = 'SALMON',
  COD = 'COD',
  STRING = 'STRING',
  BOW = 'BOW',
  ARROW = 'ARROW',
  SNOWBALL = 'SNOWBALL',
  SNOW_BLOCK = 'SNOW_BLOCK',
  PINE_SAPLING = 'PINE_SAPLING',
  RABBIT_LEG = 'RABBIT_LEG',
  BACKPACK = 'BACKPACK',
  POISON_ARROW = 'POISON_ARROW',
}

export enum EntityType {
  COW = 'COW',
  SNAKE = 'SNAKE',
  SCORPION = 'SCORPION',
  SPIDER = 'SPIDER',
  POISON_SPIDER = 'POISON_SPIDER',
  POISON_SNAKE = 'POISON_SNAKE',
  BOAT = 'BOAT',
  ARROW = 'ARROW',
  POISON_ARROW = 'POISON_ARROW',
  SNOWBALL = 'SNOWBALL',
  RABBIT = 'RABBIT',
}

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  vx?: number; // Velocity X
  vy?: number; // Velocity Y
  health: number;
  maxHealth: number;
  state: 'idle' | 'wander' | 'flee' | 'chase';
  stateTimer: number; // Time remaining in current state
  targetX?: number;
  targetY?: number;
  facing: 'left' | 'right';
  attackCooldown?: number;
  drownTimer: number;
  rotation?: number; // For projectiles
}

export type EquipmentSlot = 'head' | 'body' | 'accessory' | 'bag';

export interface InventoryItem {
  type: ItemType;
  count: number;
  durability?: number;
  maxDurability?: number;
  // For items that contain other items (Backpack)
  contents?: (InventoryItem | null)[];
}

export interface DroppedItem {
  id: string;
  type: ItemType;
  count: number;
  x: number;
  y: number;
  durability?: number;
  maxDurability?: number;
  contents?: (InventoryItem | null)[]; // Dropped backpacks keep items
  pickupDelay: number;
  floatOffset: number;
  lifeTime: number; // Items despawn after a while
}

export interface Player {
  x: number;
  y: number;
  inventory: (InventoryItem | null)[];
  equipment: {
      head: InventoryItem | null;
      body: InventoryItem | null;
      accessory: InventoryItem | null;
      bag: InventoryItem | null;
  };
  selectedItemIndex: number;
  facing: 'up' | 'down' | 'left' | 'right';
  rotation: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  poisonTimer: number;
}

export interface Chunk {
  x: number;
  y: number;
  tiles: number[][]; // [y][x]
  objects: Record<string, number>; // key "lx,ly"
  containers: Record<string, (InventoryItem | null)[]>; // key "lx,ly"
  entities: Entity[];
  droppedItems: DroppedItem[];
  // Optimization: Cached canvas for the static terrain to avoid re-drawing every frame
  terrainCache?: HTMLCanvasElement | null;
}

export interface World {
  chunks: Record<string, Chunk>; // key "cx,cy"
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export type RecipeCategory = 'gear' | 'block' | 'food' | 'misc';

export interface Recipe {
  result: ItemType;
  count: number;
  ingredients: { type: ItemType; count: number }[];
  description: string;
  requiresStation: boolean;
  initialDurability?: number;
  category: RecipeCategory;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface WorldSeedConfig {
    seed: number;
    seedY: number;
    rotation: number;
    tempOffset: number;
    mountainOffset: number;
}

// Save System Types
export interface SaveMeta {
    id: number;
    name: string;
    lastPlayed: number; // timestamp
}

export interface SaveData {
    meta: SaveMeta;
    player: {
        x: number;
        y: number;
        health: number;
        stamina: number;
        inventory: (InventoryItem | null)[];
        equipment: { head: InventoryItem | null, body: InventoryItem | null, accessory: InventoryItem | null, bag: InventoryItem | null };
        rotation: number;
        poisonTimer?: number;
    };
    world: {
        chunks: Record<string, Chunk>;
        saplings: {x: number, y: number, plantTime: number, isWheat?: boolean, isPine?: boolean}[];
        seedConfig: WorldSeedConfig;
    };
    camera: { x: number, y: number };
}

// Settings Types
export interface Keybinds {
    moveUp: string;
    moveDown: string;
    moveLeft: string;
    moveRight: string;
    inventory: string;
    run: string;
}

export interface Settings {
    guiScale: number;
    cameraZoom: number;
    keybinds: Keybinds;
}