"""Week : une des 13 semaines du plan."""

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Week(Base):
    __tablename__ = "weeks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    date_label: Mapped[str] = mapped_column(String(32), nullable=False)

    bloc_id: Mapped[int] = mapped_column(ForeignKey("blocs.id"), nullable=False)

    # Sortie longue (dimanche).
    long_run_label: Mapped[str] = mapped_column(String(128), nullable=False)
    long_run_duration_min: Mapped[int] = mapped_column(Integer, nullable=False)
    long_run_dplus_m: Mapped[int] = mapped_column(Integer, nullable=False)
    long_run_distance_km: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Volume / séances.
    sessions_per_week: Mapped[int] = mapped_column(Integer, nullable=False)
    sessions_label: Mapped[str | None] = mapped_column(String(16), nullable=True)

    # Séance qualité (jeudi) + focus de la semaine.
    quality_session: Mapped[str] = mapped_column(String(128), nullable=False)
    focus: Mapped[str] = mapped_column(Text, nullable=False)

    is_race: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    bloc: Mapped["Bloc"] = relationship(back_populates="weeks")  # noqa: F821
