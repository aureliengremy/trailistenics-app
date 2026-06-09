"""Exercise : un des 6 mouvements du circuit renfo (calisthénie × trail)."""

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    program_id: Mapped[int | None] = mapped_column(
        ForeignKey("programs.id", ondelete="CASCADE"), index=True, nullable=True
    )
    # Ordre dans le circuit (1 à 6) — unique par programme.
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(96), nullable=False)
    volume: Mapped[str] = mapped_column(String(64), nullable=False)
    # Cible / "chip" du prototype, ex. "Descente", "Fessiers".
    target: Mapped[str] = mapped_column(String(32), nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
