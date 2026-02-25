import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from ..database import get_db
from ..models.item import Item
from ..models.recipe_ingredient import RecipeIngredient
from ..schemas.item import ItemOut, ItemCreate, ItemUpdate
from ..schemas.recipe_ingredient import RecipeIngredientOut

router = APIRouter()


async def _attach_ingredients(db: AsyncSession, item: Item) -> dict:
    item_dict = ItemOut.model_validate(item).model_dump(by_alias=True)
    if item.category == "recipe":
        result = await db.execute(
            select(RecipeIngredient).where(RecipeIngredient.recipe_id == item.id)
        )
        ingredients = result.scalars().all()
        item_dict["ingredients"] = [
            RecipeIngredientOut.model_validate(i).model_dump(by_alias=True)
            for i in ingredients
        ]
    return item_dict


@router.get("")
async def get_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Item).where(Item.is_active == True).order_by(Item.name)
    )
    items = result.scalars().all()
    items_out = []
    for item in items:
        items_out.append(await _attach_ingredients(db, item))
    return {"items": items_out}


@router.get("/{item_id}")
async def get_item(item_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item": await _attach_ingredients(db, item)}


@router.post("")
async def create_item(data: ItemCreate, db: AsyncSession = Depends(get_db)):
    item_id = data.id or f"item_{uuid.uuid4().hex[:12]}"
    item = Item(
        id=item_id,
        name=data.name,
        category=data.category,
        subcategory=data.subcategory,
        unit=data.unit,
        cost_per_unit=data.cost_per_unit,
        serving_size=data.serving_size,
        bottle_size=data.bottle_size,
        is_active=data.is_active,
    )
    db.add(item)

    if data.ingredients:
        for ing in data.ingredients:
            ri = RecipeIngredient(
                id=ing.id or f"ing_{uuid.uuid4().hex[:12]}",
                recipe_id=item_id,
                item_id=ing.item_id,
                quantity=ing.quantity,
                unit=ing.unit,
            )
            db.add(ri)

    await db.commit()
    await db.refresh(item)
    return {"success": True, "item": await _attach_ingredients(db, item)}


@router.put("/{item_id}")
async def update_item(item_id: str, data: ItemUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = data.model_dump(exclude_none=True, exclude={"ingredients"})
    for field, value in update_data.items():
        setattr(item, field, value)

    if data.ingredients is not None:
        await db.execute(
            delete(RecipeIngredient).where(RecipeIngredient.recipe_id == item_id)
        )
        for ing in data.ingredients:
            ri = RecipeIngredient(
                id=ing.id or f"ing_{uuid.uuid4().hex[:12]}",
                recipe_id=item_id,
                item_id=ing.item_id,
                quantity=ing.quantity,
                unit=ing.unit,
            )
            db.add(ri)

    await db.commit()
    await db.refresh(item)
    return {"success": True, "item": await _attach_ingredients(db, item)}
