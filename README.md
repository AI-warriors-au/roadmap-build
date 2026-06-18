# roadmap-build

Configuration and guidance for AI coding agents working on Fabric development projects.

## Setup

**Prerequisites:** [Cursor](https://cursor.com/), [GitHub CLI](https://cli.github.com/)

```bash
git clone git@github.com:AI-warriors-au/roadmap-build.git
cd roadmap-build
gh auth login -h github.com -p https -s repo,read:org
bash scripts/setup-github-mcp.sh
```

Restart Cursor.

Or in Cursor chat: **Setup mcps**

## GitHub MCP

Configured in `.cursor/mcp.json`. Requires `GITHUB_TOKEN`:

```bash
export GITHUB_TOKEN=$(gh auth token)
```

Verify in **Settings → Tools & Integrations → MCP** — `github` should be connected.
