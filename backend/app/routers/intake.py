"""Intake (questionnaire de profil) de l'utilisateur courant — base de la génération du programme."""

import json
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Body, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import UserIntake
from app.notifications import send_email
from app.security import CurrentUser, get_current_user

router = APIRouter(prefix="/api", tags=["intake"])


def _notify_admin_intake(email: str | None, user_id: str, data: dict[str, Any], is_new: bool) -> None:
    """Notifie l'admin par email qu'un intake a été rempli (best-effort ; le JSON se récupère
    dans l'onglet Admin de l'app)."""
    pretty = json.dumps(data, ensure_ascii=False, indent=2)
    verb = "rempli" if is_new else "mis à jour"
    send_email(
        settings.admin_email,
        f"Intake {verb} — {email or user_id}",
        f"<p>Intake {verb} sur <b>Trailistenics</b> par <b>{email or user_id}</b>.</p>"
        f"<pre>{pretty}</pre>"
        f'<p><a href="{settings.app_url}">Ouvrir l\'app</a> (onglet Admin) pour copier le JSON '
        f"et générer le programme.</p>",
    )


@router.get("/intake", summary="Intake de l'utilisateur courant (objet vide si non rempli)")
def get_intake(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    it = db.scalar(select(UserIntake).where(UserIntake.owner_id == user.id))
    return it.data if it else {}


@router.put("/intake", summary="Enregistre l'intake de l'utilisateur courant (et notifie l'admin)")
def put_intake(
    background: BackgroundTasks,
    data: dict[str, Any] = Body(...),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    it = db.scalar(select(UserIntake).where(UserIntake.owner_id == user.id))
    is_new = it is None
    if it is None:
        db.add(UserIntake(owner_id=user.id, data=data))
    else:
        it.data = data
    db.commit()
    background.add_task(_notify_admin_intake, user.email, user.id, data, is_new)
    return {"ok": True}
