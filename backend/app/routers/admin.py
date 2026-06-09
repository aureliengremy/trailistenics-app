"""Endpoints réservés à l'administrateur (liste des comptes + leurs intakes)."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import CurrentUser, get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _require_admin(user: CurrentUser) -> None:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Réservé à l'administrateur.")


@router.get("/users", summary="Liste des comptes + état intake/programme (admin)")
def list_users(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    _require_admin(user)
    rows = db.execute(
        text(
            """
            SELECT u.id::text AS id,
                   u.email,
                   u."createdAt" AS created_at,
                   (i.owner_id IS NOT NULL) AS has_intake,
                   i.data AS intake,
                   (p.owner_id IS NOT NULL) AS has_program
            FROM neon_auth."user" u
            LEFT JOIN user_intake i ON i.owner_id = u.id::text
            LEFT JOIN programs p ON p.owner_id = u.id::text
            ORDER BY u."createdAt" DESC
            """
        )
    ).mappings()
    return [dict(r) for r in rows]
