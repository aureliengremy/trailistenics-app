# Déploiement — Plan Trail / Trailistenics

Architecture cible (gratuite, branchée sur ton GitHub `aureliengremy/trailistenics-app`) :

```
Navigateur ──> Frontend (Vercel, statique Vite) ──HTTP──> Backend (Render, FastAPI) ──> DB (Neon, Postgres)
```

| Couche   | Plateforme | Fichier de config        |
| -------- | ---------- | ------------------------ |
| Frontend | Vercel     | `frontend/vercel.json`   |
| Backend  | Render     | `render.yaml` (blueprint)|
| DB       | Neon       | — (URL via `DATABASE_URL`)|

Aucun secret n'est committé : tout passe par les variables d'environnement de chaque plateforme.
`backend/.env` et `frontend/.env` restent locaux (gitignorés).

---

## 1. Base de données — Neon

1. Crée un projet sur **https://neon.tech** (free tier), région **EU (eu-central / Frankfurt)**.
2. Base : garde celle par défaut ou crée `plantrail`.
3. **Connection Details** → copie la chaîne de l'endpoint **direct** (sans `-pooler`).
   Elle ressemble à :
   ```
   postgresql://user:pwd@ep-xxx.eu-central-1.aws.neon.tech/plantrail?sslmode=require
   ```
4. **Transforme le préfixe** en `postgresql+psycopg://` (driver psycopg 3) :
   ```
   postgresql+psycopg://user:pwd@ep-xxx.eu-central-1.aws.neon.tech/plantrail?sslmode=require
   ```
   C'est cette valeur qui ira dans `DATABASE_URL` (en local `backend/.env`, et sur Render).

### Initialiser le schéma + les données sur Neon (une fois)
En local, avec `DATABASE_URL` pointant sur Neon :
```bash
cd backend && source .venv/bin/activate
alembic upgrade head     # crée les tables
python -m app.seed       # peuple 13 semaines, blocs, 6 exercices (idempotent)
```
> Le seed vide puis réinsère le contenu du plan : le relancer est sans risque.

---

## 2. Backend — Render

1. **Render > New > Blueprint**, sélectionne ce repo → il lit `render.yaml`.
2. Renseigne les variables marquées `sync:false` :
   - `DATABASE_URL` = la chaîne Neon `postgresql+psycopg://...?sslmode=require`
   - `CORS_ORIGINS` = l'URL Vercel du front (voir §3), ex `https://trailistenics-app.vercel.app`
     (on la remplit après le 1er déploiement Vercel ; provisoirement `http://localhost:5173`).
   - `SLACK_WEBHOOK_URL` (optionnel) = webhook entrant Slack → à chaque intake rempli, le JSON
     complet est posté (entrée du pipeline de génération). Créer via api.slack.com/apps →
     Incoming Webhooks → Add New Webhook to Workspace (choisir le canal).
   - `RESEND_API_KEY` (optionnel) = emails de notification en doublon.
3. Deploy. Le build fait `pip install -e . && alembic upgrade head`, puis lance uvicorn.
4. Healthcheck : `/health`. Teste : `https://trailistenics-api.onrender.com/health` → `{"status":"ok"}`
   et `…/api/weeks` → les 13 semaines.

> **Free tier** : le service s'endort après ~15 min d'inactivité → 1er appel ~50 s (cold start).
> Acceptable pour un usage perso ; passe en instance payante si tu veux du « toujours chaud ».

---

## 3. Frontend — Vercel

1. **Vercel > Add New > Project**, importe le repo.
2. **Root Directory = `frontend`** (important, c'est un monorepo). Le reste est auto-détecté
   (Vite, build `npm run build`, output `dist`) — `frontend/vercel.json` le verrouille.

   > ⚠️ **Si Vercel réclame un `experimentalServices` / « multiple services »** : c'est qu'il
   > pointe sur la **racine** du repo (il voit `frontend/` + `backend/`). On NE veut PAS ça ici
   > (le backend vit sur Render). La correction = régler **Root Directory sur `frontend`** dans
   > *Settings → Build & Deployment → Root Directory*, puis redéployer. Vercel ne voit alors plus
   > que le front et lit `frontend/vercel.json`. Ne crée **pas** de `vercel.json` à la racine.
3. **Environment Variables** → ajoute :
   - `VITE_API_URL` = l'URL Render du backend, ex `https://trailistenics-api.onrender.com`
     (⚠️ sans slash final ; les variables `VITE_*` sont injectées **au build** → redeploy si tu la changes).
4. Deploy → tu obtiens `https://trailistenics-app.vercel.app`.

---

## 4. Boucler le CORS

Une fois l'URL Vercel connue, retourne sur **Render → Environment** et mets
`CORS_ORIGINS` = `https://trailistenics-app.vercel.app` (ajoute aussi le domaine de preview si besoin,
séparés par des virgules). Render redéploie. Le front peut alors appeler l'API sans erreur CORS.

---

## 5. Développement local (inchangé)

```bash
docker compose up -d                 # Postgres local
cd backend && source .venv/bin/activate
# backend/.env : DATABASE_URL local (ou Neon), CORS_ORIGINS=http://localhost:5173
alembic upgrade head && python -m app.seed
uvicorn app.main:app --reload        # http://localhost:8000

cd frontend                          # frontend/.env : VITE_API_URL=http://localhost:8000
npm run dev                          # http://localhost:5173
```

La bascule local ⇄ Neon est un simple changement de `DATABASE_URL` — aucun code à toucher.
