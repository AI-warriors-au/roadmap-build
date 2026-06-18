---
name: github-setup
description: Set up and fix GitHub authentication (gh CLI, PATs, SSH keys) and the GitHub MCP server in Cursor. Use when GitHub auth fails, tokens expire, gh returns 401/403, MCP github is disconnected, the user asks to log in to GitHub, or says "Setup mcps".
---

# GitHub Setup

Use this skill for **authentication and MCP connectivity only**. For issues, PRs, projects, and comments, use the **github-work** skill.

## Quick start

1. Check auth: `gh auth status`
2. If invalid → [Auth diagnosis](#auth-diagnosis)
3. For MCP → [MCP setup](#mcp-setup)
4. For GitHub operations → switch to **github-work**

## Auth diagnosis

Run before guessing:

```bash
gh auth status
git remote -v
echo "${GITHUB_TOKEN:+GITHUB_TOKEN is set}"
ssh -T git@github.com 2>&1 | head -1
```

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `token in keyring is invalid` | Expired or revoked token | `gh auth refresh -h github.com` or re-login |
| `401 Bad credentials` | Wrong/missing token | Re-auth or set `GITHUB_TOKEN` |
| `403 Resource not accessible` | Insufficient scopes | Re-login with required scopes |
| `Permission denied (publickey)` | SSH key not on GitHub | [SSH setup](#ssh-setup) |
| Wrong account active | Multiple gh accounts | `gh auth switch` |
| MCP tools missing / timeout | Stale MCP connection | Toggle server off/on; restart Cursor |

### Required scopes

| Task | Scopes / permissions |
|------|----------------------|
| Read repos, issues, PRs | `repo` (private) or public access |
| Org repos | `read:org` + `repo` |
| GitHub Projects (read/write board) | `read:project` / `project` (classic) or **Projects: Read and write** (fine-grained) |

Re-login with scopes:

```bash
gh auth login -h github.com -p https -s repo,read:org,project
# or for SSH remotes:
gh auth login -h github.com -p ssh -s repo,read:org,project
```

### gh CLI auth commands

```bash
gh auth login                    # interactive login (preferred)
gh auth refresh -h github.com    # refresh expired token
gh auth switch                   # switch active account
gh auth token                    # print token (never commit output)
gh auth logout -h github.com -u USERNAME
```

### PAT setup

Use when `gh` is unavailable or for CI/scripts.

**Fine-grained PAT (preferred):**
1. GitHub → Settings → Developer settings → Fine-grained tokens
2. Resource owner: org or user; Repository access: target repo(s)
3. Permissions: Issues, Pull requests, Contents as needed; **Organization → Projects: Read and write**
4. Export: `export GITHUB_TOKEN=ghp_...` (session only; never commit)

**Classic PAT:** `repo` for private repos; add `project` for Projects board access.

Verify (status code only — do not dump response body):

```bash
curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user
```

### SSH setup

When remotes use `git@github.com:`:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ed25519_github
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519_github
gh ssh-key add ~/.ssh/id_ed25519_github.pub --title "machine-name"
ssh -T git@github.com
```

Ensure `~/.ssh/config` maps `github.com` to the correct key if multiple exist.

## MCP setup

This repo configures the remote GitHub MCP server in [`.cursor/mcp.json`](../../mcp.json).

### Bootstrap (recommended)

When the user says **"Setup mcps"**, run from repo root:

```bash
bash scripts/setup-github-mcp.sh
```

Then remind them to restart Cursor.

The script writes `GITHUB_TOKEN` to `.env` (gitignored) from `gh auth token`.

### Manual setup

1. Authenticate gh (see above)
2. Export token so Cursor can read it:

   ```bash
   export GITHUB_TOKEN=$(gh auth token)
   ```

   Add to `~/.zshrc` if desired. On macOS, launch Cursor from a terminal (`cursor .`) or fully quit/relaunch after setting the variable — Dock launches may not inherit shell env.

3. Enable **Projects** toolset (not on by default). Add to `.cursor/mcp.json` headers:

   ```json
   "X-MCP-Toolsets": "context,repos,issues,pull_requests,users,projects"
   ```

4. Restart Cursor; verify **Settings → Tools & Integrations → MCP** — `github` shows connected (green).
5. Start a **new chat** — MCP tools load at session start.

### MCP troubleshooting

| Problem | Fix |
|---------|-----|
| No GitHub MCP tools in chat | Confirm server enabled; start new chat |
| `Timed out waiting for connection` | Toggle server off/on; quit and relaunch Cursor |
| `403`/`404` on Projects tools | Token lacks Projects scope — re-login with `project` or fine-grained Projects permission |
| Token not found | Client not launched with `GITHUB_TOKEN` in environment |

## Security rules

- Never commit tokens, PATs, or `gh auth token` output
- Never paste tokens into issue bodies or PR comments
- Prefer `gh auth login` over hardcoding credentials
- Warn the user before running `gh auth logout`

## Additional resources

- Full auth/PAT/SSH reference: [reference.md](reference.md)
