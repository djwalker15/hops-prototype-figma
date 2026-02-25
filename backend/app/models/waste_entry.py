from sqlalchemy import Column, String, Float
from .base import Base


class WasteEntry(Base):
    __tablename__ = "waste_entries"

    id = Column(String, primary_key=True)
    item_id = Column(String, nullable=False)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    reason_id = Column(String, nullable=True)
    reason_name = Column(String, nullable=True)
    logged_by_user_id = Column(String, nullable=False)
    logged_by_name = Column(String, nullable=False)
    attributed_to_user_id = Column(String, nullable=True)
    attributed_to_name = Column(String, nullable=True)
    timestamp = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
