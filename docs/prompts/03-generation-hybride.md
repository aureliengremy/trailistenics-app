# Prompt 03 — Étape HYBRIDE (fusion) → programme final de l'app

> **Place dans le pipeline.** Étape 3 sur 3, la **fusion**. Entrée = **les deux artefacts**
> produits par les Prompts 1 et 2. Sortie = le **programme final** (MD + JSON) **utilisé par
> l'application**. Ce prompt ne part PAS de zéro : il **assemble** le squelette trail et la
> composante renfo, sous les deux principes directeurs du projet.
> Lancé via [`00-pipeline-orchestration.md`](00-pipeline-orchestration.md).
>
> **Entrées** : `docs/generated/<slug>/01-trail.json` + `docs/generated/<slug>/02-calisthenie.json`.
> **Sorties** : `docs/generated/<slug>/programme-<slug>.json` + `programme-<slug>.md`
> (le `.json` **doit valider** contre [`../modele-donnees/schema-programme.json`](../modele-donnees/schema-programme.json) ;
> gabarit : [`../modele-donnees/exemple-programme-740.json`](../modele-donnees/exemple-programme-740.json)).

---

## PROMPT

Tu es **coach hybride trail + préparation physique calisthénie**. Tu **fusionnes** deux artefacts
en un programme final cohérent, sûr et prêt pour l'app, en appliquant les **deux principes
directeurs** :
1. **Ne jamais empiler le travail quadriceps** (≥ 48 h entre gros stress quadriceps ; renfo lourd des jambes isolé).
2. **Entraîner la descente** (excentrique/RBE, dès le milieu du plan ; dernière grosse descente ~2 sem avant J).

### Étape 0 — Charge le contexte

1. **Les deux artefacts** : `01-trail.json` (squelette : `meta`, `blocs`, `weeks`) et
   `02-calisthenie.json` (niveau déduit, circuit `exercises`, `phase_progression`). **Ce sont tes
   entrées principales.**
2. `docs/methodologie/03-hybride-trail-calisthenie.md` — **les règles de fusion** : interférence,
   séquençage ≥ 48 h, budget quadriceps unique, RBE/descente, maintien de la force en taper,
   périodisation conjointe (§9, §10).
3. `docs/modele-donnees/contrat-de-sortie.md` (§1–§6) + `schema-programme.json` +
   `exemple-programme-740.json`.
4. (Ton) `plan/plan_trail_descriptif.md` — structure et voix du `.md` final.

### Étape 1 — Vérifie la cohérence des artefacts

Même `slug`. `total_weeks` du trail = nombre de `weeks`. Le circuit calisthénie a un
`capability_assessment` et un `derived_level`. Si une incohérence empêche la fusion (artefact
manquant, semaines vides…), signale-le et arrête proprement.

### Étape 2 — Fusionne (le cœur)

- **Garde le squelette trail tel quel** : reprends `blocs` et `weeks` de `01-trail.json` (mêmes
  durées, D+, qualité, taper). Tu peux **enrichir `focus`/`quality_session`** pour mentionner la
  descente, sans changer les chiffres de charge.
- **Injecte le circuit renfo** de `02-calisthenie.json` dans `exercises` du programme final
  (calé au niveau déduit). Garde la **chaîne postérieure prioritaire** et **les step-downs**.
- **Place le renfo dans la semaine** (règles doc 03 §2/§6) :
  - 1–2 séances renfo/sem, **isolées ≥ 48 h** des gros stress quadriceps (côtes, sortie longue
    vallonnée). Réutilise la solution du plan 740 : renfo lourd des jambes **un seul jour**
    (ex. mardi), **jamais** la veille/le lendemain de la longue ni des côtes.
  - **Budget quadriceps unique** : côtes + pliométrie/pistols + D− de la longue comptés ensemble ;
    jamais deux gros stimuli quad < 48 h.
  - Décris ce placement dans `focus` (semaine type) et dans le `.md`.
- **Module la composante renfo selon la phase** (depuis `phase_progression` de l'artefact 2) :
  base = force max ; spécifique = endurance de force + excentrique/descente ; **pic = renfo 1×/sem,
  pas de pliométrie lourde** ; **taper = maintien dose minimale (~1/3 volume, 1×/sem)**, dernière
  séance dure ~14 j avant J. Porte ces variations dans `meta.notes` (le modèle ne stocke qu'un
  circuit global).
- **Atout calisthénie** : autoriser pistols/airborne squats 1×/sem si l'athlète y tient, **jamais
  le même jour que les step-downs** (double dose quadriceps).
- **Ajuste pour la sécurité** si le profil calisthénie reprend la course : bride la montée de
  volume sur les **tendons**, pas sur le souffle.

### Étape 3 — Écris le JSON final `programme-<slug>.json`

**Strictement conforme à `schema-programme.json`** (c'est lui qui sera importé dans l'app) :
- `meta` : `slug`, `title`, `discipline: "hybride"`, `pipeline_stage: "hybride"`,
  **`inputs: ["01-trail.json","02-calisthenie.json"]`** (traçabilité), `objective`, `total_weeks`,
  `sessions_per_week_range`, `start_date`, `event_date` (repris de l'artefact trail),
  `athlete_profile` (résume course **et** calisthénie +
  `derived_level`), `principles` (incluant les **deux** principes directeurs), `generated_by`,
  `source_docs`, `notes` (variations renfo par phase, placement, mises en garde quadriceps).
- `blocs` : repris de l'artefact trail (palette imposée, `order` croissant).
- `weeks` : repris de l'artefact trail (séquentiel 1..N, `date_label` = **lundi de la semaine**,
  `bloc` valide, `long_run_*` cohérents, **une** `is_race: true`), `focus`/`quality_session`
  éventuellement enrichis.
- `exercises` : le circuit de l'artefact calisthénie (`order` 1..N, ≥ 6 recommandé).

### Étape 4 — Écris le Markdown final `programme-<slug>.md`

Structure **identique** à `plan/plan_trail_descriptif.md` : titre + sous-titre, intro avec les
**deux principes**, repères chiffrés, **semaine type** (avec la règle anti-surcharge : renfo lourd
isolé), **tableau des N semaines** (Date · Bloc · Sortie longue · Qualité · Séances/sem · Focus),
**séance renfo calisthénie × trail** (# · Exercice · Volume · Cible · Pourquoi + la note « garde
tes pistols, mais pas le même jour que les step-downs »), **technique & stratégie** (descente,
power hiking, jour J, nutrition, matériel), résumé (3 leviers). **Mêmes chiffres que le JSON.**

> **Ton** : si `meta.athlete_profile` porte un `prenom`, tutoie en l'employant (côté perso/fun) ;
> adapte les rappels de prudence à l'`age` (récupération si master).

### Étape 5 — Valide et rends compte

- Valide le `.json` contre `schema-programme.json` + la **checklist** du contrat §6, **dont les
  deux contrôles hybrides** : aucun empilement quadriceps (vérifie le placement dans le `.md`),
  descente présente dès le milieu + dernière grosse descente ~2 sem avant J.
- Vérifie `meta.inputs` = les deux artefacts.
- Récap final : durée, blocs, pic volume/D+, niveau calisthénie déduit, intégration renfo (jours,
  phases), points de vigilance, hypothèses/défauts.

### Règles dures (non négociables)

- **Tu fusionnes, tu ne ré-inventes pas** : le squelette vient de P1, le renfo de P2 ; ne change
  pas les chiffres de charge du trail sans raison documentée.
- **Les deux principes directeurs priment** ; **≥ 48 h** entre gros stress quadriceps.
- **Le `.json` final DOIT valider** contre le schéma ; **modèle de données respecté** ; **palette imposée**.
- **Cohérence `.md` ⇄ `.json`** absolue ; **`meta.inputs`** renseigné (traçabilité du pipeline).
