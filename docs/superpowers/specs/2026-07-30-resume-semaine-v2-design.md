# Détail de semaine « Le plan » v2 — le résumé hebdo d'abord + détail par sortie

**Date :** 2026-07-30 · **Statut :** validé (demande explicite de l'utilisateur, screenshot à l'appui).

## 1. Contexte

La v1 (spec 2026-07-11, mergée le 30/07 mais pas encore déployée au moment de la demande)
a ajouté les 4 totaux hebdo prévus + « Avancement » au détail de semaine, MAIS en les
plaçant APRÈS les cartes « Sortie longue · dimanche » et « Qualité · jeudi ». Retour
utilisateur : « je veux le résumé de la semaine, pas juste la sortie longue ou la qualité
jeudi » — le résumé global doit dominer, et il veut le **détail des km par sortie**
(« mardi ~5 km, jeudi ~7 km, etc. »).

## 2. Changements (mobile `WeekDetailM` + desktop `Plan`)

1. **Réordonner la grille** : les 4 totaux hebdo (Distance totale / Temps de course /
   Dénivelé D+ / Séances dont renfo) passent EN TÊTE ; les cartes « Sortie longue » et
   « Qualité » suivent (elles restent utiles : contenu des 2 séances clés).
2. **Détail par sortie** : sous la grille, une ligne discrète
   `Par sortie : mar ~5 km · jeu ~7 km · sam ~8 km · dim ~17 km`
   - Nouvelle fonction `weekKmBreakdown(w)` dans `lib/plan.ts` : les sorties prévues
     (`weekRunKeys`) → `{ dow, km }` via `PLANNED_DOW` et `sessionTarget`, filtrées sur
     `km != null`, triées lundi→dimanche (dimanche = 7).
   - Rendu partagé desktop/mobile, classe CSS commune `.wk-breakdown` (append en fin
     d'`index.css` : 12px, `var(--muted)`).
3. **Aucun autre changement** : « Avancement », focus, « jour par jour » inchangés.

## 3. Vérification

`tsc` + `build` verts ; contrôle visuel : totaux en tête, ligne « Par sortie » cohérente
avec `Distance totale` (la somme des éléments ≈ le total affiché).
