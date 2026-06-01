# CLAUDE.md — Plan Trail

Document de référence du projet. Toute session future doit pouvoir comprendre le projet
à partir de ce seul fichier. **Tiens-le à jour** dès qu'une décision structurante change.

---

## 1. Objectif du projet

Application web full-stack qui transforme un plan d'entraînement trail
(**20 km / 740 m D+**, préparation sur **13 semaines**, juin → septembre) en une app
consultable, interactive et responsive (utilisable en mobile pendant les sorties).

Le plan fusionne course à pied et renforcement issu de la calisthénie, autour de deux
principes : **ne jamais empiler le travail quadriceps** et **entraîner la descente**.

## 2. Source de vérité (NE PAS CONTREDIRE)

Deux fichiers dans `plan/` font foi. Tout le contenu et le design en découlent :

- **`plan/plan_trail_descriptif.md`** — source de vérité du **contenu** : les 13 semaines
  (tableau), la séance renfo (6 exercices), la technique & stratégie. Le seed de la DB
  est peuplé à partir de ce fichier.
- **`plan/plan_trail_interactif.html`** — source de vérité du **design et du comportement** :
  palette, typographie, interactions (timeline cliquable, charts commutables, accordéons),
  animations. Contient aussi les données déjà structurées en JS (objet `weeks`, `ex`,
  `blocColors`) — utiles comme référence directe pour le seed et pour la visualisation
  (ex. valeurs de D+ par semaine pour les graphiques).

En cas de divergence : le `.md` prime pour le **texte/contenu**, le `.html` prime pour le
**rendu visuel et les valeurs numériques des graphiques**.

## 3. Stack technique

**Frontend** (`frontend/`)
- React 18 + Vite + TypeScript (mode **strict**)
- Tailwind CSS (thème personnalisé reprenant la palette + fonts du prototype)
- shadcn/ui (composants — Accordion, Card, Tabs, etc.)
- Recharts (graphiques — remplace le canvas du prototype par des composants React responsives)

**Backend** (`backend/`)
- FastAPI (Python 3.11+)
- Pydantic v2 (schémas de validation / sérialisation)
- SQLAlchemy 2.x (ORM) + Alembic (migrations)
- Uvicorn (serveur ASGI)

**Base de données**
- **PostgreSQL** (≥ 15)
- Connexion pilotée **exclusivement** par la variable d'env `DATABASE_URL`.

## 4. Stratégie base de données

- **Maintenant : PostgreSQL en local** (via Docker Compose fourni, ou Postgres local).
  On développe et valide tout sur cette base locale.
- **Plus tard : migration vers Neon** (PostgreSQL serverless). La bascule doit être une
  simple affaire de `DATABASE_URL` — **aucune dépendance en dur** à l'environnement local
  dans le code. Tout passe par la variable d'env.
- **Ne pas configurer Neon maintenant.** Garder le code agnostique.

Format attendu : `postgresql+psycopg://user:password@host:port/dbname`

## 5. Arborescence du monorepo

```
trailistenics-app/
├── CLAUDE.md                  # ce fichier
├── README.md                  # comment lancer back + front
├── .gitignore
├── .env.example               # gabarit des variables d'env (JAMAIS de secret réel)
├── docker-compose.yml         # Postgres local
├── plan/                      # SOURCE DE VÉRITÉ (ne pas modifier sans raison)
│   ├── plan_trail_descriptif.md
│   └── plan_trail_interactif.html
├── backend/
│   ├── app/
│   │   ├── main.py            # instance FastAPI, montage routers, CORS
│   │   ├── config.py         # Settings Pydantic (lit DATABASE_URL, CORS_ORIGINS…)
│   │   ├── database.py       # engine + SessionLocal + get_db()
│   │   ├── models/           # modèles SQLAlchemy (bloc, week, exercise)
│   │   ├── schemas/          # schémas Pydantic (réponses API)
│   │   ├── routers/          # endpoints REST (weeks, exercises, blocs)
│   │   └── seed.py           # peuple la DB à partir du contenu du .md
│   ├── alembic/              # migrations
│   ├── alembic.ini
│   ├── pyproject.toml        # deps Python
│   └── .env                  # local, gitignoré (copié de .env.example)
└── frontend/
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── index.css         # directives Tailwind + variables CSS du thème
    │   ├── lib/
    │   │   ├── api.ts        # client fetch typé (VITE_API_URL)
    │   │   └── utils.ts      # cn() shadcn
    │   ├── types/            # types TS partagés (Week, Bloc, Exercise)
    │   ├── components/
    │   │   ├── ui/           # composants shadcn générés
    │   │   ├── Hero.tsx
    │   │   ├── LoadChart.tsx        # graphiques Recharts commutables
    │   │   ├── Timeline.tsx         # timeline + panneau détail
    │   │   ├── Circuit.tsx          # cartes du circuit renfo
    │   │   └── Technique.tsx        # accordéons technique/stratégie
    │   └── hooks/
    ├── tailwind.config.ts    # thème : palette + fonts du prototype
    ├── vite.config.ts
    ├── tsconfig.json         # strict: true
    └── .env                  # local, gitignoré (VITE_API_URL)
```

## 6. Modèle de données

Trois entités (détail dans la proposition de schéma — à valider avant implémentation) :

- **bloc** — phase d'entraînement (Reprise, Base, Développement, Allégée, Pic de charge,
  Simulateur, Affûtage) avec sa **couleur** et sa catégorie.
- **week** — une des 13 semaines : numéro, date, bloc, durée de la longue, D+, séances/sem,
  libellé sortie longue, séance qualité, focus, drapeau course.
- **exercise** — un des 6 exercices du circuit renfo : ordre, nom, volume, cible, justification.

## 7. API REST

Base : `/api`

- `GET /api/blocs` — liste des blocs avec couleurs.
- `GET /api/weeks` — les 13 semaines (avec bloc imbriqué).
- `GET /api/weeks/{n}` — détail d'une semaine par numéro (1–13).
- `GET /api/exercises` — les 6 exercices du circuit, ordonnés.
- Documentation auto : `/docs` (Swagger) et `/redoc`.

CORS autorisé pour l'origine du front (configurée via `CORS_ORIGINS`).

## 8. Identité visuelle (à respecter — pas de rendu shadcn générique)

Palette (CSS vars du prototype) :

| Rôle            | Hex       | Nom        |
| --------------- | --------- | ---------- |
| Fond            | `#16140f` | bg         |
| Fond 2          | `#1f1c14` | bg2        |
| Panneau         | `#26221a` | panel      |
| Panneau 2       | `#2e2920` | panel2     |
| Lignes          | `#3a342a` | line       |
| Encre (texte)   | `#f2ede0` | ink        |
| Texte atténué   | `#a99e88` | muted      |
| Mousse          | `#7ba05b` | moss       |
| Mousse foncée   | `#5c7d3f` | moss-d     |
| Ocre            | `#d98a3d` | ocre       |
| Ocre foncé      | `#b4691f` | ocre-d     |
| Rouille         | `#c2562e` | rust       |
| Ciel            | `#6fa8c4` | sky        |

Couleurs des blocs (graphiques + timeline) : construction (Reprise/Base/Développement) =
mousse `#7ba05b` · allégée = muted `#a99e88` · pic & simulateur = rouille `#c2562e` ·
affûtage = ciel `#6fa8c4`.

Typographie : titres **Fraunces** (serif, italique pour accents), corps **Archivo** (sans).
Détails : texture topographique en fond, coins arrondis (14–18px), kicker en majuscules
espacées, esthétique outdoor éditoriale sombre.

## 9. Conventions de code

- **TypeScript strict** côté front (`strict: true`, pas de `any` implicite).
- **Aucun secret en dur** : tout via `.env` / variables d'env. `.env.example` committé,
  `.env` jamais committé.
- **Commits atomiques** et lisibles, au fil de l'avancement.
- Backend : modèles SQLAlchemy ≠ schémas Pydantic (séparation ORM / API).
- La DB ne se construit qu'avec les migrations Alembic (pas de `create_all` en prod).

## 10. Commandes clés

> À compléter/valider une fois le scaffolding en place. Cible :

```bash
# Base de données locale (Docker)
docker compose up -d                      # démarre Postgres en local

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e .                          # ou: pip install -r requirements
cp ../.env.example .env                    # puis renseigner DATABASE_URL
alembic upgrade head                       # applique les migrations
python -m app.seed                         # peuple la DB depuis le plan
uvicorn app.main:app --reload              # API sur http://localhost:8000

# Frontend
cd frontend
npm install
cp .env.example .env                       # VITE_API_URL=http://localhost:8000
npm run dev                                # front sur http://localhost:5173
```
