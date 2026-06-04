# Idées de features — Plan Trail / Trailistenics

Propositions de fonctionnalités supplémentaires, classées par effort et par valeur.
Rien ici n'est engagé : c'est une base de discussion. Coche / annote ce qui t'intéresse.

> Contexte actuel : app de suivi (desktop dashboard + mobile à onglets), données via API
> FastAPI/PostgreSQL, progression persistée en `localStorage`. Voir `CLAUDE.md`.

---

## 🟢 Quick wins (faible effort, valeur immédiate)

- [ ] **Note de séance + ressenti** — un champ libre + une échelle RPE (effort perçu 1–10)
      par séance réalisée. Stocké à côté des km.
- [ ] **Météo du jour** sur l'écran Aujourd'hui (API open-meteo, gratuite, sans clé) —
      pertinent pour une séance en extérieur.
- [ ] **Streak / régularité** — nombre de jours consécutifs avec au moins une séance validée,
      petit badge dans le header.
- [ ] **Bouton « séance reportée / sautée »** — distinguer *non fait* de *reporté*, pour des
      stats honnêtes (cf. principe anti-surcharge : sauter est parfois la bonne décision).
- [ ] **Partage / export** — bouton « exporter ma progression » (JSON + résumé texte) et
      « importer » pour changer d'appareil sans backend.
- [ ] **Lien `.ics`** — ajouter les 3 séances clés de la semaine au calendrier (Google/Apple).

## 🟡 Moyennes (vraie valeur produit)

- [ ] **Persistance serveur de la progression** — aujourd'hui tout est en `localStorage`
      (perdu si on change d'appareil / vide le cache). Table `progress` côté API + identifiant
      simple (PIN ou magic-link), pour synchroniser mobile ↔ desktop.
- [ ] **Décalage de plan / date de début configurable** — `PLAN_START` est figé au 2 juin 2026.
      Permettre de choisir sa date de course et recaler les 13 semaines automatiquement.
- [ ] **Séance qualité détaillée** — la séance du jeudi alterne côtes / seuil ; la déplier en
      blocs (échauffement, série, récup, retour au calme) avec un minuteur d'intervalles.
- [ ] **Historique réel des renfos** — le graphe « exercices par semaine » existe ; y ajouter
      les séries/charges saisies par exercice pour suivre la progression de force dans le temps.
- [ ] **Adaptation à la forme** — un check-in rapide (sommeil, fraîcheur jambes, douleur) qui
      suggère d'alléger (ex. footing au lieu de côtes) en respectant la règle « jamais empiler
      les quadriceps ».
- [ ] **Mode hors-ligne (PWA)** — manifest + service worker : installable sur l'écran d'accueil,
      utilisable sans réseau sur le terrain. Très pertinent pour le trail.
- [ ] **Vidéos renfo en cache** — pré-charger/mettre en cache les démos pour les zones sans data.

## 🟠 Ambitieuses (différenciation forte)

- [ ] **Import GPX / montre** — récupérer distance, D+ et durée réels depuis Strava/Garmin
      (OAuth) et auto-remplir les km réalisés. Comparer prévu vs réalisé sur le graphe de charge.
- [ ] **Estimateur de temps de course** — à partir des sorties longues réalisées (allure, D+),
      projeter un temps cible sur le 20 km / 740 m D+.
- [ ] **Charge & fraîcheur (ACWR)** — calcul du ratio charge aiguë / chronique pour signaler les
      semaines à risque de surentraînement, cohérent avec la philosophie anti-surcharge du plan.
- [ ] **Plan multi-distances** — généraliser le moteur (13 semaines / 20 km) à d'autres objectifs
      (10 km, 40 km, D+ variable) en gardant les principes (descente, anti-quadriceps).
- [ ] **Coach IA** — un résumé hebdo généré (Claude) : « ce qui s'est bien passé, ce qu'il reste,
      le focus de la semaine prochaine » à partir des données de progression.

## 🔧 Qualité / technique (non visible mais utile)

- [ ] **Tests** — Vitest + React Testing Library sur `sessionForDay`, `realizedStats`, `scopeWeeks`,
      et tests d'API (pytest) côté backend.
- [ ] **Migration `localStorage` versionnée** — un schéma `v2` propre avec migration depuis `v1`
      (le modèle `ex` est passé d'un index global à `${semaine}-${index}`).
- [ ] **Accessibilité** — passe a11y complète (focus visible, navigation clavier de la modal et
      des accordéons, `aria-current` sur le jour réel, contrastes en thème clair).
- [ ] **Seed enrichi** — déplacer le micro-cycle jour-par-jour (aujourd'hui codé en dur dans
      `sessionForDay`) vers la donnée, pour que le contenu de chaque jour soit éditable sans code.
- [ ] **CI** — lint + typecheck + build + tests sur chaque push (GitHub Actions).

---

### Mes 3 recommandations pour la suite

1. **Persistance serveur de la progression** — c'est la limite la plus gênante aujourd'hui
   (un cache vidé efface tout). Débloque aussi la synchro mobile ↔ desktop.
2. **Date de début configurable** — rend l'app réutilisable d'une saison à l'autre sans toucher
   au code, et corrige le `PLAN_START` figé.
3. **PWA hors-ligne** — usage cible = sur le terrain, souvent sans réseau. Fort impact, effort
   raisonnable.
