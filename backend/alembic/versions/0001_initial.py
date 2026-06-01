"""Schéma initial : blocs, weeks, exercises

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-01
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "blocs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=64), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("color", sa.String(length=7), nullable=False),
        sa.Column("color_key", sa.String(length=16), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.UniqueConstraint("key", name="uq_blocs_key"),
    )

    op.create_table(
        "weeks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("date_label", sa.String(length=32), nullable=False),
        sa.Column("bloc_id", sa.Integer(), sa.ForeignKey("blocs.id"), nullable=False),
        sa.Column("long_run_label", sa.String(length=128), nullable=False),
        sa.Column("long_run_duration_min", sa.Integer(), nullable=False),
        sa.Column("long_run_dplus_m", sa.Integer(), nullable=False),
        sa.Column("long_run_distance_km", sa.Integer(), nullable=True),
        sa.Column("sessions_per_week", sa.Integer(), nullable=False),
        sa.Column("sessions_label", sa.String(length=16), nullable=True),
        sa.Column("quality_session", sa.String(length=128), nullable=False),
        sa.Column("focus", sa.Text(), nullable=False),
        sa.Column("is_race", sa.Boolean(), nullable=False),
        sa.UniqueConstraint("number", name="uq_weeks_number"),
    )

    op.create_table(
        "exercises",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=96), nullable=False),
        sa.Column("volume", sa.String(length=64), nullable=False),
        sa.Column("target", sa.String(length=32), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.UniqueConstraint("order", name="uq_exercises_order"),
    )


def downgrade() -> None:
    op.drop_table("exercises")
    op.drop_table("weeks")
    op.drop_table("blocs")
