"""Modèles SQLAlchemy. Importés ici pour qu'Alembic les découvre via Base.metadata."""

from app.models.bloc import Bloc
from app.models.exercise import Exercise
from app.models.week import Week

__all__ = ["Bloc", "Week", "Exercise"]
