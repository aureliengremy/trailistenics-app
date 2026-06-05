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
    # (L'authentification est gérée par Neon Auth côté frontend, pas par cette API.)
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
