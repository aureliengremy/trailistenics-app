# CLAUDE.md — Plan Trail

Document de référence du projet. Toute session future doit pouvoir comprendre le projet
à partir de ce seul fichier. **Tiens-le à jour** dès qu'une décision structurante change.

---

## 1. Objectif du projet

Application web full-stack qui transforme un plan d'entraînement trail
(**20 km / 740 m D+**, préparation sur **13 semaines**, juin → septembre) en une **app de
suivi d'entraînement** ("Suivi"), responsive et adaptée à un usage mobile sur le terrain.

L'app a **deux expériences distinctes** (pas seulement du responsive), commutées par media
query (`min-width: 860px`) :

- **Desktop** — dashboard à **sidebar** : 4 sections `Aujourd'hui / Le plan / Renfo / Progrès`,
  pill de la semaine en cours, side cards, minuteur de récup, grand graphe de charge à tooltip.
- **Mobile** — app à **barre d'onglets** en bas : écran `Aujourd'hui` sensible au jour de la
  semaine (séance du jour), `Plan` (semaines → détail paginé), `Renfo` (barre de progression +
  minuteur), `Progrès` (anneau, stats cumulées, mini-graphe).

**Suivi de progression** persisté en `localStorage` (clé `planTrail.progress.v1`) : semaines
validées, exercices cochés, séances clés terminées. La semaine "en cours" est calculée d'après
la date réelle (début S1 = 2 juin 2026).

**Thème clair/sombre** : toggle (soleil/lune) dans le header desktop et la topbar mobile.
- **Premier chargement** : suit la préférence système (`prefers-color-scheme`) tant qu'aucun
  choix n'est enregistré — et la suit même **en live** si le système bascule en cours de session.
- **Au premier clic** du toggle, le choix est figé en `localStorage` (`planTrail.theme.v1`) et
  **prime** désormais sur le système (l'écoute live cesse).
- Classe `theme-light` posée sur `<html>`. Un script inline dans `index.html` applique le thème
  (choix stocké, sinon `prefers-color-scheme`) **avant** le rendu React → aucun flash.
- Palette claire = celle du prototype éditorial. Les couleurs de bloc/graphique restent en hex
  fixe (fidèle au design : `BLOC_COLORS` non thématisées).

Le plan fusionne course à pied et renforcement issu de la calisthénie, autour de deux
principes : **ne jamais empiler le travail quadriceps** et **entraîner la descente**.

## 2. Source de vérité (NE PAS CONTREDIRE)

**Contenu** (`plan/`) :
- **`plan/plan_trail_descriptif.md`** — source de vérité du **contenu** : les 13 semaines,
  la séance renfo (6 exercices), la technique & stratégie. Le seed de la DB en découle.
- **`plan/plan_trail_interactif.html`** — premier prototype éditorial : palette, typo, données
  structurées en JS (référence pour le seed et les valeurs de D+ des graphiques).

**Design system de l'app Suivi** (`plan/Trailistenics/Plan Trail/`) — source de vérité du
**design et du comportement** de l'app desktop + mobile actuelle :
- `App Suivi Desktop.html` + `app-desktop.jsx` → CSS `.d-*` et logique du dashboard desktop.
- `App Suivi.html` + `app-mobile.jsx` → CSS `.m-*` et logique de l'app mobile à onglets.
- `data.js` → données/constantes de référence (`WEEKS`, `BLOC_COLORS`, `CHARTS`, `EXERCISES`).
- `tweaks-panel.jsx` est un **outil de design-time** (protocole d'éditeur, blocs EDITMODE) —
  **ne pas porter** dans l'app. Les valeurs par défaut résolues (thème **sombre**, accent **ocre
  `#d98a3d`**, **Fraunces**, densité **regular**) constituent le design final appliqué.

Le CSS `.d-*` / `.m-*` est porté fidèlement dans `frontend/src/index.css`. En cas de divergence :
le `.md` prime pour le **texte/contenu**, les fichiers `Trailistenics/` priment pour le
**rendu visuel et le comportement** de l'app.

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
- **Production : Neon** (PostgreSQL serverless). La bascule est une simple affaire de
  `DATABASE_URL` — **aucune dépendance en dur** à l'environnement local dans le code.
  Tout passe par la variable d'env. Endpoint **direct** (sans `-pooler`) pour psycopg3/Alembic.
- Le code est **agnostique** : local ⇄ Neon = changement de `DATABASE_URL` uniquement.

Format attendu : `postgresql+psycopg://user:password@host:port/dbname?sslmode=require`

**Déploiement** (voir `DEPLOYMENT.md`) : Frontend → **Vercel** (`frontend/vercel.json`),
Backend → **Render** (`render.yaml`, blueprint), DB → **Neon**. Secrets (`DATABASE_URL`,
`CORS_ORIGINS`, `VITE_API_URL`) configurés dans chaque plateforme, jamais committés.

## 5. Arborescence du monorepo

```
trailistenics-app/
├── CLAUDE.md                  # ce fichier
├── README.md                  # comment lancer back + front
├── .gitignore
├── .env.example               # gabarit des variables d'env (JAMAIS de secret réel)
├── docker-compose.yml         # Postgres local
├── plan/                      # SOURCE DE VÉRITÉ (ne pas modifier sans raison)
│   ├── plan_trail_descriptif.md       # contenu
│   ├── plan_trail_interactif.html     # 1er prototype éditorial
│   └── Trailistenics/Plan Trail/      # design system de l'app Suivi (desktop + mobile)
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
    │   ├── App.tsx           # switch desktop/mobile + états chargement/erreur
    │   ├── index.css         # design system porté : vars + CSS .d-* (desktop) & .m-* (mobile)
    │   ├── lib/
    │   │   ├── api.ts        # client fetch typé (VITE_API_URL)
    │   │   └── plan.ts       # adaptateur API→PlanWeek, constantes charts, dates, sessionForDay
    │   ├── types/            # types TS de l'API (Week, Bloc, Exercise)
    │   ├── hooks/
    │   │   ├── usePlan.ts        # fetch weeks+blocs+exercises → forme « plan »
    │   │   ├── useProgress.ts    # suivi persisté localStorage (weeks/ex/sessions)
    │   │   └── useMediaQuery.ts  # commutation desktop/mobile
    │   └── components/
    │       ├── common/      # Ring, Check, Icons, RestTimer, LoadChart (Recharts)
    │       ├── desktop/DesktopApp.tsx   # dashboard sidebar (Today/Plan/Renfo/Progres)
    │       └── mobile/MobileApp.tsx     # app à onglets (Today/Plan/Renfo/Progres)
    ├── tailwind.config.ts    # config conservée (le design Suivi est en CSS porté)
    ├── vite.config.ts
    ├── tsconfig.json         # strict: true
    └── .env                  # local, gitignoré (VITE_API_URL)
```

> Note : les graphiques restent en **Recharts** (stack imposée), stylés pour correspondre au
> design (aire + dégradé + bande pic/simulateur + tooltip). Le contenu « Technique & stratégie »
> du prototype éditorial n'est pas surfacé dans l'app Suivi (choix du design system).

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
