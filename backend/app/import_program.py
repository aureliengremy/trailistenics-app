"""Importe un programme généré (JSON conforme à docs/modele-donnees/schema-programme.json)
sur le compte d'un utilisateur.

Usage (depuis backend/, venv actif, DATABASE_URL pointant sur la bonne base) :

    python -m app.import_program ../docs/generated/<slug>/programme-<slug>.json \
        --owner-email personne@exemple.com

ou avec l'uuid Neon Auth directement :

    python -m app.import_program programme.json --owner-id <uuid>

Comportement :
- Les blocs sont **partagés** entre programmes : upsert par `key` (créés s'ils manquent,
  couleurs/libellés mis à jour sinon).
- Si l'utilisateur a déjà un programme, il est **remplacé** (semaines/exercices supprimés
  en cascade) — sa progression (user_progress) n'est pas touchée.
- `meta.start_date` → programme ; `meta.event_date` (optionnel) → sinon dérivée du dimanche
  de la dernière semaine.
"""

import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

from sqlalchemy import delete, select, text

from app.database import SessionLocal
from app.models import Bloc, Exercise, Program, Week


def _resolve_owner(db, owner_id: str | None, owner_email: str | None) -> tuple[str, str]:
    """Renvoie (uuid, email) depuis l'uuid ou l'email (table Neon Auth)."""
    if owner_id:
        row = db.execute(
            text('SELECT id::text, email FROM neon_auth."user" WHERE id::text = :v'), {"v": owner_id}
        ).first()
    else:
        row = db.execute(
            text('SELECT id::text, email FROM neon_auth."user" WHERE lower(email) = lower(:v)'),
            {"v": owner_email},
        ).first()
    if not row:
        sys.exit(f"Utilisateur introuvable ({owner_id or owner_email}). Vérifie l'email/uuid et la base.")
    return row[0], row[1]


def _parse_date(v) -> date | None:
    return date.fromisoformat(v) if v else None


def import_program(path: Path, owner_id: str | None, owner_email: str | None, replace: bool) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    meta, blocs, weeks, exercises = data["meta"], data["blocs"], data["weeks"], data["exercises"]
    if not weeks or not exercises:
        sys.exit("Programme incomplet : weeks et exercises ne doivent pas être vides.")

    start = _parse_date(meta.get("start_date"))
    event = _parse_date(meta.get("event_date"))
    if event is None and start is not None:
        # Dimanche de la dernière semaine (S1 = semaine du start_date, lundi → dimanche).
        monday_s1 = start - timedelta(days=start.weekday())
        event = monday_s1 + timedelta(weeks=len(weeks) - 1, days=6)

    db = SessionLocal()
    try:
        uid, email = _resolve_owner(db, owner_id, owner_email)

        existing = db.scalar(select(Program).where(Program.owner_id == uid))
        if existing is not None:
            if not replace:
                sys.exit(
                    f"{email} a déjà un programme (« {existing.name} », id {existing.id}). "
                    "Relance avec --replace pour le remplacer."
                )
            db.execute(delete(Week).where(Week.program_id == existing.id))
            db.execute(delete(Exercise).where(Exercise.program_id == existing.id))
            db.delete(existing)
            db.flush()

        program = Program(
            owner_id=uid,
            name=meta.get("title") or meta["slug"],
            start_date=start,
            event_date=event,
        )
        db.add(program)
        db.flush()

        # Blocs partagés : upsert par key.
        bloc_by_key: dict[str, Bloc] = {}
        for b in blocs:
            bloc = db.scalar(select(Bloc).where(Bloc.key == b["key"]))
            if bloc is None:
                bloc = Bloc(key=b["key"])
                db.add(bloc)
            bloc.name = b["name"]
            bloc.category = b["category"]
            bloc.color = b["color"]
            bloc.color_key = b["color_key"]
            bloc.description = b.get("description") or ""
            bloc.order = b["order"]
            bloc_by_key[b["key"]] = bloc
        db.flush()

        for w in weeks:
            if w["bloc"] not in bloc_by_key:
                sys.exit(f"Semaine {w['number']} : bloc inconnu « {w['bloc']} ».")
            db.add(Week(
                program_id=program.id,
                number=w["number"],
                date_label=w["date_label"],
                bloc_id=bloc_by_key[w["bloc"]].id,
                long_run_label=w["long_run_label"],
                long_run_duration_min=w["long_run_duration_min"],
                long_run_dplus_m=w["long_run_dplus_m"],
                long_run_distance_km=w.get("long_run_distance_km"),
                sessions_per_week=w["sessions_per_week"],
                sessions_label=w.get("sessions_label"),
                quality_session=w["quality_session"],
                focus=w["focus"],
                is_race=w["is_race"],
            ))

        for e in exercises:
            db.add(Exercise(
                program_id=program.id,
                order=e["order"],
                name=e["name"],
                volume=e["volume"],
                target=e["target"],
                rationale=e["rationale"],
            ))

        db.commit()
        print(
            f"Import OK → {email} : « {program.name} » — {len(weeks)} semaines, "
            f"{len(exercises)} exercices, début {start or '?'}, course {event or '?'}."
        )
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Importe un programme généré sur un compte utilisateur.")
    parser.add_argument("json_path", type=Path, help="Chemin du programme-<slug>.json")
    who = parser.add_mutually_exclusive_group(required=True)
    who.add_argument("--owner-email", help="Email du compte destinataire")
    who.add_argument("--owner-id", help="uuid Neon Auth du compte destinataire")
    parser.add_argument("--replace", action="store_true", help="Remplace le programme existant le cas échéant")
    args = parser.parse_args()

    if not args.json_path.is_file():
        sys.exit(f"Fichier introuvable : {args.json_path}")
    import_program(args.json_path, args.owner_id, args.owner_email, args.replace)


if __name__ == "__main__":
    main()
