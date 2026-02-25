from pydantic import BaseModel
from typing import Optional, List, Any
from . import ORM_CAMEL_CONFIG
from .recipe_ingredient import RecipeIngredientCreate


class ItemOut(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: str
    name: str
    category: str
    is_active: bool
    current_inventory: Optional[float] = None
    inventory_unit: Optional[str] = None
    typical_serving_size: Optional[int] = None
    has_recipe: Optional[bool] = None
    recipe_yield: Optional[int] = None
    ingredients: Optional[List[Any]] = None


class ItemCreate(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: Optional[str] = None
    name: str
    category: str
    is_active: bool = True
    current_inventory: Optional[float] = None
    inventory_unit: Optional[str] = None
    typical_serving_size: Optional[int] = None
    has_recipe: Optional[bool] = None
    recipe_yield: Optional[int] = None
    ingredients: Optional[List[RecipeIngredientCreate]] = None


class ItemUpdate(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    name: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    current_inventory: Optional[float] = None
    inventory_unit: Optional[str] = None
    typical_serving_size: Optional[int] = None
    has_recipe: Optional[bool] = None
    recipe_yield: Optional[int] = None
    ingredients: Optional[List[RecipeIngredientCreate]] = None
