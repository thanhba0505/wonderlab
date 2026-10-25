---
name: git-workflow
description: Git branching, Conventional Commits formatting, direct merge to develop, and persistent worktree protocol for Wonderlab.
---

# Git & GitHub Workflow Standards

## 0. Mandatory Worktree-Exclusive Coding Protocol (Step 0)

**MANDATORY FIRST STEP BEFORE RUNNING ANY TASK OR GIT COMMAND**:

```bash
# 1. Always inspect active worktrees first
git worktree list
```

- **Strict Worktree-Exclusive Policy**:
  - The main workspace (`Wonderlab`) is strictly an idle root anchor on `develop` (used only for repo synchronization and worktree orchestration).
  - **NEVER** edit files, run development tasks, `git checkout`, `git checkout -b`, or `git stash` in `/Users/lethanhba/workspace/app/Wonderlab`!
  - **ALL CODING MUST OCCUR INSIDE A PERSISTENT WORKTREE**:
    - `Wonderlab-worktree-1` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-1`, Client `4200`, Server `4201`, branch `worktree-1`)
    - `Wonderlab-worktree-2` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-2`, Client `4300`, Server `4301`, branch `worktree-2`)
    - `Wonderlab-worktree-3` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-3`, Client `4400`, Server `4401`, branch `worktree-3`)
    - `Wonderlab-worktree-4` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-4`, Client `4500`, Server `4501`, branch `worktree-4`)
    - `Wonderlab-worktree-5` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-5`, Client `4600`, Server `4601`, branch `worktree-5`)
- Sync with remote and branch off inside the selected worktree (Git does NOT allow checking out `develop` in multiple worktrees at once):
  ```bash
  cd /Users/lethanhba/workspace/app/Wonderlab-worktree-1
  git fetch origin
  git checkout -B <type>/<task-name> origin/develop
  ```
- Execute all file modifications (`edit_file`, `write_file`) and tool calls (`run_command`) strictly using absolute paths or `cd` targeting the selected worktree.

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
3. Keep commit messages descriptive and concise in English.
4. Never force-push (`git push --force`) to `develop`, `main` or shared branches.

## 3. Branching, Direct Merge & Worktree Protocol

1. **Dedicated Branch for Each Task**: Never edit or commit directly on `develop` or `main` without creating a dedicated branch first. Always create a task branch (`feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`).
2. **Direct Merge into Develop (No PRs Required)**:
   - Once the task is complete and verified with `pnpm check`, merge the branch directly into `develop` and push to `origin develop`.
   - Each push to `develop` automatically updates the Draft Release on GitHub.
   - `main` is reserved strictly for production releases triggered via publishing a GitHub Release.
3. **Execution Exclusively Inside Worktrees**:
   - The main workspace (`Wonderlab`) is strictly an idle root anchor on `develop` (no branch-hopping or coding allowed).
   - In any selected worktree (`Wonderlab-worktree-1` through `Wonderlab-worktree-5`):
     ```bash
     cd /Users/lethanhba/workspace/app/Wonderlab-worktree-1
     git fetch origin
     git checkout -B <type>/<task-name> origin/develop
     # Make code changes and verify:
     pnpm check
     # Rebase onto latest develop and push directly:
     git fetch origin
     git rebase origin/develop
     git push origin HEAD:develop
     # Reset worktree to idle tracking branch:
     git checkout -B worktree-1 origin/develop
     git branch -d <type>/<task-name>
     # Sync main workspace clean develop copy:
     git -C /Users/lethanhba/workspace/app/Wonderlab pull origin develop
     ```
4. **Persistent Git Worktrees & Port Allocation (5 Dedicated Worktrees)**: Keep five pre-warmed worktrees to eliminate dependency installation overhead and guarantee total process isolation. Ports are partitioned to prevent collision:
   - `Wonderlab` (Main workspace): Client `4100`, Server `4101`. Branch: `develop` (strictly idle repo anchor).
   - `Wonderlab-worktree-1`: Client `4200`, Server `4201`. Idle branch: `worktree-1` (tracking `origin/develop`).
   - `Wonderlab-worktree-2`: Client `4300`, Server `4301`. Idle branch: `worktree-2` (tracking `origin/develop`).
   - `Wonderlab-worktree-3`: Client `4400`, Server `4401`. Idle branch: `worktree-3` (tracking `origin/develop`).
   - `Wonderlab-worktree-4`: Client `4500`, Server `4501`. Idle branch: `worktree-4` (tracking `origin/develop`).
   - `Wonderlab-worktree-5`: Client `4600`, Server `4601`. Idle branch: `worktree-5` (tracking `origin/develop`).
   - Database: Shared PostgreSQL on port `5434`.
