from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Exercise
from app.schemas import ExerciseOut

router = APIRouter(prefix="/api/exercises", tags=["exercises"])


@router.get("", response_model=list[ExerciseOut], summary="Circuit renfo (6 exercices)")
def list_exercises(db: Session = Depends(get_db)) -> list[Exercise]:
    return list(db.scalars(select(Exercise).order_by(Exercise.order)))
