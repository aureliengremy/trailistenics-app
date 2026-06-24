# Intégration Strava — note de faisabilité (récupération des sorties)

> **Statut : exploratoire.** Ce document décrit *ce qui serait possible* et les features
> envisageables pour récupérer automatiquement les sorties course depuis Strava et **pré-remplir
> le « réalisé »** de l'app (distance, durée, D+). **Aucun code n'est écrit** ; c'est une base de
> décision. Voir aussi `docs/README.md` (modèle de données) et `IDEES-FEATURES.md`.

---

## 1. Pourquoi (la valeur)

Aujourd'hui, le « réalisé » d'une sortie (durée en min, distance en km) est **saisi à la main**
(`KmField` → `user_progress.data.km`/`.dur`, clé `${semaine}-${séance}`). Le graphe Progrès compare
ensuite **prévu vs réalisé** (totaux hebdo).

Une intégration Strava permettrait de :

- **Supprimer la saisie manuelle** : à chaque run terminé sur la montre/le téléphone, l'app
  récupère automatiquement **distance, durée et dénivelé (D+)** et les place sur la bonne séance.
- **Capturer le D+ réalisé** — actuellement **non saisissable** (le graphe ne fait qu'« inférer »
  le D+ quand la longue est validée). Strava fournit `total_elevation_gain` → vrai D+ réalisé.
- Fiabiliser le comparatif prévu/réalisé et la motivation (les chiffres se remplissent seuls).
- Plus tard : allure, fréquence cardiaque, splits, carte GPS, détection auto « séance faite ».

---

## 2. Faisabilité & contraintes (API Strava, état 2025)

**C'est faisable** pour notre cas d'usage, mais sous conditions précises liées au **durcissement
de l'API Strava de novembre 2024** ([annonce officielle](https://press.strava.com/articles/updates-to-stravas-api-agreement)) :

| Règle Strava (2024) | Impact pour Trailistenics |
|---|---|
| Un tiers ne peut montrer les données Strava d'un utilisateur **qu'à cet utilisateur lui‑même** | ✅ **Compatible** : on affiche à chacun **ses** runs sur **son** plan. Pas d'affichage croisé, pas de classement public, pas d'agrégation entre utilisateurs. |
| **Interdiction d'utiliser les données dans des modèles d'IA / ML** | ✅ **Compatible** : on ne fait que du remplissage de champs (distance/durée/D+). Aucune génération de programme à partir des données Strava (le pipeline de génération reste basé sur l'intake). |
| Protection du **look & feel** de Strava ; mention **« Powered by Strava »** et logo imposés | ⚠️ **À respecter** : bouton « Se connecter avec Strava » conforme à la [marque](https://developers.strava.com/guidelines/), mention « Powered by Strava » près des données importées. |
| Accès API plus encadré (revue de l'app, quotas, évolutions tarifaires possibles avant l'IPO) | ⚠️ **Risque** : Strava peut restreindre/faire payer l'accès. Prévoir un **repli manuel** (la saisie reste toujours possible) et éventuellement d'autres sources (cf. §9). |

> En clair : une intégration « **j'importe MES runs sur MON plan** » entre dans le cadre autorisé.
> Ce qui est interdit, c'est d'exploiter ces données pour de l'IA, de les afficher à d'autres, ou
> de cloner l'UX Strava.

### Quotas (rate limits) — [doc officielle](https://developers.strava.com/docs/rate-limits/)
- **200 requêtes / 15 min** et **2 000 / jour** (global app), dont **100 / 15 min** et **1 000 / jour**
  hors upload. Le flux OAuth ne compte pas.
- Très confortable pour un usage perso/petite base. Les **webhooks** (cf. §4) évitent le polling.

---

## 3. Comment ça marche techniquement (briques Strava)

- **OAuth2 (authorization code)** : l'utilisateur autorise l'app → on reçoit un `code` →
  échange contre `access_token` (valide ~6 h) + `refresh_token` (longue durée) +
  `expires_at`. ([getting started](https://developers.strava.com/docs/getting-started/))
- **Scopes** nécessaires : `activity:read` (sorties publiques) ou **`activity:read_all`** (inclut
  les activités privées — souvent nécessaire car beaucoup de runs sont en visibilité « following »
  ou « only me »). On demande le **minimum utile** et on l'explique à l'utilisateur.
- **Endpoints utiles** :
  - `GET /api/v3/athlete/activities?after=<epoch>&per_page=…` — liste paginée des activités après
    une date (idéal pour « récupérer la semaine »).
  - `GET /api/v3/activities/{id}` — détail d'une activité (distance, temps, D+, type, splits…).
  - (option) `GET /api/v3/activities/{id}/streams` — séries temporelles (allure, FC, altitude).
- **Champs clés d'une activité** : `type`/`sport_type` (`Run`, `TrailRun`), `start_date_local`,
  `distance` (m), `moving_time` & `elapsed_time` (s), `total_elevation_gain` (m), `name`.
- **Webhooks (push)** : Strava notifie notre backend à chaque **création/màj/suppression**
  d'activité (`aspect_type=create`), sur un **endpoint public validé**. Évite de poller et permet
  un remplissage quasi temps réel. ([webhooks](https://developers.strava.com/docs/webhooks/)).

---

## 4. Architecture proposée pour Trailistenics (sans la coder)

Cohérente avec l'existant (FastAPI + Neon + Neon Auth + `user_progress` JSON) :

```
Front (React)                Backend (FastAPI)                 Strava
─────────────                ─────────────────                 ──────
[Se connecter à Strava] ──▶  GET /api/strava/connect  ──▶ redirige vers l'autorisation Strava
                                                              │  (utilisateur accepte)
   callback ◀───────────────  GET /api/strava/callback ◀──────┘  (code)
                                  │ échange code → tokens
                                  │ stocke tokens (table strava_account, chiffré)
                                  ▼
   « Importer mes runs » ──▶  POST /api/strava/sync  ──▶ GET /athlete/activities?after=…
                                  │ mappe chaque run → séance (semaine+jour)
                                  │ écrit km/dur/dplus dans user_progress.data
                                  ▼
                              (option) Webhook  ◀── Strava POST à chaque nouveau run
                                  └─ auto-remplit la séance correspondante
```

### Stockage des tokens (nouveau — à documenter dans le modèle)
Nouvelle table `strava_account` (1 ligne par utilisateur) :
`owner_id` (uuid Neon Auth) · `athlete_id` · `access_token` · `refresh_token` · `expires_at` ·
`scope` · `connected_at`. **Tokens chiffrés au repos** (clé en variable d'env), jamais exposés au
front. **Rafraîchissement** automatique côté backend quand `expires_at` est dépassé.

### Lien activité ↔ séance
Deux options :
- **Simple (recommandé MVP)** : écrire directement dans `user_progress.data` (`km`/`dur` + un
  nouveau `dplus` réalisé), même format que la saisie manuelle. Garder un `strava.<activityId>`
  → clé séance pour éviter les doublons et permettre le « dé-import ».
- **Complet (futur)** : table `imported_activity` (cache des runs Strava + le lien vers la séance),
  utile pour afficher allure/FC/carte et gérer les rematchings.

---

## 5. Logique de matching : un run Strava → une séance du plan

C'est le cœur de la feature. Pour chaque activité de type course :

1. **Filtrer** : ne garder que `Run` / `TrailRun` (ignorer vélo, marche selon préférence).
2. **Trouver la semaine** : depuis `start_date_local`, via la même logique que `currentWeek`
   (semaines lundi→dimanche calées sur `start_date` du programme).
3. **Trouver le jour** → la **clé séance** via la structure de l'app
   (`sessionForDay` : mardi=renfo/footing, jeudi=qualité, dimanche=longue, etc.).
4. **Remplir** `km` (= `distance`/1000), `dur` (= `moving_time`/60), `dplus` (= `total_elevation_gain`).
5. **Cas à gérer** (à arbitrer) :
   - **Plusieurs runs le même jour** → additionner, ou rattacher le plus long à la séance clé et le
     reste en « bonus » (`user_progress.data.bonus`).
   - **Run un jour de repos** → proposer « couru quand même » (déjà géré manuellement dans l'app)
     ou créer une **séance bonus**.
   - **Pas de plan ce jour-là / hors période** → séance bonus.
   - **Ambiguïté** → ne pas écraser en silence : proposer une **confirmation** (cf. MVP §6).
   - **Valeurs déjà saisies à la main** → demander avant d'écraser (ou ne compléter que les vides).

---

## 6. Features envisageables (par paliers)

### Palier 0 — Connexion (socle)
- Bouton **« Connecter Strava »** (OAuth), état connecté/déconnecté, **déconnexion** (révocation
  du token + suppression locale). Mention « Powered by Strava ».

### Palier 1 — Import manuel assisté (MVP recommandé)
- Bouton **« Importer mes sorties »** (semaine en cours ou plage). L'app liste les runs Strava
  détectés, propose le **rattachement à chaque séance** (pré-rempli, modifiable), l'utilisateur
  **valide**. Remplit `km`/`dur`/`dplus`. → Réversible, sans surprise, conforme.

### Palier 2 — Synchro automatique (webhooks)
- À chaque nouveau run, remplissage **automatique** de la séance correspondante + petite
  notification « Sortie de dimanche importée : 18,2 km · 1 h 52 · 540 m D+ ». Bouton « annuler ».

### Palier 3 — Données riches
- **D+ réalisé** dans le graphe Progrès (vraie courbe réalisée, plus seulement inférée).
- Allure moyenne, **FC moyenne**, splits, **carte GPS** de la sortie (affichées à l'utilisateur
  uniquement). Comparaison allure prévue/réalisée sur la qualité.

### Palier 4 — Confort
- Détection auto « séance clé faite » (coche la séance si un run correspond).
- Récap hebdo « plan vs Strava ». Rappel si une séance prévue n'a pas de run associé.

---

## 7. Modèle de données à prévoir (résumé, non implémenté)

- **`strava_account`** : tokens + scope + athlete_id (chiffré). 1/utilisateur.
- **`user_progress.data`** : ajouter `dplus: Record<string, number>` (D+ réalisé par séance), et
  un `imports: { "strava:<activityId>": "<clé séance>" }` pour la traçabilité/anti-doublon.
- **(option) `imported_activity`** : cache des activités (id, date, distance, temps, D+, type, lien
  séance) si on veut afficher allure/FC/carte ou gérer les rematchings.

---

## 8. Sécurité & vie privée

- **Tokens chiffrés** au repos (jamais côté front ; le front ne voit que « connecté / pas connecté »).
- **Scope minimal** demandé, expliqué à l'utilisateur ; consentement clair.
- **Déconnexion = révocation** (`POST /oauth/deauthorize`) + purge locale des tokens et, au choix,
  des données importées.
- **RGPD** : données de localisation/sport sensibles → finalité limitée (remplir le plan de
  l'utilisateur), export/suppression possibles, pas de partage tiers, **pas d'IA** (cf. §2).
- Webhook : endpoint public **validé** (challenge), vérifier l'origine.

---

## 9. Risques, limites & alternatives

- **Politique Strava mouvante** : durcissement 2024, quotas, **tarification possible** avant l'IPO.
  → Garder la **saisie manuelle** comme socle (l'intégration est un *plus*, pas une dépendance dure).
- **Revue d'app Strava** : l'usage doit être validé ; respecter marque + règle « données de
  l'utilisateur à lui-même ».
- **Matching imparfait** (multi-runs/jour, types, fuseaux) → toujours laisser l'utilisateur
  **confirmer/corriger** ; ne jamais écraser une saisie sans accord.
- **Alternatives / compléments** si Strava se ferme : import de **fichier GPX/FIT**, intégration
  **Garmin Connect** / **COROS** / Apple Santé, ou agrégateurs (ex. Terra). À évaluer séparément.

---

## 10. Décisions à prendre (avant tout dev)

1. **Palier cible** : commence-t-on par l'**import manuel assisté** (palier 1, recommandé) ?
2. **Scope** : `activity:read` ou `activity:read_all` (activités privées) ?
3. **Politique d'écrasement** : compléter seulement les champs vides, ou proposer systématiquement ?
4. **Runs hors plan / jours de repos** : bonus automatique, ou ignorés ?
5. **D+ réalisé** : l'ajoute‑t‑on au modèle (`dplus`) et au graphe Progrès ?
6. **Webhooks** dès le MVP ou plus tard (import manuel d'abord) ?

---

## Sources
- [Updates to Strava's API Agreement (nov. 2024)](https://press.strava.com/articles/updates-to-stravas-api-agreement)
- [Strava API — Getting Started](https://developers.strava.com/docs/getting-started/)
- [Strava API — Rate Limits](https://developers.strava.com/docs/rate-limits/)
- [Strava API — Webhooks](https://developers.strava.com/docs/webhooks/)
- [Strava API v3 — Reference](https://developers.strava.com/docs/reference/)
- [Strava Brand Guidelines (boutons « Connect / Powered by Strava »)](https://developers.strava.com/guidelines/)
