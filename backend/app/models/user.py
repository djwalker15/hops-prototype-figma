from sqlalchemy import Column, String, Boolean, DateTime
from .base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    pin = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_scheduled_today = Column(Boolean, nullable=False, server_default="false")
    clerk_user_id = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
