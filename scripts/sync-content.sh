#!/usr/bin/env bash
# Sync the content repo (dragonly/md) into src/content/docs/.
# Used by CI; safe to run locally (asks before clobbering fixtures).
#
# Usage:
#   CONTENT_REPO_TOKEN=<pat> ./scripts/sync-content.sh
#   # or, for local dev with SSH auth:
#   CONTENT_REPO_SSH=1 ./scripts/sync-content.sh
#
# Env vars:
#   CONTENT_REPO       default: dragonly/md
#   CONTENT_REPO_REF   default: main
#   CONTENT_REPO_TOKEN GitHub PAT with contents:read on CONTENT_REPO (for HTTPS)
#   CONTENT_REPO_SSH   if set, clone via SSH (uses your local key)
#   DOCS_DIR           default: src/content/docs
set -euo pipefail

REPO="${CONTENT_REPO:-dragonly/md}"
REF="${CONTENT_REPO_REF:-main}"
DOCS_DIR="${DOCS_DIR:-src/content/docs}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Cloning ${REPO}@${REF} into ${TMP}"

if [[ -n "${CONTENT_REPO_SSH:-}" ]]; then
  git clone --depth 1 --branch "$REF" "git@github.com-personal:${REPO}.git" "$TMP/content"
elif [[ -n "${CONTENT_REPO_TOKEN:-}" ]]; then
  git clone --depth 1 --branch "$REF" \
    "https://x-access-token:${CONTENT_REPO_TOKEN}@github.com/${REPO}.git" \
    "$TMP/content"
else
  echo "✗ Need CONTENT_REPO_TOKEN (HTTPS) or CONTENT_REPO_SSH=1 (local SSH)." >&2
  exit 1
fi

echo "→ Replacing ${DOCS_DIR} with content repo"
rm -rf "$DOCS_DIR"
mkdir -p "$DOCS_DIR"

# Copy everything except git metadata and repo-management files we don't render.
cd "$TMP/content"
# Exclude: .git, hidden dotfiles at root, README.md, AGENTS.md
find . -mindepth 1 -maxdepth 1 \
  ! -name ".git" \
  ! -name ".github" \
  ! -name ".gitignore" \
  ! -name "README.md" \
  ! -name "AGENTS.md" \
  -exec cp -R {} "$OLDPWD/$DOCS_DIR/" \;

cd "$OLDPWD"
echo "✓ Synced. ${DOCS_DIR} now contains:"
ls -la "$DOCS_DIR"
