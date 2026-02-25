import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from ..database import get_db
from ..models.waste_entry import WasteEntry
from ..schemas.waste_entry import WasteEntryOut, WasteEntryCreate

router = APIRouter()


@router.get("")
async def get_waste_entries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WasteEntry).order_by(WasteEntry.timestamp.desc())
    )
    entries = result.scalars().all()
    return {"entries": [WasteEntryOut.model_validate(e).model_dump(by_alias=True) for e in entries]}


@router.post("")
async def create_waste_entry(data: WasteEntryCreate, db: AsyncSession = Depends(get_db)):
    entry_id = data.id or f"waste_{uuid.uuid4().hex[:12]}"
    raw_ts = data.timestamp or datetime.now(timezone.utc)
    if isinstance(raw_ts, str):
        raw_ts = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
    timestamp = raw_ts

    entry = WasteEntry(
        id=entry_id,
        item_id=data.item_id,
        item_name=data.item_name,
        category=data.category,
        amount=data.amount,
        unit=data.unit,
        reason_id=data.reason_id,
        reason_name=data.reason_name,
        logged_by_user_id=data.logged_by_user_id,
        logged_by_name=data.logged_by_name,
        attributed_to_user_id=data.attributed_to_user_id,
        attributed_to_name=data.attributed_to_name,
        timestamp=timestamp,
        notes=data.notes,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {"success": True, "entry": WasteEntryOut.model_validate(entry).model_dump(by_alias=True)}


@router.delete("")
async def delete_all_waste_entries(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(WasteEntry))
    await db.commit()
    return {"success": True, "message": "All waste entries cleared"}
