from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

# Shared config: reads from ORM models, serializes as camelCase
ORM_CAMEL_CONFIG = ConfigDict(
    from_attributes=True,
    populate_by_name=True,
    alias_generator=to_camel,
)
