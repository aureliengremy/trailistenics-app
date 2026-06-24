# Intégration Garmin — note de faisabilité (récupération des sorties)

> **Statut : exploratoire.** Même objectif que la note Strava ([`strava.md`](strava.md)) :
> récupérer automatiquement les sorties course pour **pré-remplir le « réalisé »** de l'app
> (distance, durée, **D+**). **Aucun code n'est écrit.** Garmin fonctionne très différemment de
> Strava — ce document met l'accent sur ces différences et leurs conséquences.

---

## 1. Pourquoi (la valeur) — identique à Strava

- Supprimer la **saisie manuelle** du réalisé (`user_progress.data.km`/`.dur`, clé `${semaine}-${séance}`).
- Capter le **D+ réalisé** (non saisissable aujourd'hui) via `totalElevationGainInMeters`.
- Fiabiliser le comparatif **prévu/réalisé** du graphe Progrès.
- Public cible pertinent : beaucoup de traileurs portent une **montre Garmin** → données natives,
  précises (GPS + baro pour le D+), sans dépendre d'un partage Strava.

---

## 2. La grande différence : un programme **partenaire (B2B)**, pas du self‑service

Contrairement à Strava (où **chaque développeur** crée une app en quelques minutes), l'accès aux
données Garmin passe par le **Garmin Connect Developer Program**, qui est **réservé aux entités
légales** et soumis à approbation :

| Point | Réalité Garmin |
|---|---|
| **Éligibilité** | **Pas d'usage personnel.** Il faut postuler en tant qu'**entité légale** (société, université, hôpital, institut…). ([Program FAQ](https://developer.garmin.com/gc-developer-program/program-faq/)) |
| **Validation** | Garmin confirme le statut sous ~**2 jours ouvrés** ; si approuvé → accès au portail développeur + **environnement d'évaluation**. |
| **Coût** | **Gratuit** une fois approuvé (pas de quota payant façon Strava). |
| **Disponibilité** | ⚠️ Le programme **a été signalé « en pause »** par endroits (création de compte suspendue). **À reconfirmer** au moment d'avancer — c'est un risque bloquant. ([référence](https://www.spikeapi.com/blog/why-integrate-garmin-api-directly)) |
| **OAuth** | **Activity API = OAuth 2.0 PKCE** ; Health API = OAuth 1.0a (legacy). ([OAuth2 PKCE spec](https://developerportal.garmin.com/sites/default/files/OAuth2PKCE_1.pdf)) |

> **Conséquence directe pour Trailistenics** : tant qu'il n'y a pas d'**entité légale** pour
> porter la demande (et que le programme est ouvert), l'intégration **directe** n'est pas
> accessible — alors que **Strava l'est immédiatement** pour un projet perso. C'est le critère
> n°1 de décision (cf. §8 comparatif et §9 alternatives).

---

## 3. Quelle API Garmin pour notre besoin

Le programme expose plusieurs API ; pour **importer des runs** on vise l'**Activity API** :

- **Activity API** (OAuth 2.0 PKCE) — **la bonne** : résumés d'activité (distance, durée, D+),
  détails par seconde (GPS, FC, allure) et **fichiers d'activité** en **.FIT / .GPX / .TCX**.
  30+ types d'activité. ([Activity API](https://developer.garmin.com/gc-developer-program/activity-api/))
- **Health API** (OAuth 1.0a) — bien‑être (pas, sommeil, FC repos, stress). **Pas nécessaire** ici.

### Champs utiles d'un résumé d'activité
`activityType` (`RUNNING`, `TRAIL_RUNNING`…), `startTimeInSeconds` (epoch) + offset fuseau,
`distanceInMeters`, `durationInSeconds` (et `movingDurationInSeconds`), `totalElevationGainInMeters`.
→ tout ce qu'il faut pour remplir `km`, `dur`, `dplus`. Le détail (allure/FC/carte) se récupère via
l'URL de détail incluse dans la notification.

---

## 4. Le modèle est **push‑first** (webhook obligatoire)

Là où Strava se prête bien au *pull* (« je liste tes activités »), Garmin est conçu autour du **push** :

- **Ping / Push** : quand la montre **synchronise**, Garmin **notifie notre backend** sur un
  **endpoint public enregistré** ; la notification contient une **`callbackURL`** pour aller
  chercher les données (ou pousse directement le résumé). ([callback sync](https://openwearables.io/blog/garmin-api-push-notifications-how-callback-sync-works))
- **Backfill** (historique) : même endpoint, **90 jours max par requête** (multiples requêtes pour
  plus) ; à noter, le **backfill des *détails* d'activité est PUSH‑only**. ([backfill](https://developerportal.garmin.com/blog/activity-files-and-activity-backfill))

> **Implication archi** : un **endpoint webhook public et validé** est **indispensable** (pas
> seulement « optionnel » comme chez Strava). Notre backend FastAPI (Render) peut l'exposer.

---

## 5. Architecture proposée pour Trailistenics (sans la coder)

Très proche de la note Strava, avec le push au centre :

```
Front (React)               Backend (FastAPI)                  Garmin
─────────────               ─────────────────                  ──────
[Connecter Garmin] ──▶  GET /api/garmin/connect ──▶ autorisation OAuth2 PKCE
   callback ◀───────────  GET /api/garmin/callback ◀── (code) → tokens (chiffrés)
                              │ stocke tokens (table garmin_account)
                              │ (option) backfill 90 j → pré-remplit l'historique
                              ▼
  Montre synchronise ──▶  POST /api/garmin/webhook ◀── Garmin (ping/push)
                              │ va chercher le résumé (callbackURL) si ping
                              │ mappe run → séance (semaine+jour)
                              │ écrit km/dur/dplus dans user_progress.data
```

- **Tokens** : nouvelle table `garmin_account` (`owner_id`, `access_token`, `refresh_token`,
  `expires_at`, `garmin_user_id`, scope), **chiffrés au repos**, refresh côté backend.
- **Écriture** : même format que la saisie manuelle (`user_progress.data.km`/`.dur` + un `dplus`
  réalisé à ajouter), avec un index `garmin.<summaryId>` → clé séance (anti‑doublon, dé‑import).
- **Webhook** : endpoint public **validé**, vérification d'origine, idempotent (re‑livraisons).

---

## 6. Logique de matching : un run Garmin → une séance du plan

**Identique à Strava** (la logique de rattachement ne dépend pas de la source) :

1. Filtrer `RUNNING` / `TRAIL_RUNNING`.
2. `startTimeInSeconds` → **semaine** (logique `currentWeek`, lundi→dimanche) → **jour** → **clé séance**.
3. Remplir `km` (`distanceInMeters`/1000), `dur` (`durationInSeconds`/60), `dplus` (`totalElevationGainInMeters`).
4. Gérer : multi‑runs/jour (somme ou bonus), run un jour de repos (« couru quand même »/bonus),
   hors plan (bonus), ambiguïté (**confirmation**), valeurs déjà saisies (ne pas écraser sans accord).

> On pourrait **mutualiser** ce moteur de matching entre Strava et Garmin (une seule fonction
> « activité normalisée → séance »), les deux sources produisant le même objet interne.

---

## 7. Modèle de données à prévoir (résumé, non implémenté)

- **`garmin_account`** : tokens OAuth2 + `garmin_user_id` (chiffrés). 1/utilisateur.
- **`user_progress.data`** : ajouter `dplus` (D+ réalisé) et `imports: { "garmin:<id>": "<clé séance>" }`
  (partagé avec Strava : préfixe par source).
- **(option) `imported_activity`** : cache (id, source, date, distance, durée, D+, type, lien séance)
  pour afficher allure/FC/carte et gérer les rematchings — **commun aux deux intégrations**.

---

## 8. Comparatif Garmin vs Strava (pour décider)

| Critère | **Strava** | **Garmin** |
|---|---|---|
| Accès | **Self‑service** immédiat (perso OK) | **Partenaire B2B** : entité légale requise, approbation (programme parfois en pause) |
| Coût | Gratuit, mais **tarification/restrictions récentes** possibles | **Gratuit** une fois approuvé |
| Modèle | **Pull** facile + webhook optionnel | **Push‑first** : webhook **obligatoire** + backfill 90 j |
| Données run | distance, temps, **D+**, allure, FC, GPS | idem, souvent **plus précises** (baro pour le D+) |
| Couverture utilisateurs | Très large (Strava agrège plein de montres) | Uniquement les porteurs **Garmin** |
| Restrictions d'usage | Données **de l'utilisateur à lui‑même**, **pas d'IA** | Accord développeur Garmin (pas de revente, finalité encadrée) |
| Effort d'intégration | Faible (OAuth + pull) | Moyen (OAuth2 PKCE + webhook public + onboarding partenaire) |

**Lecture rapide** : pour un **démarrage rapide et perso**, **Strava** gagne. **Garmin** devient
intéressant quand (a) il y a une **entité légale**, (b) on veut des données **natives/précises**
sans dépendre d'un repartage Strava, ou (c) la cible est très « Garmin ».

---

## 9. Alternatives si l'accès direct est bloqué

L'accès direct Garmin étant **gated** (B2B + éventuelle pause), prévoir des replis :

- **Agrégateurs santé/sport** (un seul contrat, plusieurs marques dont Garmin, Strava, COROS,
  Polar, Apple) : ex. **Terra**, **Spike**, **Rook**, **Vital**, **Open Wearables**. Plus rapides à
  intégrer, mais **dépendance + coût** d'un intermédiaire, et soumis aux mêmes autorisations.
- **Import de fichier** **.FIT / .GPX / .TCX** : l'utilisateur **exporte** sa sortie depuis Garmin
  Connect et l'importe dans l'app. **Aucune approbation requise**, fonctionne hors ligne, mais
  **manuel** (un fichier à la fois). Bon **fallback universel**.
- **Saisie manuelle** (l'existant) : reste le socle ; toute intégration est un *plus*.

---

## 10. Sécurité & vie privée

- Tokens **chiffrés** au repos, jamais côté front ; **scope minimal** ; consentement clair.
- **Déconnexion = révocation** côté Garmin + purge locale.
- **RGPD** : données GPS/sport sensibles → finalité limitée (remplir le plan de l'utilisateur),
  export/suppression, **pas d'IA**, pas de partage tiers.
- Webhook : endpoint **validé**, vérification d'origine, traitement **idempotent**.

---

## 11. Décisions à prendre (avant tout dev)

1. **Y a‑t‑il une entité légale** pour porter la demande au programme Garmin ? (sinon → Strava ou
   import de fichier d'abord).
2. **Vérifier la disponibilité** du Garmin Connect Developer Program (ouvert / en pause).
3. **Direct vs agrégateur** (Terra/Spike…) : vitesse vs dépendance/coût.
4. **Backfill** au branchement (90 j) en plus du push temps réel ?
5. **Mutualiser** le moteur de matching et le modèle `imported_activity` avec Strava ?
6. Mêmes arbitrages que Strava : scope, écrasement, runs hors plan, `dplus` au graphe.

> **Recommandation** : si l'objectif est d'avancer vite et en perso, **commencer par Strava**
> (note dédiée) ou par l'**import de fichier .FIT/.GPX**. Garder Garmin direct pour quand une
> **entité légale** existe et que le besoin de précision/couverture Garmin le justifie.

---

## Sources
- [Garmin Connect Developer Program — Overview](https://developer.garmin.com/gc-developer-program/)
- [Garmin Connect Developer Program — Program FAQ (éligibilité B2B)](https://developer.garmin.com/gc-developer-program/program-faq/)
- [Garmin — Activity API](https://developer.garmin.com/gc-developer-program/activity-api/)
- [Garmin — OAuth 2.0 PKCE Specification (PDF)](https://developerportal.garmin.com/sites/default/files/OAuth2PKCE_1.pdf)
- [Garmin — Activity Files & Activity Backfill](https://developerportal.garmin.com/blog/activity-files-and-activity-backfill)
- [Garmin push notifications / callback sync (Open Wearables)](https://openwearables.io/blog/garmin-api-push-notifications-how-callback-sync-works)
- [Comparatif & état du programme (Spike, 2026)](https://www.spikeapi.com/blog/why-integrate-garmin-api-directly)
