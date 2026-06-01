from pydantic import BaseModel, ConfigDict

from app.schemas.bloc import BlocOut


class WeekOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: int
    date_label: str
    long_run_label: str
    long_run_duration_min: int
    long_run_dplus_m: int
    long_run_distance_km: int | None
    sessions_per_week: int
    sessions_label: str | None
    quality_session: str
    focus: str
    is_race: bool
    bloc: BlocOut
