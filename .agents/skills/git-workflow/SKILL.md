---
name: git-workflow
description: Git branching, Conventional Commits formatting, Pull Request hygiene, and security pre-flight checks for Wonderlab.
---

# Git & GitHub Workflow Standards

## 0. Mandatory Worktree Pre-Flight Protocol (Step 0)

**MANDATORY FIRST STEP BEFORE RUNNING ANY TASK OR GIT COMMAND**:

```bash
# 1. Always inspect active worktrees first
git worktree list
```

- If `Wonderlab` (Main workspace) is on any branch other than a clean `main` (meaning another agent or developer is currently working in it):
  - **NEVER** run `git checkout`, `git checkout -b`, `git stash`, or edit files in `/Users/lethanhba/workspace/app/Wonderlab`!
  - **IMMEDIATELY SWITCH** to an available idle persistent worktree:
    ```bash
    cd /Users/lethanhba/workspace/app/Wonderlab-worktree-1
    # or
    cd /Users/lethanhba/workspace/app/Wonderlab-worktree-2
    ```
- Sync `main` and branch off inside the worktree:
  ```bash
  git fetch origin
  git checkout main && git pull origin main && git checkout -b <type>/<task-name>
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
3. Keep commit messages descriptive and concise.
4. Never force-push (`git push --force`) to shared branches.

## 3. Branching, Pull Request & Worktree Protocol

1. **Dedicated Branch for Each Task**: Never commit directly to `main`. Always create a task branch (`feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`).
2. **Strict English PR Title & Description**: Both the Pull Request title (Conventional Commits format) and the entire body MUST be authored 100% in professional English. Fill out every section of `.github/pull_request_template.md` (Description, Type of Change, Checklist) in English. Never use Vietnamese or other non-English languages in PR titles or descriptions.
3. **User-Only PR Merging**: Once the task is complete and verified, push the branch and open a Pull Request targeting `main`. Agents must never merge PRs; merging is reserved solely for the user.
4. **Branch Deletion & Post-Merge Sync**: When a branch is merged and auto-deleted, sync `main` locally (`git checkout main && git pull origin main`) and branch off the updated `main` for subsequent tasks. Do not continue work on deleted branches.
5. **Persistent Git Worktrees & Port Allocation**: Keep two pre-warmed worktrees (`Wonderlab-worktree-1` and `Wonderlab-worktree-2`) to avoid deleting and reinstalling dependencies. Ports are partitioned to prevent collision:
   - `Wonderlab` (Main): Client `4100`, Server `4101`.
   - `Wonderlab-worktree-1`: Client `4200`, Server `4201`.
   - `Wonderlab-worktree-2`: Client `4300`, Server `4301`.
   - Database: Shared PostgreSQL on port `5434`.
   - Post-merge reuse: `git checkout main && git pull origin main && git checkout -b feat/<new-task>`.
