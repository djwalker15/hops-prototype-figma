from sqlalchemy import Column, String, Boolean, Integer, DateTime
from .base import Base


class WasteReason(Base):
    __tablename__ = "waste_reasons"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default="true")
    sort_order = Column(Integer, nullable=False, server_default="0")
    created_at = Column(DateTime(timezone=True), nullable=True)
