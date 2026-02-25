import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from ..database import get_db
from ..models.waste_reason import WasteReason
from ..schemas.waste_reason import WasteReasonOut, WasteReasonCreate, WasteReasonUpdate

router = APIRouter()


@router.get("")
async def get_waste_reasons(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WasteReason)
        .where(WasteReason.is_active == True)
        .order_by(WasteReason.sort_order)
    )
    reasons = result.scalars().all()
    return {"reasons": [WasteReasonOut.model_validate(r).model_dump(by_alias=True) for r in reasons]}


@router.post("")
async def create_waste_reason(data: WasteReasonCreate, db: AsyncSession = Depends(get_db)):
    reason_id = data.id or f"reason_{uuid.uuid4().hex[:12]}"
    reason = WasteReason(
        id=reason_id,
        name=data.name,
        is_active=data.is_active,
        sort_order=data.sort_order,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(reason)
    await db.commit()
    await db.refresh(reason)
    return {"success": True, "reason": WasteReasonOut.model_validate(reason).model_dump(by_alias=True)}


@router.put("/{reason_id}")
async def update_waste_reason(
    reason_id: str, data: WasteReasonUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(WasteReason).where(WasteReason.id == reason_id))
    reason = result.scalar_one_or_none()
    if not reason:
        raise HTTPException(status_code=404, detail="Waste reason not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(reason, field, value)

    await db.commit()
    await db.refresh(reason)
    return {"success": True, "reason": WasteReasonOut.model_validate(reason).model_dump(by_alias=True)}


@router.delete("/{reason_id}")
async def delete_waste_reason(reason_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(WasteReason).where(WasteReason.id == reason_id))
    await db.commit()
    return {"success": True, "message": "Waste reason deleted"}
