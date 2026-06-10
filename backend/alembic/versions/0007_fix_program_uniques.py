"""Corrige les uniques globales résiduelles sur weeks/exercises

La migration 0004 visait à rendre `weeks.number` et `exercises."order"` uniques PAR
programme, mais elle a tenté de supprimer des contraintes nommées `weeks_number_key` /
`exercises_order_key` qui n'existaient pas : les vraies contraintes (`uq_weeks_number`,
`uq_exercises_order`) sont restées globales. Conséquence : un seul programme pouvait
posséder des semaines (collision `UniqueViolation` au second programme rempli), ce qui
cassait les programmes par utilisateur.

Ici : on supprime les uniques globales et on les remplace par des uniques composites
`(program_id, number)` et `(program_id, "order")` — l'unicité voulue, par programme.

Revision ID: 0007_fix_program_uniques
Revises: 0006_user_intake
Create Date: 2026-06-09
"""
from alembic import op

revision: str = "0007_fix_program_uniques"
down_revision: str | None = "0006_user_intake"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Supprime les uniques globales résiduelles (idempotent sur les deux noms connus).
    op.execute("ALTER TABLE weeks DROP CONSTRAINT IF EXISTS uq_weeks_number")
    op.execute("ALTER TABLE weeks DROP CONSTRAINT IF EXISTS weeks_number_key")
    op.execute("ALTER TABLE exercises DROP CONSTRAINT IF EXISTS uq_exercises_order")
    op.execute("ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_order_key")
    # Unicité par programme.
    op.create_unique_constraint("uq_weeks_program_number", "weeks", ["program_id", "number"])
    op.create_unique_constraint(
        "uq_exercises_program_order", "exercises", ["program_id", "order"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_exercises_program_order", "exercises", type_="unique")
    op.drop_constraint("uq_weeks_program_number", "weeks", type_="unique")
    op.create_unique_constraint("uq_weeks_number", "weeks", ["number"])
    op.create_unique_constraint("uq_exercises_order", "exercises", ["order"])
