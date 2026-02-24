import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as db from "./database.tsx";
import { seedDatabase } from "./seed_data.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-68fdbf91/health", (c) => {
  return c.json({ status: "ok", database: "postgresql" });
});

// Initialize/Seed database endpoint
app.post("/make-server-68fdbf91/seed", async (c) => {
  try {
    console.log('Starting database seed...');
    await seedDatabase();
    return c.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error('Seed error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Force clear and reseed database endpoint
app.post("/make-server-68fdbf91/reseed", async (c) => {
  try {
    console.log('Force clearing all tables...');
    await db.clearAllTables();
    console.log('Starting fresh database seed...');
    await seedDatabase();
    return c.json({ success: true, message: "Database cleared and reseeded successfully" });
  } catch (error) {
    console.error('Reseed error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Legacy migration endpoints (no longer needed with PostgreSQL but kept for compatibility)
app.post("/make-server-68fdbf91/migrate-waste-reasons", async (c) => {
  return c.json({ success: true, message: "Migration not needed - using PostgreSQL" });
});

app.post("/make-server-68fdbf91/migrate-users", async (c) => {
  return c.json({ success: true, message: "Migration not needed - using PostgreSQL" });
});

// ============= ITEMS ENDPOINTS =============

app.get("/make-server-68fdbf91/items", async (c) => {
  try {
    const items = await db.getAllItems();
    
    // For recipes, fetch their ingredients
    const itemsWithIngredients = await Promise.all(
      items.map(async (item: any) => {
        if (item.category === 'recipe') {
          const ingredients = await db.getRecipeIngredients(item.id);
          return { ...item, ingredients };
        }
        return item;
      })
    );
    
    return c.json({ items: itemsWithIngredients });
  } catch (error) {
    console.error('Error fetching items:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get("/make-server-68fdbf91/items/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const item = await db.getItemById(id);
    
    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }
    
    // If it's a recipe, fetch ingredients
    if (item.category === 'recipe') {
      const ingredients = await db.getRecipeIngredients(item.id);
      item.ingredients = ingredients;
    }
    
    return c.json({ item });
  } catch (error) {
    console.error('Error fetching item:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/make-server-68fdbf91/items", async (c) => {
  try {
    const item = await c.req.json();
    const created = await db.createItem(item);
    
    // If it's a recipe with ingredients, create them
    if (item.ingredients && item.ingredients.length > 0) {
      const ingredients = item.ingredients.map((ing: any) => ({
        id: ing.id || `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recipeId: created.id,
        itemId: ing.itemId,
        quantity: ing.quantity,
        unit: ing.unit,
      }));
      await db.bulkCreateRecipeIngredients(ingredients);
    }
    
    return c.json({ success: true, item: created });
  } catch (error) {
    console.error('Error creating item:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put("/make-server-68fdbf91/items/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Update the item
    const updated = await db.updateItem(id, updates);
    
    // If ingredients are provided, update them
    if (updates.ingredients) {
      // Delete existing ingredients
      await db.deleteRecipeIngredients(id);
      
      // Create new ingredients
      if (updates.ingredients.length > 0) {
        const ingredients = updates.ingredients.map((ing: any) => ({
          id: ing.id || `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          recipeId: id,
          itemId: ing.itemId,
          quantity: ing.quantity,
          unit: ing.unit,
        }));
        await db.bulkCreateRecipeIngredients(ingredients);
      }
    }
    
    return c.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error updating item:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= USERS ENDPOINTS =============

app.get("/make-server-68fdbf91/users", async (c) => {
  try {
    const users = await db.getAllUsers();
    return c.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/make-server-68fdbf91/users/authenticate", async (c) => {
  try {
    const { pin } = await c.req.json();
    const user = await db.getUserByPin(pin);
    
    if (!user) {
      return c.json({ error: "Invalid PIN" }, 401);
    }
    
    return c.json({ success: true, user });
  } catch (error) {
    console.error('Error authenticating user:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= WASTE ENTRIES ENDPOINTS =============

app.get("/make-server-68fdbf91/waste-entries", async (c) => {
  try {
    const entries = await db.getAllWasteEntries();
    return c.json({ entries });
  } catch (error) {
    console.error('Error fetching waste entries:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/make-server-68fdbf91/waste-entries", async (c) => {
  try {
    const entry = await c.req.json();
    
    // Generate ID if not provided
    if (!entry.id) {
      entry.id = `waste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Save the waste entry
    const created = await db.createWasteEntry(entry);
    
    // Note: Inventory updates are handled separately if needed
    // The cascading inventory update logic can be added here if required
    
    return c.json({ success: true, entry: created });
  } catch (error) {
    console.error('Error creating waste entry:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete("/make-server-68fdbf91/waste-entries", async (c) => {
  try {
    await db.deleteAllWasteEntries();
    return c.json({ success: true, message: "All waste entries cleared" });
  } catch (error) {
    console.error('Error clearing waste entries:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= WASTE REASONS ENDPOINTS =============

app.get("/make-server-68fdbf91/waste-reasons", async (c) => {
  try {
    const reasons = await db.getAllWasteReasons();
    return c.json({ reasons });
  } catch (error) {
    console.error('Error fetching waste reasons:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/make-server-68fdbf91/waste-reasons", async (c) => {
  try {
    const reason = await c.req.json();
    
    // Generate ID if not provided
    if (!reason.id) {
      reason.id = `reason_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const created = await db.createWasteReason(reason);
    return c.json({ success: true, reason: created });
  } catch (error) {
    console.error('Error creating waste reason:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put("/make-server-68fdbf91/waste-reasons/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const updated = await db.updateWasteReason(id, updates);
    return c.json({ success: true, reason: updated });
  } catch (error) {
    console.error('Error updating waste reason:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete("/make-server-68fdbf91/waste-reasons/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await db.deleteWasteReason(id);
    return c.json({ success: true, message: "Waste reason deleted" });
  } catch (error) {
    console.error('Error deleting waste reason:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);

console.log("✅ H.O.P.S. Server running with PostgreSQL database");