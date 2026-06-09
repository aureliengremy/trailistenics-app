from datetime import date

from pydantic import BaseModel, ConfigDict

from app.schemas.exercise import ExerciseOut
from app.schemas.week import WeekOut


class ProgramOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    start_date: date | None
    event_date: date | None
    weeks: list[WeekOut]
    exercises: list[ExerciseOut]
