"""Notification à l'admin lors d'une nouvelle inscription (appelée par le front après register)."""

from fastapi import APIRouter, Depends

from app.config import settings
from app.notifications import send_email
from app.security import CurrentUser, get_current_user

router = APIRouter(prefix="/api", tags=["notify"])


@router.post("/notify-signup", summary="Notifie l'admin d'un nouveau compte (no-op si Resend non configuré)")
def notify_signup(user: CurrentUser = Depends(get_current_user)) -> dict[str, bool]:
    html = (
        f"<p>Nouveau compte sur <b>Trailistenics</b> :</p>"
        f"<p><b>{user.email}</b><br><small>uuid : {user.id}</small></p>"
        f'<p><a href="{settings.app_url}">Ouvrir l\'app</a> — pense à générer son programme '
        f"une fois l'intake rempli.</p>"
    )
    sent = send_email(settings.admin_email, "Nouveau compte Trailistenics", html)
    return {"sent": sent}
