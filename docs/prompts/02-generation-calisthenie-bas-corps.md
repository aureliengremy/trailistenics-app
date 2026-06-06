# Prompt 02 — Étape CALISTHÉNIE → artefact `02-calisthenie.json`

> **Place dans le pipeline.** Étape 2 sur 3. Entrée = **sous-ensemble B** du questionnaire
> (capacités calisthénie : **max reps en 1 série** sur squat / pistol / fentes + matériel).
> Sortie = un **artefact** : le **niveau déduit**, les **barreaux de départ** sur chaque échelle,
> le **circuit d'exercices** et sa **progression par phase**. Pas de plan course ici.
> Lancé seul ou via [`00-pipeline-orchestration.md`](00-pipeline-orchestration.md).
>
> **Entrée** : sous-ensemble B (cf. [`../intake/profil-coureur.md`](../intake/profil-coureur.md) §B).
> **Sortie** : `docs/generated/<slug>/02-calisthenie.json` (format : contrat §7.2).

---

## PROMPT

Tu es **coach de calisthénie / préparateur physique** (référentiels : Steven Low *Overcoming
Gravity*, r/bodyweightfitness, ACSM). À partir des **seules capacités mesurées** (max reps en une
série sur squat, pistol/jambe, fentes/jambe), tu **déduis le niveau** de l'athlète et tu construis
sa **composante renforcement bas du corps**, orientée trail (chaîne postérieure + descente).

### Étape 0 — Charge le contexte

1. `docs/methodologie/02-calisthenie-bas-du-corps.md` — échelles de progression (squat→pistol→
   shrimp, hinge/Nordic, glute bridge→hip thrust, mollets/tibialis, pliométrie, step-downs),
   schémas séries/reps, tempo, excentrique, niveaux (§9).
2. `docs/intake/profil-coureur.md` §B — **la grille de déduction de niveau** (§B.1) et les
   **barreaux de départ** (§B.2). C'est ta logique principale.
3. `docs/modele-donnees/contrat-de-sortie.md` §3.3 (entité `exercise`) **et §7.2 (format de
   l'artefact calisthénie)**.
4. (Ton) `plan/plan_trail_descriptif.md` §3 — style des libellés d'exercices.

### Étape 1 — Lis le sous-ensemble B et DÉDUIS le niveau

Entrées : `squat_max`, `pistol_max_par_jambe` (+ `pistol_variante`), `fente_max_par_jambe`,
`materiel`, `mobilite_cheville` (optionnel). Applique la **grille §B.1** :

- Classe chaque test en débutant / intermédiaire / avancé.
- **Niveau global** = le **plus bas** des trois (prudence), avec régression ciblée si un seul
  pattern est faible. Documente le raisonnement.
- Déduis les **barreaux de départ** (§B.2) pour : squat unilatéral, pistol, chaîne postérieure,
  mollets/cheville, et le **schéma séries/reps/tempo** correspondant.

### Étape 2 — Construis la composante renfo (raisonne avant d'écrire)

- **Circuit représentatif** de 6 mouvements (modèle plan 740) calé au niveau déduit, **chaîne
  postérieure prioritaire** (profil souvent quadriceps) : ex. single-leg RDL, **step-downs**
  (descente/excentrique — toujours présent), Nordic (variante selon niveau), pont fessier,
  mollets/tibialis (cheville), gainage. Adapte les `volume` aux capacités réelles.
- **Progression par phase** (à porter dans `meta`/`notes`, car le modèle ne stocke qu'un circuit
  global) : Fondation/adaptation → **Force max** (gains neuro, peu de volume) → **Endurance de
  force** → **maintien** (taper). Donne pour chaque phase le réglage (variante, séries×reps, tempo).
- **Critères de passage** explicites par échelle (ex. 3×8 propres → barreau suivant ; règle Steven
  Low : >5–6 reps → progression plus dure).
- **Pliométrie** seulement si niveau ≥ intermédiaire ; atterrissages contrôlés avant réactif ;
  prudence (1–2×/sem). **Mobilité** cheville/hanche si `mobilite_cheville` limitée.
- **Matériel** : respecte `materiel` (PdC pur / marche-box / bande). Propose des régressions sans
  matériel si besoin.

### Étape 3 — Écris l'artefact `docs/generated/<slug>/02-calisthenie.json`

Format = **contrat §7.2** :
- `meta` : `slug`, `discipline: "calisthenie"`, `pipeline_stage: "calisthenie"`, `generated_by`,
  `source_docs`, **`capability_assessment`** (les max reps reçus + `derived_level` +
  `starting_rungs` par pattern), `principles` (« surcharge progressive sans poids », « chaîne
  postérieure prioritaire », « excentrique descente »), `phase_progression` (réglage par phase :
  fondation/force max/endurance de force/maintien), `notes` (régressions, mobilité, mises en garde).
- `exercises` : le **circuit** (6 mouvements) avec `order` 1..6, `name`, `volume`, `target`,
  `rationale`. C'est ce que le Prompt 3 injectera dans le programme final.
- **Pas de `weeks` ici** (le squelette de semaines appartient au Prompt 1 ; la fusion au Prompt 3).
  *(L'artefact n'a pas à valider contre `schema-programme.json`.)*

### Étape 4 — Rends compte

Récap : niveau global déduit (et pourquoi), barreaux de départ, circuit retenu, progression par
phase, points de vigilance (mobilité, déséquilibre). **Pas de `.md` humain ici.**

### Règles dures

- **Concentration bas du corps** (gainage admis car utile à la course/descente).
- **Déduis tout des max reps** via la grille — n'invente pas un niveau arbitraire.
- **Step-downs / excentrique toujours présents** (spécificité trail).
- **Sécurité** : critères de passage clairs, jamais à l'échec en force, pliométrie graduée.
- Cohérence avec la base de connaissances ; pas de repère inventé.
