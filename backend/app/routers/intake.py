"""Intake (questionnaire de profil) de l'utilisateur courant — base de la génération du programme."""

from typing import Any

from fastapi import APIRouter, Body, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserIntake
from app.security import CurrentUser, get_current_user

router = APIRouter(prefix="/api", tags=["intake"])


@router.get("/intake", summary="Intake de l'utilisateur courant (objet vide si non rempli)")
def get_intake(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    it = db.scalar(select(UserIntake).where(UserIntake.owner_id == user.id))
    return it.data if it else {}


@router.put("/intake", summary="Enregistre l'intake de l'utilisateur courant")
def put_intake(
    data: dict[str, Any] = Body(...),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    it = db.scalar(select(UserIntake).where(UserIntake.owner_id == user.id))
    if it is None:
        db.add(UserIntake(owner_id=user.id, data=data))
    else:
        it.data = data
    db.commit()
    return {"ok": True}
