# Contrat de sortie — format des programmes générés (MD + JSON)

> **Rôle de ce document.** Définir *exactement* ce que la génération doit produire pour qu'un
> programme soit (a) lisible par un humain et (b) **importable dans l'app sans transformation**.
> Toute génération (prompts 01/02/03) **doit** respecter ce contrat. Référence machine :
> [`schema-programme.json`](schema-programme.json) (JSON Schema) et exemple complet faisant foi :
> [`exemple-programme-740.json`](exemple-programme-740.json) (le plan actuel 20 km / 740 m).

---

## 1. Principe : deux artefacts par programme

Chaque programme généré produit **deux fichiers jumeaux** portant le même identifiant :

| Fichier | Pour qui | Rôle |
|---|---|---|
| `programme-<slug>.md` | **Humain** | Plan rédigé, lisible, dans le ton de l'app — calqué sur `plan/plan_trail_descriptif.md` (sections : intro/principes, repères chiffrés, semaine type, tableau des semaines, séance renfo, technique & stratégie, résumé). |
| `programme-<slug>.json` | **Machine** | Données structurées **strictement conformes** à `schema-programme.json` — directement consommables par le seed/import de l'app. |

Le `.md` est la *source de vérité narrative* ; le `.json` est la *source de vérité structurée*. Les deux doivent être **cohérents** (mêmes valeurs de durée, D+, séances, exercices). En cas de génération, produire d'abord le raisonnement → le `.json` → puis le `.md` qui le met en mots.

`<slug>` = identifiant court, ex. `trail-20k-740-13s` (objectif + durée).

> **Pipeline (cf. [`../prompts/00-pipeline-orchestration.md`](../prompts/00-pipeline-orchestration.md)).**
> Le programme final est produit en **3 étapes**, dans un dossier `docs/generated/<slug>/` :
> 1. **Prompt 1** → artefact `01-trail.json` (squelette de périodisation — format §7.1).
> 2. **Prompt 2** → artefact `02-calisthenie.json` (niveau + circuit renfo — format §7.2).
> 3. **Prompt 3** → fusionne les deux → **`programme-<slug>.json` + `.md`** (ce §1).
>
> **Seul le programme final** doit valider contre `schema-programme.json`. Les deux artefacts
> intermédiaires sont des **documents de travail** (formats au §7), pas importés dans l'app.

---

## 2. Pourquoi ce format (alignement avec l'app existante)

L'app sert aujourd'hui **un seul plan global** via trois entités exposées en API
(`GET /api/blocs`, `/api/weeks`, `/api/exercises`). Le seed (`backend/app/seed.py`) les peuple
depuis le contenu du plan. **Le JSON généré reprend exactement ces trois entités**, plus un
bloc `meta` décrivant le programme. Ainsi un futur petit script d'import
(`python -m app.import_program programme-<slug>.json`) pourra remplacer les tuples codés en dur
du seed — sans changer le modèle de données ni le frontend.

> ⚠️ **État actuel (juin 2026)** : la base n'a pas encore de notion de « programme par
> utilisateur » ; le contenu est mono-plan et public. Le contrat ci-dessous est donc
> **rétro-compatible** : un programme généré peut *remplacer* le plan global dès aujourd'hui
> (via seed/import). Le rattachement `programme ↔ utilisateur` en base est une étape future
> (voir [`docs/README.md`](../README.md), section feuille de route).

---

## 3. Le modèle de données exact (rappel, depuis le code)

Tiré de `backend/app/models/{bloc,week,exercise}.py` et des schémas Pydantic
`backend/app/schemas/`. **Ne pas s'en écarter** (mêmes noms de champs, mêmes types).

### 3.1 `bloc` — phase d'entraînement

| Champ | Type | Contrainte | Exemple |
|---|---|---|---|
| `key` | string | **unique**, ≤ 32, stable (slug) | `"pic"` |
| `name` | string | ≤ 64, nom affiché | `"Pic de charge"` |
| `category` | string | ≤ 64 | `"Construction"` / `"Récupération"` / `"Pic de charge"` / `"Simulateur"` / `"Affûtage"` |
| `color` | string | hex exact `#rrggbb` (7 car.) | `"#c2562e"` |
| `color_key` | string | ≤ 16 — regroupe les couleurs pour les graphes | `"pic"` |
| `description` | string (text) | libre | `"Volume maximal, le bloc le plus exigeant."` |
| `order` | int | ordre d'affichage (1..N) | `5` |

**Palette imposée (identité visuelle — ne pas inventer de couleurs)** :

| Famille | `color` | `color_key` | Blocs concernés |
|---|---|---|---|
| Construction (mousse) | `#7ba05b` | `base` | Reprise, Base, Développement |
| Allégée (muted) | `#a99e88` | `allege` | Allégée |
| Pic & Simulateur (rouille) | `#c2562e` | `pic` / `simul` | Pic de charge, Simulateur |
| Affûtage (ciel) | `#6fa8c4` | `affut` | Affûtage |

> Le `color_key` distingue `pic` et `simul` (même couleur rouille) pour le regroupement des
> graphiques. Reprendre **ces 5 `color_key`** : `base`, `allege`, `pic`, `simul`, `affut`.
> Si un programme n'a pas de bloc « simulateur », ne pas créer la clé `simul`.

### 3.2 `week` — une semaine du plan

| Champ | Type | Contrainte | Exemple |
|---|---|---|---|
| `number` | int | **unique**, 1..N (séquentiel) | `9` |
| `date_label` | string | ≤ 32, **lundi (premier jour)** de la semaine | `"27 juil."` |
| `bloc` | string | **clé** d'un bloc défini ci-dessus (FK logique) | `"pic"` |
| `long_run_label` | string | ≤ 128, libellé riche de la sortie longue | `"2h00 · ~17 km · 550 m D+"` |
| `long_run_duration_min` | int | durée de la longue en **minutes** | `120` |
| `long_run_dplus_m` | int | D+ de la longue en **mètres** | `550` |
| `long_run_distance_km` | int \| null | distance approx. en km (null si non pertinent) | `17` |
| `sessions_per_week` | int | nombre de séances de la semaine | `4` |
| `sessions_label` | string \| null | libellé alternatif (ex. transition) | `"3 → 4"` ou `null` |
| `quality_session` | string | ≤ 128, séance qualité de la semaine | `"Côtes longues : 5×2 min"` |
| `focus` | string (text) | phrase d'intention de la semaine (ton app) | `"Le bloc clé. Matériel testé en conditions réelles."` |
| `is_race` | bool | `true` uniquement la semaine de course | `false` |

**Règles de cohérence semaines :**
- `number` est **séquentiel sans trou** de 1 à `meta.total_weeks`.
- `date_label` = le **lundi de la semaine `number`** (format court FR, ex. `"1 juin"`, `"27 juil."`),
  dérivé de `meta.start_date` : la semaine 1 est celle qui contient `start_date` (si `start_date`
  tombe un mardi, son `date_label` est le lundi de la veille). L'app affiche le premier jour de
  chaque semaine — S1 = 1 juin, S2 = 8 juin, etc.
- Exactement **une** semaine avec `is_race = true` (la dernière, en général).
- `long_run_label` doit refléter `long_run_duration_min` / `long_run_dplus_m` / `long_run_distance_km`.
- Chaque `week.bloc` référence un `bloc.key` existant.
- Les nombres (durée, D+, distance) suivent les règles de progression de
  [`01-trail-periodisation.md`](../methodologie/01-trail-periodisation.md) (≤ ~10 %/sem, déloads, taper).

### 3.3 `exercise` — circuit de renforcement

| Champ | Type | Contrainte | Exemple |
|---|---|---|---|
| `order` | int | **unique**, 1..N (ordre dans le circuit) | `2` |
| `name` | string | ≤ 96 | `"Step-downs lents"` |
| `volume` | string | ≤ 64 (texte libre : séries × reps) | `"3 × 8 / jambe"` |
| `target` | string | ≤ 32 — « chip » de cible | `"Descente"` |
| `rationale` | string (text) | le *pourquoi* de l'exercice | `"…excentrique qui blinde les cuisses."` |

> **Limite actuelle du modèle** : `exercises` est une **liste globale unique** (un seul circuit
> pour tout le plan), pas un circuit par semaine ni par bloc. La génération respecte cette
> limite : elle produit **un circuit représentatif** (typiquement 6 exercices) et décrit les
> variations par phase dans le **`.md`** (texte) et, optionnellement, dans `meta.notes`.
> Voir §5 pour l'extension future (renfo par phase).

---

## 4. Bloc `meta` (en-tête du JSON, niveau programme)

Décrit le programme dans son ensemble. **Non encore stocké en base** (le seed actuel ignore les
champs inconnus), mais essentiel pour la traçabilité, le `.md`, et l'évolution future.

| Champ | Type | Rôle |
|---|---|---|
| `slug` | string | identifiant du programme (= base des noms de fichiers) |
| `title` | string | titre lisible, ex. `"Trail 20 km / 740 m D+ — 13 semaines"` |
| `discipline` | enum | `"trail"` \| `"calisthenie"` \| `"hybride"` (quel prompt l'a produit) |
| `pipeline_stage` | enum | `"trail"` \| `"calisthenie"` \| `"hybride"` — étape du pipeline qui a produit le fichier |
| `inputs` | array<string> | (programme final) artefacts consommés, ex. `["01-trail.json","02-calisthenie.json"]` |
| `capability_assessment` | object | (artefact calisthénie) max reps reçus + `derived_level` + `starting_rungs` |
| `phase_progression` | object/array | (artefact calisthénie) réglage du renfo par phase (force max / ME / maintien) |
| `objective` | object | `{ distance_km, dplus_m, terrain, race_date }` (selon discipline) |
| `total_weeks` | int | doit égaler le nombre d'entrées `weeks` |
| `sessions_per_week_range` | string | ex. `"2 → 4"` |
| `start_date` | string | date de début (ISO `YYYY-MM-DD`) — défaut : **le lundi qui suit la génération** |
| `event_date` | string \| null | date de la course (ISO `YYYY-MM-DD`) = `objectif.date_course` de l'intake |
| `athlete_profile` | object | résumé du profil d'entrée ayant produit le plan (cf. [`../intake/profil-coureur.md`](../intake/profil-coureur.md)) |
| `principles` | array<string> | principes directeurs appliqués (ex. les deux du projet) |
| `generated_by` | string | `"claude-code"` (aujourd'hui) ou modèle API (futur) |
| `source_docs` | array<string> | docs de `docs/` utilisés (traçabilité) |
| `notes` | array<string> | notes libres (ex. variations renfo par phase, mises en garde) |

> L'import (`python -m app.import_program`) lit `blocs`, `weeks`, `exercises` **et** dans `meta` :
> `title` (nom du programme), `start_date` et `event_date` (dérivée du dimanche de la dernière
> semaine si absente). Le reste de `meta` est conservé pour l'humain et l'avenir (champs ignorés).

---

## 5. Extensions futures (NON bloquantes — ne pas générer tant que le modèle ne les supporte pas)

Pour mémoire, à activer quand le backend évoluera (voir feuille de route) :

- **Renfo par phase** : `strength_blocks[]` reliant un circuit d'exercices à un ou plusieurs
  blocs (force max en base, ME en spécifique, maintien en taper). Aujourd'hui : décrit en
  **texte** dans le `.md`, pas en données.
- **Séances détaillées par jour** : `weeks[].days[]` (lun..dim) avec type de séance. Aujourd'hui :
  l'app affiche la « séance du jour » via une logique frontend (`lib/plan.ts`), pas via la base.
- **Programme par utilisateur** : `meta.user_id` + table `programs`. Aujourd'hui : mono-plan global.

**Règle d'or** : un programme généré reste **valide vis-à-vis du schéma actuel**. Les extensions
sont documentées ici pour que le `.md` puisse déjà *décrire* ce que les données ne *stockent* pas
encore — sans jamais produire un JSON que l'import actuel rejetterait.

---

## 6. Checklist de validation (avant de livrer un programme)

- [ ] `weeks.length === meta.total_weeks`, `number` séquentiel 1..N sans trou.
- [ ] Exactement une semaine `is_race: true`.
- [ ] Chaque `week.bloc` ∈ `{ blocs[].key }`.
- [ ] `blocs[].color` ∈ palette imposée ; `color_key` ∈ `{base, allege, pic, simul, affut}`.
- [ ] Progression durée/D+/distance plausible (≤ ~10 %/sem hors déload/taper ; déloads présents ; taper en fin).
- [ ] `exercises` : `order` unique 1..N, chaîne postérieure priorisée si discipline trail/hybride.
- [ ] `.md` et `.json` **cohérents** (mêmes chiffres, mêmes exercices).
- [ ] Deux principes respectés si discipline `hybride`/`trail` : *pas d'empilement quadriceps*, *descente entraînée*.
- [ ] Le JSON **valide** contre `schema-programme.json` (le faire vérifier si possible).
- [ ] `meta.inputs` renseigné (= les deux artefacts) pour un programme issu du pipeline.

---

## 7. Artefacts intermédiaires (documents de travail du pipeline)

> Produits par les Prompts 1 et 2, consommés par le Prompt 3. **Ne sont pas importés dans l'app**
> et **n'ont pas à valider** contre `schema-programme.json` (ce sont des fichiers de travail). Ils
> réutilisent toutefois les mêmes entités pour que la fusion soit triviale. Vivent dans
> `docs/generated/<slug>/`.

### 7.1 Artefact TRAIL — `01-trail.json`

Le **squelette de périodisation**, sans renfo.

```jsonc
{
  "meta": {
    "slug": "...", "title": "...",
    "discipline": "trail", "pipeline_stage": "trail",
    "objective": { "distance_km": 20, "dplus_m": 740, "terrain": "...", "race_date": "YYYY-MM-DD" },
    "total_weeks": 13, "sessions_per_week_range": "2 → 4",
    "start_date": "YYYY-MM-DD", "event_date": "YYYY-MM-DD",
    "athlete_profile": { /* résumé course */ },
    "principles": [ "..." ],
    "generated_by": "claude-code",
    "source_docs": [ "docs/methodologie/01-trail-periodisation.md" ],
    "notes": [ "profil de charge : déloads S4/S8, descente dès S5, taper S12-13", "défauts pris : ..." ]
  },
  "blocs":  [ /* §3.1 — palette imposée */ ],
  "weeks":  [ /* §3.2 — séquentiel 1..N, une seule is_race:true */ ],
  "exercises": []                              // VIDE : le renfo vient de 02-calisthenie.json
}
```

### 7.2 Artefact CALISTHÉNIE — `02-calisthenie.json`

Le **niveau déduit** + le **circuit renfo** + sa **progression par phase**. Pas de `weeks`.

```jsonc
{
  "meta": {
    "slug": "...",
    "discipline": "calisthenie", "pipeline_stage": "calisthenie",
    "generated_by": "claude-code",
    "source_docs": [ "docs/methodologie/02-calisthenie-bas-du-corps.md", "docs/intake/profil-coureur.md" ],
    "capability_assessment": {
      "squat_max": 30, "pistol_max_par_jambe": 2, "pistol_variante": "box", "fente_max_par_jambe": 12,
      "derived_level": "intermédiaire",
      "starting_rungs": {
        "squat_unilateral": "bulgarian split squat",
        "pistol": "box pistol bas",
        "chaine_posterieure": "single-leg RDL + Nordic à la bande",
        "mollet_cheville": "single-leg calf raise + tibialis"
      }
    },
    "phase_progression": [
      { "phase": "fondation",   "reglage": "3×8-12, tempo 3-1-3" },
      { "phase": "force_max",   "reglage": "5×3-5 sur variante plus dure" },
      { "phase": "endurance_force", "reglage": "3×12-15 + excentrique 3-5 s" },
      { "phase": "maintien",    "reglage": "1×/sem, ~1/3 volume" }
    ],
    "principles": [ "surcharge progressive sans poids", "chaîne postérieure prioritaire", "excentrique descente" ],
    "notes": [ "régressions sans matériel : ...", "mobilité cheville à travailler si <3in" ]
  },
  "exercises": [ /* §3.3 — circuit 6 mouvements, order 1..6, calé au niveau déduit */ ]
  // PAS de "weeks" : le squelette de semaines appartient à 01-trail.json ; la fusion = Prompt 3
}
```

### 7.3 Fusion (Prompt 3)

Le programme final = `blocs` + `weeks` repris de **7.1**, `exercises` repris de **7.2**, `meta`
fusionné (`discipline: "hybride"`, `pipeline_stage: "hybride"`, `inputs: ["01-trail.json",
"02-calisthenie.json"]`, profil + niveau, variations renfo par phase en `notes`). Placement du
renfo dans la semaine selon les règles anti-surcharge quadriceps (doc 03 §2/§6). **Ce fichier-là
valide contre le schéma.**
