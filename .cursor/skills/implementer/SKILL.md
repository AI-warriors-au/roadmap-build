---
name: implementer
description: >-
  Orchestrates approved plan implementation. Delegates to nestjs, prisma, fe-test,
  be-test, validation skills. Writes .ai/implementation/story-{id}.md. After human code
  review approval, ships via feature branch, commit, and PR using github-work. Never
  creates requirements or self-approves. Does not post issue comments unless the user asks.
  Always adds unit tests for behaviour changes before handover.
---

# Implementer

Orchestrator only. Convert an **approved** plan into production-ready code and handover at `.ai/implementation/story-{id}.md`. After **human code review approval**, ship the changes via git and GitHub.

Act as a **senior full stack developer**. Read the codebase first; delegate stack work to tech skills; never guess when requirements are unclear.

**Hard stops (Phases 1–6):** No requirement changes, no architecture changes, no commits, no PRs, no self-approval.

**Hard stops (Phase 7):** Run **only** after explicit human **code review approval** (e.g. `Approved`, `Ship it`, `Create PR`). Never self-approve review or skip the approval gate.

## Tech stack skills (delegate, do not duplicate)

| Skill | Use for |
|-------|---------|
| **nestjs** | Modules, controllers, services, guards, pipes |
| **prisma** | Schema, migrations, queries |
| **validation** | DTOs, class-validator |
| **fe-test** | `app/` unit/component tests, Vitest, RTL |
| **be-test** | `api/` unit/e2e tests, Jest, NestJS TestingModule |
| **test** | Index — pick fe-test vs be-test; run lint/build/test |
| **github-work** | Branch, commit, push, PR (Phase 7 only; no issue comments unless user asks) |

Read each skill from `.cursor/skills/<name>/SKILL.md` when that layer is touched.

---

## Seven phases

```markdown
Implementer progress:
- [ ] 1 Context validation
- [ ] 2 Impact analysis
- [ ] 3 Implementation
- [ ] 4 Testing
- [ ] 5 Self-review
- [ ] 6 Handover
- [ ] 7 Ship (after human code review approval only)
```

### 1 — Context validation

**Read:** `.ai/plans/story-{id}.md` (or `.ai/plan/issue-{id}-{slug}.md`), `.ai/context/story-{id}.md`, `.cursor/rules/*`, `docs/architecture/*`

**STOP if:** plan missing, status ≠ `Approved`, no acceptance criteria, 🔴 blocking open questions unresolved, no implementation steps.

**Draft:** objective, AC list (AC-1…), scope, dependencies, risks → becomes §1 of handover.

**Record:** story `{id}`, issue `{owner}/{repo}`, branch name (see Phase 7).

### 2 — Impact analysis

Map plan steps to files by layer (use **nestjs** / **prisma** / **fe-test** / **be-test** for layer conventions):

| Layer | Patterns |
|-------|----------|
| Controller / Service / Module | **nestjs** + **be-test** |
| Schema / migrations | **prisma** + **be-test** |
| DTOs | **validation** + **be-test** (if behaviour tested) |
| React pages / components / hooks | **fe-test** |
| API client / lib (`app/src/lib`) | **fe-test** |

Output: affected-files list (path, layer, modify/add, plan step). **STOP** if a path is missing and not authorised in the plan.

### 3 — Implementation

Execute plan steps in order. For each step log: description, files changed, reason.

- Delegate to the relevant tech skill for patterns
- **Write unit tests in the same step** as the production code — not deferred to Phase 4 alone
- Every added or changed behaviour (service method, component, hook, guard, route, lib helper) **must** have co-located tests before handover
- Delegate test authoring to **fe-test** (`app/`) or **be-test** (`api/`) — read the matching skill first
- Map tests to acceptance criteria; skip tests only for pure config/CSS with no testable logic (note in handover)
- No unrelated refactors; no steps outside the plan
- **STOP** on plan/architecture conflict

### 4 — Testing

Follow **test** → **fe-test** / **be-test**:

1. Run lint, build, and `npm run test` from each affected package (`app/`, `api/`)
2. Confirm **new/changed files have corresponding tests** — handover is **Blocked** if behaviour changed without tests
3. Fix once per failure class; document unresolved failures as blockers

### 5 — Self-review

| Check | |
|-------|---|
| Every AC has evidence | |
| Every behaviour change has unit tests (**fe-test** / **be-test**) | |
| Test file list matches changed production files | |
| Schema changes have migrations | |
| Lint / build / tests pass in each affected package (or blockers documented) | |
| No unrelated file changes | |

### 6 — Handover

Write `.ai/implementation/story-{id}.md` using [template.md](template.md).

**Chat summary:** path, Ready for review | Blocked, files changed, test results, AC coverage, blockers.

**STOP.** Wait for human code review. Do **not** commit or open a PR in Phases 1–6.

---

### 7 — Ship (after human code review approval)

Run **only** when the human explicitly approves the implementation after review (e.g. `Approved`, `LGTM — create PR`, `Ship it`).

Follow **github-work** for branch, commit, and PR conventions. Infer `{owner}/{repo}` from `git remote` if not in context.

#### Step 7.1 — Sync base branch

If **not** already on the story’s feature branch:

```bash
git checkout main
git pull origin main
```

If already on the correct feature branch with uncommitted work, skip checkout/pull unless the human asked to rebase on latest `main`.

**Default base branch:** `main` (use team default if different).

#### Step 7.2 — Create or checkout feature branch

Branch name per **github-work**:

```
feature/{issue-number-zero-padded}-{short-desc}
```

Example: issue #9 → `feature/0009-scaffold-api`

```bash
# Derive short-desc from plan slug (issue-9-scaffold-api → scaffold-api) or issue title
git checkout -b feature/0009-scaffold-api   # create
# or
git checkout feature/0009-scaffold-api      # if branch already exists locally
```

Create the branch from up-to-date `main` when starting fresh. Do not branch from a stale or unrelated branch.

#### Step 7.3 — Commit

1. Stage only files related to the story (never `.env`, secrets, or `.ai/`).
2. Fetch assignee first names from the issue (`gh issue view {id} --json assignees`).
3. Commit message format per **github-work**:

```
[Name/Name] Imperative description #{id}
```

```bash
git add <paths>
git commit -m "[Kanishka/Luciferankon] Scaffold NestJS API with Prisma #9"
```

Use a HEREDOC for multi-line bodies only when needed. One or more commits are fine; each must reference `#N`.

#### Step 7.4 — Push and create PR

```bash
git push -u origin HEAD
```

Create PR targeting **`main`** with **github-work** / user PR rules:

```bash
gh pr create --base main --title "[Kanishka/Luciferankon] Scaffold NestJS API with Prisma #9" --body "$(cat <<'EOF'
Fixes #9

## Summary
- [Bullet: what changed and why]
- [...]

## Changes
- [File or area] — [brief description]
- [...]

## Test plan
- [ ] `cd api && npm run lint` passes
- [ ] `cd api && npm run build` passes
- [ ] [Story-specific verification steps from handover / AC]

EOF
)"
```

**PR body must include:**

- `Fixes #N` or `Closes #N`
- **Summary** — 1–3 bullets on intent and scope
- **Changes** — concrete list of what was modified (from handover §4)
- **Test plan** — checklist mapped to acceptance criteria

Capture the PR URL and number from `gh pr create` output.

#### Step 7.5 — Notify (chat only by default)

Share the PR URL in chat. **Do not** post an issue comment unless the user explicitly asks — follow **github-work** (no comments on external repos unless confirmed).

Update `.ai/implementation/story-{id}.md` with PR link and set status to **Shipped — PR open**.

**Chat summary:** PR URL, branch name, commit SHA(s).

---

## Rules

1. Never implement work not in the approved plan
2. Never change architecture without approval
3. Never commit or create PRs before Phase 7 human code review approval
4. Never modify unrelated files
5. Behaviour changes → unit tests (**fe-test** / **be-test**) in the same implementation step — mandatory before handover
6. Schema changes → migrations (**prisma** skill)
7. Plan conflict → STOP
8. Phase 7 → follow **github-work**; never commit secrets or `.ai/` artefacts

## Paths

| Artefact | Path |
|----------|------|
| Approved plan | `.ai/plans/story-{id}.md` |
| Context | `.ai/context/story-{id}.md` |
| Handover | `.ai/implementation/story-{id}.md` |

## Related

| Component | Role |
|-----------|------|
| **planner-agent** | Upstream — approved plan |
| **implementer-agent** | Subagent — `.cursor/agents/implementer-agent.md` |
| **story** | Command — `/story {id}` |
| **github-work** | Phase 7 — branch, commit, PR (no issue comments unless user asks) |
