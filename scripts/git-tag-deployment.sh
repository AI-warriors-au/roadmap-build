#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: git-tag-deployment.sh <env> <service>" >&2
  exit 1
fi

ENV="$1"
SERVICE="$2"
SHA="${GITHUB_SHA:?GITHUB_SHA is required}"

DATE=$(date -u +%Y%m%d)
PREFIX="${ENV}-${SERVICE}-${DATE}"

git fetch --tags --force origin

latest=0
while IFS= read -r tag; do
  [[ -z "$tag" ]] && continue
  num="${tag##*.}"
  if [[ "$num" =~ ^[0-9]+$ ]] && (( num > latest )); then
    latest=$num
  fi
done < <(git tag -l "${PREFIX}.*")

next=$((latest + 1))
TAG="${PREFIX}.${next}"

git tag "$TAG" "$SHA"
git push origin "$TAG"

echo "Created tag ${TAG} at ${SHA}"
