from sqlalchemy import Column, String, Float, ForeignKey
from .base import Base


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(String, primary_key=True)
    recipe_id = Column(String, ForeignKey("items.id"), nullable=False)
    item_id = Column(String, ForeignKey("items.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
