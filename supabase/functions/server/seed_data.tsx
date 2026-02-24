import * as db from "./database.tsx";
import { comprehensiveSpirits, comprehensiveWines, comprehensiveBeers, comprehensiveMixers, comprehensivePrepItems } from "./comprehensive_seed_data.tsx";

console.log("Loading seed_data.tsx module...");

// Seed the database with comprehensive Haywire Bar inventory data
export async function seedDatabase() {
  console.log("Starting database seeding with comprehensive data...");
  
  try {
    // Check if data already exists
    const existingUsers = await db.supabase.from('users').select('id').limit(1);
    const existingItems = await db.supabase.from('items').select('id').limit(1);
    
    if (existingUsers.data && existingUsers.data.length > 0) {
      console.log('⚠️ Database already seeded. Skipping to prevent duplicates.');
      console.log('💡 To reseed, first clear tables in Supabase SQL Editor.');
      return;
    }
    
    // Clear existing data (just in case)
    console.log('Clearing existing data...');
    await db.clearAllTables();
    
    // Seed in order (respecting foreign key constraints)
    await seedUsers();
    await seedWasteReasons();
    await seedSpirits();
    await seedWines();
    await seedBeers();
    await seedMixers();
    await seedPrepItems();
    await seedRecipes();
    
    console.log("✅ Database seeding completed!");
  } catch (error: any) {
    console.error('❌ [Supabase] Seed error:', error);
    throw error;
  }
}

// Seed Users
async function seedUsers() {
  const users = [
    { id: 'user_001', name: 'Brittany', pin: '1234', role: 'manager', isScheduledToday: true, createdAt: new Date().toISOString() },
    { id: 'user_002', name: 'Davontae', pin: '2345', role: 'bartender', isScheduledToday: true, createdAt: new Date().toISOString() },
    { id: 'user_003', name: 'Izzy', pin: '3456', role: 'bartender', isScheduledToday: true, createdAt: new Date().toISOString() },
    { id: 'user_004', name: 'Sydney', pin: '4567', role: 'bartender', isScheduledToday: true, createdAt: new Date().toISOString() },
    { id: 'user_005', name: 'Dylan', pin: '5678', role: 'bartender', isScheduledToday: false, createdAt: new Date().toISOString() },
    { id: 'user_006', name: 'Dalton', pin: '6789', role: 'bartender', isScheduledToday: false, createdAt: new Date().toISOString() },
  ];

  await db.bulkCreateUsers(users);
  console.log(`✓ Seeded ${users.length} users`);
}

// Seed Waste Reasons
async function seedWasteReasons() {
  const reasons = [
    { id: 'reason_001', name: 'Dropped/Spilled', isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
    { id: 'reason_002', name: 'Guest sent back', isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
    { id: 'reason_003', name: 'Wrong item made', isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
    { id: 'reason_004', name: 'Spoilage/Expired', isActive: true, sortOrder: 4, createdAt: new Date().toISOString() },
    { id: 'reason_005', name: 'Cork disintegrated', isActive: true, sortOrder: 5, createdAt: new Date().toISOString() },
    { id: 'reason_006', name: 'Over-poured', isActive: true, sortOrder: 6, createdAt: new Date().toISOString() },
    { id: 'reason_007', name: 'Training/Tasting', isActive: true, sortOrder: 7, createdAt: new Date().toISOString() },
    { id: 'reason_008', name: 'Burned batch', isActive: true, sortOrder: 8, createdAt: new Date().toISOString() },
    { id: 'reason_009', name: 'Product recall', isActive: true, sortOrder: 9, createdAt: new Date().toISOString() },
    { id: 'reason_010', name: 'Other', isActive: true, sortOrder: 10, createdAt: new Date().toISOString() },
  ];

  await db.bulkCreateWasteReasons(reasons);
  console.log(`✓ Seeded ${reasons.length} waste reasons`);
}

// Seed Spirits - Complete inventory from CSV
async function seedSpirits() {
  let counter = 1;
  const spirits = comprehensiveSpirits.map((spirit) => ({
    id: `spirit_${String(counter++).padStart(3, '0')}`,
    name: spirit.name,
    category: 'spirits',
    subcategory: spirit.subcategory,
    unit: spirit.unit,
    costPerUnit: spirit.costPerUnit,
    servingSize: spirit.servingSize,
    bottleSize: spirit.bottleSize,
    isActive: true,
    createdAt: new Date().toISOString()
  }));

  await db.bulkCreateItems(spirits);
  console.log(`✓ Seeded ${spirits.length} spirits`);
}

// Seed Wines - Complete inventory from CSV
async function seedWines() {
  let counter = 1;
  const wines = comprehensiveWines.map((wine) => ({
    id: `wine_${String(counter++).padStart(3, '0')}`,
    name: wine.name,
    category: 'wine',
    subcategory: wine.subcategory,
    unit: wine.unit,
    costPerUnit: wine.costPerUnit,
    servingSize: wine.servingSize,
    bottleSize: wine.bottleSize,
    isActive: true,
    createdAt: new Date().toISOString()
  }));

  await db.bulkCreateItems(wines);
  console.log(`✓ Seeded ${wines.length} wines`);
}

// Seed Beers - Complete inventory from CSV
async function seedBeers() {
  let counter = 1;
  const beers = comprehensiveBeers.map((beer) => ({
    id: `beer_${String(counter++).padStart(3, '0')}`,
    name: beer.name,
    category: 'beer',
    subcategory: beer.subcategory,
    unit: beer.unit,
    costPerUnit: beer.costPerUnit,
    servingSize: beer.servingSize,
    bottleSize: beer.bottleSize,
    isActive: true,
    createdAt: new Date().toISOString()
  }));

  await db.bulkCreateItems(beers);
  console.log(`✓ Seeded ${beers.length} beers`);
}

// Seed Mixers - Complete inventory from CSV
async function seedMixers() {
  let counter = 1;
  const mixers = comprehensiveMixers.map((mixer) => ({
    id: `mixer_${String(counter++).padStart(3, '0')}`,
    name: mixer.name,
    category: 'mixers',
    subcategory: mixer.subcategory,
    unit: mixer.unit,
    costPerUnit: mixer.costPerUnit,
    servingSize: mixer.servingSize,
    bottleSize: mixer.bottleSize,
    isActive: true,
    createdAt: new Date().toISOString()
  }));

  await db.bulkCreateItems(mixers);
  console.log(`✓ Seeded ${mixers.length} mixers`);
}

// Seed Prep Items - Complete inventory from CSV
async function seedPrepItems() {
  let counter = 1;
  const prepItems = comprehensivePrepItems.map((prep) => ({
    id: `prep_${String(counter++).padStart(3, '0')}`,
    name: prep.name,
    category: 'prep',
    subcategory: prep.subcategory,
    unit: prep.unit,
    costPerUnit: prep.costPerUnit,
    servingSize: prep.servingSize,
    bottleSize: prep.bottleSize,
    isActive: true,
    createdAt: new Date().toISOString()
  }));

  await db.bulkCreateItems(prepItems);
  console.log(`✓ Seeded ${prepItems.length} prep items`);
}

// Seed Recipes - Haywire Bar Cocktails with Ingredients
async function seedRecipes() {
  const recipes = [
    { 
      id: 'recipe_001', 
      name: 'HW/TR Old Fashioned', 
      category: 'recipe', 
      subcategory: 'Old Fashioned', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_002', 
      name: 'Classic Margarita', 
      category: 'recipe', 
      subcategory: 'Margarita', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_003', 
      name: 'Ranch Water', 
      category: 'recipe', 
      subcategory: 'Signature', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_004', 
      name: 'Espresso Martini', 
      category: 'recipe', 
      subcategory: 'Signature', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_005', 
      name: 'Texas Mule', 
      category: 'recipe', 
      subcategory: 'Signature', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_006', 
      name: 'Bourbon Smash', 
      category: 'recipe', 
      subcategory: 'Signature', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_007', 
      name: 'Front Porch Swing', 
      category: 'recipe', 
      subcategory: 'Signature', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_008', 
      name: 'Regular Bloody Mary', 
      category: 'recipe', 
      subcategory: 'Brunch', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_009', 
      name: 'Cowboy Carajillo', 
      category: 'recipe', 
      subcategory: 'Brunch', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
    { 
      id: 'recipe_010', 
      name: 'Lady Bird (Mocktail)', 
      category: 'recipe', 
      subcategory: 'Mocktail', 
      unit: 'serving', 
      costPerUnit: 0, 
      servingSize: 1, 
      bottleSize: 1, 
      isActive: true,
      createdAt: new Date().toISOString() 
    },
  ];

  // Create recipe items first
  await db.bulkCreateItems(recipes);
  console.log(`✓ Seeded ${recipes.length} recipes`);

  // Create recipe ingredients
  const allIngredients = [
    // HW/TR Old Fashioned
    { id: 'ing_001', recipeId: 'recipe_001', itemId: 'mixer_011', quantity: 0.25, unit: 'oz' },
    { id: 'ing_002', recipeId: 'recipe_001', itemId: 'mixer_018', quantity: 2, unit: 'dash' },
    
    // Classic Margarita
    { id: 'ing_003', recipeId: 'recipe_002', itemId: 'mixer_001', quantity: 0.75, unit: 'oz' },
    { id: 'ing_004', recipeId: 'recipe_002', itemId: 'mixer_012', quantity: 0.5, unit: 'oz' },
    { id: 'ing_005', recipeId: 'recipe_002', itemId: 'mixer_022', quantity: 0.5, unit: 'oz' },
    { id: 'ing_006', recipeId: 'recipe_002', itemId: 'mixer_024', quantity: 0.5, unit: 'oz' },
    
    // Ranch Water
    { id: 'ing_007', recipeId: 'recipe_003', itemId: 'mixer_001', quantity: 0.75, unit: 'oz' },
    { id: 'ing_008', recipeId: 'recipe_003', itemId: 'mixer_030', quantity: 4, unit: 'oz' },
    
    // Espresso Martini
    { id: 'ing_009', recipeId: 'recipe_004', itemId: 'mixer_011', quantity: 0.5, unit: 'oz' },
    { id: 'ing_010', recipeId: 'recipe_004', itemId: 'mixer_025', quantity: 1, unit: 'oz' },
    { id: 'ing_011', recipeId: 'recipe_004', itemId: 'mixer_026', quantity: 1.5, unit: 'oz' },
    
    // Texas Mule
    { id: 'ing_012', recipeId: 'recipe_005', itemId: 'mixer_011', quantity: 0.5, unit: 'oz' },
    { id: 'ing_013', recipeId: 'recipe_005', itemId: 'mixer_001', quantity: 0.75, unit: 'oz' },
    { id: 'ing_014', recipeId: 'recipe_005', itemId: 'mixer_028', quantity: 2, unit: 'oz' },
    { id: 'ing_015', recipeId: 'recipe_005', itemId: 'mixer_038', quantity: 2, unit: 'slice' },
    
    // Bourbon Smash
    { id: 'ing_016', recipeId: 'recipe_006', itemId: 'mixer_011', quantity: 0.75, unit: 'oz' },
    { id: 'ing_017', recipeId: 'recipe_006', itemId: 'mixer_002', quantity: 0.75, unit: 'oz' },
    { id: 'ing_018', recipeId: 'recipe_006', itemId: 'mixer_036', quantity: 8, unit: 'leaf' },
    { id: 'ing_019', recipeId: 'recipe_006', itemId: 'mixer_041', quantity: 4, unit: 'each' },
    { id: 'ing_020', recipeId: 'recipe_006', itemId: 'mixer_029', quantity: 1, unit: 'oz' },
    
    // Front Porch Swing
    { id: 'ing_021', recipeId: 'recipe_007', itemId: 'mixer_011', quantity: 0.5, unit: 'oz' },
    { id: 'ing_022', recipeId: 'recipe_007', itemId: 'mixer_006', quantity: 0.75, unit: 'oz' },
    { id: 'ing_023', recipeId: 'recipe_007', itemId: 'mixer_001', quantity: 0.75, unit: 'oz' },
    { id: 'ing_024', recipeId: 'recipe_007', itemId: 'mixer_023', quantity: 0.5, unit: 'oz' },
    { id: 'ing_025', recipeId: 'recipe_007', itemId: 'mixer_036', quantity: 4, unit: 'leaf' },
    
    // Regular Bloody Mary
    { id: 'ing_026', recipeId: 'recipe_008', itemId: 'mixer_033', quantity: 3, unit: 'oz' },
    { id: 'ing_027', recipeId: 'recipe_008', itemId: 'mixer_035', quantity: 0.25, unit: 'oz' },
    { id: 'ing_028', recipeId: 'recipe_008', itemId: 'mixer_001', quantity: 0.25, unit: 'oz' },
    { id: 'ing_029', recipeId: 'recipe_008', itemId: 'mixer_034', quantity: 0.5, unit: 'oz' },
    { id: 'ing_030', recipeId: 'recipe_008', itemId: 'mixer_047', quantity: 1, unit: 'each' },
    
    // Cowboy Carajillo
    { id: 'ing_031', recipeId: 'recipe_009', itemId: 'mixer_027', quantity: 1.5, unit: 'oz' },
    { id: 'ing_032', recipeId: 'recipe_009', itemId: 'mixer_013', quantity: 0.25, unit: 'oz' },
    { id: 'ing_033', recipeId: 'recipe_009', itemId: 'prep_007', quantity: 2, unit: 'oz' },
    
    // Lady Bird (Mocktail)
    { id: 'ing_034', recipeId: 'recipe_010', itemId: 'mixer_004', quantity: 1.5, unit: 'oz' },
    { id: 'ing_035', recipeId: 'recipe_010', itemId: 'mixer_006', quantity: 1, unit: 'oz' },
    { id: 'ing_036', recipeId: 'recipe_010', itemId: 'mixer_005', quantity: 1, unit: 'oz' },
    { id: 'ing_037', recipeId: 'recipe_010', itemId: 'mixer_012', quantity: 0.75, unit: 'oz' },
    { id: 'ing_038', recipeId: 'recipe_010', itemId: 'mixer_017', quantity: 0.15, unit: 'oz' },
    { id: 'ing_039', recipeId: 'recipe_010', itemId: 'mixer_032', quantity: 1.5, unit: 'oz' },
  ];

  await db.bulkCreateRecipeIngredients(allIngredients);
  console.log(`✓ Seeded ${allIngredients.length} recipe ingredients`);
}