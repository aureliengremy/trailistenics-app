from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Week
from app.schemas import WeekOut

router = APIRouter(prefix="/api/weeks", tags=["weeks"])


@router.get("", response_model=list[WeekOut], summary="Les 13 semaines du plan")
def list_weeks(db: Session = Depends(get_db)) -> list[Week]:
    return list(
        db.scalars(select(Week).options(joinedload(Week.bloc)).order_by(Week.number))
    )


@router.get("/{number}", response_model=WeekOut, summary="Détail d'une semaine (1–13)")
def get_week(number: int, db: Session = Depends(get_db)) -> Week:
    week = db.scalar(
        select(Week).options(joinedload(Week.bloc)).where(Week.number == number)
    )
    if week is None:
        raise HTTPException(status_code=404, detail=f"Semaine {number} introuvable")
    return week
