"""Programmes par utilisateur : table programs + program_id sur weeks/exercises

Le plan existant (13 semaines + 6 exercices) est rattaché au programme de l'admin.
Les numéros de semaine / ordres d'exercice ne sont plus uniques globalement (uniques
par programme).

Revision ID: 0004_programs
Revises: 0003_drop_users
Create Date: 2026-06-09
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004_programs"
down_revision: str | None = "0003_drop_users"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ADMIN_OWNER_ID = "2a11d7dd-dc93-43e8-bee5-fd5ac030bfaf"


def upgrade() -> None:
    op.create_table(
        "programs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("owner_id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("event_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_programs_owner_id", "programs", ["owner_id"])

    op.add_column("weeks", sa.Column("program_id", sa.Integer(), nullable=True))
    op.add_column("exercises", sa.Column("program_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_weeks_program", "weeks", "programs", ["program_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("fk_exercises_program", "exercises", "programs", ["program_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_weeks_program_id", "weeks", ["program_id"])
    op.create_index("ix_exercises_program_id", "exercises", ["program_id"])

    # Les numéros/ordres ne sont plus uniques globalement (uniques par programme).
    op.execute("ALTER TABLE weeks DROP CONSTRAINT IF EXISTS weeks_number_key")
    op.execute("ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_order_key")

    # Backfill : rattache les données existantes au programme de l'admin.
    op.execute(
        f"""
        INSERT INTO programs (owner_id, name, start_date, event_date)
        SELECT '{ADMIN_OWNER_ID}', 'Trail 20 km · 740 m D+', DATE '2026-06-02', DATE '2026-08-30'
        WHERE EXISTS (SELECT 1 FROM weeks)
          AND NOT EXISTS (SELECT 1 FROM programs WHERE owner_id = '{ADMIN_OWNER_ID}')
        """
    )
    op.execute(
        f"""
        UPDATE weeks SET program_id =
          (SELECT id FROM programs WHERE owner_id = '{ADMIN_OWNER_ID}' ORDER BY id LIMIT 1)
        WHERE program_id IS NULL
        """
    )
    op.execute(
        f"""
        UPDATE exercises SET program_id =
          (SELECT id FROM programs WHERE owner_id = '{ADMIN_OWNER_ID}' ORDER BY id LIMIT 1)
        WHERE program_id IS NULL
        """
    )


def downgrade() -> None:
    op.drop_index("ix_exercises_program_id", table_name="exercises")
    op.drop_index("ix_weeks_program_id", table_name="weeks")
    op.drop_constraint("fk_exercises_program", "exercises", type_="foreignkey")
    op.drop_constraint("fk_weeks_program", "weeks", type_="foreignkey")
    op.drop_column("exercises", "program_id")
    op.drop_column("weeks", "program_id")
    op.drop_index("ix_programs_owner_id", table_name="programs")
    op.drop_table("programs")
    op.create_unique_constraint("weeks_number_key", "weeks", ["number"])
    op.create_unique_constraint("exercises_order_key", "exercises", ["order"])
