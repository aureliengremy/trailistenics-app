"""Programme de l'utilisateur courant (authentifié via Neon Auth)."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Exercise, Program, Week
from app.schemas import ExerciseOut, ProgramOut, WeekOut
from app.security import CurrentUser, get_current_user

router = APIRouter(prefix="/api", tags=["program"])


@router.get(
    "/program",
    response_model=ProgramOut | None,
    summary="Le programme de l'utilisateur courant (null si aucun → nouveau compte)",
)
def my_program(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProgramOut | None:
    prog = db.scalar(select(Program).where(Program.owner_id == user.id).order_by(Program.id))
    if prog is None:
        return None
    weeks = db.scalars(
        select(Week).options(joinedload(Week.bloc)).where(Week.program_id == prog.id).order_by(Week.number)
    )
    exercises = db.scalars(
        select(Exercise).where(Exercise.program_id == prog.id).order_by(Exercise.order)
    )
    return ProgramOut(
        id=prog.id,
        name=prog.name,
        start_date=prog.start_date,
        event_date=prog.event_date,
        weeks=[WeekOut.model_validate(w) for w in weeks],
        exercises=[ExerciseOut.model_validate(e) for e in exercises],
    )
