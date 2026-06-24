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