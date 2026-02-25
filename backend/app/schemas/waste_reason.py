from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime
from . import ORM_CAMEL_CONFIG


class WasteReasonOut(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: str
    name: str
    is_active: bool
    sort_order: int
    created_at: Optional[Union[datetime, str]] = None


class WasteReasonCreate(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: Optional[str] = None
    name: str
    is_active: bool = True
    sort_order: int = 0


class WasteReasonUpdate(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    name: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
