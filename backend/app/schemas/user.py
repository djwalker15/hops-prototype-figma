from pydantic import BaseModel
from . import ORM_CAMEL_CONFIG


class UserOut(BaseModel):
    model_config = ORM_CAMEL_CONFIG

    id: str
    name: str
    pin: str
    role: str
    is_active: bool
    is_scheduled_today: bool
