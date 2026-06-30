---
name: github-work
description: Manage GitHub issues, pull requests, projects, labels, branches, and commits. Prefer GitHub MCP tools; fall back to gh CLI or GraphQL. Do not post issue comments unless the user explicitly asks; never comment on external repos without confirmation. Use when creating, listing, updating, or closing issues/PRs, creating branches, writing commit messages, moving project board items, or searching repos.
---

# GitHub Work

Use this skill for **GitHub operations** — issues, PRs, projects, comments, labels. For auth or MCP connectivity problems, use **github-setup** first.

## Tool priority
 
1. **GitHub MCP tools** (when available in the session)
2. **`gh` CLI** (fallback)
3. **GraphQL / REST via `gh api`** (for Projects field updates or gaps in `gh`)

Do not retry the same failing command more than twice without new diagnostic output. On 401/403, switch to **github-setup**.

## Issue comments — default: do not post

**Never post issue comments unless the user explicitly asks** (e.g. “comment on the issue”, “post an approval comment”, “update the GitHub issue”).

| Situation | Action |
|-----------|--------|
| Plan approved, PR shipped, story handover | **Do not** comment on the issue unless asked |
| User asks to comment | Post only what they requested |
| Issue is in an **external repo** | **Do not** comment — even if asked, confirm first (see below) |

### This repo vs external repos

Resolve the **workspace repo** from `git remote get-url origin` (e.g. `AI-warriors-au/roadmap-build`, `bugdiver-fabric/learnmap`).

| Repo type | Examples | Comment policy |
|-----------|----------|----------------|
| **This repo** (workspace) | Monorepo you are editing | Only when user explicitly asks |
| **External repo** | `learnmap/specs`, other orgs | **Never** comment unless user explicitly asks **and** you warn that the issue lives outside the code repo; prefer keeping plan/handover in `.ai/` and chat |

Reading, searching, and viewing issues in external repos (e.g. `learnmap/specs` for stories) is fine — **commenting** is not.

### If the user asks to comment

1. Confirm the target `{owner}/{repo}` and issue number.
2. If `{owner}/{repo}` ≠ workspace repo, state that the issue is external and confirm they still want a comment there.
3. Post only the content they requested — do not auto-post plan summaries, approval blocks, or PR links unless asked.

## Branch and commit conventions

Apply these whenever creating a branch or commit for issue-linked work.

### Branch names

```
feature/{issue-number}-{short-desc}
```

| Part | Rule | Example |
|------|------|---------|
| Prefix | Always `feature/` | `feature/` |
| `{issue-number}` | Issue number, zero-padded to 4 digits | `#10` → `0010`, `#48` → `0048` |
| `{short-desc}` | Kebab-case summary of the work (2–4 words) | `scaffold-app`, `publish-flow` |

**Examples**

- Issue #10 — Scaffold app → `feature/0010-scaffold-app`
- Issue #48 — Publish flow → `feature/0048-publish-flow`

```bash
git checkout -b feature/0010-scaffold-app
# or, if the branch already exists for the issue number only:
git checkout feature/0010
```

Create the branch from an up-to-date `main` (or the team's default branch) before starting implementation.

### Commit messages

```
[Name/Name] Description #issue-number
```

| Part | Rule | Example |
|------|------|---------|
| `[Name/Name]` | Assignee first names from the issue, slash-separated | `[Abhishek/Vinay]` |
| `Description` | Imperative, concise summary of the change | `Bootstrap app with Vite and React` |
| `#issue-number` | Issue number with `#` prefix (not zero-padded) | `#10` |

**Examples**

```
[Abhishek/Vinay] Bootstrap app with Vite and React #10
[Abhishek/Vinay] Add Tailwind CSS and shadcn/ui #10
[Abhishek/Vinay] Create a skill for the story clarification and plan #10
```

**Rules**

- Use assignee **first names** from the GitHub issue. If there is one assignee, use a single name: `[Abhishek] … #10`.
- If assignees are unknown, fetch them with `gh issue view N --json assignees` before committing.
- Keep the description in imperative mood (e.g. "Add", "Fix", "Update", not "Added" or "Adds").
- Always append the issue reference `#N` at the end of the subject line.
- Use Australian English in descriptions when writing prose; code identifiers stay American English per **AGENTS.md**.

### Linking branches, commits, and PRs

1. **Branch** — `feature/{issue-number}-{short-desc}` before first commit
2. **Commits** — `[Name/Name] Description #N` on every commit for that issue
3. **PR title** — may mirror the commit subject or summarise the full change set
4. **PR body** — include `Fixes #N` or `Closes #N` to auto-close the issue on merge

```bash
gh issue view 10 -R owner/repo --json assignees --jq '.assignees[].login'
git checkout -b feature/0010-scaffold-app
git commit -m "[Abhishek/Vinay] Bootstrap app with Vite and React #10"
gh pr create --title "[Abhishek/Vinay] Bootstrap app with Vite and React #10" --body "$(cat <<'EOF'
Fixes #10

## Summary
- ...

## Test plan
- [ ] ...
EOF
)"
```

## Quick checklist

```markdown
GitHub task progress:
- [ ] Confirm repo: `gh repo view` or `-R owner/repo`
- [ ] Try MCP tool first (if connected)
- [ ] Fall back to gh / GraphQL
- [ ] Verify result (`gh issue view`, `gh pr view`, or MCP re-fetch)
```

## MCP workflow

When GitHub MCP tools are loaded, prefer them over shell commands.

### Discover project

```
projects_list  method=list_projects  owner=ORG  owner_type=org
projects_list  method=list_project_fields  owner=ORG  owner_type=org  project_number=N
projects_list  method=list_project_items  owner=ORG  owner_type=org  project_number=N  query=status:Backlog
```

### Common MCP tool groups

| Area | Toolset | Typical tools |
|------|---------|---------------|
| Issues | `issues` | create, list, view, update, comment |
| Pull requests | `pull_requests` | create, list, view, review, merge |
| Projects | `projects` | `projects_list`, `projects_get`, `projects_write` |

If Projects tools are missing, check **github-setup** — enable the `projects` toolset in `.cursor/mcp.json` and restart Cursor.

## Issues

### List and search

```bash
gh issue list -R owner/repo
gh issue list --state open --label bug --assignee @me
gh issue list --search "is:issue is:open no:assignee"
gh issue list --json number,title,state,labels --jq '.[] | "\(.number): \(.title)"'
```

### Create

```bash
gh issue create -R owner/repo \
  --title "Short descriptive title" \
  --body "## Summary\n\nWhat and why.\n\n## Acceptance criteria\n- [ ] ..." \
  --label bug \
  --assignee @me
```

### View, update, close

```bash
gh issue view 42 -R owner/repo --comments
gh issue edit 42 -R owner/repo --add-label "priority:high" --add-assignee USER
gh issue close 42 -R owner/repo
gh issue reopen 42 -R owner/repo
```

### Comment (only when user explicitly asks)

See **Issue comments — default: do not post** above. Do not use `--comment` on `gh issue close` unless asked.

```bash
gh issue comment 42 -R owner/repo --body "Update: fixed in #43"
```

### Find child issues of an epic

Issues may link via body (`## Parent Epic\n#N`) or GitHub sub-issues:

```bash
# Body reference
gh issue list -R owner/repo --json number,body --jq \
  '[.[] | select(.body != null and (.body | test("## Parent Epic\\n#2")))] | .[].number'

# Sub-issues (GraphQL)
gh api graphql -f query='
query { repository(owner:"OWNER", name:"REPO") {
  issue(number:2) { subIssues(first:50) { nodes { number title } } }
}}'
```

### Link to branches/PRs

Follow **Branch and commit conventions** above when naming branches and writing commit messages.

```bash
gh issue view 42 -R owner/repo --json assignees --jq '.assignees[].login'
git checkout -b feature/0042-short-desc
git commit -m "[Name/Name] Description #42"
gh issue develop 42 --checkout   # optional; rename to match convention if needed
# PR body: "Fixes #42" or "Closes #42"
```

## Pull requests

```bash
gh pr list -R owner/repo
gh pr create -R owner/repo --title "..." --body "Fixes #42"
gh pr view 42 -R owner/repo
gh pr review 42 --approve
gh pr merge 42 --squash
gh pr comment 42 --body "LGTM"
```

Use `gh pr create` per user rules when opening PRs; include summary and test plan in the body. PR titles should follow the same `[Name/Name] Description #N` commit format when the PR maps to a single issue.

## Projects (board status)

When MCP `projects_write` is unavailable, use GraphQL via `gh api graphql`.

### Get field and option IDs

```bash
GH_TOKEN="$GITHUB_TOKEN" gh api graphql -f query='
query { organization(login:"ORG") { projectV2(number:2) {
  id
  fields(first:20) { nodes { ... on ProjectV2SingleSelectField {
    id name options { id name }
  }}}
}}}'
```

### List items with current status

```bash
GH_TOKEN="$GITHUB_TOKEN" gh api graphql -f query='
query { organization(login:"ORG") { projectV2(number:2) {
  items(first:100) { nodes {
    id
    content { ... on Issue { number title } }
    fieldValues(first:10) { nodes {
      ... on ProjectV2ItemFieldSingleSelectValue {
        name field { ... on ProjectV2SingleSelectField { name } }
      }
    }}
  }}
}}}'
```

### Move item to a status (e.g. Ready)

```bash
GH_TOKEN="$GITHUB_TOKEN" gh api graphql -f query='
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PROJECT_ID"
    itemId: "ITEM_ID"
    fieldId: "STATUS_FIELD_ID"
    value: { singleSelectOptionId: "READY_OPTION_ID" }
  }) { projectV2Item { id } }
}'
```

Requires a token with Projects scope — see **github-setup** if you get `INSUFFICIENT_SCOPES`.

## Error recovery

| Error | Action |
|-------|--------|
| 401 / invalid token | **github-setup** — refresh or re-login |
| 403 / insufficient scopes | Re-login with `repo`, `read:org`, `project` |
| 404 | Wrong repo, issue number, or no access |
| MCP timeout | Toggle MCP server; restart Cursor; new chat |
| MCP tools absent | Enable toolsets; confirm `GITHUB_TOKEN` in env |

## Security rules

- Never commit tokens or paste them in issues/PRs
- Do not dump auth API responses containing token metadata

## Additional resources

- Full gh issue/PR command reference and REST fallbacks: [reference.md](reference.md)
