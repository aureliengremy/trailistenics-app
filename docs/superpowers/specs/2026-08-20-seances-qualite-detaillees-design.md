# Séances qualité détaillées — intensité chiffrée (RPE), récup explicite, progressivité

**Date :** 2026-08-20 · **Statut :** validé (affichage 3 phases) — **révision 2** : ajout de
l'échelle d'intensité RPE et du barème de progressivité par niveau.

## 1. Contexte & problème

Le jour « Séance qualité » affiche : `{quality_session} · ~{min} min en tout (échauffement +
retour au calme inclus).` Trois manques :

1. **Pas de détail des phases** — « échauffement » et « retour au calme » sans durée.
2. **Pas d'intensité chiffrée** — « vif », « soutenu », « léger » ne disent pas l'effort réel.
   C'est le manque le plus transversal : **aucune notion d'intensité** dans le projet.
3. **Récup absente** de ~21 libellés sur 27.

**Progressivité — constat mesuré.** Le générateur fait déjà bien le travail : le programme
15 semaines démarre par `Initiation : 8×(1 min course / 1 min marche)` → `8×(2 min/1 min)` →
`Côtes en marche rapide` → `Footing souple` → `Côtes 6×30 s` → `Seuil doux 2×6 min`. C'est une
rampe débutant exemplaire, pilotée par l'intake (`court_deja`, `course.volume_hebdo_km`,
`course.frequence_actuelle`, `course.experience_trail`, `age`).

En revanche :
- **Le plan de référence 13 semaines** (`plan_trail_descriptif.md` + `seed.py`, écrit à la main)
  attaque à **S1 = Côtes 6×1 min** puis **S2 = Seuil 2×12 min** — 24 min à haute intensité en
  semaine 2 de « Reprise ». Trop dur pour une reprise, et incohérent avec la règle du prompt.
- **La règle de progressivité est vague** dans `01-generation-trail.md` (« débutant : commence à
  4–5 min total utiles ») et **absente du contrat de sortie** → rien ne garantit qu'une
  prochaine génération respecte la rampe.

## 2. Décisions

- **Hybride** : la donnée (`week.quality_session`) garde un corps **court mais complet**
  (allure + **RPE** + récup) ; le front structure l'affichage en **3 phases**.
- **Échauffement ~10 min / retour au calme ~10 min** (valeurs de l'utilisateur), affichés par le
  front, jamais stockés dans le libellé.
- **RPE (effort perçu, 1–10)** ajouté à chaque intensité, partout.
- **Progressivité** : re-rampe des premières semaines du plan de référence + **barème par niveau
  codifié** dans le contrat de sortie et les prompts (pour que ce soit vérifiable, pas implicite).

## 3. Échelle d'intensité (RPE) — vocabulaire commun

À afficher une fois dans l'app (aide contextuelle du jour qualité) et à respecter partout :

| RPE | Ressenti | Test de parole | Usage dans le plan |
|---|---|---|---|
| 1–2 | marche | — | récup marche |
| 3–4 | très facile | phrases complètes | échauffement, retour au calme, footings, récup en trot |
| 5–6 | modéré | phrases longues | initiation course/marche, côtes en marche rapide |
| **7** | soutenu mais tenable | phrases courtes | **seuil**, allure course |
| **8** | dur | 3–4 mots | **côtes 30 s–2 min** |
| **9** | très dur, quasi max | 1 mot | **VMA**, lignes droites 20 s |
| 10 | sprint maximal | rien | **jamais** dans ce plan |

## 4. Table de conversion des libellés (source de vérité du contenu)

Format cible : `Famille : NxDurée allure (RPE X/10), récup : …`. À appliquer partout où le
libellé apparaît (`.md`, `seed.py`, JSON générés, DB prod).

| Avant | Après |
|---|---|
| Côtes : 5×1 min vif | Côtes : 5×1 min vif (RPE 8/10), récup : redescente en trot |
| Côtes : 6×1 min | Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot |
| Côtes : 6×1 min (récup en descendant) | Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot |
| Côtes : 8×1 min | Côtes : 8×1 min vif (RPE 8/10), récup : redescente en trot |
| Côtes : 10×1 min | Côtes : 10×1 min vif (RPE 8/10), récup : redescente en trot |
| Côtes : 8×1 min + descente | Côtes : 8×1 min vif (RPE 8/10), récup : redescente en trot — 3 dernières descentes appuyées (RPE 6/10) |
| Côtes : 6×2 min (léger) | Côtes : 6×2 min contrôlé (RPE 6–7/10), récup : redescente en trot |
| Côtes : 6×30 s (course) | Côtes : 6×30 s allure course (RPE 8/10), récup : redescente en marche |
| Côtes en marche rapide : 6×1 min | Côtes en marche rapide : 6×1 min (RPE 6/10), récup : redescente tranquille |
| Côtes longues : 5×2 min | Côtes longues : 5×2 min soutenu (RPE 8/10), récup : redescente en trot |
| Côtes longues : 6×2 min | Côtes longues : 6×2 min soutenu (RPE 8/10), récup : redescente en trot |
| Lignes + côtes courtes : 5×1 min vif | Lignes + côtes courtes : 5×1 min vif (RPE 8/10), récup : 1 min 30 marche/trot |
| Lignes droites : 6×20 s (activation) | Lignes droites : 6×20 s rapides (RPE 9/10), récup : retour en marche |
| Activation : 5×20 s lignes (veille) | Activation veille de course : 5×20 s rapides (RPE 9/10), récup : retour en marche |
| Footing souple + 4 lignes | Footing souple (RPE 3–4/10) + 4 lignes droites ~20 s (RPE 9/10), récup : retour en marche |
| Footing souple continu 20 min | Footing souple continu 20 min (RPE 3–4/10), aucune intensité |
| Initiation : 8×(1 min course / 1 min marche) | Initiation : 8×(1 min course RPE 5/10 / 1 min marche) — la marche est la récup |
| Initiation : 8×(2 min course / 1 min marche) | Initiation : 8×(2 min course RPE 5–6/10 / 1 min marche) — la marche est la récup |
| Seuil doux : 2×6 min | Seuil doux : 2×6 min (RPE 6–7/10), récup 3 min trot |
| Seuil : 2×10 min | Seuil : 2×10 min (RPE 7/10), récup 3 min trot |
| Seuil : 2×10 min (allure course) | Seuil : 2×10 min allure course (RPE 7/10), récup 3 min trot |
| Seuil : 2×12 min | Seuil : 2×12 min (RPE 7/10), récup 3 min trot |
| Seuil : 3×10 min | Seuil : 3×10 min (RPE 7/10), récup 3 min trot |
| Seuil : 3×12 min | Seuil : 3×12 min (RPE 7/10), récup 3 min trot |
| VMA : 5×3 min (récup 3 min) | VMA : 5×3 min (RPE 9/10), récup 3 min trot |
| VMA courte : 6×2 min (récup 2 min) | VMA courte : 6×2 min (RPE 9/10), récup 2 min trot |
| Repos / 20 min footing | Repos, ou 20 min de footing très facile (RPE 3/10) |

## 5. Progressivité

### 5.1 Re-rampe du plan de référence 13 semaines (`.md` + `seed.py`)

Seules les **4 premières semaines** changent (bloc Reprise/Base) ; S5→S13 sont conservées.
Le volume « utile » = temps cumulé à RPE ≥ 7.

| S | Avant (utile) | Après (utile) | Raison |
|---|---|---|---|
| S1 | Côtes : 6×1 min — 6 min | **Lignes droites : 6×20 s rapides (RPE 9/10), récup : retour en marche** — 2 min | Reprise neuromusculaire, aucun dégât musculaire |
| S2 | Seuil : 2×12 min — 24 min | **Côtes : 6×30 s allure course (RPE 8/10), récup : redescente en marche** — 3 min | 24 min de seuil en S2 était le pic du plan… en semaine 2 |
| S3 | Côtes : 8×1 min — 8 min | **Côtes : 6×1 min vif (RPE 8/10), récup : redescente en trot** — 6 min | Première vraie séance de côtes |
| S4 | Seuil : 2×10 min — 20 min | **Seuil doux : 2×6 min (RPE 6–7/10), récup 3 min trot** — 12 min | Introduction du seuil |

Rampe résultante du volume utile : 2 → 3 → 6 → 12 → (S5) 8 → (S6) 20 … progression sans saut
brutal, et le pic reste en S9–S12.

### 5.2 Barème par niveau — codifié pour les générations futures

À ajouter dans `docs/modele-donnees/contrat-de-sortie.md` et repris dans les prompts 01/03.
Niveau déduit de l'intake (`court_deja`, `course.volume_hebdo_km`, `course.experience_trail`).

| Niveau | 1ʳᵉ séance qualité (volume utile RPE ≥ 7) | Plafond en semaine de pic |
|---|---|---|
| `court_deja = false` | **0 min** — marche/course alternée (RPE 5–6) pendant ≥ 2 semaines | 8–10 min |
| débutant (< 20 km/sem) | 2–3 min (lignes 20 s, côtes 30 s) | 12–15 min |
| intermédiaire (20–40 km/sem) | 5–6 min | 20–25 min |
| confirmé (> 40 km/sem) | 8–10 min | 30 min |

Règles associées : progression du volume utile **≤ ~15 %/sem**, **jamais de doublement** d'une
semaine à l'autre ; **RPE 9 (VMA) interdit avant la 4ᵉ semaine** pour un profil débutant ou
`court_deja = false` ; toute `quality_session` **doit** porter allure + `(RPE X/10)` + récup.

## 6. Affichage front — 3 phases

- `sessionForDay` (jour 4) expose, en plus de `detail` (phrase une-ligne conservée pour la carte
  « ↪ Reporté ») : `phases: Array<{ label: string; text: string }>` =
  1. **Échauffement** — « ~10 min footing progressif (RPE 3–4/10) » ;
  2. **Corps de séance** — le libellé DB (allure + RPE + récup) ;
  3. **Retour au calme** — « ~10 min très facile (RPE 3/10) ».
- `DaySessionDetail` : si `sess.phases` existe → rendu 3 lignes (label petites majuscules muted +
  texte), puis « ≈ {min} min en tout · ~{km} km ». Sinon, comportement actuel.
- Une ligne d'aide repliée sous le corps : **« RPE = effort perçu sur 10 : 7 = phrases courtes,
  8 = 3–4 mots, 9 = quasi max »** (rappel de l'échelle sans quitter l'écran).
- `DaySession` gagne `phases?: Array<{ label: string; text: string }>`. Nouveau CSS `.qual-phase*`
  (append en fin d'`index.css`).
- La box « Qualité · jeudi » du détail de semaine continue d'afficher `w.qual` brut.

## 7. Propagation des données

1. `plan/plan_trail_descriptif.md` — table §4 + re-rampe §5.1 (S1–S4).
2. `backend/app/seed.py` — idem (mêmes chaînes).
3. `docs/generated/trail-20k-740-4s-auriane/programme-trail-20k-740-4s-auriane.json` et
   `docs/generated/trail-20k-740-15s-aureltest/programme-trail-20k-740-15s-aureltest.json` —
   table §4 uniquement (leur rampe est déjà bonne). Les `01-trail.json` (artefacts de travail)
   ne sont pas touchés.
4. **Prod** : script one-shot `backend/app/update_quality_sessions.py` — table §4 en dur,
   `UPDATE week SET quality_session = <après> WHERE quality_session = <avant>` sur tous les
   programmes ; affiche le nombre de lignes par libellé ; piloté par `DATABASE_URL` (prod = URL
   Neon des env-vars Render, jamais le `.env` local). **Idempotent** (relançable sans effet).
   La re-rampe §5.1 concerne le plan de référence : les semaines 1–4 du programme 13 s en base
   sont mises à jour par le même script, **par numéro de semaine et par programme**, uniquement
   si le libellé actuel correspond à l'« avant » attendu (sinon : ignoré + avertissement).
5. **Génération future** : `docs/modele-donnees/contrat-de-sortie.md` (barème §5.2 + format
   obligatoire du libellé) et les prompts `01-generation-trail.md` / `03-generation-hybride.md`.

## 8. Hors périmètre (YAGNI)

- Pas de migration de schéma (aucun champ warmup/body/cooldown séparé en DB).
- Pas de personnalisation des durées d'échauffement/retour par semaine ou par niveau.
- L'heuristique du temps total (`sessionTarget`) est inchangée.
- Pas de recalcul des allures en min/km (le RPE suffit et ne dépend pas du terrain).

## 9. Vérification

- `tsc` + `build` verts ; preview : jour qualité en 3 phases (desktop + mobile) avec le RPE
  visible ; carte « ↪ Reporté » d'une qualité toujours lisible en une ligne.
- Les 27 libellés convertis relus ; aucun libellé résiduel sans `(RPE` dans `.md`, `seed.py`
  et les 2 JSON (vérifiable par `grep`).
- Script prod : lignes modifiées = attendu ; **re-lancement → 0 modification** (idempotence).
- Spot-check prod : S9 affiche « Côtes longues : 5×2 min soutenu (RPE 8/10), récup : redescente
  en trot » en corps de séance.
