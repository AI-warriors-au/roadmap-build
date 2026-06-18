# GitHub Setup — Reference

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
  --git-protocol https \
  --web \
  --scopes repo,read:org,project
```

### Environment variables

| Variable | Used by | Notes |
|----------|---------|-------|
| `GITHUB_TOKEN` | gh, MCP, curl | PAT or gh OAuth token |
| `GH_TOKEN` | gh (alias) | Same as GITHUB_TOKEN |

`gh` prefers stored credentials over env vars unless `GH_TOKEN`/`GITHUB_TOKEN` is explicitly set.

## PAT comparison

| Type | Best for | Notes |
|------|----------|-------|
| Fine-grained | CI, scripts, least privilege | Per-repo permissions, expiration |
| Classic | Legacy tooling | Broad scopes; avoid when possible |
| gh OAuth token | Local dev | Managed by `gh auth login`; auto-refresh |

### Minimum fine-grained permissions

| Task | Repository / org permissions |
|------|-------------------------------|
| List/view issues | Issues: Read |
| Create/comment/close issues | Issues: Read and write |
| Create linked PR | Issues + Pull requests + Contents: Read and write |
| Projects board | Organization → Projects: Read and write |

## SSH troubleshooting

```bash
ssh -vT git@github.com
ssh-add -l
```

Sample `~/.ssh/config`:

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
```

## GitHub Apps (automation)

Use for CI/CD instead of personal PATs when possible.

```yaml
- uses: actions/create-github-app-token@v1
  id: app-token
  with:
    app-id: ${{ vars.APP_ID }}
    private-key: ${{ secrets.APP_PRIVATE_KEY }}
```

For local interactive work, prefer `gh auth login`.

## MCP toolsets

`X-MCP-Toolsets` accepts comma-separated values. Common: `context`, `repos`, `issues`, `pull_requests`, `users`, `projects`.

See [GitHub MCP server docs](https://github.com/github/github-mcp-server#available-toolsets) for the full list.

## Multi-account setup

```bash
gh auth login --hostname github.com
gh auth status
gh auth switch --user OTHER_ACCOUNT
GH_TOKEN=$(gh auth token --user OTHER_ACCOUNT) gh repo view -R org/repo
```
