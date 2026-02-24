// Database layer using Supabase PostgreSQL
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// Helper to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// ============= USERS =============

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function getUserByPin(pin: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('pin', pin)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return toCamelCase(data);
}

export async function createUser(user: any) {
  const { data, error } = await supabase
    .from('users')
    .insert(toSnakeCase(user))
    .select()
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function updateUser(id: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(toSnakeCase(updates))
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

// ============= ITEMS =============

export async function getAllItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return toCamelCase(data);
}

export async function getItemsByCategory(category: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function createItem(item: any) {
  const { data, error } = await supabase
    .from('items')
    .insert(toSnakeCase(item))
    .select()
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function updateItem(id: string, updates: any) {
  const { data, error } = await supabase
    .from('items')
    .update(toSnakeCase(updates))
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function deleteItem(id: string) {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============= RECIPE INGREDIENTS =============

export async function getRecipeIngredients(recipeId: string) {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select('*, items!recipe_ingredients_item_id_fkey(*)')
    .eq('recipe_id', recipeId);
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function createRecipeIngredient(ingredient: any) {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .insert(toSnakeCase(ingredient))
    .select()
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function deleteRecipeIngredients(recipeId: string) {
  const { error } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', recipeId);
  
  if (error) throw error;
}

// ============= WASTE REASONS =============

export async function getAllWasteReasons() {
  const { data, error } = await supabase
    .from('waste_reasons')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function getWasteReasonById(id: string) {
  const { data, error } = await supabase
    .from('waste_reasons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return toCamelCase(data);
}

export async function createWasteReason(reason: any) {
  const { data, error } = await supabase
    .from('waste_reasons')
    .insert(toSnakeCase(reason))
    .select()
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function updateWasteReason(id: string, updates: any) {
  const { data, error } = await supabase
    .from('waste_reasons')
    .update(toSnakeCase(updates))
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function deleteWasteReason(id: string) {
  const { error } = await supabase
    .from('waste_reasons')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============= WASTE ENTRIES =============

export async function getAllWasteEntries() {
  const { data, error } = await supabase
    .from('waste_entries')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function getWasteEntriesByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('waste_entries')
    .select('*')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function createWasteEntry(entry: any) {
  const { data, error } = await supabase
    .from('waste_entries')
    .insert(toSnakeCase(entry))
    .select()
    .single();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function deleteAllWasteEntries() {
  const { error } = await supabase
    .from('waste_entries')
    .delete()
    .neq('id', ''); // Delete all
  
  if (error) throw error;
}

// ============= BULK OPERATIONS =============

export async function bulkCreateItems(items: any[]) {
  const { data, error } = await supabase
    .from('items')
    .insert(items.map(toSnakeCase))
    .select();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function bulkCreateUsers(users: any[]) {
  const { data, error } = await supabase
    .from('users')
    .insert(users.map(toSnakeCase))
    .select();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function bulkCreateWasteReasons(reasons: any[]) {
  const { data, error } = await supabase
    .from('waste_reasons')
    .insert(reasons.map(toSnakeCase))
    .select();
  
  if (error) throw error;
  return toCamelCase(data);
}

export async function bulkCreateRecipeIngredients(ingredients: any[]) {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .insert(ingredients.map(toSnakeCase))
    .select();
  
  if (error) throw error;
  return toCamelCase(data);
}

// ============= DATABASE UTILITIES =============

export async function clearAllTables() {
  // Delete in order to respect foreign key constraints
  await supabase.from('waste_entries').delete().neq('id', '');
  await supabase.from('recipe_ingredients').delete().neq('id', '');
  await supabase.from('items').delete().neq('id', '');
  await supabase.from('waste_reasons').delete().neq('id', '');
  await supabase.from('users').delete().neq('id', '');
}

export async function runMigration() {
  // Check if tables exist by trying to query them
  try {
    await supabase.from('users').select('id').limit(1);
    console.log('Database tables already exist');
    return true;
  } catch (error: any) {
    console.log('Database needs initialization:', error.message);
    return false;
  }
}