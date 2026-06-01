from pydantic import BaseModel, ConfigDict


class ExerciseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order: int
    name: str
    volume: str
    target: str
    rationale: str
