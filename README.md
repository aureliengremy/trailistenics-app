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
cp ../.env.example .env          # DATABASE_URL pré-rempli ; en prod, fixer un JWT_SECRET fort
alembic upgrade head             # crée les tables (dont `users` pour l'auth)
python -m app.seed               # peuple les 13 semaines, blocs et exercices
uvicorn app.main:app --reload    # API → http://localhost:8000  (docs: /docs)
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env             # VITE_API_URL=http://localhost:8000
npm run dev                      # → http://localhost:5173
```

## Authentification

L'app est protégée par un écran de connexion / inscription (email + mot de passe). Les mots de
passe sont hachés (bcrypt) et la session repose sur un jeton JWT signé avec `JWT_SECRET`.
En production, fixe impérativement un `JWT_SECRET` fort dans `backend/.env`
(`python -c "import secrets; print(secrets.token_urlsafe(48))"`). Endpoints : `POST /api/auth/register`,
`POST /api/auth/login`, `GET /api/auth/me`.

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
