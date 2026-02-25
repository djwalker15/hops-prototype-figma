// Mock Data for H.O.P.S. Waste Logger

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
  unit: string; // 'oz', 'ml', 'dash', 'bottle', 'each', etc.
}

export interface Item {
  id: string;
  name: string;
  category: 'spirits' | 'wine' | 'beer' | 'mixers' | 'prep' | 'recipe';
  subcategory?: string;
  unit: string;
  costPerUnit?: number;
  servingSize?: number;
  bottleSize?: number;
  isActive: boolean;
  ingredients?: RecipeIngredient[]; // Populated for category='recipe' items
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

// Base ingredient items for reference/testing only (real data comes from API)
export const mockItems: Item[] = [
  { id: 'item_001', name: 'Bulleit Bourbon',            category: 'spirits', subcategory: 'American Whiskey', unit: 'oz', isActive: true },
  { id: 'item_002', name: "Tito's Vodka",               category: 'spirits', subcategory: 'Vodka',           unit: 'oz', isActive: true },
  { id: 'item_003', name: 'Cazadores Blanco Tequila',   category: 'spirits', subcategory: 'Blanco',          unit: 'oz', isActive: true },
  { id: 'item_004', name: 'Simple Syrup',               category: 'mixers',  unit: 'oz', isActive: true },
  { id: 'item_005', name: 'Lime Juice',                 category: 'mixers',  unit: 'oz', isActive: true },
  { id: 'item_008', name: 'Caymus Cabernet Sauvignon',  category: 'wine',    unit: 'oz', isActive: true },
  { id: 'item_009', name: 'Miller Lite',                category: 'beer',    unit: 'each', isActive: true },
  {
    id: 'recipe_001',
    name: 'Haywire Old Fashioned',
    category: 'recipe',
    unit: 'serving',
    isActive: true,
    ingredients: [
      { itemId: 'item_001', quantity: 2,    unit: 'oz'     },
      { itemId: 'item_004', quantity: 0.25, unit: 'oz'     },
    ],
  },
];