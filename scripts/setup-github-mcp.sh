#!/usr/bin/env bash
# Bootstrap GITHUB_TOKEN for the GitHub MCP server in Cursor.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI is not installed. Install it from https://cli.github.com/"
  exit 1
fi

if ! gh auth status -h github.com &>/dev/null; then
  echo "ERROR: gh is not authenticated. Run: gh auth login -h github.com -p https -s repo,read:org"
  exit 1
fi

TOKEN="$(gh auth token)"
printf 'GITHUB_TOKEN=%s\n' "$TOKEN" > "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo "Wrote ${ENV_FILE}"
echo ""
echo "Next steps:"
echo "  1. Add this to ~/.zshrc (or run before starting Cursor):"
echo "       export GITHUB_TOKEN=\$(gh auth token)"
echo "  2. Restart Cursor completely"
echo "  3. Verify: Settings → Tools & Integrations → MCP → github shows a green dot"
echo "  4. Test in chat: \"List open issues in AI-warriors-au/roadmap-build\""
