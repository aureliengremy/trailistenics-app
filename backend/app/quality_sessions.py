"""Libellés de séance qualité : table de conversion (allure + RPE + récup) et re-rampe
des premières semaines du plan de référence 13 semaines.

Source unique consommée par :
- `app.update_quality_sessions` (mise à jour des programmes en base) ;
- le script d'application aux fichiers du repo (.md, seed.py, JSON générés).

Format cible d'un libellé : `Famille : NxDurée allure (RPE X/10), récup : …`.
L'échauffement et le retour au calme ne sont PAS dans le libellé (le front les affiche).
Contrainte : `week.quality_session` est un String(128).
"""

# Ancien libellé -> nouveau (allure + RPE + récup).
REWRITES: dict[str, str] = {
    "Côtes : 5×1 min vif": "Côtes : 5×1 min vif (RPE 8/10), récup : redescente en trot",
    "Côtes : 6×1 min": "Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot",
    "Côtes : 6×1 min (récup en descendant)": "Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot",
    "Côtes : 8×1 min": "Côtes : 8×1 min vif (RPE 8/10), récup : redescente en trot",
    "Côtes : 10×1 min": "Côtes : 10×1 min vif (RPE 8/10), récup : redescente en trot",
    "Côtes : 8×1 min + descente": "Côtes : 8×1 min vif (RPE 8/10), récup : redescente en trot — 3 dernières descentes appuyées (RPE 6/10)",
    "Côtes : 6×2 min (léger)": "Côtes : 6×2 min contrôlé (RPE 6–7/10), récup : redescente en trot",
    "Côtes : 6×30 s (course)": "Côtes : 6×30 s allure course (RPE 8/10), récup : redescente en marche",
    "Côtes en marche rapide : 6×1 min": "Côtes en marche rapide : 6×1 min (RPE 6/10), récup : redescente tranquille",
    "Côtes longues : 5×2 min": "Côtes longues : 5×2 min soutenu (RPE 8/10), récup : redescente en trot",
    "Côtes longues : 6×2 min": "Côtes longues : 6×2 min soutenu (RPE 8/10), récup : redescente en trot",
    "Lignes + côtes courtes : 5×1 min vif": "Lignes + côtes courtes : 5×1 min vif (RPE 8/10), récup : 1 min 30 marche/trot",
    "Lignes droites : 6×20 s (activation)": "Lignes droites : 6×20 s rapides (RPE 9/10), récup : retour en marche",
    "Activation : 5×20 s lignes (veille)": "Activation veille de course : 5×20 s rapides (RPE 9/10), récup : retour en marche",
    "Footing souple + 4 lignes": "Footing souple (RPE 3–4/10) + 4 lignes droites ~20 s (RPE 9/10), récup : retour en marche",
    "Footing souple continu 20 min": "Footing souple continu 20 min (RPE 3–4/10), aucune intensité",
    "Initiation : 8×(1 min course / 1 min marche)": "Initiation : 8×(1 min course RPE 5/10 / 1 min marche) — la marche est la récup",
    "Initiation : 8×(2 min course / 1 min marche)": "Initiation : 8×(2 min course RPE 5–6/10 / 1 min marche) — la marche est la récup",
    "Seuil doux : 2×6 min": "Seuil doux : 2×6 min (RPE 6–7/10), récup 3 min trot",
    "Seuil : 2×10 min": "Seuil : 2×10 min (RPE 7/10), récup 3 min trot",
    "Seuil : 2×10 min (allure course)": "Seuil : 2×10 min allure course (RPE 7/10), récup 3 min trot",
    "Seuil : 2×12 min": "Seuil : 2×12 min (RPE 7/10), récup 3 min trot",
    "Seuil : 3×10 min": "Seuil : 3×10 min (RPE 7/10), récup 3 min trot",
    "Seuil : 3×12 min": "Seuil : 3×12 min (RPE 7/10), récup 3 min trot",
    "VMA : 5×3 min (récup 3 min)": "VMA : 5×3 min (RPE 9/10), récup 3 min trot",
    "VMA courte : 6×2 min (récup 2 min)": "VMA courte : 6×2 min (RPE 9/10), récup 2 min trot",
    "Repos / 20 min footing": "Repos, ou 20 min de footing très facile (RPE 3/10)",
}

# Re-rampe des 4 premières semaines du plan de référence 13 semaines :
# n° de semaine -> (libellé attendu APRÈS conversion, libellé final).
#
# Deux garde-fous, indispensables :
# 1. La re-rampe s'applique TOUJOURS APRÈS `REWRITES` (sinon "Côtes : 6×1 min", qui est un
#    sous-texte de sa propre version convertie, serait substitué deux fois).
# 2. Elle ne s'applique qu'à un programme dont les QUATRE semaines correspondent à la
#    signature ci-dessous (cf. `matches_reference`) : sans ce test, la semaine 1 d'un autre
#    programme portant le même libellé serait ré-écrite à tort.
REFERENCE_RERAMP: dict[int, tuple[str, str]] = {
    1: (
        "Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot",
        "Lignes droites : 6×20 s rapides (RPE 9/10), récup : retour en marche",
    ),
    2: (
        "Seuil : 2×12 min (RPE 7/10), récup 3 min trot",
        "Côtes : 6×30 s allure course (RPE 8/10), récup : redescente en marche",
    ),
    3: (
        "Côtes : 8×1 min vif (RPE 8/10), récup : redescente en trot",
        "Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot",
    ),
    4: (
        "Seuil : 2×10 min (RPE 7/10), récup 3 min trot",
        "Seuil doux : 2×6 min (RPE 6–7/10), récup 3 min trot",
    ),
}


def matches_reference(labels_by_week: dict[int, str]) -> bool:
    """Vrai si les semaines 1–4 (déjà converties) portent la signature du plan de référence.

    `labels_by_week` : n° de semaine -> libellé courant, pour UN programme.
    Empêche de re-ramper un autre programme dont une semaine partagerait un libellé.
    """
    return all(
        labels_by_week.get(num) == expected for num, (expected, _new) in REFERENCE_RERAMP.items()
    )
