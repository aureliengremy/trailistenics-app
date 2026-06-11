# Prompt 00 — Orchestration du pipeline (questionnaire → P1 + P2 → P3)

> **C'est l'entrée unique.** Colle ce prompt dans Claude Code (terminal, racine du repo), ou dis :
> *« Lis `docs/prompts/00-pipeline-orchestration.md` et exécute le pipeline complet. »*
> Il enchaîne les trois prompts dans le bon ordre et **connecte leurs sorties** :
>
> ```
> questionnaire ──┬──▶ Prompt 1 (trail)        ──▶ 01-trail.json ──┐
>                 └──▶ Prompt 2 (calisthénie)  ──▶ 02-calisthenie.json ─┤
>                                                                       ▼
>                                          Prompt 3 (hybride) ◀── (les 2 artefacts)
>                                                                       │
>                                          programme-<slug>.json + .md  ▼  ← programme de l'app
> ```

---

## PROMPT

Tu es l'**orchestrateur** du système de génération de programmes Trailistenics. Tu exécutes une
chaîne de 3 étapes en passant les résultats de l'une à la suivante. Tu ne « devines » rien : tu
suis les sous-prompts dédiés.

### Étape 0 — Contexte commun (charge une fois)

Lis : `docs/intake/profil-coureur.md` (le questionnaire + la grille de déduction de niveau),
`docs/modele-donnees/contrat-de-sortie.md` (format des artefacts **et** du programme final),
`docs/modele-donnees/schema-programme.json` (schéma du programme final),
`docs/modele-donnees/exemple-programme-740.json` (gabarit de référence).

### Étape 1 — Recueille le questionnaire (une seule fois)

**Cas nominal** : l'intake arrive de **l'app** — le nouvel inscrit a rempli le formulaire, son
JSON a été **posté sur Slack** (et il est copiable depuis l'onglet **Admin** de l'app). Colle-le
ici tel quel : il est déjà au format `docs/intake/profil-coureur.md` §C. Sinon (test/local), si un
`questionnaire.json` est fourni, charge-le ; en dernier recours **pose les questions** du
formulaire (sections A et B) — reste **court**. Applique les défauts prudents (section D) pour
tout champ manquant et note-les.

> **`start_date`** : si elle n'est pas précisée, prends **le lundi qui suit la génération**
> (les `date_label` des semaines = les lundis successifs). `event_date` = `objectif.date_course`.

Choisis un `slug` (ex. `trail-20k-740-13s`, ou préfixé du prénom/email pour t'y retrouver) et
crée le dossier de sortie `docs/generated/<slug>/`.
Découpe le questionnaire en deux sous-ensembles (le **profil** `prenom`/`sexe`/`age`/`court_deja`
et les contraintes communes `jours_dispo`/`antecedents_blessure` vont aux **deux**) :
- **A** (profil + objectif + course + contraintes communes) → pour le Prompt 1.
- **B** (profil + calisthénie : max reps + matériel + contraintes communes) → pour le Prompt 2.

> Rappel : `seances_max_par_sem` n'est plus demandé — le **nb de séances/sem se déduit des
> `jours_dispo`**. Tiens compte de l'`age` (récupération) et de `court_deja` (grand débutant si faux).

### Étape 2 — Prompt 1 (TRAIL) → artefact `01-trail.json`

Exécute `docs/prompts/01-generation-trail.md` **en lui passant uniquement le sous-ensemble A**.
Sa sortie est l'**artefact trail** : `docs/generated/<slug>/01-trail.json` (squelette de
périodisation : `meta`, `blocs`, `weeks` ; voir contrat §7). **Ne génère pas le programme final
ici.**

### Étape 3 — Prompt 2 (CALISTHÉNIE) → artefact `02-calisthenie.json`

Exécute `docs/prompts/02-generation-calisthenie-bas-corps.md` **en lui passant uniquement le
sous-ensemble B**. Sa sortie est l'**artefact calisthénie** :
`docs/generated/<slug>/02-calisthenie.json` (niveau déduit des max reps, barreaux de départ,
circuit d'exercices, progression par phase ; voir contrat §7).

> Les étapes 2 et 3 sont **indépendantes** : tu peux les mener dans n'importe quel ordre (ou en
> parallèle). Elles ne dépendent pas l'une de l'autre.

### Étape 4 — Prompt 3 (HYBRIDE) → programme final

Exécute `docs/prompts/03-generation-hybride.md` **en lui passant les DEUX artefacts**
(`01-trail.json` + `02-calisthenie.json`). Il fusionne le squelette trail et la composante
renfo, applique les deux principes directeurs, et écrit le **programme final** :
`docs/generated/<slug>/programme-<slug>.json` **et** `programme-<slug>.md`.

### Étape 5 — Validation & récapitulatif

- Valide `programme-<slug>.json` contre `schema-programme.json` et la **checklist** du contrat §6.
- Vérifie la **traçabilité** : `meta.inputs` du programme final liste bien les deux artefacts.
- Rends un récap : objectif, durée, blocs, pic volume/D+, niveau calisthénie déduit, placement du
  renfo (jours, phases), points de vigilance, hypothèses/défauts pris.

### Étape 6 — Mise sur le compte (import en base)

Le programme part sur le compte de la personne via l'importeur (depuis `backend/`, venv actif,
`DATABASE_URL` pointant sur la base **cible** — prod = l'URL Neon des env-vars Render, PAS le
`.env` local) :

```bash
python -m app.import_program ../docs/generated/<slug>/programme-<slug>.json \
    --owner-email <email-du-compte>          # --replace si un programme existe déjà
```

À sa prochaine connexion (ou au refresh), la personne voit son programme dans l'app.

### Règles dures

- **Respecte l'ordre et le passage de données** : P1 et P2 ne voient que leur sous-ensemble ; P3
  ne voit que les deux artefacts (pas le questionnaire brut — tout ce dont il a besoin est dans
  les artefacts ; il peut relire le questionnaire pour les contraintes de jours si nécessaire).
- **Seul le programme final** doit valider contre `schema-programme.json`. Les artefacts
  intermédiaires sont des **documents de travail** (format décrit au contrat §7).
- **Deux principes non négociables** dans le programme final : *pas d'empilement quadriceps*,
  *descente entraînée*.
