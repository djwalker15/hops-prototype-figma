from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..seed.seed_data import seed_database, clear_all_tables

router = APIRouter()


@router.post("/seed")
async def seed(db: AsyncSession = Depends(get_db)):
    await seed_database(db)
    return {"success": True, "message": "Database seeded successfully"}


@router.post("/reseed")
async def reseed(db: AsyncSession = Depends(get_db)):
    await clear_all_tables(db)
    await seed_database(db)
    return {"success": True, "message": "Database cleared and reseeded successfully"}


@router.post("/migrate-waste-reasons")
async def migrate_waste_reasons():
    return {"success": True, "message": "Migration not needed - using PostgreSQL"}


@router.post("/migrate-users")
async def migrate_users():
    return {"success": True, "message": "Migration not needed - using PostgreSQL"}
