"""Engine SQLAlchemy, session factory et dépendance FastAPI get_db()."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

# pool_pre_ping : robustesse aux connexions coupées (utile avec un Postgres serverless
# comme Neon, qui peut suspendre les connexions inactives).
engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    """Base déclarative partagée par tous les modèles."""


def get_db() -> Generator[Session, None, None]:
    """Dépendance FastAPI : fournit une session et la ferme en fin de requête."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
