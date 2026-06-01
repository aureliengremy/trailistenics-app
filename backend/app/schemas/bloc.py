from pydantic import BaseModel, ConfigDict


class BlocOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    name: str
    category: str
    color: str
    color_key: str
    description: str
    order: int
