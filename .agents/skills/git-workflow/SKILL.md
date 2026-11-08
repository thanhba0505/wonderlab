---
name: git-workflow
description: Git branching, Conventional Commits formatting, direct merge to develop, and persistent worktree protocol for Wonderlab.
---

# Git & GitHub Workflow Standards

## 1. Mandatory Worktree-Exclusive Protocol

All development MUST occur inside one of the 5 persistent worktrees. The main workspace (`Wonderlab`) is strictly an idle root anchor on `develop`.

```bash
# 1. Inspect active worktrees first
git worktree list
```

### Persistent Worktrees & Allocated Ports:

- `Wonderlab` (Main root): Client `4100`, Server `4101`. Branch: `develop` (strictly idle repo anchor, NO coding).
- `Wonderlab-worktree-1`: Client `4200`, Server `4201`. Idle branch: `worktree-1` (tracking `origin/develop`).
- `Wonderlab-worktree-2`: Client `4300`, Server `4301`. Idle branch: `worktree-2` (tracking `origin/develop`).
- `Wonderlab-worktree-3`: Client `4400`, Server `4401`. Idle branch: `worktree-3` (tracking `origin/develop`).
- `Wonderlab-worktree-4`: Client `4500`, Server `4501`, branch: `worktree-4` (tracking `origin/develop`).
- `Wonderlab-worktree-5`: Client `4600`, Server `4601`, branch: `worktree-5` (tracking `origin/develop`).
- Database: Shared PostgreSQL on `127.0.0.1:5432`.

### Worktree Execution & Direct Merge Workflow:

```bash
cd /Users/lethanhba/workspace/app/Wonderlab-worktree-N
git fetch origin
git checkout -B <type>/<task-name> origin/develop

# Perform edits and verify:
pnpm check

# Rebase onto latest develop and push directly:
git fetch origin
git rebase origin/develop
git push origin HEAD:develop

# Reset worktree back to idle tracking branch:
git checkout -B worktree-N origin/develop
git branch -d <type>/<task-name>

# Sync main workspace clean develop copy:
git -C /Users/lethanhba/workspace/app/Wonderlab pull origin develop
```

- Execute all tool calls (`edit_file`, `write_file`, `run_command`) targeting the selected worktree.
- Never delete worktrees; persistent retention preserves caches and eliminates install overhead.

---

## 2. Commit Message Convention

Follow Conventional Commits v1.0.0 (strictly in English):

- `feat: <description>`: Introduces a new user-facing feature.
- `fix: <description>`: Fixes a bug.
- `chore: <description>`: Maintenance, package updates, configuration adjustments.
- `docs: <description>`: Documentation changes only.
- `test: <description>`: Adding or refactoring tests.
- `refactor: <description>`: Code change that neither fixes a bug nor adds a feature.
- `ci: <description>`: CI/CD configuration and workflow updates.

---

## 3. Pre-Commit Security & Invariants

1. `git status`: Ensure no `.env*` or secrets are untracked or staged.
2. Ensure `pnpm check` passes cleanly before pushing.
3. Never force-push (`--force`) to `develop`, `main` or shared branches.
4. Direct merge: Push directly to `origin/develop`. No PRs needed for agent tasks. Each push updates the Draft Release.
5. Production release: Triggered strictly by official GitHub Release or `v*` tag.
