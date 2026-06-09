"""Modèles SQLAlchemy. Importés ici pour qu'Alembic les découvre via Base.metadata."""

from app.models.bloc import Bloc
from app.models.exercise import Exercise
from app.models.program import Program
from app.models.user_progress import UserProgress
from app.models.week import Week

__all__ = ["Bloc", "Week", "Exercise", "Program", "UserProgress"]
