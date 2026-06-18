# GitHub Auth & Issues — Reference

## gh auth — full command reference

| Command | Purpose |
|---------|---------|
| `gh auth login` | Interactive login via browser or token |
| `gh auth login --with-token < token.txt` | Non-interactive login from stdin |
| `gh auth refresh -h HOST` | Refresh expired credentials |
| `gh auth status` | Show active accounts and token health |
| `gh auth switch` | Switch active account (multi-account) |
| `gh auth token` | Print active token (sensitive) |
| `gh auth logout` | Remove stored credentials |
| `gh auth setup-git` | Configure git to use gh as credential helper |

### Login flags

```bash
gh auth login \
  --hostname github.com \
  --git-protocol https \   # or ssh
  --web \                  # browser OAuth flow
  --scopes repo,read:org
```

### Environment variables

| Variable | Used by | Notes |
|----------|---------|-------|
| `GITHUB_TOKEN` | gh, curl, actions | Personal or fine-grained PAT |
| `GH_TOKEN` | gh (alias) | Same as GITHUB_TOKEN |
| `GITHUB_ENTERPRISE_TOKEN` | gh (GHE) | Enterprise Server |

`gh` prefers stored credentials over env vars unless `GH_TOKEN`/`GITHUB_TOKEN` is explicitly set.

## PAT comparison

| Type | Best for | Notes |
|------|----------|-------|
| Fine-grained | CI, scripts, least privilege | Per-repo permissions, expiration |
| Classic | Legacy tooling | Broad scopes; avoid when possible |
| gh OAuth token | Local dev | Managed by `gh auth login`; auto-refresh |

### Minimum fine-grained permissions by task

| Task | Repository permissions |
|------|------------------------|
| List/view issues | Issues: Read |
| Create/comment/close issues | Issues: Read and write |
| Create linked PR | Issues: Read and write, Pull requests: Read and write, Contents: Read and write |

## SSH troubleshooting

```bash
# Verbose SSH debug
ssh -vT git@github.com

# List loaded keys
ssh-add -l

# Sample ~/.ssh/config entry
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
```

Common fixes:
- `IdentitiesOnly yes` when agent offers wrong key
- Key not added: `gh ssh-key add` or GitHub Settings → SSH keys
- Enterprise: use `github.example.com` host alias

## GitHub Apps (automation)

### When to use

- CI/CD that should not depend on a person's PAT
- Org-wide automation with auditable permissions
- Short-lived tokens via installation ID

### GitHub Actions pattern

```yaml
- uses: actions/create-github-app-token@v1
  id: app-token
  with:
    app-id: ${{ vars.APP_ID }}
    private-key: ${{ secrets.APP_PRIVATE_KEY }}

- uses: peter-evans/create-or-update-comment@v4
  with:
    token: ${{ steps.app-token.outputs.token }}
    issue-number: ${{ github.event.issue.number }}
    body: "Automated update"
```

### Local app token (manual)

Use the app's private key + JWT to request an installation token via GitHub API. Prefer `gh auth login` for interactive work; use apps only when the user requests non-interactive org automation.

## gh issue — full command reference

| Command | Purpose |
|---------|---------|
| `gh issue list` | List issues with filters |
| `gh issue create` | Create issue |
| `gh issue view NUMBER` | View issue details |
| `gh issue edit NUMBER` | Update title, body, labels, assignees, milestone |
| `gh issue close NUMBER` | Close issue |
| `gh issue reopen NUMBER` | Reopen closed issue |
| `gh issue comment NUMBER` | Add comment |
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
  --web   # open browser form instead
```

### Close linking keywords (in PR body)

`Fixes #N`, `Closes #N`, `Resolves #N` — auto-close issue on merge.

## REST API fallback

When `gh` lacks a flag, use authenticated curl:

```bash
# List issues
curl -s -H "Authorization: Bearer $(gh auth token)" \
  "https://api.github.com/repos/OWNER/REPO/issues?state=open"

# Create issue
curl -s -X POST -H "Authorization: Bearer $(gh auth token)" \
  -H "Content-Type: application/json" \
  -d '{"title":"Title","body":"Body"}' \
  "https://api.github.com/repos/OWNER/REPO/issues"
```

Prefer `gh` over raw API when equivalent commands exist.

## Multi-account setup

```bash
# Login second account
gh auth login --hostname github.com

# List accounts
gh auth status

# Switch active account for subsequent commands
gh auth switch --user OTHER_ACCOUNT

# Per-command override
GH_TOKEN=$(gh auth token --user OTHER_ACCOUNT) gh issue list -R org/repo
```
