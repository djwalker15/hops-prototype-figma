from pydantic import BaseModel
from typing import Optional, List, Any
from . import ORM_CAMEL_CONFIG
from .recipe_ingredient import RecipeIngredientCreate


class ItemOut(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: str
    name: str
    category: str
    subcategory: Optional[str] = None
    unit: str
    cost_per_unit: Optional[float] = None
    serving_size: Optional[float] = None
    bottle_size: Optional[float] = None
    is_active: bool
    ingredients: Optional[List[Any]] = None


class ItemCreate(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: Optional[str] = None
    name: str
    category: str
    subcategory: Optional[str] = None
    unit: str = "oz"
    cost_per_unit: Optional[float] = None
    serving_size: Optional[float] = None
    bottle_size: Optional[float] = None
    is_active: bool = True
    ingredients: Optional[List[RecipeIngredientCreate]] = None


class ItemUpdate(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    name: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    unit: Optional[str] = None
    cost_per_unit: Optional[float] = None
    serving_size: Optional[float] = None
    bottle_size: Optional[float] = None
    is_active: Optional[bool] = None
    ingredients: Optional[List[RecipeIngredientCreate]] = None
