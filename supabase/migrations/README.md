# H.O.P.S. Database Migration Instructions

## Overview
The H.O.P.S. Waste Logging System has been migrated from a KV-pair storage model to a relational PostgreSQL database. This provides better scalability, data integrity, and querying capabilities.

## Database Schema

### Tables Created:
1. **users** - Staff members who can log into the system
2. **items** - All inventory items (spirits, wines, beers, mixers, prep items, recipes)
3. **recipe_ingredients** - Links recipes to their ingredient items with quantities
4. **waste_reasons** - Predefined reasons for waste entries
5. **waste_entries** - Logged waste events with full audit trail

### Key Improvements:
- ✅ Foreign key constraints for data integrity
- ✅ Indexes for fast queries
- ✅ Automatic timestamp tracking (created_at, updated_at)
- ✅ Cascading deletes for related data
- ✅ Type safety with CHECK constraints

## Running the Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `/supabase/migrations/001_initial_schema.sql`
4. Paste and run the SQL
5. Verify tables were created in the **Table Editor**

### Option 2: Via Supabase CLI
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

## After Migration

Once the tables are created:

1. **Refresh your app** - The force reseed flag in App.tsx will automatically:
   - Clear old KV-pair data
   - Seed PostgreSQL with comprehensive Haywire Bar inventory
   - Create 250+ items across all categories

2. **Verify data** - Check the Supabase dashboard to see:
   - 4 users (Sarah, Marcus, Emily, James)
   - ~150 spirits
   - 30 wines
   - 12 beers
   - 50+ mixers
   - 11 prep items
   - 10 recipes with ingredients

3. **Remove force reseed** - After successful seeding, remove this line from `/src/app/App.tsx`:
   ```typescript
   localStorage.removeItem('hops_db_initialized'); // FORCE RESEED FOR COMPREHENSIVE DATA
   ```

## Benefits of Relational Model

### Before (KV-pairs):
- ❌ No relationships between data
- ❌ Manual data integrity checks
- ❌ Difficult to query related data
- ❌ No schema validation

### After (PostgreSQL):
- ✅ Proper relationships with foreign keys
- ✅ Automatic data integrity
- ✅ Efficient joins and queries
- ✅ Schema validation and type safety
- ✅ Better scalability
- ✅ Transaction support
- ✅ Advanced analytics capabilities

## Technical Details

### Data Conversion:
- KV keys like `item:spirit_001` → PostgreSQL row in `items` table
- Automatic snake_case ↔ camelCase conversion in API layer
- Maintained backward compatibility with existing frontend code

### Performance:
- Indexed queries for fast searches
- Optimized for mobile-first waste logging (< 30 second target)
- Efficient bulk operations for seeding

## Troubleshooting

If you encounter errors:

1. **Tables already exist**: Drop tables manually in SQL Editor:
   ```sql
   DROP TABLE IF EXISTS waste_entries CASCADE;
   DROP TABLE IF EXISTS recipe_ingredients CASCADE;
   DROP TABLE IF EXISTS items CASCADE;
   DROP TABLE IF EXISTS waste_reasons CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```

2. **Permission errors**: Ensure your Supabase service role key has proper permissions

3. **Connection errors**: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables

## Next Steps

With the relational model in place, you can now:
- Add advanced reporting and analytics
- Implement proper inventory tracking
- Create complex queries across related data
- Scale to multiple locations
- Add user permissions and roles
- Integrate with external systems
