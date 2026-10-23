---
name: git-workflow
description: Git branching, Conventional Commits formatting, Pull Request hygiene, and security pre-flight checks for Wonderlab.
---

# Git & GitHub Workflow Standards

## 1. Commit Message Convention

Follow Conventional Commits v1.0.0:

- `feat: <description>`: Introduces a new user-facing feature.
- `fix: <description>`: Fixes a bug.
- `chore: <description>`: Maintenance, package updates, configuration adjustments.
- `docs: <description>`: Documentation changes only.
- `test: <description>`: Adding or refactoring tests.
- `refactor: <description>`: Code change that neither fixes a bug nor adds a feature.
- `ci: <description>`: CI/CD configuration and workflow updates.

## 2. Pre-Commit Security Checklist

Before staging or committing:

1. `git status` check: Ensure no `.env`, `.env.local`, or credential dumps are untracked or staged.
2. Ensure `pnpm check` passes cleanly.
3. Keep commit messages descriptive and concise.
4. Never force-push (`git push --force`) to shared branches.
