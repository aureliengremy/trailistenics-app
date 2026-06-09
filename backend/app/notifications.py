"""Envoi d'emails via Resend (stdlib, sans dépendance). No-op si aucune clé configurée."""

import json
import urllib.request

from app.config import settings


def send_email(to: str, subject: str, html: str) -> bool:
    """Envoie un email via Resend. Retourne False (sans lever) si pas de clé ou en cas d'échec."""
    if not settings.resend_api_key:
        return False
    payload = json.dumps(
        {"from": settings.resend_from, "to": [to], "subject": subject, "html": html}
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {settings.resend_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status < 300
    except Exception:
        return False
