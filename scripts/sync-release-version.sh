#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Wonderlab — Synchronize Monorepo Version on Official Release
# Runs ONLY when a release is officially published, updating package.json across
# workspaces and pushing the official release commit to main.
# ==============================================================================

TARGET_TAG="${1:-}"

if [ -z "$TARGET_TAG" ]; then
  echo "::error::Target tag is required (e.g. v0.4.0)"
  exit 1
fi

TARGET_VERSION="${TARGET_TAG#v}"

echo "=================================================================="
echo "🎯 Official Release Version Synchronization"
echo "Target Tag     : $TARGET_TAG"
echo "Target Version : $TARGET_VERSION"
echo "=================================================================="

CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "")

if [ "$CURRENT_VERSION" = "$TARGET_VERSION" ]; then
  echo "✅ Monorepo version is already $TARGET_VERSION. No file modifications needed."
  exit 0
fi

if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
  echo "• Configuring Git author..."
  git config user.name "github-actions[bot]"
  git config user.email "github-actions[bot]@users.noreply.github.com"

  # Switch to branch main to avoid detached HEAD
  git checkout -B main origin/main
fi

echo "• Updating package.json in monorepo root, client, and server..."

node -e '
  const fs = require("fs");
  const targetVer = process.argv[1];
  const files = ["package.json", "client/package.json", "server/package.json"];
  for (const f of files) {
    if (fs.existsSync(f)) {
      const data = JSON.parse(fs.readFileSync(f, "utf-8"));
      data.version = targetVer;
      fs.writeFileSync(f, JSON.stringify(data, null, 2) + "\n");
      console.log(`  ✓ ${f} -> ${targetVer}`);
    }
  }
' "$TARGET_VERSION"

if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
  echo "• Committing official release version bump to main..."
  git add package.json client/package.json server/package.json
  git commit -m "chore(release): v${TARGET_VERSION} [skip ci]"
  
  echo "• Pushing release commit to main..."
  git push origin main

  echo "• Pushing updated tag $TARGET_TAG to point to the release commit..."
  git tag -fa "$TARGET_TAG" -m "Release $TARGET_TAG"
  git push origin "$TARGET_TAG" --force || echo "::warning::Tag update on remote skipped or already pinned"

  echo "✅ Official release $TARGET_TAG successfully synced and committed to main."
else
  echo "ℹ️ Local environment detected. Files updated without auto-commit."
fi
