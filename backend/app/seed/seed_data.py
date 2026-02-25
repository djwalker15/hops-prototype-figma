"""
Comprehensive seed data for H.O.P.S. (Haywire Bar waste logger).
Ported from supabase/functions/server/comprehensive_seed_data.tsx.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, text
from ..models.user import User
from ..models.item import Item
from ..models.waste_reason import WasteReason
from ..models.waste_entry import WasteEntry
from ..models.recipe_ingredient import RecipeIngredient


# ─────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────

USERS = [
    {"id": "user_brittany", "name": "Brittany", "pin": "1234", "role": "manager", "is_active": True, "is_scheduled_today": True},
    {"id": "user_davontae", "name": "Davontae", "pin": "2345", "role": "bartender", "is_active": True, "is_scheduled_today": True},
    {"id": "user_izzy",     "name": "Izzy",     "pin": "3456", "role": "bartender", "is_active": True, "is_scheduled_today": True},
    {"id": "user_sydney",   "name": "Sydney",   "pin": "4567", "role": "bartender", "is_active": True, "is_scheduled_today": False},
    {"id": "user_dylan",    "name": "Dylan",    "pin": "5678", "role": "barback",   "is_active": True, "is_scheduled_today": False},
    {"id": "user_dalton",   "name": "Dalton",   "pin": "6789", "role": "bartender", "is_active": True, "is_scheduled_today": False},
]

# ─────────────────────────────────────────────
# WASTE REASONS
# ─────────────────────────────────────────────

WASTE_REASONS = [
    {"id": "reason_dropped",   "name": "Dropped/Spilled",        "is_active": True, "sort_order": 1},
    {"id": "reason_sent_back", "name": "Guest sent back",        "is_active": True, "sort_order": 2},
    {"id": "reason_wrong",     "name": "Wrong item made",        "is_active": True, "sort_order": 3},
    {"id": "reason_spoilage",  "name": "Spoilage/Expired",       "is_active": True, "sort_order": 4},
    {"id": "reason_cork",      "name": "Cork disintegrated",     "is_active": True, "sort_order": 5},
    {"id": "reason_overpour",  "name": "Over-poured",            "is_active": True, "sort_order": 6},
    {"id": "reason_training",  "name": "Training/Tasting",       "is_active": True, "sort_order": 7},
    {"id": "reason_burned",    "name": "Burned batch",           "is_active": True, "sort_order": 8},
    {"id": "reason_recall",    "name": "Product recall",         "is_active": True, "sort_order": 9},
    {"id": "reason_other",     "name": "Other",                  "is_active": True, "sort_order": 10},
]

# ─────────────────────────────────────────────
# ITEMS  (spirits, wines, beers, mixers, batches)
# ─────────────────────────────────────────────

def _spirit(name: str, subcategory: str) -> dict:
    return {"name": name, "category": "spirit", "is_active": True}

def _wine(name: str) -> dict:
    return {"name": name, "category": "wine", "is_active": True}

def _beer(name: str) -> dict:
    return {"name": name, "category": "beer", "is_active": True}

def _mixer(name: str) -> dict:
    return {"name": name, "category": "mixer", "is_active": True}

def _batch(name: str) -> dict:
    return {"name": name, "category": "batch", "is_active": True}


ITEMS_RAW = [
    # VODKA
    _spirit("Tito's Handmade", "Vodka"),
    _spirit("Belvedere", "Vodka"),
    _spirit("Chopin", "Vodka"),
    _spirit("Deep Eddy Ruby Red", "Vodka"),
    _spirit("Grey Goose", "Vodka"),
    _spirit("Ketel One", "Vodka"),
    _spirit("Smirnoff Vanilla", "Vodka"),
    _spirit("Towans", "Vodka"),
    _spirit("Western Son", "Vodka"),
    _spirit("Western Son Lemon", "Vodka"),
    _spirit("Western Son Blueberry", "Vodka"),
    _spirit("Wheatley", "Vodka"),
    # GIN
    _spirit("New Amsterdam", "Gin"),
    _spirit("Still Austin", "Gin"),
    _spirit("Tanqueray", "Gin"),
    _spirit("Bombay Sapphire", "Gin"),
    _spirit("Botanist", "Gin"),
    _spirit("Empress 1908 Indigo", "Gin"),
    _spirit("Hendrick's", "Gin"),
    # RUM
    _spirit("Malibu Coconut", "Rum"),
    _spirit("Meyer's Dark", "Rum"),
    _spirit("Ron Zacapa 23yr", "Rum"),
    _spirit("Appleton Estate 12yr Rare Casks", "Rum"),
    _spirit("Bacardi", "Rum"),
    _spirit("Captain Morgan", "Rum"),
    # AMERICAN WHISKEY
    _spirit("1792 Small Batch", "American Whiskey"),
    _spirit("Angels Envy Bourbon", "American Whiskey"),
    _spirit("Basil Hayden Bourbon", "American Whiskey"),
    _spirit("Blanton's", "American Whiskey"),
    _spirit("Buffalo Trace", "American Whiskey"),
    _spirit("Bulleit Bourbon", "American Whiskey"),
    _spirit("Eagle Rare 10yr", "American Whiskey"),
    _spirit("Eagle Rare 10yr Haywire Barrel Select", "American Whiskey"),
    _spirit("Elijah Craig Small Batch", "American Whiskey"),
    _spirit("Four Roses Single Barrel", "American Whiskey"),
    _spirit("Four Roses Small Batch", "American Whiskey"),
    _spirit("Gentleman Jack", "American Whiskey"),
    _spirit("Heaven Hill 7yr", "American Whiskey"),
    _spirit("High West Bourbon", "American Whiskey"),
    _spirit("Jack Daniel's Old No 7", "American Whiskey"),
    _spirit("Jefferson's Ocean", "American Whiskey"),
    _spirit("Jim Beam", "American Whiskey"),
    _spirit("Knob Creek Bourbon", "American Whiskey"),
    _spirit("Larceny Small Batch", "American Whiskey"),
    _spirit("Laws Four Grain Bourbon", "American Whiskey"),
    _spirit("Maker's Mark 46", "American Whiskey"),
    _spirit("Maker's Mark", "American Whiskey"),
    _spirit("Michter's American", "American Whiskey"),
    _spirit("Michter's Small Batch Bourbon", "American Whiskey"),
    _spirit("Old Forester Bourbon", "American Whiskey"),
    _spirit("Old Forester King Ranch", "American Whiskey"),
    _spirit("Old Forester Single Barrel Haywire Select", "American Whiskey"),
    _spirit("Russell's Reserve Single Barrel", "American Whiskey"),
    _spirit("Weller Special Reserve", "American Whiskey"),
    _spirit("Weller Antique 107 proof", "American Whiskey"),
    _spirit("Weller 12yr", "American Whiskey"),
    _spirit("Widow Jane 10yr", "American Whiskey"),
    _spirit("Wild Turkey 101 Bourbon", "American Whiskey"),
    _spirit("Woodford Reserve Bourbon", "American Whiskey"),
    _spirit("Woodford Reserve Double Oaked", "American Whiskey"),
    # TEXAS WHISKEY
    _spirit("Balcones Brimstone", "Texas Whiskey"),
    _spirit("Balcones Single Malt Haywire Select", "Texas Whiskey"),
    _spirit("Bendt No 5. Haywire Exclusive Blend", "Texas Whiskey"),
    _spirit("Garrison Brother's Honey Dew", "Texas Whiskey"),
    _spirit("Garrison Brother's Single Barrel", "Texas Whiskey"),
    _spirit("Garrison Brother's Small Batch", "Texas Whiskey"),
    _spirit("Milam & Greene Port Cask Rye", "Texas Whiskey"),
    _spirit("Milam & Greene Triple Cask", "Texas Whiskey"),
    _spirit("Still Austin 'The Artist' Rye", "Texas Whiskey"),
    _spirit("Still Austin 'The Musician' Bourbon", "Texas Whiskey"),
    _spirit("Treaty Oak Day Drinker", "Texas Whiskey"),
    _spirit("TX Blended", "Texas Whiskey"),
    _spirit("TX Straight Bourbon", "Texas Whiskey"),
    _spirit("Yellow Rose Outlaw Bourbon", "Texas Whiskey"),
    # RYE WHISKEY
    _spirit("Angels Envy Rye", "Rye Whiskey"),
    _spirit("Basil Hayden Dark Rye", "Rye Whiskey"),
    _spirit("Bulleit Rye", "Rye Whiskey"),
    _spirit("High West Double Rye", "Rye Whiskey"),
    _spirit("Knob Creek Rye", "Rye Whiskey"),
    _spirit("Old Forester Rye", "Rye Whiskey"),
    _spirit("High West Rendezvous Rye", "Rye Whiskey"),
    _spirit("Redemption Rye", "Rye Whiskey"),
    _spirit("Rittenhouse Rye", "Rye Whiskey"),
    _spirit("Sazerac 6yr Rye", "Rye Whiskey"),
    _spirit("Whistlepig 10yr Small Batch", "Rye Whiskey"),
    _spirit("Whistlepig PiggyBack 6yr", "Rye Whiskey"),
    _spirit("Woodford Reserve Rye", "Rye Whiskey"),
    # SCOTCH
    _spirit("Balvenie 12yr Double Wood", "Scotch"),
    _spirit("Balvenie 14yr Caribbean Cask", "Scotch"),
    _spirit("Chivas Regal 12yr", "Scotch"),
    _spirit("Dewars White Label", "Scotch"),
    _spirit("Dewars 12yr", "Scotch"),
    _spirit("Glenfiddich 12yr", "Scotch"),
    _spirit("Glenlivet 12yr", "Scotch"),
    _spirit("Glenlivet 18yr", "Scotch"),
    _spirit("Glenmorangie Quinta Ruban 14yr", "Scotch"),
    _spirit("Johnnie Walker Black", "Scotch"),
    _spirit("Johnnie Walker Blue", "Scotch"),
    _spirit("Lagavulin 16yr", "Scotch"),
    _spirit("Laphroaig 10yr", "Scotch"),
    _spirit("Macallan 12yr Double Cask", "Scotch"),
    _spirit("Macallan 18yr Sherry Cask", "Scotch"),
    _spirit("Macallan 25yr (1oz)", "Scotch"),
    _spirit("Monkey Shoulder", "Scotch"),
    _spirit("Oban 14yr", "Scotch"),
    # INTERNATIONAL WHISKEY
    _spirit("Crown Royal Canadian", "International"),
    _spirit("Jameson Irish", "International"),
    _spirit("Green Spot Irish", "International"),
    _spirit("Redbreast 12yr Irish", "International"),
    _spirit("Suntory Toki Japanese", "International"),
    # COGNAC
    _spirit("Courvoisier VS", "Cognac"),
    _spirit("Hennessy VS", "Cognac"),
    _spirit("Hennessy VSOP", "Cognac"),
    _spirit("Remy Martin 1738", "Cognac"),
    _spirit("Remy Martin XO", "Cognac"),
    # TEQUILA
    _spirit("Casa Noble Blanco", "Blanco"),
    _spirit("Casamigos Blanco", "Blanco"),
    _spirit("Cazadores Blanco", "Blanco"),
    _spirit("Codigo 1530 Blanco", "Blanco"),
    _spirit("Don Julio Blanco", "Blanco"),
    _spirit("Fortaleza Blanco", "Blanco"),
    _spirit("G4 Blanco", "Blanco"),
    _spirit("Lalo Blanco", "Blanco"),
    _spirit("Patron Silver", "Blanco"),
    _spirit("Tequila Ocho Plata Blanco", "Blanco"),
    _spirit("Volans Still Strength Blanco", "Blanco"),
    _spirit("Casamigos Reposado", "Reposado"),
    _spirit("Codigo 1530 Reposado", "Reposado"),
    _spirit("Don Julio Reposado", "Reposado"),
    _spirit("El Tesoro Reposado", "Reposado"),
    _spirit("Clase Azul Reposado", "Reposado"),
    _spirit("Fortaleza Reposado", "Reposado"),
    _spirit("G4 Reposado", "Reposado"),
    _spirit("La Gritona Reposado", "Reposado"),
    _spirit("Lunazul Reposado", "Reposado"),
    _spirit("Siete Leguas Reposado", "Reposado"),
    _spirit("Tequila Ocho Reposado", "Reposado"),
    _spirit("Casamigos Añejo", "Añejo"),
    _spirit("Don Julio Añejo", "Añejo"),
    _spirit("Fortaleza Añejo", "Añejo"),
    _spirit("Siete Leguas Añejo", "Añejo"),
    _spirit("Don Julio 1942", "Extra Añejo"),
    _spirit("El Tesoro Extra Añejo", "Extra Añejo"),
    # MEZCAL
    _spirit("Del Maguey Vida Mezcal", "Mezcal"),
    _spirit("Clase Azul Mezcal", "Mezcal"),
    _spirit("Ilegal Mezcal Joven", "Mezcal"),
    _spirit("Ilegal Mezcal Reposado", "Mezcal"),
    # CORDIALS
    _spirit("Amaro Averna", "Cordial"),
    _spirit("Amaro Nonino", "Cordial"),
    _spirit("Bailey's Irish Cream", "Cordial"),
    _spirit("Bendt Bourbon Cream", "Cordial"),
    _spirit("Benedictine", "Cordial"),
    _spirit("Chambord", "Cordial"),
    _spirit("Chartreuse, Green", "Cordial"),
    _spirit("Frangelico Hazelnut", "Cordial"),
    _spirit("Grand Marnier", "Cordial"),
    _spirit("Kahlua", "Cordial"),
    # WINES
    _wine("La Gioiosa Prosecco"),
    _wine("McPherson Cellars Sparkling Chenin Blanc"),
    _wine("JCB 'N°69' Crémant Rosé"),
    _wine("Vietti Moscato d'Asti"),
    _wine("My Paris Secret"),
    _wine("A to Z Riesling"),
    _wine("Banfi 'San Angelo' Pinot Grigio"),
    _wine("Villa Maria Sauvignon Blanc"),
    _wine("'Details' Special Estate Winery Sauvignon Blanc"),
    _wine("Jackson Estate Chardonnay"),
    _wine("Palomes 'Running Wild' Chardonnay"),
    _wine("Rose Gold Rosé"),
    _wine("Erath 'Resplendent' Pinot Noir"),
    _wine("Cambria Estate Winery 'Julia's Vineyard' Pinot Noir"),
    _wine("Decoy 'Limited' Pinot Noir"),
    _wine("Alexander Valley Vineyards Merlot"),
    _wine("Opolo Vineyards 'Summit Creek' Zinfandel"),
    _wine("Lost Draw Cellars Tempranillo"),
    _wine("The Federalist Red Blend"),
    _wine("Angels & Cowboys Red Blend"),
    _wine("Unshackled Cabernet Sauvignon"),
    _wine("Raymond Vineyards 'Sommelier Selection' Cabernet Sauvignon"),
    _wine("Justin Vineyards & Winery Cabernet Sauvignon"),
    _wine("Martin Ray 'Synthesis' Cabernet Sauvignon"),
    _wine("Terrazas de los Andes 'Altos Del Plata' Malbec"),
    _wine("Belle Glos 'Dairyman' Pinot Noir"),
    _wine("Caymus Vineyards Cabernet Sauvignon"),
    _wine("Stag's Leap Winery Cabernet Sauvignon"),
    _wine("Hall Cabernet Sauvignon"),
    _wine("Quintessa Red Blend"),
    # BEERS
    _beer("Independence 'Native Texan'"),
    _beer("Shiner Bock"),
    _beer("Miller Lite"),
    _beer("Bud Light"),
    _beer("Michelob Ultra"),
    _beer("Dos Equis"),
    _beer("Stella Artois"),
    _beer("Heineken 0.0"),
    _beer("Pinthouse 'Electric Jellyfish'"),
    _beer("Karbach 'Love Street'"),
    _beer("Estrella Jalisco"),
    _beer("Independence 'Austin Amber'"),
    # MIXERS
    _mixer("Lime Juice"),
    _mixer("Lemon Juice"),
    _mixer("Orange Juice"),
    _mixer("Grapefruit Juice"),
    _mixer("Cranberry Juice"),
    _mixer("Pineapple Juice"),
    _mixer("Blood Orange Juice"),
    _mixer("Hibiscus Prickly Pear Juice"),
    _mixer("Blueberry Pomegranate Juice"),
    _mixer("Simple Syrup"),
    _mixer("Agave Syrup"),
    _mixer("Tobacco Vanilla Syrup"),
    _mixer("Brown Sugar Simple"),
    _mixer("Cinnamon Agave Simple"),
    _mixer("Prickly Pear Syrup"),
    _mixer("Guava Puree"),
    _mixer("Angostura Bitters"),
    _mixer("Black Walnut Bitters"),
    _mixer("Regan's Orange Bitters"),
    _mixer("Peach Bitters"),
    _mixer("Paula's Orange Liqueur"),
    _mixer("Cointreau"),
    _mixer("Aperol"),
    _mixer("Cold Brew Coffee Liqueur"),
    _mixer("Katz Coffee Concentrate"),
    _mixer("Katz Coffee Cold Brew Vanilla Bean"),
    _mixer("Fever-Tree Ginger Beer"),
    _mixer("Lemon-Lime Soda"),
    _mixer("Sparkling Water"),
    _mixer("Ginger Ale"),
    _mixer("Lady Bird Tonic"),
    _mixer("Lady Bird Grapefruit Soda"),
    _mixer("Zing Zang"),
    _mixer("Garlic Lime Jus"),
    _mixer("Olive Juice"),
    _mixer("Mint Leaves"),
    _mixer("Cucumber Slices"),
    _mixer("Jalapeño Slices"),
    _mixer("Orange Peel"),
    _mixer("Lemon Wheel"),
    _mixer("Lime Wheel"),
    _mixer("Blackberries"),
    _mixer("Coffee Beans"),
    _mixer("Pecans"),
    _mixer("Dried Hibiscus"),
    _mixer("Olive"),
    _mixer("Salt"),
    _mixer("Tajin"),
    # BATCHES
    _batch("Cadillac Batch"),
    _batch("Bourbon Smash Batch"),
    _batch("Front Porch Swing Batch"),
    _batch("Lady Bird Batch"),
    _batch("Hibiscus Haze Batch"),
    _batch("Cucumber Refresher Batch"),
    _batch("Cowboy Carajillo Spirit Batch"),
    _batch("Haywire Whiskey Blend"),
    _batch("Frozen Margarita Mix"),
    _batch("Texas Tea Batch"),
    _batch("Sangria"),
]


async def seed_database(db: AsyncSession) -> None:
    """
    Idempotent seed: skips entities that already exist (checked by id / name).
    """
    now = datetime.now(timezone.utc).isoformat()

    # ── Users ──────────────────────────────────────────────────────────────
    existing_users = (await db.execute(select(User.id))).scalars().all()
    existing_user_ids = set(existing_users)
    for u in USERS:
        if u["id"] not in existing_user_ids:
            db.add(User(
                id=u["id"],
                name=u["name"],
                pin=u["pin"],
                role=u["role"],
                is_active=u["is_active"],
                is_scheduled_today=u["is_scheduled_today"],
                created_at=now,
            ))

    # ── Waste Reasons ──────────────────────────────────────────────────────
    existing_reasons = (await db.execute(select(WasteReason.id))).scalars().all()
    existing_reason_ids = set(existing_reasons)
    for r in WASTE_REASONS:
        if r["id"] not in existing_reason_ids:
            db.add(WasteReason(
                id=r["id"],
                name=r["name"],
                is_active=r["is_active"],
                sort_order=r["sort_order"],
                created_at=now,
            ))

    # ── Items ──────────────────────────────────────────────────────────────
    existing_names_result = await db.execute(select(Item.name))
    existing_item_names = set(existing_names_result.scalars().all())
    for item_data in ITEMS_RAW:
        if item_data["name"] not in existing_item_names:
            db.add(Item(
                id=f"item_{uuid.uuid4().hex[:12]}",
                name=item_data["name"],
                category=item_data["category"],
                is_active=item_data["is_active"],
            ))

    await db.commit()


async def clear_all_tables(db: AsyncSession) -> None:
    """Delete all data in FK-safe order."""
    await db.execute(delete(WasteEntry))
    await db.execute(delete(RecipeIngredient))
    await db.execute(delete(Item))
    await db.execute(delete(WasteReason))
    await db.execute(delete(User))
    await db.commit()
