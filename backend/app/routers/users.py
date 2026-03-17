from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserOut
from ..dependencies.clerk_auth import get_clerk_user_id

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


@router.get("/by-clerk-id/{clerk_user_id}")
async def get_user_by_clerk_id(
    clerk_user_id: str,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_clerk_user_id),
):
    result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="No user linked to this Clerk account")
    return {"user": UserOut.model_validate(user).model_dump(by_alias=True)}


@router.patch("/{user_id}/link-clerk")
async def link_clerk_user(
    user_id: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    pin = body.get("pin")
    if not pin:
        raise HTTPException(status_code=400, detail="PIN required")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.pin != pin:
        raise HTTPException(status_code=401, detail="Incorrect PIN")

    user.clerk_user_id = clerk_user_id
    await db.commit()
    await db.refresh(user)
    return {"user": UserOut.model_validate(user).model_dump(by_alias=True)}
