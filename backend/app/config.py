"""Configuration de l'application — lue exclusivement depuis l'environnement.

Aucune valeur sensible n'est codée en dur : la connexion à la base vient entièrement
de DATABASE_URL, ce qui rend la bascule local -> Neon triviale.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Connexion DB — pilote tout (local Postgres aujourd'hui, Neon demain).
    database_url: str = "postgresql+psycopg://traildev:traildev@localhost:5432/plantrail"

    # Origines autorisées par CORS, séparées par des virgules.
    cors_origins: str = "http://localhost:5173"

    # --- Neon Auth (Better Auth) ---
    # Le front envoie le JWT (EdDSA) obtenu via {auth}/token ; on le vérifie via JWKS.
    # `iss`/`aud` = l'host du serveur d'auth (sans le chemin /neondb/auth).
    neon_auth_issuer: str = "https://ep-damp-pond-aq32vtdp.neonauth.c-8.us-east-1.aws.neon.tech"
    neon_auth_jwks_url: str = (
        "https://ep-damp-pond-aq32vtdp.neonauth.c-8.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json"
    )
    # Email du compte administrateur (capacités admin).
    admin_email: str = "gremy.aurelien@gmail.com"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
