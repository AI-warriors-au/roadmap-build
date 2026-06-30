# GitHub Work — Reference

## gh issue — full command reference

| Command | Purpose |
|---------|---------|
| `gh issue list` | List issues with filters |
| `gh issue create` | Create issue |
| `gh issue view NUMBER` | View issue details |
| `gh issue edit NUMBER` | Update title, body, labels, assignees, milestone |
| `gh issue close NUMBER` | Close issue |
| `gh issue reopen NUMBER` | Reopen closed issue |
| `gh issue comment NUMBER` | Add comment — **only when user explicitly asks**; see SKILL.md |
| `gh issue delete NUMBER` | Delete issue (requires admin) |
| `gh issue develop NUMBER` | Create linked branch |
| `gh issue pin/unpin NUMBER` | Pin issue in repo |
| `gh issue status` | Your assigned issues across repos |
| `gh issue transfer NUMBER --repo OWNER/REPO` | Transfer to another repo |

### Useful list filters

```bash
gh issue list --assignee @me
gh issue list --author @me
gh issue list --label "bug,help wanted"
gh issue list --milestone "v1.0"
gh issue list --state all
gh issue list --search "is:open sort:updated-desc"
```

### Create flags

```bash
gh issue create \
  --title TITLE \
  --body BODY \
  --body-file path.md \
  --assignee USER \
  --label LABEL \
  --milestone NAME \
  --project "Board name" \
  --template TEMPLATE \
  --web
```

### Close linking keywords (in PR body)

`Fixes #N`, `Closes #N`, `Resolves #N` — auto-close issue on merge.

## gh pr — common commands

| Command | Purpose |
|---------|---------|
| `gh pr list` | List pull requests |
| `gh pr create` | Open a PR |
| `gh pr view NUMBER` | View PR details and checks |
| `gh pr diff NUMBER` | Show diff |
| `gh pr review NUMBER` | Submit review |
| `gh pr merge NUMBER` | Merge PR |
| `gh pr comment NUMBER` | Add comment |
| `gh pr checkout NUMBER` | Check out PR branch locally |
| `gh pr checks NUMBER` | Show CI status |

## MCP projects methods

Via `projects_list` with `method`:

| Method | Purpose |
|--------|---------|
| `list_projects` | Find org/user projects |
| `list_project_fields` | Status, Priority, Size field IDs and options |
| `list_project_items` | Items with optional `query=status:Backlog` |
| `get_project` | Project metadata |
| `get_project_item` | Single item details |

Use `projects_write` to create/update items and field values when available.

## GraphQL — common queries

### Issue with labels and parent

```graphql
query {
  repository(owner: "OWNER", name: "REPO") {
    issue(number: 42) {
      title
      labels(first: 10) { nodes { name } }
      parent { number title }
      subIssues(first: 50) { nodes { number title } }
    }
  }
}
```

### Cross-referenced issues (timeline)

```bash
gh api repos/OWNER/REPO/issues/EPIC_NUM/timeline \
  --jq '.[] | select(.event == "cross-referenced") | .source.issue.number'
```

## REST API fallback

When `gh` lacks a flag:

```bash
curl -s -H "Authorization: Bearer $(gh auth token)" \
  "https://api.github.com/repos/OWNER/REPO/issues?state=open"

curl -s -X POST -H "Authorization: Bearer $(gh auth token)" \
  -H "Content-Type: application/json" \
  -d '{"body":"Comment text"}' \
  "https://api.github.com/repos/OWNER/REPO/issues/42/comments"
```

Prefer MCP or `gh` over raw API when equivalent commands exist.

## Branch and commit conventions

See [SKILL.md](SKILL.md#branch-and-commit-conventions) for the full rules. Quick reference:

| Artifact | Format | Example |
|----------|--------|---------|
| Branch | `feature/{issue-number}-{short-desc}` | `feature/0010-scaffold-app` |
| Commit | `[Name/Name] Description #issue-number` | `[Abhishek/Vinay] Bootstrap app with Vite and React #10` |

- Issue number in branch names: zero-padded to 4 digits (`10` → `0010`)
- Issue number in commits: `#` prefix, not zero-padded (`#10`)
- Names: assignee first names from the issue, slash-separated
