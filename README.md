# Learnmap monorepo

Configuration and guidance for AI coding agents, plus the Learnmap product codebase.

| Package | Path | Description |
|---------|------|-------------|
| API | `api/` | NestJS backend, Prisma, PostgreSQL |
| App | `app/` | React frontend _(coming in #10)_ |

Issue references to `learnmap/api` and `learnmap/app` map to `api/` and `app/` in this repo. See `AGENTS.md` and `.ai/context/repo-layout.md`.

## Prerequisites

- [Node.js](https://nodejs.org/) 22 LTS or newer (see `.nvmrc`)
- [PostgreSQL](https://www.postgresql.org/) 16+ locally, or Docker Compose _(#11)_
- [Cursor](https://cursor.com/) and [GitHub CLI](https://cli.github.com/) for agent workflows

## API setup

```bash
git clone git@github.com:AI-warriors-au/roadmap-build.git
cd roadmap-build
cp .env.example .env
# Edit .env — set DATABASE_URL for your local PostgreSQL instance
npm install
npm run start:api
```

Verify the API is running:

```bash
curl http://localhost:3000/health
```

Expected when PostgreSQL is reachable: `{"status":"ok","database":"connected"}` (HTTP 200).  
When PostgreSQL is down: HTTP 503 with `"status":"unhealthy"`.

### API commands

| Task | Command |
|------|---------|
| Install (all workspaces) | `npm install` |
| Start API (watch mode) | `npm run start:api` |
| Lint API | `npm run lint:api` |
| Build API | `npm run build:api` |
| Prisma generate | `cd api && npx prisma generate` |

Environment variables are loaded from the repo root `.env` file when running the API from `api/`.

## Agent / GitHub MCP setup

```bash
gh auth login -h github.com -p https -s repo,read:org
bash scripts/setup-github-mcp.sh
```

Restart Cursor, or in chat: **Setup mcps**

Configured in `.cursor/mcp.json`. Requires `GITHUB_TOKEN`:

```bash
export GITHUB_TOKEN=$(gh auth token)
```

Verify in **Settings → Tools & Integrations → MCP** — `github` should be connected.
