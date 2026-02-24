// Mock Data for H.O.P.S. Waste Logger

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
  unit: string; // 'oz', 'ml', 'dash', 'bottle', 'each', etc.
}

export interface ItemRecipe {
  ingredients: RecipeIngredient[];
  yield: number; // How many servings this recipe makes
}

export interface Item {
  id: string;
  name: string;
  category: 'cocktail' | 'wine' | 'beer' | 'batch' | 'spirit' | 'mixer' | 'garnish' | 'other';
  isActive: boolean;
  recipe?: ItemRecipe; // If this item is made from other items
  currentInventory?: number; // Current stock level
  inventoryUnit?: string; // Unit for inventory tracking
  typicalServingSize?: number; // For legacy support
  hasRecipe?: boolean; // Easy flag to check if item has recipe
  recipeYield?: number; // Recipe yield for compatibility
  ingredients?: RecipeIngredient[]; // Ingredients list for compatibility
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: 'bartender' | 'barback' | 'manager';
  isActive: boolean;
  isScheduledToday?: boolean;
}

export interface WasteEntry {
  id: string;
  itemId: string;
  itemName: string;
  amountType: 'serving' | 'bottle';
  quantity: number;
  reason: string;
  loggedByUserId: string;
  loggedByName: string;
  attributedToUserId?: string; // Who the waste is attributed to (defaults to loggedBy)
  attributedToName?: string;   // Name of person waste is attributed to
  timestamp: string;
  photoUrl?: string;
  notes?: string;
}

export interface WasteReason {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

export const WASTE_REASONS = [
  'Dropped/Spilled',
  'Guest sent back',
  'Wrong item made',
  'Spoilage/Expired',
  'Cork disintegrated',
  'Over-poured',
  'Training/Tasting',
  'Burned batch',
  'Product recall',
  'Other'
];

export const mockUsers: User[] = [
  { id: '1', name: 'Alex', pin: '1234', role: 'bartender', isActive: true, isScheduledToday: true },
  { id: '2', name: 'Jordan', pin: '2345', role: 'bartender', isActive: true, isScheduledToday: true },
  { id: '3', name: 'Sam', pin: '3456', role: 'barback', isActive: true, isScheduledToday: true },
  { id: '4', name: 'Casey', pin: '4567', role: 'manager', isActive: true, isScheduledToday: true },
  { id: '5', name: 'Morgan', pin: '5678', role: 'bartender', isActive: true, isScheduledToday: false },
];

// Base ingredient items (spirits, mixers, bitters, wines, beers)
export const mockItems: Item[] = [
  // Spirits
  { 
    id: 'item_001', 
    name: 'Bulleit Bourbon', 
    category: 'spirit', 
    isActive: true, 
    currentInventory: 6, 
    inventoryUnit: 'bottles' 
  },
  { 
    id: 'item_002', 
    name: 'Tito\'s Vodka', 
    category: 'spirit', 
    isActive: true, 
    currentInventory: 10, 
    inventoryUnit: 'bottles' 
  },
  { 
    id: 'item_003', 
    name: 'Cazadores Blanco Tequila', 
    category: 'spirit', 
    isActive: true, 
    currentInventory: 8, 
    inventoryUnit: 'bottles' 
  },
  
  // Mixers & Ingredients
  { 
    id: 'item_004', 
    name: 'Simple Syrup', 
    category: 'mixer', 
    isActive: true, 
    currentInventory: 48, 
    inventoryUnit: 'oz' 
  },
  { 
    id: 'item_005', 
    name: 'Lime Juice', 
    category: 'mixer', 
    isActive: true, 
    currentInventory: 32, 
    inventoryUnit: 'oz' 
  },
  { 
    id: 'item_006', 
    name: 'Lemon Juice', 
    category: 'mixer', 
    isActive: true, 
    currentInventory: 28, 
    inventoryUnit: 'oz' 
  },
  { 
    id: 'item_007', 
    name: 'Angostura Bitters', 
    category: 'mixer', 
    isActive: true, 
    currentInventory: 2, 
    inventoryUnit: 'bottles' 
  },
  { 
    id: 'item_010', 
    name: 'Agave Syrup', 
    category: 'mixer', 
    isActive: true, 
    currentInventory: 32, 
    inventoryUnit: 'oz' 
  },
  
  // Wines
  { 
    id: 'item_008', 
    name: 'Caymus Cabernet Sauvignon', 
    category: 'wine', 
    isActive: true, 
    currentInventory: 12, 
    inventoryUnit: 'bottles' 
  },
  
  // Beers
  { 
    id: 'item_009', 
    name: 'Miller Lite', 
    category: 'beer', 
    isActive: true, 
    currentInventory: 36, 
    inventoryUnit: 'bottles' 
  },
  
  // Cocktails with recipes
  { 
    id: 'recipe_001', 
    name: 'Haywire Old Fashioned', 
    category: 'cocktail', 
    isActive: true,
    recipe: {
      yield: 1,
      ingredients: [
        { itemId: 'item_001', quantity: 2, unit: 'oz' },      // Bulleit Bourbon
        { itemId: 'item_004', quantity: 0.25, unit: 'oz' },   // Simple Syrup
        { itemId: 'item_007', quantity: 2, unit: 'dashes' },  // Angostura Bitters
      ]
    },
    hasRecipe: true,
    recipeYield: 1,
    ingredients: [
      { itemId: 'item_001', quantity: 2, unit: 'oz' },      // Bulleit Bourbon
      { itemId: 'item_004', quantity: 0.25, unit: 'oz' },   // Simple Syrup
      { itemId: 'item_007', quantity: 2, unit: 'dashes' },  // Angostura Bitters
    ]
  },
  { 
    id: 'recipe_002', 
    name: 'Ranch Water', 
    category: 'cocktail', 
    isActive: true,
    recipe: {
      yield: 1,
      ingredients: [
        { itemId: 'item_003', quantity: 2, unit: 'oz' },    // Cazadores Blanco Tequila
        { itemId: 'item_005', quantity: 0.5, unit: 'oz' },  // Lime Juice
      ]
    },
    hasRecipe: true,
    recipeYield: 1,
    ingredients: [
      { itemId: 'item_003', quantity: 2, unit: 'oz' },    // Cazadores Blanco Tequila
      { itemId: 'item_005', quantity: 0.5, unit: 'oz' },  // Lime Juice
    ]
  },
  { 
    id: 'recipe_003', 
    name: 'Moscow Mule', 
    category: 'cocktail', 
    isActive: true,
    recipe: {
      yield: 1,
      ingredients: [
        { itemId: 'item_002', quantity: 2, unit: 'oz' },    // Tito's Vodka
        { itemId: 'item_005', quantity: 0.5, unit: 'oz' },  // Lime Juice
      ]
    },
    hasRecipe: true,
    recipeYield: 1,
    ingredients: [
      { itemId: 'item_002', quantity: 2, unit: 'oz' },    // Tito's Vodka
      { itemId: 'item_005', quantity: 0.5, unit: 'oz' },  // Lime Juice
    ]
  },
];

// Legacy export for backward compatibility
export const mockRecipes = mockItems;