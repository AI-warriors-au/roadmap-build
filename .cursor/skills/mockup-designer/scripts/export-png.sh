#!/usr/bin/env bash
# Render a mockup HTML file to a full-page PNG using headless Chromium (Playwright).
#
# Usage:
#   bash export-png.sh <input.html> <output.png> [width]
#
# Defaults: width=1280. Creates the output directory if missing.
# Requires network access on first run (downloads Chromium + loads the web font).

set -euo pipefail

INPUT="${1:-}"
OUTPUT="${2:-}"
WIDTH="${3:-1280}"

if [[ -z "$INPUT" || -z "$OUTPUT" ]]; then
  echo "Usage: bash export-png.sh <input.html> <output.png> [width]" >&2
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "Input HTML not found: $INPUT" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"

# Absolute file:// URL so Playwright can load the local HTML.
ABS_INPUT="$(cd "$(dirname "$INPUT")" && pwd)/$(basename "$INPUT")"

# Ensure the Chromium browser binary is available (no-op if already installed).
npx --yes playwright@latest install chromium >/dev/null 2>&1 || true

# Full-page screenshot at desktop width; wait 1500ms so the web font settles.
npx --yes playwright@latest screenshot \
  --full-page \
  --viewport-size="${WIDTH},900" \
  --wait-for-timeout=1500 \
  "file://${ABS_INPUT}" \
  "$OUTPUT"

echo "PNG written to $OUTPUT"
