"""Met à jour les libellés de séance qualité (allure + RPE + récup) de tous les programmes,
et applique la rampe progressive des 4 premières semaines au plan de référence.

Usage (depuis backend/, venv actif, DATABASE_URL sur la base CIBLE — pour la prod, l'URL
Neon des variables d'environnement Render, jamais le .env local) :

    python -m app.update_quality_sessions            # aperçu (par défaut)
    python -m app.update_quality_sessions --apply    # écrit en base

Idempotent : un second passage ne modifie rien (les libellés convertis ne sont plus des
clés de conversion, et la re-rampe est gardée par le libellé attendu).
"""

import argparse
from collections import defaultdict

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Week
from app.quality_sessions import REFERENCE_RERAMP, REWRITES, matches_reference


def main() -> int:
    parser = argparse.ArgumentParser(description="Convertit les libellés de séance qualité.")
    parser.add_argument("--apply", action="store_true", help="écrit en base (sinon : aperçu)")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        weeks = db.scalars(select(Week)).all()

        # 1. Conversion (allure + RPE + récup) — libellé courant, ou converti s'il est connu.
        converted: dict[int, str] = {
            id(week): REWRITES.get(week.quality_session or "", week.quality_session or "")
            for week in weeks
        }

        # 2. Re-rampe : uniquement pour un programme dont les semaines 1–4 (converties)
        #    portent la signature du plan de référence.
        by_program: dict[int | None, dict[int, str]] = defaultdict(dict)
        for week in weeks:
            by_program[week.program_id][week.number] = converted[id(week)]
        reference_programs = {
            pid for pid, labels in by_program.items() if matches_reference(labels)
        }
        for week in weeks:
            if week.program_id in reference_programs:
                reramp = REFERENCE_RERAMP.get(week.number)
                if reramp is not None and converted[id(week)] == reramp[0]:
                    converted[id(week)] = reramp[1]

        changes: list[tuple[Week, str, str]] = [
            (week, week.quality_session, converted[id(week)])
            for week in weeks
            if week.quality_session and converted[id(week)] != week.quality_session
        ]

        for week, old, new in changes:
            print(f"  programme {week.program_id} · S{week.number}")
            print(f"      - {old}")
            print(f"      + {new}")
        print(f"\n{len(changes)} semaine(s) à mettre à jour sur {len(weeks)}.")
        print(f"Plan(s) de référence re-rampé(s) : {sorted(p for p in reference_programs if p)}")

        if args.apply:
            for week, _old, new in changes:
                week.quality_session = new
            db.commit()
            print("Appliqué.")
        else:
            print("Aperçu seulement — relancer avec --apply pour écrire.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
