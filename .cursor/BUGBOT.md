# roadmap-build — Bugbot Review Standards

Bugbot reviews every PR for **bugs**, **security**, **code quality**, **test coverage**, and **project standards**. Apply these rules to the **full PR diff** (not only the latest commit).

## Repository context

- **Monorepo:** `roadmap-build/api` → `api/`, `roadmap-build/app` → `app/` (future).
- **Stack:** NestJS, Prisma, PostgreSQL, independent npm packages (`api/`, `app/`), TypeScript.
- **Agent skills** (implementation reference): `.cursor/skills/nestjs`, `prisma`, `validation`, `test`.

When reviewing files under a path, also apply the linked rule files below.

## Review priorities (in order)

1. **Correctness** — logic bugs, null/undefined handling, race conditions, wrong HTTP status codes, broken error paths.
2. **Security** — secrets in code, injection, missing auth on protected routes, unsafe env handling, mass assignment.
3. **Data integrity** — Prisma schema/migration mismatches, missing transactions, N+1 queries, unbounded `findMany`.
4. **Standards** — NestJS module layout, DTO validation, naming, monorepo conventions.
5. **Tests** — business logic changes without `*.spec.ts`; missing edge-case coverage.
6. **Maintainability** — god services, duplicated logic, dead code, scope creep unrelated to the PR.

## Severity guide

| Severity | When to use | Example |
|----------|-------------|---------|
| **Blocking** | Must fix before merge — bugs, security, data loss, missing migrations | SQL injection, committed `.env`, schema change without migration |
| **High** | Strongly recommended — likely production issue | Unhandled promise rejection, missing auth guard on write endpoint |
| **Medium** | Quality or standards violation | Business logic in controller, missing tests for new service method |
| **Low** | Nit or minor style | Naming inconsistency, missing JSDoc on public API |

Prefer **actionable** comments: what is wrong, why it matters, and a concrete fix suggestion.

## Always flag (project-wide)

- Committed **secrets**, API keys, or real tokens (not `.env.example` placeholders).
- Committed **`.env`** or credentials files.
- Changes to **`api/prisma/schema.prisma`** without a new migration in `api/prisma/migrations/`.
- **`console.log`** left in production paths (use NestJS `Logger` or remove).
- **Unrelated files** clearly outside the PR's stated scope (e.g. drive-by refactors).
- **Breaking changes** to public API contracts without migration notes in the PR description.

## Verification expectations

If the PR touches `api/`, expect evidence that these pass (PR description or CI):

- `cd api && npm run lint`
- `cd api && npm run build`
- `npm run test` (in `api/`) when business logic changed

Flag if backend logic changed with **no test file changes** unless the PR explicitly documents why tests are N/A.

## Comment style

- One issue per comment; anchor to the **specific line**.
- Categorise internally: `bug` | `security` | `quality` | `standard` | `test`.
- Do not duplicate existing unresolved PR comments.
- Do not nitpick formatting already enforced by ESLint/Prettier unless ESLint is bypassed.

## Scoped rule files

Bugbot must follow these linked standards when reviewing matching paths:

- [Monorepo & general](bugbot/rules/monorepo.mdc)
- [API — NestJS](bugbot/rules/api-nestjs.mdc)
- [API — Prisma](bugbot/rules/api-prisma.mdc)
- [API — Validation & DTOs](bugbot/rules/api-validation.mdc)
- [API — Tests & coverage](bugbot/rules/api-tests.mdc)
- [API — Security](bugbot/rules/api-security.mdc)

## Effort hint

Use **deeper review** when the PR changes: auth, payments, Prisma schema/migrations, public API contracts, or more than 300 lines in `api/src/`.
