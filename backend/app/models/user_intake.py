"""Intake : questionnaire de profil d'un utilisateur (JSON), base de la génération du programme."""

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserIntake(Base):
    __tablename__ = "user_intake"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    # Réponses du questionnaire (objectif / course / calisthénie). Forme gérée par le front.
    data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
