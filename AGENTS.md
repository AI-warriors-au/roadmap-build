# AI Agent Configuration Guide

You are a coding agent at Fabric. You select and apply the right skills and MCP tools at the right time based on the task at hand.

This repository contains comprehensive configuration and guidance for AI coding agents working across all Fabric development projects.

It is also the **Learnmap product monorepo** (`AI-warriors-au/roadmap-build`). When issues or specs say `learnmap/api`, `learnmap/app`, etc., they refer to packages in this repo — not separate GitHub repositories.

| Issue / spec wording | Monorepo path |
|----------------------|---------------|
| `learnmap/api` | `api/` |
| `learnmap/app` | `app/` |

See `.ai/context/repo-layout.md` for full layout notes (local handoff).

## Language Rules

- **Text and documentation:** Use Australian English (e.g. "behaviour", "initialise", "colour").
- **Code identifiers and comments in code:** Use American English (e.g. `behavior`, `initialize`, `color`).

## Skills

| Skill | Use for |
|-------|---------|
| **github-setup** | Auth, PAT, SSH, MCP connectivity — or when the user says **"Setup mcps"** |
| **github-work** | Issues, PRs, projects, comments, labels — prefer GitHub MCP, fall back to `gh` |
| **story-to-requirements** | Turn a GitHub issue into a draft plan at `.ai/plan/issue-{id}-{slug}.md` |
| **implementer** | Orchestrate approved plan implementation; ship PR after code review approval — **ImplementerAgent** |
| **nestjs** | NestJS modules, controllers, services — delegated by implementer |
| **prisma** | Schema, migrations, queries — delegated by implementer |
| **validation** | DTOs, class-validator — delegated by implementer |
| **test** | Unit tests, lint/build/test — delegated by implementer |

## Bugbot PR review

Automated PR review uses [Cursor Bugbot](https://cursor.com/docs/bugbot). Project standards live in **`.cursor/BUGBOT.md`** (with scoped rules in `bugbot/rules/`). Bugbot does **not** read `.cursor/rules/` — keep review guidance in `BUGBOT.md`.

- Enable Bugbot on `AI-warriors-au/roadmap-build` in the [Bugbot dashboard](https://cursor.com/dashboard/bugbot).
- Manual trigger on a PR: comment `cursor review` or `bugbot run`.
- Teach Bugbot inline: `@cursor remember [fact]` on a PR comment.

## Agents

| Agent | Use for |
|-------|---------|
| **planner-agent** | Orchestrates story-to-requirements + approval gate; invoked by `/story {id}` |
| **implementer-agent** | Senior full stack orchestrator; delegates to nestjs, prisma, validation, test |

## Prompts

### Setup mcps

When the user says **"Setup mcps"**, follow **github-setup**: run `bash scripts/setup-github-mcp.sh` from the repo root, then remind them to restart Cursor.

### Story workflow

Use **`/story {id}`** — plan → manual approval → implement → code review → ship (PR).

```text
/story 42        # Plan, then stop for approval
Approved         # Promote plan and run ImplementerAgent
Approved         # After code review — Phase 7 ship (branch, commit, PR)
```

- **PlannerAgent** → **planner-agent** (uses **story-to-requirements** internally)
- **ImplementerAgent** → **implementer** + **nestjs** / **prisma** / **validation** / **test**

Never self-approve. Phase 2 runs only after explicit human approval.

## Cursor Cloud specific instructions

The startup update script runs `npm install` (root npm workspaces install both `api/` and `app/`). The following are non-obvious caveats; standard commands live in `README.md` and `package.json`.

### Services

Full product E2E is three services: PostgreSQL 16 (`5432`) → NestJS API (`3000`) → React/Vite app (`5173`). The app's Vite dev server proxies `/api/*` to the API (`app/vite.config.ts`); the API's `/health` endpoint checks the DB via Prisma. Run commands: `npm run start:api` and `npm run start:app` from the repo root (each is a long-running watcher — use a tmux session).

### PostgreSQL (must be started manually each session)

PostgreSQL is installed natively via apt (not Docker here). The update script does not start services, so start it yourself:

```bash
sudo pg_ctlcluster 16 main start
```

The `learnmap` role + `learnmap` database already exist (password `learnmap`), matching `docker-compose.yml` defaults. The repo-root `.env` (gitignored) sets `DATABASE_URL=postgresql://learnmap:learnmap@localhost:5432/learnmap`. Config is loaded from root `.env` then `api/.env` (`api/src/app.module.ts`). The API still boots if the DB is down — it just returns HTTP 503 / `"database":"disconnected"`, so always confirm Postgres is running before trusting health checks.

### Native binding gotcha (app/) — important

`app/` depends on native binaries (`@tailwindcss/oxide`, `oxlint`). If `npm run lint:app` / `test:app` / `build:app` fail with `Cannot find native binding` / `MODULE_NOT_FOUND` for a `*-linux-x64-gnu` package, the `package-lock.json` was generated on macOS and is missing the linux platform entries (npm bug #4828). Recover with a clean cross-platform reinstall:

```bash
rm -rf node_modules app/node_modules api/node_modules package-lock.json
npm install
```

This regenerates a lockfile containing all platforms (also fixes the `npm ci` Docker dev workflow on linux).

### Tests / lint / build

- API: `npm run lint:api`, `npm run build:api`, e2e `npm run test:e2e -w api` (needs Postgres up). There are no API unit `*.spec.ts` files yet, so `npm test -w api` exits non-zero with "No tests found" — this is expected, not a failure.
- App: `npm run lint:app` (oxlint), `npm run test:app` (vitest), `npm run build:app`.