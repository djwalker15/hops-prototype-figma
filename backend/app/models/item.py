from sqlalchemy import Column, String, Boolean, Float, DateTime
from .base import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    subcategory = Column(String, nullable=True)
    unit = Column(String, nullable=False)
    cost_per_unit = Column(Float, nullable=True, server_default="0")
    serving_size = Column(Float, nullable=True, server_default="1")
    bottle_size = Column(Float, nullable=True, server_default="750")
    is_active = Column(Boolean, nullable=False, server_default="true")
    created_at = Column(DateTime(timezone=True), nullable=True)
