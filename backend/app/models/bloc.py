"""Bloc d'entraînement : phase du plan avec sa couleur (cf. section « Lecture des blocs »)."""

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Bloc(Base):
    __tablename__ = "blocs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Identifiant stable, ex. "reprise", "pic".
    key: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    # Nom affiché, ex. "Pic de charge".
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    # Catégorie / "tag" du prototype, ex. "Construction", "Récupération".
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    # Couleur d'affichage (hex), ex. "#c2562e".
    color: Mapped[str] = mapped_column(String(7), nullable=False)
    # Clé de couleur regroupant pic+simulateur (rouille) pour les graphiques.
    color_key: Mapped[str] = mapped_column(String(16), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    weeks: Mapped[list["Week"]] = relationship(back_populates="bloc")  # noqa: F821
