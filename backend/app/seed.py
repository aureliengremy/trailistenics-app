"""Peuple la base à partir du contenu du plan (source de vérité : plan/*.md & *.html).

Idempotent : vide les tables puis réinsère. Lancer avec `python -m app.seed`.
Le texte provient de plan_trail_descriptif.md ; les valeurs numériques des graphiques
(durée, D+) suivent plan_trail_interactif.html.
"""

from sqlalchemy import delete

from app.database import SessionLocal
from app.models import Bloc, Exercise, Week

# --- Blocs -----------------------------------------------------------------
# (key, name, category, color, color_key, description, order)
BLOCS = [
    ("reprise", "Reprise", "Construction", "#7ba05b", "base",
     "Phase de construction — montée progressive du volume, reprise en douceur.", 1),
    ("base", "Base", "Construction", "#7ba05b", "base",
     "Phase de construction — installation de la base d'endurance.", 2),
    ("developpement", "Développement", "Construction", "#7ba05b", "base",
     "Phase de construction — le volume grimpe.", 3),
    ("allegee", "Allégée", "Récupération", "#a99e88", "allege",
     "Récupération, assimilation de la charge. Ne pas la sauter.", 4),
    ("pic", "Pic de charge", "Pic de charge", "#c2562e", "pic",
     "Volume maximal, le bloc le plus exigeant.", 5),
    ("simulateur", "Simulateur", "Simulateur", "#c2562e", "simul",
     "Sortie choc qui reproduit le D+ de la course.", 6),
    ("affutage", "Affûtage", "Affûtage", "#6fa8c4", "affut",
     "Réduction du volume pour arriver frais.", 7),
]

# --- Semaines --------------------------------------------------------------
# (number, date, bloc_key, long_label, dur_min, dplus_m, dist_km,
#  sessions, sessions_label, quality, focus, is_race)
WEEKS = [
    (1, "2 juin", "reprise", "1h10 · ~11 km · 250 m D+", 70, 250, 11,
     3, None, "Côtes : 6×1 min",
     "Réveil en douceur. Endurance facile, on marche dès que ça monte raide.", False),
    (2, "9 juin", "reprise", "1h15 · ~12 km · 300 m D+", 75, 300, 12,
     3, None, "Seuil : 2×12 min",
     "On installe la routine. Footing du seuil sur faux-plat.", False),
    (3, "16 juin", "base", "1h20 · ~13 km · 350 m D+", 80, 350, 13,
     3, "3 → 4", "Côtes : 8×1 min",
     "Passage vers 4 séances selon la forme. Le renfo du mardi devient régulier.", False),
    (4, "23 juin", "allegee", "1h00 · ~10 km · 250 m D+", 60, 250, 10,
     3, None, "Seuil : 2×10 min",
     "Semaine de récup. Le corps assimile — ne la saute pas.", False),
    (5, "30 juin", "base", "1h30 · ~14 km · 400 m D+", 90, 400, 14,
     4, None, "Côtes : 8×1 min + descente",
     "On commence le travail de descente sur la longue. Sentiers en pente choisis exprès.",
     False),
    (6, "7 juil.", "developpement", "1h40 · ~15 km · 450 m D+", 100, 450, 15,
     4, None, "Seuil : 3×10 min",
     "Le volume grimpe. Teste ta nutrition sur la longue.", False),
    (7, "14 juil.", "developpement", "1h50 · ~16 km · 500 m D+", 110, 500, 16,
     4, None, "Côtes : 10×1 min",
     "Première vraie longue. Power hiking dans les passages raides.", False),
    (8, "21 juil.", "allegee", "1h15 · ~12 km · 300 m D+", 75, 300, 12,
     3, None, "Seuil : 2×12 min",
     "Deuxième coupure. Tu encaisses la charge avant le gros bloc.", False),
    (9, "28 juil.", "pic", "2h00 · ~17 km · 550 m D+", 120, 550, 17,
     4, None, "Côtes longues : 5×2 min",
     "Le bloc clé. Matériel testé en conditions réelles.", False),
    (10, "4 août", "pic", "2h15 · ~18 km · 600 m D+", 135, 600, 18,
     4, None, "Seuil : 3×12 min",
     "Volume maximal. Gère la fatigue, dors bien.", False),
    (11, "11 août", "simulateur", "2h30 · ~15 km · ~700 m D+ (sortie choc)", 150, 700, 15,
     4, None, "Côtes : 6×2 min (léger)",
     "Sortie choc à J-3 semaines : le D+ max que tu trouves. "
     "Évalue ton rythme en descente technique.", False),
    (12, "18 août", "affutage", "1h15 · ~12 km · 350 m D+", 75, 350, 12,
     3, None, "Côtes : 5×1 min vif",
     "Réduction ~50 % du volume. On garde du tonus, pas de fatigue.", False),
    (13, "25 août", "affutage", "45 min relâché + lignes → COURSE", 45, 120, None,
     2, None, "Repos / 20 min footing",
     "Dernière ligne droite. Jambes fraîches, frais mental. La course t'attend.", True),
]

# --- Circuit renfo ---------------------------------------------------------
# (order, name, volume, target, rationale)
EXERCISES = [
    (1, "Single-Leg RDL (soulevé roumain sur une jambe)", "3 × 10 / jambe",
     "Chaîne postérieure",
     "Cible ischios + fessiers : ce qui te propulse en montée et rééquilibre ton profil "
     "quadriceps."),
    (2, "Step-downs lents", "3 × 8 / jambe", "Descente",
     "Descendre d'une marche/box en 4–5 s, contrôlé. LE geste de la descente : excentrique "
     "qui blinde les cuisses."),
    (3, "Nordic Hamstring Curls", "3 × 6", "Genou",
     "Assistés au besoin. Protègent le genou au freinage, sécurisent la descente."),
    (4, "Pont fessier sur une jambe", "3 × 12 / jambe", "Fessiers",
     "Renforce les fessiers sans recharger des quadriceps déjà bien sollicités ailleurs."),
    (5, "Tibial raises + Calf raises (sur une marche)", "3 × 15", "Cheville",
     "Cheville solide = pas d'entorse au km 12 sur terrain instable."),
    (6, "Planche latérale + levé de jambe", "3 × 40 s / côté", "Gainage",
     "Stabilité du bassin dans la foulée. Ton point fort calisthénie, à entretenir."),
]


def seed() -> None:
    db = SessionLocal()
    try:
        # Idempotence : on repart d'une base propre (ordre : enfants avant parents).
        db.execute(delete(Week))
        db.execute(delete(Exercise))
        db.execute(delete(Bloc))
        db.flush()

        bloc_by_key: dict[str, Bloc] = {}
        for key, name, category, color, color_key, description, order in BLOCS:
            bloc = Bloc(
                key=key, name=name, category=category, color=color,
                color_key=color_key, description=description, order=order,
            )
            db.add(bloc)
            bloc_by_key[key] = bloc
        db.flush()

        for (number, date, bloc_key, label, dur, dplus, dist, sessions,
             sessions_label, quality, focus, is_race) in WEEKS:
            db.add(Week(
                number=number, date_label=date, bloc_id=bloc_by_key[bloc_key].id,
                long_run_label=label, long_run_duration_min=dur, long_run_dplus_m=dplus,
                long_run_distance_km=dist, sessions_per_week=sessions,
                sessions_label=sessions_label, quality_session=quality, focus=focus,
                is_race=is_race,
            ))

        for order, name, volume, target, rationale in EXERCISES:
            db.add(Exercise(
                order=order, name=name, volume=volume, target=target, rationale=rationale,
            ))

        db.commit()
        print(f"Seed OK : {len(BLOCS)} blocs, {len(WEEKS)} semaines, {len(EXERCISES)} exercices.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
