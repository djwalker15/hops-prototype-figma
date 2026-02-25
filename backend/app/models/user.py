from sqlalchemy import Column, String, Boolean
from .base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    pin = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default="true")
    is_scheduled_today = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(String, nullable=True)
