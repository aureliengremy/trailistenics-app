# Refonte de l'écran « Aujourd'hui » — Tableau de bord semaine

**Date :** 2026-06-24
**Statut :** validé (design), prêt pour le plan d'implémentation.

## 1. Contexte & objectif

L'écran d'accueil « Aujourd'hui » (mobile + desktop) ne convient pas à l'utilisateur :
dense, redondant (le bloc « Les 3 séances clés de la semaine » répète des infos, le renfo
apparaît deux fois), et trop centré sur « le jour » alors que l'utilisateur raisonne **à la
semaine** (il court au feeling, décale ses séances au lendemain).

**Objectif :** transformer l'écran en **tableau de bord hebdomadaire** : vue d'ensemble de la
semaine, repérage immédiat des jours d'entraînement, objectifs hebdo (prévu/réalisé), et
gestion de **n'importe quel jour** (valider, saisir, reporter) **sans quitter l'accueil**.

## 2. Décisions (cadrage validé)

- **Direction retenue : « Tableau de bord semaine »** (parmi 3 propositions : Focus du jour /
  Tableau de bord / Timeline).
- **Interaction jour : le jour s'ouvre sur place** — taper un jour de la bande déplie son détail
  juste en dessous (aujourd'hui ouvert par défaut).
- **Portée : mobile ET desktop** (même logique, mises en page adaptées).
- **Aucun changement backend** : tout vient déjà de `user_progress` (`sessions`, `km`, `dur`,
  `moved`, `bonus`) et du programme. Une seule nouvelle brique UI (`WeekStrip`).

## 3. Structure / hiérarchie de l'écran

De haut en bas (mobile en colonne ; desktop pleine largeur, en-tête + objectifs en ligne) :

1. **En-tête semaine**
   - Date du jour (« jeudi 25 juin »), « Semaine N / total », bloc en cours (couleur du bloc).
   - **Anneau de complétion** = séances faites cette semaine / séances prévues (`w.sea`).
   - Remplace la carte latérale desktop « Semaine en cours » (fusionnée ici).
2. **Objectifs de la semaine** — 3 mini-stats **réalisé / prévu** :
   - **Distance** (km) · **Temps de course** (min) · **Séances** (faites / `w.sea`).
   - Mêmes chiffres que le graphe Progrès — réutilise `weekPlannedKm/Min`, `weekRealizedKm/Min`
     (lib/plan) et le comptage de séances cochées.
3. **Bande des 7 jours** (lun→dim) — composant `WeekStrip` (nouveau).
4. **Détail du jour sélectionné**, déplié sous la bande (aujourd'hui par défaut).

## 4. La bande des 7 jours (`WeekStrip`)

Chaque jour affiche : abrév. (lun…dim) + **date du jour calendaire** (via `weekDayDate`) +
une **icône de type** + un **état visuel**.

**Types de séance** (depuis `sessionForDay`) : renfo (force), qualité (intensité), longue
(endurance), footing (souple), repos.

**États d'un jour :**
- **fait** : la séance du jour est validée (vert, ✓).
- **aujourd'hui** : surligné ocre ; sélectionné par défaut.
- **sélectionné** : bordure ocre (suit le tap).
- **à venir** : couleur du type (ciel pour footing/qualité/renfo, moss pour la longue).
- **repos** : atténué.
- **reporté (↪)** : un jour dont la séance a été déplacée (`moved`) — vers (origine) ou depuis
  (arrivée). Marque ↪ sur le(s) jour(s) concerné(s).

**Interaction :** taper un jour le sélectionne et déplie son détail (section 5). Aujourd'hui est
sélectionné à l'ouverture de l'écran.

## 5. Détail du jour (déplié sur place)

Recompose les briques existantes (pas de nouvelle logique de suivi) :

- **Séance courue** (footing, qualité, longue) : tag + type, **objectif chiffré** (`sessionTarget`
  → ~min / ~km), bouton **Valider**, **`KmField`** (durée + distance réalisées), **`MoveControls`**
  (« Reporter au lendemain »).
- **Renfo (mardi)** : **`ExerciseChecklist`** (lecture seule) + **`RenfoActions`** (Valider le
  renfo / Ouvrir la page Renfo) + le footing associé (`KmField`).
- **Repos** : note + action **« Pas prévu ? J'ai couru »** → bascule en « couru quand même »
  (saisie km/durée), comme aujourd'hui.
- **Séance reportée arrivant ce jour** : affichée comme carte « ↪ Reporté » (réutilise
  `ArrivalCard` / la logique de `SessionMove`), non dupliquée avec le libellé du jour.

## 6. Souplesse (besoins explicites de l'utilisateur)

- **Décaler une séance** : taper le jour → « Reporter à demain » → la séance migre (marquée ↪).
- **Courir au feeling** : taper n'importe quel jour (y compris repos) → saisir km/durée → la
  séance compte dans les objectifs hebdo (séance « couru quand même » ou bonus).
- Les **objectifs hebdo** en haut se recalculent à chaque saisie (cohérent avec Progrès).

## 7. Ce qui est supprimé / réutilisé

**Supprimé de l'écran Aujourd'hui :**
- Le bloc « Les 3 séances clés de la semaine » (redondant — couvert par la bande + le détail).
- La carte latérale desktop « Semaine en cours » (fusionnée dans l'en-tête).
- La double présentation du renfo (À faire + 3 clés).

**Nouveau :** composant `WeekStrip` (7 pastilles jour, états).

**Réutilisé tel quel :** `SessionCard`, `ExerciseChecklist`, `KmField`, `RenfoActions`,
`MoveControls` / `MovedSessions` / `ArrivalCard`, `Ring`, `BonusSection` (accessible depuis le
détail d'un jour ou en bas), helpers `sessionForDay`, `sessionTarget`, `weekDayDate`,
`weekPlannedKm/Min`, `weekRealizedKm/Min`, `currentWeek`.

## 8. Desktop

Pleine largeur : en-tête (anneau + semaine + bloc) et objectifs hebdo en ligne ; bande des 7
jours sur toute la largeur ; détail du jour sélectionné déplié dessous (carte pleine largeur).
Le `WeekStrip` et le détail sont **partagés** avec le mobile (mêmes composants, styles `.d-*` /
`.m-*`).

## 9. Cas limites

- **Avant le début du plan** / **après la fin** : `currentWeek` est borné ; la semaine affichée
  reste 1 (à venir) ou la dernière. La bande montre la semaine courante.
- **Plusieurs sorties le même jour** (feeling) : la saisie s'ajoute ; le surplus peut aller en
  séance bonus (logique existante).
- **Programme ≠ 13 semaines** : tout utilise `plan.weeks.length` (pas de `/13` codé en dur).
- **Jour de repos couru** : géré par « couru quand même » (clés `repos1`/`repos5`).

## 10. Hors périmètre (YAGNI)

- Pas d'intégration Strava/Garmin ici (cf. `docs/integrations/`).
- Pas de drag-and-drop pour déplacer une séance (le bouton « Reporter » suffit).
- Pas de modification du modèle de données ni du backend.
- Nettoyage des autres `/13` codés en dur (sidebar, pager du Plan) : **cleanup connexe** à faire
  en parallèle, hors de cette refonte.

## 11. Critères de réussite

- L'écran répond d'un coup d'œil à : « où j'en suis cette semaine ? » et « qu'est-ce qui est
  prévu chaque jour ? ».
- On peut **valider / saisir / reporter** n'importe quel jour depuis l'accueil, sans aller dans
  « Le plan ».
- Les objectifs hebdo (distance/temps/séances) sont **cohérents** avec le graphe Progrès.
- Plus de redondance (un seul endroit par séance).
- Fonctionne mobile et desktop, thème clair/sombre, sans changement backend.
