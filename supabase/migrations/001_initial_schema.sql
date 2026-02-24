-- H.O.P.S. Waste Logging System - Initial Database Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('bartender', 'manager')),
  is_scheduled_today BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items Table (Spirits, Wines, Beers, Mixers, Prep, Recipes)
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('spirits', 'wine', 'beer', 'mixers', 'prep', 'recipe')),
  subcategory TEXT,
  unit TEXT NOT NULL,
  cost_per_unit NUMERIC(10, 2) DEFAULT 0,
  serving_size NUMERIC(10, 2) DEFAULT 1,
  bottle_size NUMERIC(10, 2) DEFAULT 750,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe Ingredients Table (for linking recipes to their ingredient items)
CREATE TABLE recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waste Reasons Table
CREATE TABLE waste_reasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waste Entries Table
CREATE TABLE waste_entries (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  reason_id TEXT NOT NULL REFERENCES waste_reasons(id),
  reason_name TEXT NOT NULL,
  logged_by_user_id TEXT NOT NULL REFERENCES users(id),
  logged_by_name TEXT NOT NULL,
  attributed_to_user_id TEXT REFERENCES users(id),
  attributed_to_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_active ON items(is_active);
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_waste_entries_timestamp ON waste_entries(timestamp DESC);
CREATE INDEX idx_waste_entries_item_id ON waste_entries(item_id);
CREATE INDEX idx_waste_entries_logged_by ON waste_entries(logged_by_user_id);
CREATE INDEX idx_waste_entries_attributed_to ON waste_entries(attributed_to_user_id);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_item ON recipe_ingredients(item_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_reasons_updated_at BEFORE UPDATE ON waste_reasons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'Staff members who can log into the system';
COMMENT ON TABLE items IS 'All inventory items including spirits, wines, beers, mixers, prep items, and recipes';
COMMENT ON TABLE recipe_ingredients IS 'Links recipes to their ingredient items with quantities';
COMMENT ON TABLE waste_reasons IS 'Predefined reasons for waste entries';
COMMENT ON TABLE waste_entries IS 'Logged waste events with full audit trail';
