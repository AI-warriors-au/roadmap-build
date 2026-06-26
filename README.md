# Learnmap monorepo

| Package | Path |
|---------|------|
| API | `api/` |
| App | `app/` |

`learnmap/api` → `api/`, `learnmap/app` → `app/`. See `AGENTS.md`.

## Prerequisites

- Node.js 22+ (`.nvmrc`)
- Docker Compose, or PostgreSQL 16+ for local API

## Setup

```bash
git clone git@github.com:AI-warriors-au/roadmap-build.git
cd roadmap-build
cp .env.example .env
npm install
```

## Docker (full stack)

```bash
docker compose up
```

| Service | URL |
|---------|-----|
| App | http://localhost:5173 |
| API | http://localhost:3000/health |
| PostgreSQL | `localhost:5432` — `learnmap` / `learnmap` / `learnmap` |

```bash
docker compose up -d              # detached
docker compose up -d postgres     # postgres only
docker compose logs -f api
docker compose down -v && docker compose up   # reset database
docker compose build api && docker compose up -d api   # rebuild API image
docker compose exec api npm run db:migration:deploy  # migrate manually
```

Migrations run automatically when the API container starts. Set `SEED_DATABASE=true` in `.env` to seed on startup (once `prisma.seed` is configured in `api/package.json`).

## Local API

```bash
docker compose up -d postgres     # or use your own PostgreSQL
npm run db:migration:deploy
npm run start:api
curl http://localhost:3000/health
```

| Task | Command |
|------|---------|
| Start API | `npm run start:api` |
| Lint | `npm run lint:api` |
| Build | `npm run build:api` |

## Database / Prisma

Schema: `api/prisma/schema.prisma` · Migrations: `api/prisma/migrations/`

Use npm scripts from the repo root (loads `DATABASE_URL` from `.env`):

| Task | Command |
|------|---------|
| Apply migrations | `npm run db:migration:deploy` |
| Create migration | `npm run db:migration:generate -- --name descriptive_name` |
| Reset database | `npm run db:migration:reset` |
| Seed | `npm run db:seed` |
| Prisma Studio | `npm run db:studio` |

After editing `schema.prisma`:

```bash
npm run db:migration:generate -- --name add_my_change
npm run db:migration:deploy
```

Commit `schema.prisma` and the new file under `api/prisma/migrations/`.

**`DATABASE_URL` in `.env`**

```env
# Host / Prisma Studio / local API against Docker Postgres
DATABASE_URL=postgresql://learnmap:learnmap@localhost:5432/learnmap
```

## App

```bash
npm run start:app
```

| Task | Command |
|------|---------|
| Lint | `npm run lint:app` |
| Build | `npm run build:app` |
| Test | `npm run test:app` |

## Agent / GitHub MCP

```bash
gh auth login -h github.com -p https -s repo,read:org
bash scripts/setup-github-mcp.sh
export GITHUB_TOKEN=$(gh auth token)
```

Restart Cursor, or in chat: **Setup mcps**
