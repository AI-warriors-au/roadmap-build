---
name: github-auth-issues
description: Diagnose and fix GitHub authentication (gh CLI, PATs, SSH keys, GitHub Apps) and manage issues via gh. Use when GitHub auth fails, tokens expire, gh commands return 401/403, the user asks to log in to GitHub, or when creating, listing, updating, commenting on, or closing GitHub issues.
---

# GitHub Auth & Issues

Use the `gh` CLI for all GitHub operations in this project. Diagnose auth before retrying failed commands.

## Quick start

1. Check auth: `gh auth status`
2. If invalid or expired → follow [Auth diagnosis](#auth-diagnosis) below
3. For issues → follow [Issue workflow](#issue-workflow)

## Auth diagnosis

Run and read output before guessing:

```bash
gh auth status
git remote -v
echo "${GITHUB_TOKEN:+GITHUB_TOKEN is set}"
ssh -T git@github.com 2>&1 | head -1
```

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `token in keyring is invalid` | Expired or revoked token | `gh auth refresh -h github.com` or re-login |
| `401 Bad credentials` on API | Wrong/missing token | Re-auth or set `GITHUB_TOKEN` |
| `403 Resource not accessible` | Insufficient scopes | Re-login with required scopes (see below) |
| `Permission denied (publickey)` | SSH key not on GitHub | Add SSH key (see [SSH setup](#ssh-setup)) |
| Wrong account active | Multiple gh accounts | `gh auth switch` |

### Required scopes for common tasks

| Task | Scopes |
|------|--------|
| Read repos, list/view issues | `repo` (private) or public access |
| Create/edit/close issues | `repo` |
| Manage org issues | `read:org` + `repo` |
| Create PRs from issues | `repo` |

Re-login with scopes:

```bash
gh auth login -h github.com -p https -s repo,read:org
# or for SSH remotes:
gh auth login -h github.com -p ssh -s repo,read:org
```

### gh CLI auth commands

```bash
# Interactive login (preferred)
gh auth login

# Refresh expired token (keeps same account)
gh auth refresh -h github.com

# Switch between logged-in accounts
gh auth switch

# Print token for scripts/CI debugging (never commit output)
gh auth token

# Log out one account
gh auth logout -h github.com -u USERNAME
```

### PAT setup

Use when `gh` is unavailable or for CI/scripts.

**Fine-grained PAT (preferred):**
1. GitHub → Settings → Developer settings → Fine-grained tokens
2. Resource owner: repo org or user; Repository access: target repo(s)
3. Permissions: Issues (Read and write), Contents (Read), Pull requests (Read) as needed
4. Export: `export GITHUB_TOKEN=ghp_...` (session only; never commit)

**Classic PAT (legacy):**
- Scopes: `repo` for private repos; `public_repo` for public only

Verify PAT:

```bash
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user | jq .login
```

### SSH setup

When remotes use `git@github.com:`:

```bash
# Generate key if missing
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ed25519_github

# Add to agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_github

# Register with GitHub
gh ssh-key add ~/.ssh/id_ed25519_github.pub --title "machine-name"

# Test
ssh -T git@github.com
```

Ensure `~/.ssh/config` maps `github.com` to the correct key if multiple exist.

### GitHub Apps

Use for automation/CI instead of personal PATs when possible.

- Install app on target repo/org with Issues read/write permission
- Generate installation access token via app credentials or GitHub Actions `actions/create-github-app-token`
- Prefer short-lived installation tokens over long-lived PATs

For local scripts, `gh auth login` with a user account is simpler unless the user explicitly wants app-based auth.

## Issue workflow

Copy this checklist and track progress:

```markdown
Issue task progress:
- [ ] Confirm auth (`gh auth status`)
- [ ] Identify repo (`gh repo view` or `-R owner/repo`)
- [ ] Perform issue action
- [ ] Verify result (`gh issue view NUMBER`)
```

### List and search

```bash
# Open issues in current repo
gh issue list

# With filters
gh issue list --state open --label bug --assignee @me
gh issue list --search "is:issue is:open no:assignee"

# Across org
gh issue list -R owner/repo --limit 50
```

### Create

```bash
gh issue create \
  --title "Short descriptive title" \
  --body "## Summary\n\nWhat and why.\n\n## Acceptance criteria\n- [ ] ..." \
  --label bug \
  --assignee @me

# From template (if repo has .github/ISSUE_TEMPLATE/)
gh issue create --template bug_report
```

### View and update

```bash
gh issue view 42
gh issue view 42 --web          # open in browser
gh issue view 42 --comments     # include thread

gh issue edit 42 --add-label "priority:high" --add-assignee USER
gh issue edit 42 --remove-label bug
gh issue edit 42 --title "New title" --body "Updated body"
```

### Comment, close, reopen

```bash
gh issue comment 42 --body "Update: fixed in #43"
gh issue close 42 --comment "Resolved by #43"
gh issue reopen 42
```

### Link issues to branches/PRs

```bash
# Create linked branch (GitHub flow)
gh issue develop 42 --checkout

# Reference in PR body: "Fixes #42" or "Closes #42"
```

### Bulk / JSON output

```bash
gh issue list --json number,title,state,labels --jq '.[] | "\(.number): \(.title)"'
```

## Error recovery loop

When any `gh` command fails:

1. Run `gh auth status` — fix auth first
2. Confirm repo access: `gh repo view [-R owner/repo]`
3. Re-run with explicit repo: `gh issue list -R owner/repo`
4. For 404: issue number wrong or no access
5. For 403: missing scope — re-login with `-s repo` (and `read:org` if org repo)

Do not retry the same failing command more than twice without new diagnostic output.

## Security rules

- Never commit tokens, PATs, or `gh auth token` output
- Never paste tokens into issue bodies or PR comments
- Prefer `gh auth login` over hardcoding credentials
- Use fine-grained PATs scoped to specific repos when PATs are required
- Warn the user before running `gh auth logout` (revokes local session)

## Additional resources

- Full command reference and API fallbacks: [reference.md](reference.md)
