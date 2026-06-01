"""Exercise : un des 6 mouvements du circuit renfo (calisthénie × trail)."""

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Ordre dans le circuit (1 à 6).
    order: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(96), nullable=False)
    volume: Mapped[str] = mapped_column(String(64), nullable=False)
    # Cible / "chip" du prototype, ex. "Descente", "Fessiers".
    target: Mapped[str] = mapped_column(String(32), nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
