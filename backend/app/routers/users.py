from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserOut

router = APIRouter()


@router.get("")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.name))
    users = result.scalars().all()
    return {"users": [UserOut.model_validate(u).model_dump(by_alias=True) for u in users]}


@router.post("/authenticate")
async def authenticate(body: dict, db: AsyncSession = Depends(get_db)):
    pin = body.get("pin")
    if not pin:
        raise HTTPException(status_code=400, detail="PIN required")
    result = await db.execute(select(User).where(User.pin == pin))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    return {"success": True, "user": UserOut.model_validate(user).model_dump(by_alias=True)}
