# `docs/` — Base de connaissances & génération de programmes

Ce dossier rassemble **toutes les informations brutes** servant à **générer des programmes
d'entraînement personnalisés** pour les nouveaux inscrits de Trailistenics, ainsi que les
**prompts** qui pilotent cette génération.

Aujourd'hui l'app sert **un seul programme propre** (Trail 20 km / 740 m D+, 13 semaines).
L'objectif de ce dossier : pouvoir produire **d'autres programmes** (trail, calisthénie bas du
corps, ou hybride) **sans clé API** — en faisant raisonner **Claude Code dans le terminal** sur
cette base de connaissances. La bascule vers une génération par **API** plus tard ne changera que
le *moteur* : les docs, le contrat de sortie et les prompts restent les mêmes (ils deviendront le
*system prompt* + le *schéma d'outil*).

---

## 1. Architecture de la génération (pipeline en 3 étapes, sans API, via Claude Code)

Un **seul petit questionnaire** à l'inscription, **découpé** en deux sous-ensembles, alimente
deux prompts dont les **résultats** nourrissent un troisième prompt qui produit le programme final.

```
   NOUVEAU COMPTE
        │  questionnaire (objectif trail  +  max reps squat/pistol/fentes)
        ▼
   ┌─────────────────────────── docs/intake/profil-coureur.md ───────────────────────────┐
   │  A. objectif trail + forme course            B. capacités calisthénie (max reps/série) │
   └───────────────┬───────────────────────────────────────────┬───────────────────────────┘
                   ▼ (A)                                          ▼ (B)
        ┌───────────────────────┐                     ┌────────────────────────────┐
        │ PROMPT 1 — TRAIL      │                     │ PROMPT 2 — CALISTHÉNIE      │
        │ → 01-trail.json       │                     │ → 02-calisthenie.json       │
        │   (blocs, semaines,   │                     │   (niveau déduit des reps + │
        │    longue, D+, taper) │                     │    circuit + progression)   │
        └───────────┬───────────┘                     └─────────────┬──────────────┘
                    └──────────────────┬──────────────────────────┘
                                       ▼  (les DEUX artefacts)
                        ┌──────────────────────────────────────┐
                        │ PROMPT 3 — HYBRIDE (fusion)            │
                        │ → programme-<slug>.json + .md          │  ← LE programme de l'app
                        └──────────────────────────────────────┘
                                       │
                            (futur) import / seed ▼
                              backend → blocs / weeks / exercises
```

L'**orchestrateur** [`prompts/00-pipeline-orchestration.md`](prompts/00-pipeline-orchestration.md)
exécute toute la chaîne et **connecte les sorties** : il pose le questionnaire, lance P1 et P2
(indépendants), puis P3 sur leurs deux artefacts.

1. **Questionnaire** — petit formulaire, 2 sous-ensembles : [`intake/profil-coureur.md`](intake/profil-coureur.md).
2. **Connaissances** — la science, brute et sourcée : [`methodologie/`](methodologie/).
3. **Contrat de sortie** — format des **artefacts** (§7) et du **programme final MD + JSON**,
   calé sur le modèle de données de l'app : [`modele-donnees/`](modele-donnees/).
4. **Prompts** — l'orchestrateur (00) + les 3 étapes (01/02/03) : [`prompts/`](prompts/).
5. **Sortie** — un dossier `generated/<slug>/` : `01-trail.json`, `02-calisthenie.json`, puis le
   programme final `programme-<slug>.md` + `programme-<slug>.json`.

> **Pourquoi MD + JSON ?** Le `.md` est la version lisible (ton de l'app, comme
> `plan/plan_trail_descriptif.md`). Le `.json` final reprend **exactement** les entités de l'app
> (`blocs`, `weeks`, `exercises`) → directement seedable/importable, sans transformation. Les deux
> artefacts intermédiaires (`01-trail.json`, `02-calisthenie.json`) sont des documents de travail.

---

## 2. Contenu du dossier

| Chemin | Rôle |
|---|---|
| [`methodologie/01-trail-periodisation.md`](methodologie/01-trail-periodisation.md) | Science de l'entraînement trail (périodisation, 80/20, séances, sortie longue/D+, descente, taper, déloads, ACWR, nutrition). |
| [`methodologie/02-calisthenie-bas-du-corps.md`](methodologie/02-calisthenie-bas-du-corps.md) | Calisthénie bas du corps (surcharge sans poids, échelles squat→pistol, chaîne postérieure, mollets, pliométrie, excentrique, niveaux). |
| [`methodologie/03-hybride-trail-calisthenie.md`](methodologie/03-hybride-trail-calisthenie.md) | Hybride (interférence, séquençage ≥48 h, force pour le coureur, RBE/descente, anti-surcharge quadriceps, périodisation conjointe). |
| [`modele-donnees/contrat-de-sortie.md`](modele-donnees/contrat-de-sortie.md) | **Le format de sortie exact** (entités, palette, règles, checklist). |
| [`modele-donnees/schema-programme.json`](modele-donnees/schema-programme.json) | JSON Schema (draft 2020-12) — validation machine d'un programme. |
| [`modele-donnees/exemple-programme-740.json`](modele-donnees/exemple-programme-740.json) | **Exemple de référence** = le plan actuel, byte-fidèle à `backend/app/seed.py`. |
| [`intake/profil-coureur.md`](intake/profil-coureur.md) | **Questionnaire** (2 sous-ensembles) + grille max reps → niveau + défauts prudents. |
| [`prompts/00-pipeline-orchestration.md`](prompts/00-pipeline-orchestration.md) | **Orchestrateur** — exécute la chaîne complète et connecte les sorties. |
| [`prompts/01-generation-trail.md`](prompts/01-generation-trail.md) | **Prompt 1** (étape trail) → artefact `01-trail.json`. |
| [`prompts/02-generation-calisthenie-bas-corps.md`](prompts/02-generation-calisthenie-bas-corps.md) | **Prompt 2** (étape calisthénie) → artefact `02-calisthenie.json`. |
| [`prompts/03-generation-hybride.md`](prompts/03-generation-hybride.md) | **Prompt 3** (fusion) → programme final de l'app. |
| `generated/<slug>/` | Sorties d'un run : les 2 artefacts + le programme final (`.md` + `.json`). |

---

## 3. Comment générer un programme (mode d'emploi)

Dans le terminal, à la racine du repo :

```bash
claude    # ouvre Claude Code
```

Puis, **le plus simple** (chaîne complète) :

> « Lis `docs/prompts/00-pipeline-orchestration.md` et exécute le pipeline complet. »
> (ou fournis un `questionnaire.json` conforme à `docs/intake/profil-coureur.md`).

Claude va :
1. poser le **petit questionnaire** (objectif trail + max reps squat/pistol/fentes),
2. créer `generated/<slug>/` et découper les réponses en 2 sous-ensembles,
3. exécuter **Prompt 1** → `01-trail.json` et **Prompt 2** → `02-calisthenie.json`,
4. exécuter **Prompt 3** (fusion des 2 artefacts) → `programme-<slug>.json` + `.md`,
5. valider (checklist + schéma) et te faire un récap.

**Lancer une étape seule** (debug / itération) :
- Squelette trail seul → `prompts/01` (entrée : sous-ensemble A).
- Renfo bas du corps seul → `prompts/02` (entrée : sous-ensemble B).
- Fusion seule (si les 2 artefacts existent déjà) → `prompts/03`.

---

## 4. Vérifier / importer un programme généré (optionnel, futur)

- **Valider le JSON** contre le schéma (quand un validateur est en place) :
  `programme-<slug>.json` ⟶ `modele-donnees/schema-programme.json`.
- **Importer en base** : aujourd'hui le contenu vient de `backend/app/seed.py` (tuples codés en
  dur). Étape future : un petit `python -m app.import_program generated/programme-<slug>.json` qui
  lit `blocs`/`weeks`/`exercises` et remplace le plan global. Le JSON est **déjà au bon format** pour ça.

---

## 5. Feuille de route (du manuel vers l'automatique)

| Étape | État | Description |
|---|---|---|
| 1. Base de connaissances + 3 prompts + contrat de sortie | ✅ fait | Ce dossier. |
| 2. Première génération via Claude Code | ⏳ à tester | Produire un 2ᵉ programme (ex. autre D+/durée) et le relire. |
| 3. Importeur `import_program` (JSON → DB) | ⏳ futur | Remplacer les tuples du seed par un import de fichier. |
| 4. Programme **par utilisateur** en base | ⏳ futur | Table `programs` + `meta.user_id` ; l'app sert le plan de l'utilisateur connecté. |
| 5. Génération par **API Claude** | ⏳ futur | Les docs deviennent le system prompt ; le schéma devient un *tool* à sortie structurée ; génération à l'inscription. |

> Voir aussi `IDEES-FEATURES.md` à la racine et la note d'auth dans `CLAUDE.md` (§7).

---

## 6. Principes non négociables (rappel)

Tout programme **trail** ou **hybride** respecte les **deux principes directeurs du projet** :
1. **Ne jamais empiler le travail quadriceps** (≥ 48 h entre gros stress quadriceps ; renfo lourd isolé).
2. **Entraîner la descente** (excentrique, RBE, dès le milieu du plan ; dernière grosse descente ~2 sem avant la course).

Et la règle d'or de l'app : **prudence > performance** — « mieux vaut arriver un peu sous-entraîné
et frais que cuit ou blessé ».
