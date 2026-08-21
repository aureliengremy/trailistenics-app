# Séances qualité détaillées (RPE + récup + progressivité) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chaque séance qualité indique son allure, son intensité chiffrée (RPE /10) et sa récupération ; l'app l'affiche en 3 phases (échauffement ~10 min / corps / retour au calme ~10 min) ; les 4 premières semaines du plan de référence deviennent progressives ; la règle est codifiée pour les générations futures.

**Architecture:** Un module Python de données (`backend/app/quality_sessions.py`) porte la table de conversion des 27 libellés + la re-rampe S1–S4 : il est la source unique consommée par le script de mise à jour prod ET par le script d'application aux fichiers du repo. Le front ne stocke rien : il compose les 3 phases autour du libellé.

**Tech Stack:** React 18 + Vite + TypeScript strict (frontend) ; Python 3.11 + SQLAlchemy 2 (backend, piloté par `DATABASE_URL`).

## Global Constraints

- Spec : `docs/superpowers/specs/2026-08-20-seances-qualite-detaillees-design.md` (tables §3, §4, §5 = source de vérité du contenu ; recopier les valeurs **verbatim**).
- **`week.quality_session` est un `String(128)`** (`backend/app/models/week.py:33`) — aucun libellé converti ne doit dépasser 128 caractères.
- Format obligatoire d'un libellé : `Famille : NxDurée allure (RPE X/10), récup : …`.
- L'échauffement et le retour au calme ne sont **jamais** dans le libellé stocké (le front les ajoute).
- TypeScript strict : `npx tsc --noEmit` à 0 erreur après chaque tâche front. Pas de framework de test front → vérif = `tsc` + `npm run build` + preview.
- Textes UI et commentaires **en français**. CSS ajouté **en fin** de `frontend/src/index.css` (règles existantes intactes).
- Aucune migration de schéma, aucun champ DB ajouté.
- Répertoires : frontend = `/Users/aureliengremy/Documents/CODE/trailistenics-app/frontend`, backend = `/Users/aureliengremy/Documents/CODE/trailistenics-app/backend`.
- Commits atomiques, messages en français, suffixés :
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: Module de données — table de conversion + re-rampe

**Files:**
- Create: `backend/app/quality_sessions.py`

**Interfaces:**
- Produces: `REWRITES: dict[str, str]` (27 entrées, ancien libellé → nouveau) ; `REFERENCE_RERAMP: dict[int, tuple[str, str]]` (n° de semaine → (libellé attendu, libellé final)) — consommés par les Tasks 2 et 4.

- [ ] **Step 1: Créer le module**

Créer `backend/app/quality_sessions.py` avec exactement ce contenu :

```python
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
```

- [ ] **Step 2: Vérifier les invariants du module**

Run (depuis `backend/`) :

```bash
python -c "
from app.quality_sessions import REWRITES, REFERENCE_RERAMP, matches_reference
assert len(REWRITES) == 27, len(REWRITES)
# Idempotence : aucune valeur produite ne doit être elle-même une clé.
overlap = set(REWRITES.values()) & set(REWRITES.keys())
assert not overlap, overlap
# Contrainte de colonne String(128).
too_long = [v for v in list(REWRITES.values()) + [r[1] for r in REFERENCE_RERAMP.values()] if len(v) > 128]
assert not too_long, too_long
# Toute valeur porte une intensité chiffrée (les libellés « Initiation » la portent
# à l'intérieur de la parenthèse de répétitions : on cherche RPE, pas '(RPE').
missing = [v for v in REWRITES.values() if 'RPE' not in v]
assert not missing, missing
# Les libellés attendus par la re-rampe sont bien des SORTIES de conversion.
vals = set(REWRITES.values())
assert all(exp in vals for exp, _ in REFERENCE_RERAMP.values())
# La re-rampe est stable : ses résultats ne sont ni des clés, ni des attendus.
finals = {new for _, new in REFERENCE_RERAMP.values()}
assert not (finals & set(REWRITES.keys()))
assert not (finals & {exp for exp, _ in REFERENCE_RERAMP.values()} - {REFERENCE_RERAMP[3][1]})
# La signature du plan de référence ne matche que si les 4 semaines correspondent.
assert matches_reference({n: e for n, (e, _) in REFERENCE_RERAMP.items()})
assert not matches_reference({1: REFERENCE_RERAMP[1][0]})  # un seul match ne suffit pas
print('OK', len(REWRITES), 'libellés ; max', max(len(v) for v in REWRITES.values()), 'car.')
"
```

Expected : `OK 27 libellés ; max 102 car.` (le nombre exact peut varier de ±2 ; seul `> 128` est un échec).

- [ ] **Step 3: Commit**

```bash
git add backend/app/quality_sessions.py
git commit -m "feat(contenu): table de conversion des séances qualité (RPE + récup) et re-rampe S1-S4"
```

---

### Task 2: Appliquer la conversion aux fichiers du repo

**Files:**
- Modify: `plan/plan_trail_descriptif.md`
- Modify: `backend/app/seed.py`
- Modify: `docs/generated/trail-20k-740-4s-auriane/programme-trail-20k-740-4s-auriane.json`
- Modify: `docs/generated/trail-20k-740-15s-aureltest/programme-trail-20k-740-15s-aureltest.json`

**Interfaces:**
- Consumes: `REWRITES`, `REFERENCE_RERAMP` (Task 1).

- [ ] **Step 1: Appliquer la conversion aux 4 fichiers, puis la re-rampe au `.md`**

**L'ordre est impératif** : `REWRITES` d'abord (les clés les plus longues en premier, car
`Côtes : 8×1 min` est un sous-texte de `Côtes : 8×1 min + descente`), la re-rampe ensuite
(ses libellés attendus sont les formes **déjà converties**). La re-rampe ne concerne que le
plan de référence — jamais les 2 JSON, qui sont d'autres programmes.

Run (depuis la racine du dépôt, avec le venv backend actif) :

```bash
python - <<'PY'
import json, pathlib, re, sys
sys.path.insert(0, "backend")
from app.quality_sessions import REWRITES, REFERENCE_RERAMP

ROOT = pathlib.Path(".")
targets = [
    "plan/plan_trail_descriptif.md",
    "backend/app/seed.py",
    "docs/generated/trail-20k-740-4s-auriane/programme-trail-20k-740-4s-auriane.json",
    "docs/generated/trail-20k-740-15s-aureltest/programme-trail-20k-740-15s-aureltest.json",
]

# 1. Conversion (allure + RPE + récup) sur les 4 fichiers.
#    UN SEUL passage via re.sub : 17 valeurs de REWRITES contiennent leur propre libellé
#    d'origine en sous-texte (« Côtes : 8×1 min » ⊂ « Côtes : 8×1 min vif (RPE 8/10)… »).
#    Un enchaînement de str.replace re-substituerait à l'intérieur du texte déjà converti
#    et corromprait le résultat ; re.sub ne relit jamais ce qu'il vient d'écrire.
pattern = re.compile("|".join(re.escape(k) for k in sorted(REWRITES, key=len, reverse=True)))
for rel in targets:
    p = ROOT / rel
    text = p.read_text(encoding="utf-8")
    p.write_text(pattern.sub(lambda m: REWRITES[m.group(0)], text), encoding="utf-8")

# 2. Re-rampe du plan de référence, dans le .md uniquement (la semaine et le libellé sont
#    sur la même ligne : `| **1** | 2 juin | … | <libellé> | 3 | … |`).
#    Dans seed.py, n° et libellé sont sur deux lignes : fait à la main à l'étape 2.
p = ROOT / "plan/plan_trail_descriptif.md"
lines = p.read_text(encoding="utf-8").split("\n")
for num, (expected, new) in REFERENCE_RERAMP.items():
    for i, line in enumerate(lines):
        if line.startswith(f"| **{num}**") and expected in line:
            lines[i] = line.replace(expected, new)
            break
    else:
        raise SystemExit(f"Semaine {num} introuvable dans le .md avec : {expected}")
p.write_text("\n".join(lines), encoding="utf-8")

# 3. Les JSON doivent rester valides.
for rel in targets[2:]:
    json.loads((ROOT / rel).read_text(encoding="utf-8"))
print("Appliqué.")
PY
```

Expected : `Appliqué.` (toute autre sortie = échec à corriger avant de continuer).

- [ ] **Step 2: Re-rampe manuelle dans `seed.py`**

Dans `backend/app/seed.py`, remplacer les libellés des semaines 1 à 4 (les autres champs
du tuple sont inchangés) :

```python
    (1, "2 juin", "reprise", "1h10 · ~11 km · 250 m D+", 70, 250, 11,
     3, None, "Lignes droites : 6×20 s rapides (RPE 9/10), récup : retour en marche",
     "Réveil en douceur. Endurance facile, on marche dès que ça monte raide.", False),
    (2, "9 juin", "reprise", "1h15 · ~12 km · 300 m D+", 75, 300, 12,
     3, None, "Côtes : 6×30 s allure course (RPE 8/10), récup : redescente en marche",
     "On installe la routine. Footing du seuil sur faux-plat.", False),
    (3, "16 juin", "base", "1h20 · ~13 km · 350 m D+", 80, 350, 13,
     3, "3 → 4", "Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot",
     "Passage vers 4 séances selon la forme. Le renfo du mardi devient régulier.", False),
    (4, "23 juin", "allegee", "1h00 · ~10 km · 250 m D+", 60, 250, 10,
     3, None, "Seuil doux : 2×6 min (RPE 6–7/10), récup 3 min trot",
     "Semaine de récup. Le corps assimile — ne la saute pas.", False),
```

- [ ] **Step 3: Vérifier qu'aucun libellé n'est resté sans intensité**

Run (depuis la racine) :

```bash
grep -nE "(Côtes|Seuil|VMA|Lignes droites|Activation|Initiation|Footing souple) ?:" \
  plan/plan_trail_descriptif.md backend/app/seed.py \
  docs/generated/*/programme-*.json | grep -v "RPE" || echo "OK : aucun libellé sans RPE"
```

Expected : `OK : aucun libellé sans RPE`

- [ ] **Step 4: Vérifier la rampe du plan de référence**

Run (depuis la racine) :

```bash
grep -oE '"(Lignes droites|Côtes|Seuil)[^"]*"' backend/app/seed.py | head -4
```

Expected : les 4 premiers libellés sont, dans l'ordre, `Lignes droites : 6×20 s rapides…`,
`Côtes : 6×30 s allure course…`, `Côtes : 6×1 min vif…`, `Seuil doux : 2×6 min…`.

- [ ] **Step 5: Commit**

```bash
git add plan/plan_trail_descriptif.md backend/app/seed.py docs/generated
git commit -m "feat(contenu): RPE + récup sur toutes les séances qualité, rampe progressive S1-S4"
```

---

### Task 3: Affichage front en 3 phases

**Files:**
- Modify: `frontend/src/lib/plan.ts` (interface `DaySession` ~ligne 261 ; `sessionForDay` cas 4 ~ligne 333)
- Modify: `frontend/src/components/common/DaySessionDetail.tsx` (branche sortie courue)
- Modify: `frontend/src/index.css` (append)

**Interfaces:**
- Produces: `DaySession.phases?: Array<{ label: string; text: string }>` — rendu par `DaySessionDetail`.

- [ ] **Step 1: Étendre le type `DaySession`**

Dans `frontend/src/lib/plan.ts`, remplacer l'interface :

```ts
export interface DaySession {
  type: string
  detail: string
  tag: string
  col: string
  key: string
  /** Séance qualité : décomposition en phases (échauffement / corps / retour au calme). */
  phases?: Array<{ label: string; text: string }>
}
```

- [ ] **Step 2: Exposer les phases sur le jour qualité**

Dans `frontend/src/lib/plan.ts`, `sessionForDay`, remplacer le `case 4` :

```ts
    case 4: {
      const t = sessionTarget("qual", w)
      return {
        type: "Séance qualité",
        detail: `${w.qual} · ~${t.min} min en tout (échauffement + retour au calme inclus).`,
        tag: "Intensité",
        col: "var(--accent)",
        key: "qual",
        phases: [
          { label: "Échauffement", text: "~10 min de footing progressif (RPE 3–4/10)" },
          { label: "Corps de séance", text: w.qual },
          { label: "Retour au calme", text: "~10 min très facile (RPE 3/10)" },
        ],
      }
    }
```

`detail` est conservé tel quel : il reste utilisé en une ligne par la carte « ↪ Reporté »
(`ArrivalCard`, `SessionMove.tsx`).

- [ ] **Step 3: Rendre les phases dans `DaySessionDetail`**

Dans `frontend/src/components/common/DaySessionDetail.tsx`, dans la dernière branche
(sortie courue), remplacer la ligne `<div className="sess-body-note">{sess.detail}</div>`
par :

```tsx
            {sess.phases ? (
              <div className="qual-phases">
                {sess.phases.map((p) => (
                  <div key={p.label}>
                    <div className="qual-phase-l">{p.label}</div>
                    <div className="qual-phase-t">{p.text}</div>
                  </div>
                ))}
                <div className="qual-rpe">
                  RPE = effort perçu sur 10 · 7 = phrases courtes · 8 = 3–4 mots · 9 = quasi max
                </div>
              </div>
            ) : (
              <div className="sess-body-note">{sess.detail}</div>
            )}
```

- [ ] **Step 4: CSS**

Ajouter à la **fin** de `frontend/src/index.css` :

```css
/* ===== Séance qualité : phases (échauffement · corps · retour au calme) ===== */
.qual-phases { display: flex; flex-direction: column; gap: 8px; }
.qual-phase-l {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted);
}
.qual-phase-t { font-size: 14px; color: var(--ink); }
.qual-rpe { margin-top: 2px; font-size: 11px; font-style: italic; color: var(--muted); }
```

- [ ] **Step 5: Vérifier**

Run (depuis `frontend/`) : `npx tsc --noEmit && npm run build`
Expected : 0 erreur, build OK.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/plan.ts frontend/src/components/common/DaySessionDetail.tsx frontend/src/index.css
git commit -m "feat(suivi): séance qualité affichée en 3 phases avec rappel de l'échelle RPE"
```

---

### Task 4: Script de mise à jour des programmes en base

**Files:**
- Create: `backend/app/update_quality_sessions.py`

**Interfaces:**
- Consumes: `REWRITES`, `REFERENCE_RERAMP` (Task 1) ; `SessionLocal` (`app.database`) ; `Week` (`app.models`, champs `number`, `program_id`, `quality_session`).

- [ ] **Step 1: Créer le script**

Créer `backend/app/update_quality_sessions.py` :

```python
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
```

- [ ] **Step 2: Vérifier sur la base LOCALE (aperçu)**

Prérequis : Docker lancé (`docker compose up -d` à la racine), `alembic upgrade head` +
`python -m app.seed` déjà passés. Run depuis `backend/` (venv actif, `.env` local) :

```bash
python -m app.update_quality_sessions
```

Expected : la liste des semaines à convertir puis `N semaine(s) à mettre à jour sur M.` et
`Aperçu seulement — relancer avec --apply pour écrire.` Aucune écriture.

**Attention** : si la base locale a été re-seedée **après** la Task 2, le seed contient déjà
les libellés convertis → `0 semaine(s) à mettre à jour`. C'est un résultat valide (il prouve
l'idempotence) ; pour tester la conversion, re-seeder depuis un `seed.py` d'avant la Task 2
n'est pas nécessaire — l'étape 3 suffit.

- [ ] **Step 3: Vérifier l'idempotence et le non-débordement**

Run depuis `backend/` :

```bash
python -m app.update_quality_sessions --apply && python -m app.update_quality_sessions
```

Expected : le second appel affiche `0 semaine(s) à mettre à jour sur M.`

Vérifier ensuite que la re-rampe **n'a pas débordé** sur un autre programme — les semaines 1
des programmes non-référence doivent avoir gardé leur libellé (converti, mais pas re-rampé) :

```bash
python -c "
from sqlalchemy import select
from app.database import SessionLocal
from app.models import Week
db = SessionLocal()
for w in db.scalars(select(Week).where(Week.number == 1)).all():
    print(f'programme {w.program_id} · S1 : {w.quality_session}')
db.close()
"
```

Expected : au plus **un** programme affiche `Lignes droites : 6×20 s rapides (RPE 9/10)…`
(le plan de référence). Un programme de 4 semaines dont la S1 est une séance de côtes doit
afficher `Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot`, **pas** les lignes
droites.

- [ ] **Step 4: Commit**

```bash
git add backend/app/update_quality_sessions.py
git commit -m "feat(backend): script idempotent de conversion des séances qualité en base"
```

---

### Task 5: Codifier la règle pour les générations futures

**Files:**
- Modify: `docs/modele-donnees/contrat-de-sortie.md`
- Modify: `docs/prompts/01-generation-trail.md`
- Modify: `docs/prompts/03-generation-hybride.md`

- [ ] **Step 1: Contrat de sortie — format + barème**

Dans `docs/modele-donnees/contrat-de-sortie.md`, ajouter une section (à la suite des règles
existantes sur les semaines) :

```markdown
### `quality_session` — format obligatoire

`Famille : NxDurée allure (RPE X/10), récup : …` — 128 caractères maximum.

- **L'intensité est toujours chiffrée** sur l'échelle RPE (effort perçu /10) :
  3–4 = très facile (conversation) · 5–6 = modéré · **7 = seuil** (phrases courtes) ·
  **8 = côtes** (3–4 mots) · **9 = VMA / lignes** (quasi max) · 10 = jamais.
- **La récupération est toujours précisée** (« récup : redescente en trot »,
  « récup 3 min trot », « la marche est la récup »…).
- **L'échauffement et le retour au calme n'y figurent pas** : l'app les affiche
  automatiquement (~10 min chacun).

### Progressivité de l'intensité — barème par niveau

Niveau déduit de l'intake (`court_deja`, `course.volume_hebdo_km`, `course.experience_trail`).
« Volume utile » = temps cumulé à RPE ≥ 7 dans la séance.

| Niveau | 1ʳᵉ séance qualité (volume utile) | Plafond en semaine de pic |
|---|---|---|
| `court_deja = false` | **0 min** — marche/course alternée (RPE 5–6) pendant ≥ 2 semaines | 8–10 min |
| débutant (< 20 km/sem) | 2–3 min (lignes 20 s, côtes 30 s) | 12–15 min |
| intermédiaire (20–40 km/sem) | 5–6 min | 20–25 min |
| confirmé (> 40 km/sem) | 8–10 min | 30 min |

Règles associées :
- progression du volume utile **≤ ~15 %/semaine**, **jamais de doublement** d'une semaine à
  l'autre ;
- **RPE 9 (VMA, lignes rapides) interdit avant la 4ᵉ semaine** pour un profil débutant ou
  `court_deja = false`.
```

- [ ] **Step 2: Prompt 01 — remplacer la règle vague**

Dans `docs/prompts/01-generation-trail.md`, la ligne actuelle se termine par :
`Adapte le volume au niveau (débutant : commence à 4–5 min total utiles).`
Remplacer cette phrase par :

```markdown
  Adapte le volume au niveau selon le **barème de progressivité** du contrat de sortie
  (§ « Progressivité de l'intensité ») : volume utile de départ, plafond au pic,
  progression ≤ ~15 %/sem, pas de RPE 9 avant la 4ᵉ semaine pour un débutant.
  Chaque `quality_session` respecte le **format obligatoire** : allure + `(RPE X/10)` + récup.
```

- [ ] **Step 3: Prompt 03 — rappel du format**

Dans `docs/prompts/03-generation-hybride.md`, ajouter dans la liste des règles de fusion :

```markdown
- Les `quality_session` héritées de l'artefact trail conservent le **format obligatoire**
  (allure + `(RPE X/10)` + récup, ≤ 128 caractères) et le **barème de progressivité** du
  contrat de sortie. Ne jamais y ajouter l'échauffement ni le retour au calme : l'app les
  affiche.
```

- [ ] **Step 4: Vérifier**

Run (depuis la racine) :

```bash
grep -c "RPE" docs/modele-donnees/contrat-de-sortie.md docs/prompts/01-generation-trail.md docs/prompts/03-generation-hybride.md
```

Expected : un compte ≥ 1 pour les trois fichiers.

- [ ] **Step 5: Commit**

```bash
git add docs/modele-donnees/contrat-de-sortie.md docs/prompts/01-generation-trail.md docs/prompts/03-generation-hybride.md
git commit -m "docs(generation): format obligatoire des séances qualité (RPE + récup) et barème de progressivité"
```

---

### Task 6: Vérification de bout en bout

**Files:** aucun (vérification) ; retouches si besoin.

- [ ] **Step 1: Build**

Run depuis `frontend/` : `npx tsc --noEmit && npm run build`
Expected : 0 erreur, build OK (2 chunks : `index-*.js` + `LoadChart-*.js`).

- [ ] **Step 2: Parcours preview**

Démarrer les serveurs (`preview_start` sur `frontend` puis `backend`) et vérifier, connecté :

1. Onglet **Aujourd'hui**, un jeudi (ou en sélectionnant le jeudi dans la bande) → la séance
   qualité affiche **3 phases** : « ÉCHAUFFEMENT / ~10 min de footing progressif (RPE 3–4/10) »,
   « CORPS DE SÉANCE / <libellé avec RPE et récup> », « RETOUR AU CALME / ~10 min très facile
   (RPE 3/10) », puis la ligne d'aide RPE.
2. Le champ de saisie (durée / km / D+) et « Reporter à … » sont toujours présents dessous.
3. Reporter la séance qualité au lendemain → la carte « ↪ Reporté » affiche la version
   **une ligne** (`detail`), sans les phases.
4. Onglet **Le plan**, détail d'une semaine → la box « Qualité · jeudi » affiche le libellé
   court **avec RPE et récup**.
5. Largeur mobile (375 px) : les 3 phases restent lisibles, pas de débordement.
6. Console : aucune erreur.

- [ ] **Step 3: Mise à jour de la base de production**

Depuis `backend/`, venv actif, avec `DATABASE_URL` = l'URL Neon des variables
d'environnement **Render** (jamais le `.env` local) :

```bash
DATABASE_URL="<url-neon-prod>" python -m app.update_quality_sessions
```

Vérifier la liste affichée (les 3 programmes), puis appliquer :

```bash
DATABASE_URL="<url-neon-prod>" python -m app.update_quality_sessions --apply
DATABASE_URL="<url-neon-prod>" python -m app.update_quality_sessions
```

Expected : le dernier appel affiche `0 semaine(s) à mettre à jour` (idempotence confirmée).

- [ ] **Step 4: Déploiement du front**

Le projet exige le déploiement **prébuilt** (le build distant n'embarque pas `frontend/api/`) :

```bash
cd frontend && vercel build --prod --yes && vercel deploy --prebuilt --prod --yes
```

- [ ] **Step 5: Spot-check en production**

Ouvrir `https://trailistenics-app.vercel.app`, onglet **Le plan**, semaine 9 → la box
« Qualité · jeudi » doit afficher
`Côtes longues : 5×2 min soutenu (RPE 8/10), récup : redescente en trot`.

- [ ] **Step 6: Commit des retouches éventuelles**

```bash
git add -A && git commit -m "fix(suivi): retouches vérification des séances qualité"
```
