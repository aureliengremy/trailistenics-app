"""Progression de l'utilisateur courant, persistée en DB (sync avec le localStorage du front)."""

from typing import Any

from fastapi import APIRouter, Body, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserProgress
from app.security import CurrentUser, get_current_user

router = APIRouter(prefix="/api", tags=["progress"])


@router.get("/progress", summary="Progression de l'utilisateur courant (objet vide si aucune)")
def get_progress(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    up = db.scalar(select(UserProgress).where(UserProgress.owner_id == user.id))
    return up.data if up else {}


@router.put("/progress", summary="Enregistre la progression de l'utilisateur courant")
def put_progress(
    data: dict[str, Any] = Body(...),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    up = db.scalar(select(UserProgress).where(UserProgress.owner_id == user.id))
    if up is None:
        db.add(UserProgress(owner_id=user.id, data=data))
    else:
        up.data = data
    db.commit()
    return {"ok": True}
