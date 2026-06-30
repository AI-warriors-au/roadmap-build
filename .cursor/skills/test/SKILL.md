---
name: test
description: >-
  Index skill for verification and testing. Delegates to fe-test (app/) or
  be-test (api/) based on which package changed. Use when ImplementerAgent
  runs lint/build/test or needs to pick the right test conventions.
---

# Test (index)

This monorepo has **separate frontend and backend packages** with different test runners. Do not mix conventions — delegate to the package-specific skill.

| Package | Path | Skill | Runner |
|---------|------|-------|--------|
| Frontend | `app/` | **fe-test** | Vitest + React Testing Library |
| Backend | `api/` | **be-test** | Jest + NestJS TestingModule |

## When to read which skill

| Changed files | Read |
|---------------|------|
| `app/**` | `.cursor/skills/fe-test/SKILL.md` |
| `api/**` | `.cursor/skills/be-test/SKILL.md` |
| Both | Read **both**; run verification from each package directory |

## Implementer requirement

**Unit tests are mandatory** for every implementation change that adds or modifies behaviour (see **implementer** Phase 3–4). Tests are not optional follow-up work.

## Quick verification

```bash
# Frontend
cd app && npm run lint && npm run build && npm run test

# Backend
cd api && npm run lint && npm run build && npm run test
```

See **fe-test** and **be-test** for examples, file naming, mocking patterns, and coverage rules.
