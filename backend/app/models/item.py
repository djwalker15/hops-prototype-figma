from sqlalchemy import Column, String, Boolean, Float, Integer
from .base import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default="true")
    current_inventory = Column(Float, nullable=True)
    inventory_unit = Column(String, nullable=True)
    typical_serving_size = Column(Integer, nullable=True)
    has_recipe = Column(Boolean, nullable=True, server_default="false")
    recipe_yield = Column(Integer, nullable=True)
