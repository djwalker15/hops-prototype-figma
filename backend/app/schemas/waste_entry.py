from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime
from . import ORM_CAMEL_CONFIG


class WasteEntryOut(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: str
    item_id: str
    item_name: str
    category: Optional[str] = None
    amount: float
    unit: str
    reason_id: Optional[str] = None
    reason_name: Optional[str] = None
    logged_by_user_id: str
    logged_by_name: str
    attributed_to_user_id: Optional[str] = None
    attributed_to_name: Optional[str] = None
    timestamp: Union[datetime, str]
    notes: Optional[str] = None


class WasteEntryCreate(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: Optional[str] = None
    item_id: str
    item_name: str
    category: Optional[str] = None
    amount: float
    unit: str
    reason_id: Optional[str] = None
    reason_name: Optional[str] = None
    logged_by_user_id: str
    logged_by_name: str
    attributed_to_user_id: Optional[str] = None
    attributed_to_name: Optional[str] = None
    timestamp: Optional[Union[datetime, str]] = None
    notes: Optional[str] = None
