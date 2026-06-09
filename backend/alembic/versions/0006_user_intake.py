"""Intake utilisateur (table user_intake, JSONB par user)

Revision ID: 0006_user_intake
Revises: 0005_user_progress
Create Date: 2026-06-09
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0006_user_intake"
down_revision: str | None = "0005_user_progress"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "user_intake",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("owner_id", sa.String(length=64), nullable=False),
        sa.Column("data", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("owner_id", name="uq_user_intake_owner"),
    )
    op.create_index("ix_user_intake_owner_id", "user_intake", ["owner_id"])


def downgrade() -> None:
    op.drop_index("ix_user_intake_owner_id", table_name="user_intake")
    op.drop_table("user_intake")
