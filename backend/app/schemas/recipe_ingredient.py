from pydantic import BaseModel
from typing import Optional
from . import ORM_CAMEL_CONFIG


class RecipeIngredientOut(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: str
    recipe_id: str
    item_id: str
    quantity: float
    unit: str


class RecipeIngredientCreate(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: Optional[str] = None
    item_id: str
    quantity: float
    unit: str
