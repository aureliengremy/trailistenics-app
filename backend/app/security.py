"""Authentification : vérification du JWT Neon Auth (Better Auth, EdDSA) via JWKS.

Le front obtient un JWT auprès du serveur Neon Auth (`GET {auth}/token`) et l'envoie en
`Authorization: Bearer`. On le vérifie ici contre le JWKS (clé Ed25519), sans état serveur.
"""

from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.config import settings

# Client JWKS partagé (met en cache les clés de signature ; rafraîchit au besoin).
_jwks_client = PyJWKClient(settings.neon_auth_jwks_url)

_bearer = HTTPBearer(auto_error=True)
_credentials_exc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Jeton d'authentification invalide ou expiré.",
    headers={"WWW-Authenticate": "Bearer"},
)


@dataclass
class CurrentUser:
    """Utilisateur courant résolu depuis le JWT Neon Auth."""

    id: str  # uuid Neon Auth (claim `sub`)
    email: str | None
    is_admin: bool


def _decode(token: str) -> dict:
    signing_key = _jwks_client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["EdDSA"],
        audience=settings.neon_auth_issuer,
        issuer=settings.neon_auth_issuer,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> CurrentUser:
    """Dépendance FastAPI : exige un JWT Neon Auth valide, renvoie l'utilisateur courant."""
    try:
        payload = _decode(credentials.credentials)
    except Exception as exc:  # signature/exp/aud invalides, JWKS injoignable…
        raise _credentials_exc from exc
    user_id = payload.get("sub")
    if not user_id:
        raise _credentials_exc
    email = payload.get("email")
    return CurrentUser(id=user_id, email=email, is_admin=email == settings.admin_email)
