# Implementation summary template

Use this structure for `.ai/implementation/story-{id}.md`. Replace bracketed placeholders.

```markdown
# Implementation — [Story title]

**Story ID:** {id}  
**Source plan:** `.ai/plans/story-{id}.md` _(or `.ai/plan/issue-{id}-{slug}.md`)_  
**Status:** Ready for review | Blocked  
**Implemented:** [ISO 8601 date]  
**Agent:** ImplementerAgent v1.0.0

---

## 1. Implementation understanding

### Objective

[One paragraph: what this implementation delivers, from the approved plan.]

### Acceptance criteria

| ID | Criterion | Source |
|----|-----------|--------|
| AC-1 | [Criterion text] | Plan § Acceptance criteria |
| AC-2 | ... | ... |

### Scope

**In scope (implemented)**

- [Item from plan]

**Out of scope (verified untouched)**

- [Item from plan]

### Dependencies

- [Services, modules, issues, env vars]

### Risks (from plan + implementation)

| Risk | Severity | Mitigation / status |
|------|----------|---------------------|
| [Risk] | Low / Medium / High | [What was done or remaining] |

---

## 2. Impact analysis

### Layers affected

| Layer | Files | Change type |
|-------|-------|-------------|
| Controller | `src/...` | Modified / Added |
| Service | `src/...` | Modified |
| Repository / Prisma | `src/...`, `prisma/schema.prisma` | Modified |
| DTO | `src/.../dto/...` | Added |
| Migration | `prisma/migrations/...` | Added |
| Tests | `src/....spec.ts` | Added / Modified |

### Affected files (pre-implementation)

- `path/to/file.ts` — [reason from plan]

---

## 3. Implementation log

Execute in plan order. One subsection per plan step.

### Step 1: [Plan step title]

**Description:** [From plan]  
**Files changed:**

| File | Change | Reason |
|------|--------|--------|
| `src/...` | [Added / Modified] | [Tied to plan step] |

**Delegated skill:** [nestjs | prisma | test | validation | none]

### Step 2: [Plan step title]

...

---

## 4. Files modified (summary)

| File | Change |
|------|--------|
| `src/users/users.controller.ts` | Modified |
| `src/users/users.service.ts` | Modified |
| `src/users/users.service.spec.ts` | Added |
| `prisma/schema.prisma` | Modified |
| `prisma/migrations/20260622120000_add_export_flag/migration.sql` | Added |

**Unrelated files modified:** None _(required — list any if unavoidable and explain)_

---

## 5. Test results

Commands run from repository root:

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Lint | `npm run lint` | Pass / Fail | [output summary if fail] |
| Build | `npm run build` | Pass / Fail | |
| Unit tests | `npm run test` | Pass / Fail | [count passed/failed] |

### Failures and fixes attempted

| Failure | Fix attempted | Outcome |
|---------|---------------|---------|
| [Test name / lint rule] | [What was tried] | Fixed / Blocked |

### Blockers (if any)

- [Unresolved item preventing full verification]

---

## 6. Acceptance criteria coverage

| ID | Criterion | Evidence | Tests |
|----|-----------|----------|-------|
| AC-1 | [Text] | `src/...` — [behaviour] | `users.service.spec.ts` — "[test name]" |
| AC-2 | ... | ... | ... |

**Coverage:** [N]/[N] criteria satisfied _(or list gaps)_

---

## 7. Self-review

| Check | Result | Notes |
|-------|--------|-------|
| All plan steps executed | Yes / No | |
| No scope outside plan | Yes / No | |
| No architecture changes beyond plan | Yes / No | |
| Business logic has tests | Yes / No | |
| Schema changes have migrations | Yes / No / N/A | |
| Lint passing | Yes / No | |
| Build passing | Yes / No | |
| Unit tests passing | Yes / No | |
| No unrelated file changes | Yes / No | |

---

## 8. Known risks

- [Runtime, performance, security, or rollout risk introduced by this change]

---

## 9. Recommendations for reviewer

**Focus areas**

- [Non-obvious logic, permission checks, migration safety, etc.]

**Suggested review order**

1. [File or layer]
2. [...]

**Do not review (out of scope)**

- [Explicit exclusions]
```
