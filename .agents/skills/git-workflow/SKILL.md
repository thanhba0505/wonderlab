---
name: git-workflow
description: Git branching, Conventional Commits formatting, direct merge to develop, and persistent worktree protocol for Wonderlab.
---

# Git & GitHub Workflow Standards

## 0. Mandatory Worktree Pre-Flight Protocol (Step 0)

**MANDATORY FIRST STEP BEFORE RUNNING ANY TASK OR GIT COMMAND**:

```bash
# 1. Always inspect active worktrees first
git worktree list
```

- If `Wonderlab` (Main workspace) is on any branch other than a clean `develop` (meaning another agent or developer is currently working in it):
  - **NEVER** run `git checkout`, `git checkout -b`, `git stash`, or edit files in `/Users/lethanhba/workspace/app/Wonderlab`!
  - **IMMEDIATELY SWITCH** to an available idle persistent worktree:
    ```bash
    cd /Users/lethanhba/workspace/app/Wonderlab-worktree-1
    # or
    cd /Users/lethanhba/workspace/app/Wonderlab-worktree-2
    ```
- Sync with remote and branch off inside the worktree (Git does NOT allow checking out `develop` in multiple worktrees at once):
  ```bash
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
3. **Execution by Workspace**:
   - **Main Workspace (`Wonderlab`)**:
     ```bash
     git checkout develop && git pull origin develop
     git checkout -b <type>/<task-name>
     # Make code changes and verify:
     pnpm check
     # Direct merge:
     git checkout develop
     git pull origin develop
     git merge <type>/<task-name> --no-ff -m "<type>: <concise description>"
     git push origin develop
     git branch -d <type>/<task-name>
     ```
   - **Persistent Worktrees (`Wonderlab-worktree-1` or `Wonderlab-worktree-2`)**:
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
     # Sync main workspace if clean/idle:
     git -C /Users/lethanhba/workspace/app/Wonderlab pull origin develop
     ```
4. **Persistent Git Worktrees & Port Allocation**: Keep two pre-warmed worktrees (`Wonderlab-worktree-1` and `Wonderlab-worktree-2`) to avoid deleting and reinstalling dependencies. Ports are partitioned to prevent collision:
   - `Wonderlab` (Main): Client `4100`, Server `4101`. Branch: `develop`.
   - `Wonderlab-worktree-1`: Client `4200`, Server `4201`. Idle branch: `worktree-1` (tracking `origin/develop`).
   - `Wonderlab-worktree-2`: Client `4300`, Server `4301`. Idle branch: `worktree-2` (tracking `origin/develop`).
   - Database: Shared PostgreSQL on port `5434`.
