# Séances qualité détaillées — récup explicite + affichage en 3 phases

**Date :** 2026-08-20 · **Statut :** validé (approche hybride C + affichage 3 lignes).

## 1. Contexte & problème

Le jour « Séance qualité » affiche aujourd'hui : `{quality_session} · ~{min} min en tout
(échauffement + retour au calme inclus).` — trop laconique. L'utilisateur veut le détail
terrain : ~10 min d'échauffement, le corps (répétitions + **récupération entre reps**,
absente de ~21 libellés sur 26), ~10 min de retour au calme.

Architecture du texte : la DB (`week.quality_session`) porte le corps court ; le suffixe
« ~X min en tout » est composé au front ([plan.ts:333]) depuis `sessionTarget("qual")`
(heuristique : 55 % de la durée de la longue, borné 30–60 — c'est un **objectif global**,
pas la somme arithmétique des phases).

## 2. Décisions

- **Hybride** : la donnée garde un corps **court mais complet** (récup toujours précisée) ;
  le front structure l'affichage en **3 lignes** (Échauffement / Corps / Retour au calme)
  + le total « ≈ X min en tout » conservé.
- Standard : **échauffement ~10 min footing progressif**, **retour au calme ~10 min très
  facile** (valeurs de l'utilisateur). Les séances continues (footing souple, initiation
  marche/course) gardent le même cadre générique.
- **Tous les programmes** : contenu source (`.md`), seed, les 2 programmes générés, et les
  **3 programmes déjà en prod** (script one-shot). Les **futurs programmes** hériteront de
  la règle via le contrat de sortie + prompts.

## 3. Table de conversion des libellés (source de vérité du contenu)

Harmonisation : la récup s'écrit `récup : …` ; les mentions existantes entre parenthèses
sont absorbées. À appliquer PARTOUT où le libellé apparaît (md, seed, JSON générés, DB prod).

| Avant | Après |
|---|---|
| Côtes : 5×1 min vif | Côtes : 5×1 min vif, récup : redescente en trot |
| Côtes : 6×1 min | Côtes : 6×1 min vif, récup : redescente en trot |
| Côtes : 6×1 min (récup en descendant) | Côtes : 6×1 min vif, récup : redescente en trot |
| Côtes : 8×1 min | Côtes : 8×1 min vif, récup : redescente en trot |
| Côtes : 10×1 min | Côtes : 10×1 min vif, récup : redescente en trot |
| Côtes : 8×1 min + descente | Côtes : 8×1 min vif, récup : redescente en trot — descentes appuyées sur les 3 dernières |
| Côtes : 6×2 min (léger) | Côtes : 6×2 min allure légère, récup : redescente en trot |
| Côtes : 6×30 s (course) | Côtes : 6×30 s allure course, récup : redescente en marche |
| Côtes en marche rapide : 6×1 min | Côtes en marche rapide : 6×1 min, récup : redescente tranquille |
| Côtes longues : 5×2 min | Côtes longues : 5×2 min soutenu, récup : redescente en trot |
| Côtes longues : 6×2 min | Côtes longues : 6×2 min soutenu, récup : redescente en trot |
| Lignes + côtes courtes : 5×1 min vif | Lignes + côtes courtes : 5×1 min vif, récup : 1 min 30 en marche/trot |
| Lignes droites : 6×20 s (activation) | Lignes droites : 6×20 s rapides, récup : retour en marche (activation) |
| Activation : 5×20 s lignes (veille) | Activation veille de course : 5×20 s rapides en ligne droite, récup : retour en marche |
| Footing souple + 4 lignes | Footing souple + 4 lignes droites (~20 s vif), récup : retour en marche |
| Footing souple continu 20 min | Footing souple continu 20 min, aucune intensité |
| Initiation : 8×(1 min course / 1 min marche) | Initiation : 8×(1 min course / 1 min marche) — la marche est la récup |
| Initiation : 8×(2 min course / 1 min marche) | Initiation : 8×(2 min course / 1 min marche) — la marche est la récup |
| Seuil doux : 2×6 min | Seuil doux : 2×6 min, récup 3 min trot |
| Seuil : 2×10 min | Seuil : 2×10 min, récup 3 min trot |
| Seuil : 2×10 min (allure course) | Seuil : 2×10 min allure course, récup 3 min trot |
| Seuil : 2×12 min | Seuil : 2×12 min, récup 3 min trot |
| Seuil : 3×10 min | Seuil : 3×10 min, récup 3 min trot |
| Seuil : 3×12 min | Seuil : 3×12 min, récup 3 min trot |
| VMA : 5×3 min (récup 3 min) | VMA : 5×3 min, récup 3 min trot |
| VMA courte : 6×2 min (récup 2 min) | VMA courte : 6×2 min, récup 2 min trot |

## 4. Affichage front — 3 phases

- `sessionForDay` (jour 4) expose, en plus de `detail` (phrase enrichie conservée pour les
  usages une-ligne, ex. carte « ↪ Reporté ») : `phases: [{ label, text }]` =
  1. **Échauffement** — « ~10 min footing progressif » ;
  2. **Corps de séance** — le libellé DB (avec récup) ;
  3. **Retour au calme** — « ~10 min très facile ».
- `DaySessionDetail` : si `sess.phases` existe, rendu en 3 lignes (label en petites
  majuscules muted + texte) puis « ≈ {min} min en tout · ~{km} km » ; sinon comportement
  actuel. Nouveau CSS `.qual-phase*` (append en fin d'`index.css`).
- Le type `DaySession` gagne `phases?: Array<{ label: string; text: string }>`.
- La box « Qualité · jeudi » du détail de semaine continue d'afficher `w.qual` brut
  (court, désormais avec récup) — pas de changement là.

## 5. Propagation des données

1. `plan/plan_trail_descriptif.md` — remplacer les libellés (13 semaines) selon la table.
2. `backend/app/seed.py` — idem (mêmes chaînes).
3. `docs/generated/trail-20k-740-4s-auriane/programme-trail-20k-740-4s-auriane.json` +
   `docs/generated/trail-20k-740-15s-aureltest/programme-trail-20k-740-15s-aureltest.json`
   — idem (`quality_session`). (Les artefacts intermédiaires `01-trail.json` sont des
   documents de travail : pas touchés.)
4. **Prod** : script one-shot `backend/app/update_quality_sessions.py` — la table de
   conversion en dur, `UPDATE week SET quality_session = <après> WHERE quality_session =
   <avant>` sur TOUS les programmes ; affiche le nombre de lignes modifiées par libellé ;
   piloté par `DATABASE_URL` (exécution prod = URL Neon des env-vars Render, jamais le
   `.env` local — cf. memory). Idempotent (relançable sans effet).
5. **Génération future** : `docs/modele-donnees/contrat-de-sortie.md` + prompts
   `01-generation-trail.md` et `03-generation-hybride.md` : règle « toute
   `quality_session` précise l'allure du corps ET la récupération entre répétitions
   (format court : "…, récup : …") ; l'échauffement/retour au calme ne sont PAS dans le
   libellé (le front les affiche) ».

## 6. Hors périmètre (YAGNI)

- Pas de migration de schéma (pas de champs séparés warmup/body/cooldown en DB).
- Pas de personnalisation des durées d'échauffement/retour par semaine ou par niveau.
- L'heuristique du temps total (`sessionTarget`) est inchangée.

## 7. Vérification

- `tsc` + `build` verts ; preview : jour qualité en 3 phases (desktop + mobile), carte
  « ↪ Reporté » d'une qualité reportée toujours lisible (une ligne).
- Script prod exécuté : total de lignes modifiées = nombre de semaines à séance qualité
  non-continue des 3 programmes ; re-lancement → 0 modification (idempotence).
- Spot-check dans l'app prod (S9 « Côtes longues : 5×2 min soutenu, récup : redescente en
  trot » en corps de séance).
