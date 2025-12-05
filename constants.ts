

import { ItemType, Recipe, TileType, EquipmentSlot, EntityType, Settings } from "./types";

export const TILE_SIZE = 48;
export const CHUNK_SIZE = 32; // 32x32 tiles per chunk
export const PLAYER_SPEED = 3; 
export const RUN_SPEED_MULTIPLIER = 2.5;
export const WATER_SPEED_MULTIPLIER = 0.3;
export const COBWEB_SPEED_MULTIPLIER = 0.2;
export const SNOW_SPEED_MULTIPLIER = 0.5; // Walking through snow piles
export const INVENTORY_SIZE = 24;
export const CONTAINER_SIZE = 12; // Chest size
export const BACKPACK_SIZE = 8;
export const MAX_STACK_SIZE = 100;

export const STAMINA_DRAIN_RATE = 20; 
export const DROWN_DELAY = 3.0; 
export const DROWN_DAMAGE = 10; 
export const BUSH_DAMAGE = 8; // Damage per second when moving in bushes
export const CACTUS_DAMAGE = 5; // Damage per second in cactus
export const SNAKE_DAMAGE = 8;

export const GROWTH_TIME = 60000; 

export const DEFAULT_SETTINGS: Settings = {
    guiScale: 1.0,
    cameraZoom: 1.0,
    keybinds: {
        moveUp: 'w',
        moveDown: 's',
        moveLeft: 'a',
        moveRight: 'd',
        inventory: 'e',
        run: 'shift'
    }
};

export const COLORS: Record<number, string> = {
  [TileType.GRASS]: '#4ade80', 
  [TileType.WATER]: '#60a5fa', 
  [TileType.SAND]: '#fde047', 
  [TileType.TREE]: '#166534', 
  [TileType.ROCK]: '#57534e', 
  [TileType.IRON_ORE]: '#7f1d1d', 
  [TileType.BUSH]: '#15803d', 
  [TileType.WALL_WOOD]: '#78350f', 
  [TileType.FLOOR_WOOD]: '#b45309', 
  [TileType.WALL_STONE]: '#292524', 
  [TileType.CRAFTING_STATION]: '#db2777', 
  [TileType.SAPLING]: '#86efac', 
  [TileType.CLAM]: '#fce7f3', 
  [TileType.CHEST]: '#854d0e', // yellow-800
  [TileType.BUSH_SAPLING]: '#a7f3d0',
  [TileType.CACTUS]: '#16a34a',
  [TileType.TALL_GRASS]: '#22c55e',
  [TileType.MOUNTAIN]: '#57534e', // Stone-600
  [TileType.COBWEB]: '#e5e7eb',
  [TileType.WHEAT_CROP]: '#86efac',
  [TileType.WHEAT_PLANT]: '#facc15',
  [TileType.FLOOR_STONE]: '#57534e',
  [TileType.GOLD_ORE]: '#fbbf24', // amber-400
  [TileType.SNOW]: '#f8fafc', // slate-50
  [TileType.PINE_TREE]: '#064e3b', // emerald-900
  [TileType.PINE_SAPLING]: '#6ee7b7', // emerald-300
  [TileType.SNOW_PILE]: '#e2e8f0', // slate-200
  [TileType.SNOW_BLOCK]: '#e2e8f0', 
};

export const ITEM_NAMES: Record<string, string> = {
  [ItemType.WOOD]: 'Wood',
  [ItemType.STONE]: 'Stone',
  [ItemType.IRON]: 'Iron Ore',
  [ItemType.BERRY]: 'Berry',
  [ItemType.WOOD_AXE]: 'Wood Axe',
  [ItemType.STONE_AXE]: 'Stone Axe',
  [ItemType.IRON_AXE]: 'Iron Axe',
  [ItemType.WOOD_PICKAXE]: 'Wood Pickaxe',
  [ItemType.STONE_PICKAXE]: 'Stone Pickaxe',
  [ItemType.IRON_PICKAXE]: 'Iron Pickaxe',
  [ItemType.WOOD_SWORD]: 'Wood Sword',
  [ItemType.STONE_SWORD]: 'Stone Sword',
  [ItemType.IRON_SWORD]: 'Iron Sword',
  [ItemType.WALL_WOOD_ITEM]: 'Wood Wall',
  [ItemType.FLOOR_WOOD_ITEM]: 'Wood Floor',
  [ItemType.WALL_STONE_ITEM]: 'Stone Wall',
  [ItemType.CRAFTING_STATION_ITEM]: 'Crafting Station',
  [ItemType.CHEST_ITEM]: 'Chest',
  [ItemType.SAPLING]: 'Sapling',
  [ItemType.CLAM]: 'Clam',
  [ItemType.HELMET_LEATHER]: 'Leather Helmet',
  [ItemType.ARMOR_LEATHER]: 'Leather Armor',
  [ItemType.HELMET_IRON]: 'Iron Helmet',
  [ItemType.ARMOR_IRON]: 'Iron Armor',
  [ItemType.BERRY_SEED]: 'Berry Seeds',
  [ItemType.CACTUS]: 'Cactus',
  [ItemType.RAW_BEEF]: 'Raw Beef',
  [ItemType.LEATHER]: 'Leather',
  [ItemType.PLANT_FIBER]: 'Plant Fiber',
  [ItemType.SNAKE_FANG]: 'Snake Fang',
  [ItemType.COBWEB]: 'Cobweb',
  [ItemType.BOAT]: 'Wooden Boat',
  [ItemType.WHEAT_SEEDS]: 'Wheat Seeds',
  [ItemType.WHEAT]: 'Wheat',
  [ItemType.BREAD]: 'Bread',
  [ItemType.FLOOR_STONE_ITEM]: 'Stone Floor',
  [ItemType.RUBY]: 'Ruby',
  [ItemType.GOLD]: 'Gold Ore',
  [ItemType.GOLD_AXE]: 'Golden Axe',
  [ItemType.GOLD_PICKAXE]: 'Golden Pickaxe',
  [ItemType.GOLD_SWORD]: 'Golden Sword',
  [ItemType.HELMET_GOLD]: 'Golden Helmet',
  [ItemType.ARMOR_GOLD]: 'Golden Armor',
  [ItemType.CHARM]: 'Ruby Charm',
  [ItemType.FISHING_ROD]: 'Fishing Rod',
  [ItemType.SALMON]: 'Salmon',
  [ItemType.COD]: 'Cod',
  [ItemType.STRING]: 'String',
  [ItemType.BOW]: 'Bow',
  [ItemType.ARROW]: 'Arrow',
  [ItemType.SNOWBALL]: 'Snowball',
  [ItemType.SNOW_BLOCK]: 'Snow Block',
  [ItemType.PINE_SAPLING]: 'Pine Sapling',
  [ItemType.RABBIT_LEG]: 'Rabbit Leg',
  [ItemType.BACKPACK]: 'Backpack',
  [ItemType.POISON_ARROW]: 'Poison Arrow',
};

// Tool Configuration
export const TOOL_CONFIG = {
    [ItemType.WOOD_AXE]: { durability: 40, yieldBonus: 1, attackDamage: 5 },
    [ItemType.STONE_AXE]: { durability: 80, yieldBonus: 2, attackDamage: 8 },
    [ItemType.IRON_AXE]: { durability: 160, yieldBonus: 3, attackDamage: 12 },
    [ItemType.GOLD_AXE]: { durability: 60, yieldBonus: 4, attackDamage: 18 },
    
    [ItemType.WOOD_PICKAXE]: { durability: 40, yieldBonus: 1, attackDamage: 4 },
    [ItemType.STONE_PICKAXE]: { durability: 80, yieldBonus: 2, attackDamage: 7 },
    [ItemType.IRON_PICKAXE]: { durability: 160, yieldBonus: 3, attackDamage: 10 },
    [ItemType.GOLD_PICKAXE]: { durability: 60, yieldBonus: 4, attackDamage: 15 },
    
    [ItemType.WOOD_SWORD]: { durability: 50, yieldBonus: 1, attackDamage: 10 },
    [ItemType.STONE_SWORD]: { durability: 100, yieldBonus: 1, attackDamage: 15 },
    [ItemType.IRON_SWORD]: { durability: 200, yieldBonus: 1, attackDamage: 25 },
    [ItemType.GOLD_SWORD]: { durability: 70, yieldBonus: 1, attackDamage: 35 },
    
    [ItemType.FISHING_ROD]: { durability: 50, yieldBonus: 1, attackDamage: 3 },
    [ItemType.BOW]: { durability: 100, yieldBonus: 1, attackDamage: 1 }, // Bow damage is mainly projectile based
};

export const ARMOR_STATS: Record<string, { slot: EquipmentSlot, defense: number, maxDurability: number }> = {
    [ItemType.HELMET_LEATHER]: { slot: 'head', defense: 5, maxDurability: 60 },
    [ItemType.ARMOR_LEATHER]: { slot: 'body', defense: 10, maxDurability: 80 },
    [ItemType.HELMET_IRON]: { slot: 'head', defense: 15, maxDurability: 120 },
    [ItemType.ARMOR_IRON]: { slot: 'body', defense: 25, maxDurability: 160 },
    [ItemType.HELMET_GOLD]: { slot: 'head', defense: 20, maxDurability: 100 },
    [ItemType.ARMOR_GOLD]: { slot: 'body', defense: 35, maxDurability: 140 },
    [ItemType.CHARM]: { slot: 'accessory', defense: 0, maxDurability: 0 },
    [ItemType.BACKPACK]: { slot: 'bag', defense: 0, maxDurability: 0 },
};

export const FOOD_STATS: Record<string, { health: number, stamina: number }> = {
    [ItemType.BERRY]: { health: 5, stamina: 25 },
    [ItemType.CLAM]: { health: 25, stamina: 15 },
    [ItemType.RAW_BEEF]: { health: 10, stamina: 50 },
    [ItemType.BREAD]: { health: 10, stamina: 35 },
    [ItemType.SALMON]: { health: 20, stamina: 35 },
    [ItemType.COD]: { health: 18, stamina: 40 },
    [ItemType.RABBIT_LEG]: { health: 3, stamina: 5 },
};

export const COW_STATS = {
    maxHealth: 35,
    speed: 0.8,
    fleeSpeed: 2.5,
    // Independent drop chances
    dropRateMeat: 0.6,
    dropRateLeather: 0.4
};

export const RABBIT_STATS = {
    maxHealth: 10,
    speed: 1.5,
    fleeSpeed: 4.5, // Faster than cows
    dropRateLeg: 0.4
};

export const SNAKE_STATS = {
    maxHealth: 15,
    speed: 2.0,
    damage: 8,
    dropRateFang: 0.0, // Normal snakes don't drop fangs
    detectionRange: 5.0
};

export const POISON_SNAKE_STATS = {
    maxHealth: 15,
    speed: 2.0,
    damage: 8,
    dropRateFang: 0.4, // Poison snakes drop fangs
    detectionRange: 5.0,
    poisonChance: 1.0
};

export const SCORPION_STATS = {
    maxHealth: 20,
    speed: 1.8,
    damage: 6,
    detectionRange: 5.0,
    poisonChance: 1.0 // Always poisons
};

export const SPIDER_STATS = {
    maxHealth: 35, // Buffed from 20
    speed: 1.5,
    damage: 6,
    detectionRange: 6.0
};

export const POISON_SPIDER_STATS = {
    maxHealth: 25, // Slightly buffed from 15
    speed: 1.6,
    damage: 4,
    detectionRange: 6.0,
    poisonChance: 1.0 // Always poisons
};

export const BOAT_STATS = {
    maxHealth: 50,
    acceleration: 15.0,
    maxSpeed: 8.0,
    friction: 0.96, // High friction = quick stop, Low = drift. 0.96 is drift-y
};

export const ARROW_STATS = {
    speed: 12.0,
    damage: 15,
    maxDistance: 12.0
};

export const POISON_ARROW_STATS = {
    speed: 12.0,
    damage: 10,
    maxDistance: 12.0
};

export const SNOWBALL_STATS = {
    speed: 10.0,
    damage: 1,
    knockback: 5.0
};

export const POISON_CONFIG = {
    duration: 5.0, // seconds
    damagePerSecond: 4
};

export const CHARM_CONFIG = {
    reachBonus: 2.0,
    speedMultiplier: 1.1
};

export const BREAK_TIMES: Record<number, number> = {
    [TileType.TREE]: 1.0,
    [TileType.ROCK]: 1.5,
    [TileType.IRON_ORE]: 2.0,
    [TileType.GOLD_ORE]: 3.0,
    [TileType.BUSH]: 0.5,
    [TileType.CRAFTING_STATION]: 0.8,
    [TileType.WALL_WOOD]: 0.8,
    [TileType.WALL_STONE]: 1.5,
    [TileType.FLOOR_WOOD]: 0.5,
    [TileType.SAPLING]: 0.1,
    [TileType.BUSH_SAPLING]: 0.1,
    [TileType.CLAM]: 0.3,
    [TileType.CHEST]: 1.0,
    [TileType.CACTUS]: 1.0,
    [TileType.TALL_GRASS]: 0.25,
    [TileType.MOUNTAIN]: 0.5,
    [TileType.COBWEB]: 0.3,
    [TileType.WHEAT_CROP]: 0.1,
    [TileType.WHEAT_PLANT]: 0.2,
    [TileType.FLOOR_STONE]: 0.8,
    [TileType.PINE_TREE]: 1.0,
    [TileType.PINE_SAPLING]: 0.1,
    [TileType.SNOW_PILE]: 0.2,
    [TileType.SNOW_BLOCK]: 0.2,
};

export const RECIPES: Recipe[] = [
  {
    result: ItemType.STRING,
    count: 2,
    ingredients: [{ type: ItemType.COBWEB, count: 1 }],
    description: "Useful fiber made from webs.",
    requiresStation: false,
    category: 'misc'
  },
  {
    result: ItemType.CRAFTING_STATION_ITEM,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 10 }],
    description: "Required for advanced crafting.",
    requiresStation: false,
    category: 'block'
  },
  {
    result: ItemType.BERRY_SEED,
    count: 2,
    ingredients: [{ type: ItemType.BERRY, count: 1 }],
    description: "Seeds to grow bushes.",
    requiresStation: false,
    category: 'misc'
  },
  {
    result: ItemType.WHEAT_SEEDS,
    count: 2,
    ingredients: [{ type: ItemType.PLANT_FIBER, count: 1 }],
    description: "Seeds to grow wheat.",
    requiresStation: false,
    category: 'misc'
  },
  {
    result: ItemType.CHEST_ITEM,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 8 }],
    description: "Stores items.",
    requiresStation: false,
    category: 'block'
  },
  {
    result: ItemType.WOOD_AXE,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 5 }],
    description: "Basic wood chopping tool.",
    requiresStation: false,
    initialDurability: 40,
    category: 'gear'
  },
  {
    result: ItemType.WOOD_PICKAXE,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 5 }],
    description: "Basic mining tool.",
    requiresStation: false,
    initialDurability: 40,
    category: 'gear'
  },
  {
    result: ItemType.WOOD_SWORD,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 5 }],
    description: "Basic weapon.",
    requiresStation: false,
    initialDurability: 50,
    category: 'gear'
  },
  {
    result: ItemType.STONE_AXE,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 3 }, { type: ItemType.STONE, count: 3 }],
    description: "Better wood chopping tool.",
    requiresStation: true,
    initialDurability: 80,
    category: 'gear'
  },
  {
    result: ItemType.STONE_PICKAXE,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 3 }, { type: ItemType.STONE, count: 3 }],
    description: "Better mining tool.",
    requiresStation: true,
    initialDurability: 80,
    category: 'gear'
  },
  {
    result: ItemType.STONE_SWORD,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 2 }, { type: ItemType.STONE, count: 3 }],
    description: "Better weapon.",
    requiresStation: true,
    initialDurability: 100,
    category: 'gear'
  },
  {
    result: ItemType.IRON_AXE,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 3 }, { type: ItemType.IRON, count: 3 }],
    description: "Superior wood chopping tool.",
    requiresStation: true,
    initialDurability: 160,
    category: 'gear'
  },
  {
    result: ItemType.IRON_PICKAXE,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 3 }, { type: ItemType.IRON, count: 3 }],
    description: "Superior mining tool.",
    requiresStation: true,
    initialDurability: 160,
    category: 'gear'
  },
  {
    result: ItemType.IRON_SWORD,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 2 }, { type: ItemType.IRON, count: 3 }],
    description: "Deals high damage.",
    requiresStation: true,
    initialDurability: 200,
    category: 'gear'
  },
  // GOLD GEAR
  {
    result: ItemType.GOLD_AXE,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 3 }, { type: ItemType.GOLD, count: 3 }],
    description: "High yield, low durability.",
    requiresStation: true,
    initialDurability: 60,
    category: 'gear'
  },
  {
    result: ItemType.GOLD_PICKAXE,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 3 }, { type: ItemType.GOLD, count: 3 }],
    description: "High yield, low durability.",
    requiresStation: true,
    initialDurability: 60,
    category: 'gear'
  },
  {
    result: ItemType.GOLD_SWORD,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 2 }, { type: ItemType.GOLD, count: 3 }],
    description: "Massive damage, fragile.",
    requiresStation: true,
    initialDurability: 70,
    category: 'gear'
  },
  {
    result: ItemType.FISHING_ROD,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 3 }, { type: ItemType.STRING, count: 2 }],
    description: "Used to catch fish in water.",
    requiresStation: true,
    initialDurability: 50,
    category: 'gear'
  },
  {
    result: ItemType.BOW,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 3 }, { type: ItemType.STRING, count: 2 }],
    description: "Ranged weapon.",
    requiresStation: true,
    initialDurability: 100,
    category: 'gear'
  },
  {
    result: ItemType.ARROW,
    count: 5,
    ingredients: [{ type: ItemType.WOOD, count: 1 }, { type: ItemType.STONE, count: 1 }],
    description: "Ammo for bows.",
    requiresStation: true,
    category: 'gear'
  },
  {
    result: ItemType.POISON_ARROW,
    count: 1,
    ingredients: [{ type: ItemType.ARROW, count: 1 }, { type: ItemType.SNAKE_FANG, count: 1 }],
    description: "Poisonous ammo for bows.",
    requiresStation: true,
    category: 'gear'
  },
  {
    result: ItemType.WALL_WOOD_ITEM,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 4 }],
    description: "A simple wooden wall.",
    requiresStation: true,
    category: 'block'
  },
  {
    result: ItemType.FLOOR_WOOD_ITEM,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 2 }],
    description: "Wooden flooring.",
    requiresStation: true,
    category: 'block'
  },
  {
    result: ItemType.FLOOR_STONE_ITEM,
    count: 1,
    ingredients: [{ type: ItemType.STONE, count: 2 }],
    description: "Durable stone flooring.",
    requiresStation: true,
    category: 'block'
  },
  {
    result: ItemType.WALL_STONE_ITEM,
    count: 1,
    ingredients: [{ type: ItemType.STONE, count: 4 }],
    description: "A sturdy stone wall.",
    requiresStation: true,
    category: 'block'
  },
  {
    result: ItemType.HELMET_LEATHER,
    count: 1,
    ingredients: [{ type: ItemType.LEATHER, count: 5 }],
    description: "Basic head protection.",
    requiresStation: true,
    initialDurability: 60,
    category: 'gear'
  },
  {
    result: ItemType.ARMOR_LEATHER,
    count: 1,
    ingredients: [{ type: ItemType.LEATHER, count: 8 }],
    description: "Basic body protection.",
    requiresStation: true,
    initialDurability: 80,
    category: 'gear'
  },
  {
    result: ItemType.HELMET_IRON,
    count: 1,
    ingredients: [{ type: ItemType.IRON, count: 5 }],
    description: "Strong head protection.",
    requiresStation: true,
    initialDurability: 120,
    category: 'gear'
  },
  {
    result: ItemType.ARMOR_IRON,
    count: 1,
    ingredients: [{ type: ItemType.IRON, count: 8 }],
    description: "Strong body protection.",
    requiresStation: true,
    initialDurability: 160,
    category: 'gear'
  },
  {
    result: ItemType.HELMET_GOLD,
    count: 1,
    ingredients: [{ type: ItemType.GOLD, count: 5 }],
    description: "Superior protection.",
    requiresStation: true,
    initialDurability: 100,
    category: 'gear'
  },
  {
    result: ItemType.ARMOR_GOLD,
    count: 1,
    ingredients: [{ type: ItemType.GOLD, count: 8 }],
    description: "Superior body protection.",
    requiresStation: true,
    initialDurability: 140,
    category: 'gear'
  },
  {
    result: ItemType.CHARM,
    count: 1,
    ingredients: [{ type: ItemType.GOLD, count: 3 }, { type: ItemType.RUBY, count: 1 }],
    description: "Increases reach and speed.",
    requiresStation: true,
    category: 'gear'
  },
  {
    result: ItemType.BACKPACK,
    count: 1,
    ingredients: [{ type: ItemType.LEATHER, count: 4 }, { type: ItemType.STRING, count: 4 }],
    description: "Adds 8 inventory slots.",
    requiresStation: true,
    category: 'gear'
  },
  {
    result: ItemType.BOAT,
    count: 1,
    ingredients: [{ type: ItemType.WOOD, count: 20 }],
    description: "Allows travel on water.",
    requiresStation: true,
    category: 'misc'
  },
  {
    result: ItemType.BREAD,
    count: 1,
    ingredients: [{ type: ItemType.WHEAT, count: 3 }],
    description: "Nutritious food.",
    requiresStation: true,
    category: 'food'
  },
  {
      result: ItemType.SNOW_BLOCK,
      count: 1,
      ingredients: [{ type: ItemType.SNOWBALL, count: 4 }],
      description: "A compact block of snow.",
      requiresStation: false,
      category: 'block'
  }
];

export const COLLIDABLE_TILES = [
  TileType.WATER, 
  TileType.TREE,
  TileType.ROCK,
  TileType.IRON_ORE,
  TileType.GOLD_ORE,
  TileType.WALL_WOOD,
  TileType.WALL_STONE,
  TileType.CRAFTING_STATION,
  TileType.CHEST,
  TileType.CACTUS,
  TileType.PINE_TREE,
];

export const INTERACTABLE_TILES = [
  TileType.TREE,
  TileType.ROCK,
  TileType.IRON_ORE,
  TileType.GOLD_ORE,
  TileType.BUSH,
  TileType.CRAFTING_STATION,
  TileType.WALL_WOOD,
  TileType.WALL_STONE,
  TileType.FLOOR_WOOD,
  TileType.CLAM,
  TileType.SAPLING,
  TileType.BUSH_SAPLING,
  TileType.CHEST,
  TileType.CACTUS,
  TileType.TALL_GRASS,
  TileType.COBWEB,
  TileType.WHEAT_PLANT,
  TileType.FLOOR_STONE,
  TileType.PINE_TREE,
  TileType.PINE_SAPLING,
  TileType.SNOW_PILE,
  TileType.SNOW_BLOCK,
];