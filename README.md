# Plan Trail 🏔️

Application web full-stack du plan d'entraînement **Trail 20 km / 740 m D+** — préparation
sur 13 semaines, fusion course + calisthénie. Timeline interactive, graphiques de charge,
circuit de renforcement et stratégie de course, dans une esthétique outdoor éditoriale.

> Le contenu et le design proviennent de `plan/plan_trail_descriptif.md` (contenu) et
> `plan/plan_trail_interactif.html` (design). Voir **[CLAUDE.md](./CLAUDE.md)** pour le
> contexte complet du projet.

## Stack

| Couche   | Technologies                                                        |
| -------- | ------------------------------------------------------------------- |
| Frontend | React + Vite + TypeScript, Tailwind CSS, shadcn/ui, Recharts        |
| Backend  | FastAPI, Pydantic v2, SQLAlchemy 2, Alembic                         |
| DB       | PostgreSQL (local via Docker ; Neon plus tard — bascule via `DATABASE_URL`) |

## Prérequis

- Node ≥ 18, npm
- Python ≥ 3.11
- Docker (pour la base Postgres locale)

## Démarrage rapide

### 1. Base de données (Docker)

```bash
docker compose up -d            # Postgres sur localhost:5432 (db plantrail)
```

### 2. Backend

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -e .
cp ../.env.example .env          # DATABASE_URL pré-rempli (local Docker, ou Neon)
alembic upgrade head             # crée les tables (blocs, weeks, exercises)
python -m app.seed               # peuple les 13 semaines, blocs et exercices
uvicorn app.main:app --reload    # API → http://localhost:8000  (docs: /docs)
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env             # VITE_API_URL + VITE_NEON_AUTH_URL (voir ci-dessous)
npm run dev                      # → http://localhost:5173
```

## Authentification

L'app est protégée par un écran de connexion / inscription (email + mot de passe), **propulsé
par [Neon Auth](https://neon.com/docs/neon-auth/overview) (Better Auth)**. L'UI reste celle de
l'app (`AuthScreen`) ; le client `@neondatabase/auth` gère la session.

- Variable requise : **`VITE_NEON_AUTH_URL`** = la `base_url` affichée dans **Neon Console → Auth**
  (publiable, pas un secret).
- Le **backend ne fait pas d'auth** : ses endpoints de données sont publics. La progression est
  rattachée à l'`id` Neon Auth de l'utilisateur (localStorage par compte).
- En production, ajouter l'origine du front (Vercel) aux **Trusted origins** dans Neon Console → Auth.

## Structure

```
backend/    API FastAPI, modèles SQLAlchemy, migrations Alembic, seed
frontend/   App React (Vite), composants shadcn, graphiques Recharts
plan/       Source de vérité (contenu .md + prototype .html)
```

## Migration vers Neon (plus tard)

Aucune dépendance en dur à l'environnement local : il suffit de remplacer `DATABASE_URL`
dans `backend/.env` par l'URL fournie par Neon, puis `alembic upgrade head` et
`python -m app.seed`. Rien d'autre à changer.
