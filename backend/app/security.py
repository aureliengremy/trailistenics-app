"""Sécurité : hachage de mot de passe (bcrypt), jetons JWT et dépendance d'auth.

Aucun secret en dur : la clé de signature vient de `settings.jwt_secret` (env).
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

# bcrypt tronque silencieusement au-delà de 72 octets ; on borne aussi côté schéma.
_BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    """Retourne le hachage bcrypt (avec sel) d'un mot de passe en clair."""
    digest = bcrypt.hashpw(password.encode("utf-8")[:_BCRYPT_MAX_BYTES], bcrypt.gensalt())
    return digest.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Vérifie un mot de passe en clair contre son hachage bcrypt."""
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:_BCRYPT_MAX_BYTES], hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str) -> str:
    """Crée un jeton JWT signé dont le `sub` identifie l'utilisateur."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict | None:
    """Décode/valide un jeton JWT ; retourne le payload ou None si invalide/expiré."""
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None


_bearer = HTTPBearer(auto_error=True)
_credentials_exc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Identifiants invalides ou jeton expiré.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Dépendance FastAPI : résout l'utilisateur courant à partir du jeton Bearer."""
    payload = decode_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise _credentials_exc
    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise _credentials_exc
    user = db.get(User, user_id)
    if user is None:
        raise _credentials_exc
    return user
