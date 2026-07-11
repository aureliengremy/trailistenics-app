# Totaux hebdo dans « Le plan » · saisie D+ réalisé · courbe Réalisé continue

**Date :** 2026-07-11
**Statut :** validé (design), prêt pour le plan d'implémentation.

## 1. Contexte & objectif

Trois problèmes remontés par l'utilisateur (avec captures) :

1. **« Le plan » — détail d'une semaine** : les boxes actuelles (« Séances / sem »,
   « D+ sur la longue ») ne donnent pas la vision **globale de la semaine** (km totaux,
   temps total, D+, séances dont renfo) ni l'avancement réalisé.
2. **Pas de saisie du dénivelé réalisé** : l'utilisateur fait du D+ sur des footings
   (ex. ~100 m sur un footing libre) et veut le compter face à son objectif D+. Le
   « réalisé » D+ du graphe est aujourd'hui simulé (= D+ prévu si la longue est cochée).
3. **Graphe Progrès cassé par une semaine vide** : les `weekRealized*` renvoient `null`
   pour une semaine sans saisie et `connectNulls={false}` coupe la courbe — bloquée à S4
   alors qu'on est S6 (S5 non courue), avec un point isolé en S6.

## 2. Décisions (cadrage validé)

- **Semaine passée vide → la courbe Réalisé descend à 0** (honnête, ligne continue).
- **Champ « D+ réalisé » sur toutes les sorties** (longue, qualité, footings, « couru
  quand même », bonus), **optionnel** : ne conditionne pas le « ✓ Réalisé » vert
  (qui reste durée + km).
- **Semaine en cours sans aucune saisie → `null`** (pas de plongeon à 0 un lundi matin) ;
  dès la première saisie, la somme courante s'affiche.
- Détail de semaine : **approche « enrichir sur place »** (garder les cartes Sortie
  longue / Qualité, remplacer les deux demi-boxes par une grille de 4 totaux prévus,
  ajouter l'avancement `WeekObjectives` pour les semaines ≤ en cours).
- **Aucun changement backend** : `dpos` s'ajoute au blob JSON `user_progress`
  (champ absent = `{}` pour les anciennes données).

## 3. Détail de semaine « Le plan » (mobile `WeekDetailM` + desktop `Plan`)

- Nouvelle fonction `weekPlannedDpos(w)` = `w.dpos` (le D+ planifié vit sur la longue).
- La grille remplace « Séances / sem » et « D+ sur la longue » par **4 totaux prévus** :
  - **Distance** : `weekPlannedKm(w)` km
  - **Temps** : `weekPlannedMin(w)` min
  - **D+** : `weekPlannedDpos(w)` m
  - **Séances** : `w.sea` (le mardi renfo est l'une d'elles — affiché « {sea} dont renfo »)
- Les cartes « Sortie longue · dimanche » et « Qualité · jeudi » sont conservées.
- **Avancement** : `<WeekObjectives>` (version 4 stats, cf. §4) rendu sous la grille,
  **uniquement si `w.n <= currentWeek(new Date())`** (pas de « réalisé » pour le futur).
- Mise en page : mêmes classes `d-dbox half` / boxes mobiles existantes (2×2).

## 4. Saisie du D+ réalisé

- `ProgressState` gagne `dpos: Record<string, number>` — clé `${semaine}-${séance}`,
  identique à `km`/`dur` (ex. `"6-easyW"`). `normalize()` défaut `{}`. Nouvelle action
  `setDpos(k, val | null)` (même sémantique que `setKm`/`setDur` : `null` efface,
  déclenche la synchro DB).
- `KmField` : 3ᵉ input **« m D+ »** optionnel, après durée et km, même style ; affiche
  l'objectif `~{plannedDpos} m` quand fourni (prop `plannedDpos?`). Le bord vert
  « ✓ Réalisé » reste conditionné à durée + km remplis (D+ ignoré).
- `plannedDposFor(sessKey, w)` : `w.dpos` pour `longue`, `null` sinon (pas d'objectif
  D+ par séance hors longue).
- **Séances bonus** : le formulaire bonus gagne aussi le champ D+ (stocké dans la
  `BonusSession` → nouveau champ optionnel `dpos: number | null`).
- **Correction d'une lacune découverte** : les bonus ne comptent pas aujourd'hui dans
  les totaux réalisés (contrairement à l'intention de la spec du tableau de bord).
  On les intègre : `weekRealizedKm` ajoute les `km` des bonus de la semaine ;
  `weekRealizedDpos` ajoute leurs `dpos`. (`weekRealizedMin`/`Sessions` inchangés :
  un bonus n'a pas de durée et ne compte pas comme séance du plan.)
- `weekRealizedDpos(w, s)` = somme des `dpos` de la semaine (map `dpos` + bonus).
- La métrique graphe **« Dénivelé D+ »** utilise `weekRealizedDpos` (supprime la
  simulation « D+ prévu si longue cochée »).
- `WeekObjectives` passe de 3 à **4 mini-stats** : distance, temps, **D+**, séances —
  partout où il est rendu (écran Aujourd'hui mobile + desktop, et désormais « Le plan »).

## 5. Courbe « Réalisé » continue

- Helper commun dans `lib/plan.ts` (utilisé par les 4 métriques de `CHART_METRICS`) :

  ```
  realizedForChart(w, s, sum):
    cur = currentWeek(aujourd'hui)
    si w.n > cur            → null            (futur : pas de courbe)
    v = sum(w, s)                              (somme réelle, null si aucune saisie)
    si w.n < cur            → v ?? 0           (passé vide : plonge à 0)
    sinon (semaine en cours) → v               (null si rien saisi, sinon somme)
  ```

- Appliqué à : temps (`weekRealizedMin`), distance (`weekRealizedKm`),
  D+ (`weekRealizedDpos`), séances (`weekRealizedSessions`).
- `connectNulls` reste `false` : plus aucun trou dans le passé → courbe continue de S1
  à la semaine courante ; rien au-delà.

## 6. Ce qui ne change pas (YAGNI)

- Aucun changement backend/API/migration (le blob JSON absorbe `dpos`).
- Pas d'objectif D+ par séance hors longue (pas de répartition inventée).
- Le « ✓ Réalisé » vert (durée + km) et la logique de validation renfo sont inchangés.
- Le prévu du graphe (`planned`) est inchangé.

## 7. Vérification (pas de framework de test front)

- `npx tsc --noEmit` + `npm run build` verts.
- Preview : (a) graphe Distance avec S5 vide → la courbe plonge à 0 en S5 et remonte
  en S6, plus de point isolé ; (b) saisie D+ sur un footing → répercutée dans
  WeekObjectives et la métrique D+ du graphe ; (c) détail S6 dans « Le plan » →
  4 totaux prévus + avancement ; une semaine future n'affiche pas d'avancement ;
  (d) rétro-compat : progression existante sans `dpos` se charge sans erreur ;
  (e) une séance bonus avec km + D+ compte dans le réalisé de la semaine.

## 8. Critères de réussite

- Le détail d'une semaine répond à « qu'est-ce que cette semaine représente au global,
  et où j'en suis ? » sans quitter « Le plan ».
- Le D+ réalisé se saisit sur n'importe quelle sortie et compte dans Progrès.
- La courbe Réalisé est continue de S1 à la semaine en cours, quelles que soient les
  semaines manquées.
