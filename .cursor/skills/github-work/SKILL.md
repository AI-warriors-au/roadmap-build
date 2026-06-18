---
name: github-work
description: Manage GitHub issues, pull requests, projects, comments, and labels. Prefer GitHub MCP tools; fall back to gh CLI or GraphQL. Use when creating, listing, updating, or closing issues/PRs, moving project board items, commenting, or searching repos.
---

# GitHub Work

Use this skill for **GitHub operations** — issues, PRs, projects, comments, labels. For auth or MCP connectivity problems, use **github-setup** first.

## Tool priority
 
1. **GitHub MCP tools** (when available in the session)
2. **`gh` CLI** (fallback)
3. **GraphQL / REST via `gh api`** (for Projects field updates or gaps in `gh`)

Do not retry the same failing command more than twice without new diagnostic output. On 401/403, switch to **github-setup**.

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

### View, update, comment, close

```bash
gh issue view 42 -R owner/repo --comments
gh issue edit 42 -R owner/repo --add-label "priority:high" --add-assignee USER
gh issue comment 42 -R owner/repo --body "Update: fixed in #43"
gh issue close 42 -R owner/repo --comment "Resolved by #43"
gh issue reopen 42 -R owner/repo
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

```bash
gh issue develop 42 --checkout
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

Use `gh pr create` per user rules when opening PRs; include summary and test plan in the body.

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
