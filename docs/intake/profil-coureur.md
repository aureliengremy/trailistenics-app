# Questionnaire d'entrée (intake) — un petit formulaire, deux sous-ensembles

> **Rôle.** C'est le **point de départ unique** du pipeline de génération
> ([`../prompts/00-pipeline-orchestration.md`](../prompts/00-pipeline-orchestration.md)).
> **En production**, ce questionnaire est le formulaire in-app (`IntakeForm`) rempli à
> l'inscription : il produit **exactement le JSON du §C**, enregistré en base
> (`user_intake`) et **posté sur Slack** à l'admin (copiable aussi depuis l'onglet Admin).
> Le nouvel inscrit répond à **un seul petit questionnaire**. Les réponses se découpent en
> **deux sous-ensembles** :
> - **A. Objectif trail** → consommé par le **Prompt 1** (artefact `01-trail.json`).
> - **B. Capacités calisthénie** → consommé par le **Prompt 2** (artefact `02-calisthenie.json`).
>
> Le **Prompt 3** fusionne ensuite les deux artefacts pour produire le programme hybride final.
> Garder le questionnaire **court** : objectif + forme actuelle minimale + 3 tests de force au
> poids du corps (max reps en une série).

---

## A. Objectif trail (→ Prompt 1)

### A.0 Profil (toi)

| Champ | Type | Exemple | Obligatoire |
|---|---|---|---|
| `prenom` | string | `"Aurélien"` (ou un surnom) | optionnel (ton du `.md`) |
| `sexe` | enum | `"femme"` / `"homme"` / `"autre"` | ✅ |
| `age` | int | `34` | ✅ (prudence récup — voir §D) |
| `court_deja` | bool | `true` | ✅ (porte d'entrée de la forme course, cf. A.2) |

### A.1 La course visée

| Champ | Type | Exemple | Obligatoire |
|---|---|---|---|
| `objectif.distance_km` | number | `20` | ✅ |
| `objectif.dplus_m` | int | `740` | ✅ (variable structurante) |
| `objectif.terrain` | enum | `"roulant"` / `"vallonné"` / `"montagneux"` | ✅ |
| `objectif.date_course` | date `YYYY-MM-DD` | `"2026-09-06"` | ✅ (fixe la fin de plan + le taper) |
| `objectif.technicite_descente` | enum | `"roulante"` / `"technique"` | défaut `"roulante"` |

### A.2 Forme actuelle en course — **uniquement si `court_deja = true`**

> Si `court_deja = false` (« je ne cours pas encore »), ces champs ne sont **pas demandés** : on
> prend `volume_hebdo_km = 0`, `sortie_longue_max_km = null`, `frequence_actuelle = 0`,
> `experience_trail = "débutant"` (grand débutant). `acces_terrain` reste demandé dans tous les cas.

| Champ | Type | Exemple | Obligatoire |
|---|---|---|---|
| `course.volume_hebdo_km` | number | `20` | ✅ si `court_deja` (base de la progression) |
| `course.sortie_longue_max_km` | number | `11` | si `court_deja` (plafond prudent du pic) |
| `course.frequence_actuelle` | int | `2` | si `court_deja` |
| `course.experience_trail` | enum | `"débutant"` / `"intermédiaire"` / `"confirmé"` | défaut `"débutant"` |
| `course.acces_terrain` | array | `["côtes","escaliers"]` / `["montagne"]` / `["plat"]` | défaut `["côtes"]` (toujours demandé) |

### A.3 Contraintes pratiques (communes au plan)

| Champ | Type | Exemple | Obligatoire |
|---|---|---|---|
| `jours_dispo` | array | `["mar","jeu","sam","dim"]` | défaut 4 j — le **nb de séances/sem se déduit de ces jours** |
| `antecedents_blessure` | array | `["genou droit"]` | défaut `[]` |

---

## B. Capacités calisthénie — test « max reps en 1 série » (→ Prompt 2)

> **Concept.** On ne demande PAS un long bilan : juste le **nombre maximal de répétitions
> propres en une seule série** sur quelques mouvements bas du corps standard. De ces nombres,
> le Prompt 2 **déduit le niveau** et le **barreau de départ** sur chaque échelle de progression
> (cf. [`../methodologie/02-calisthenie-bas-du-corps.md`](../methodologie/02-calisthenie-bas-du-corps.md) §2 & §9).

| Champ | Type | Description | Exemple |
|---|---|---|---|
| `calisthenie.squat_max` | int | Air squats (poids du corps) max en 1 série, cuisses sous la parallèle | `30` |
| `calisthenie.pistol_max_par_jambe` | int | Pistol squats **par jambe** (0 si aucun ; voir variante ci-dessous) | `2` |
| `calisthenie.pistol_variante` | enum | Si `pistol_max_par_jambe = 0` ou assisté : `"aucun"` / `"assisté"` / `"box"` / `"complet"` | `"box"` |
| `calisthenie.fente_max_par_jambe` | int | Fentes (ou Bulgarian split squat) max **par jambe**, contrôlées | `12` |
| `calisthenie.materiel` | array | `["marche_box","bande_elastique","barre_traction"]` | `["marche_box"]` |
| `calisthenie.mobilite_cheville` | enum | (optionnel) test knee-to-wall : `"<3in"`/`"3-5in"`/`">5in"` | `"3-5in"` |

> **Optionnel** (si la personne sait) : `posterieur_max` (ponts fessiers 1 jambe / jambe) et
> `gainage_max_s` (planche, secondes). Sinon le Prompt 2 prend des défauts prudents.

### B.1 Logique de déduction du niveau (LE cœur de la personnalisation)

Le Prompt 2 applique cette grille (un mouvement « tire » le niveau vers le haut, mais le
**plus contraignant** prime pour la sécurité). Référence : doc 02 §9.

| Test | Débutant | Intermédiaire | Avancé |
|---|---|---|---|
| **Squat** (air squat, /série) | < 20 | 20 – 40 | > 40 |
| **Pistol** (/jambe) | `aucun` ou `assisté` | `box`, ou 1–4 complets/jambe | ≥ 5 complets/jambe |
| **Fente / Bulgarian** (/jambe) | < 8 | 8 – 15 | > 15 |

**Niveau global retenu** = le **plus bas** des trois (principe « prudence > performance »), sauf
si un seul test est bas et les autres nettement hauts → niveau intermédiaire avec régression ciblée
sur le pattern faible. À documenter dans `meta.notes`.

### B.2 Barreau de départ déduit (exemples)

| Niveau global | Squat unilatéral (départ) | Pistol (départ) | Chaîne postérieure (départ) | Schéma séries/reps |
|---|---|---|---|---|
| **Débutant** | Split squat → Bulgarian split squat | Box pistol haut / assisté | Glute bridge → single-leg ; RDL au PdC | 3×8–12, tempo 3-1-3 |
| **Intermédiaire** | Bulgarian split squat | Box pistol bas / pistol assisté | Single-leg RDL ; Nordic à la bande | 3×6–10 + excentrique 3–5 s |
| **Avancé** | Pistol complet / shrimp | Pistol complet → lesté | Nordic complet ; hip thrust 1 jambe | 5×3–5 (force) ou 3×8–12 |

> Toujours injecter l'**excentrique de descente** (step-downs lents) quel que soit le niveau —
> c'est la spécificité trail (cf. doc 03, principe « entraîner la descente »).

---

## C. Exemple de `questionnaire.json` (entrée complète du pipeline)

```json
{
  "prenom": "Aurélien",
  "sexe": "homme",
  "age": 34,
  "court_deja": true,
  "jours_dispo": ["mar", "jeu", "sam", "dim"],
  "antecedents_blessure": [],

  "objectif": {
    "distance_km": 20,
    "dplus_m": 740,
    "terrain": "vallonné",
    "date_course": "2026-09-06",
    "technicite_descente": "technique"
  },
  "course": {
    "volume_hebdo_km": 20,
    "sortie_longue_max_km": 11,
    "frequence_actuelle": 2,
    "experience_trail": "débutant",
    "acces_terrain": ["côtes", "escaliers"]
  },

  "calisthenie": {
    "squat_max": 30,
    "pistol_max_par_jambe": 2,
    "pistol_variante": "box",
    "fente_max_par_jambe": 12,
    "materiel": ["marche_box", "bande_elastique"],
    "mobilite_cheville": "3-5in"
  }
}
```

Le pipeline découpe ce JSON : `{prenom, sexe, age, court_deja, jours_dispo, antecedents_blessure,
objectif, course}` → **Prompt 1** ; `{prenom, sexe, age, jours_dispo, antecedents_blessure,
calisthenie}` → **Prompt 2**. (Les champs communs — dont `prenom/sexe/age` — vont aux deux.)

---

## D. Valeurs par défaut (si un champ manque)

La génération **suppose un défaut prudent** et le **signale** dans `meta.notes` :

- `court_deja = false` (ou forme course incomplète) → **grand débutant prudent** : départ 2–3 séances/sem en marche/course alternée, sortie longue de départ courte, montée de charge très graduelle.
- Forme course incomplète (mais `court_deja = true`) → **débutant prudent** : départ 2–3 séances/sem, sortie longue de départ ≈ `volume_hebdo_km` ÷ 2,5.
- `age` élevé (≈ 45 ans et +) → **récupération accrue** : montée de charge plus graduelle, +1 jour de récup entre les gros stress quadriceps, prudence sur le volume. `age` sert aussi de garde-fou (pas de protocole inadapté).
- `prenom` / `sexe` → servent au **ton** du `.md` (tutoiement personnalisé), pas à la structure du plan.
- `seances_max_par_sem` n'est plus demandé : le **nombre de séances/sem se déduit des `jours_dispo`** (≤ leur nombre).
- `acces_terrain` inconnu → prévoir **alternatives** (escaliers, côtes routières, tapis incliné) et le noter.
- Capacités calisthénie partielles → niveau déduit du **mouvement le plus bas renseigné** ; pistol non testé → supposer `aucun` (régressions).
- `date_course` absente → caler la durée de prépa via le tableau §1.4 de
  [`../methodologie/01-trail-periodisation.md`](../methodologie/01-trail-periodisation.md) et le préciser.
- Règle d'or : **prudence > performance** — « mieux vaut arriver un peu sous-entraîné et frais que cuit ou blessé ».
