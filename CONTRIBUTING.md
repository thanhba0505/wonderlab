# Contributing to Wonderlab

Thank you for your interest in contributing to Wonderlab! To maintain high engineering standards, architectural clarity, and long-term maintainability across our interactive scientific simulations platform, please adhere to the guidelines outlined below.

---

## 1. Commit Guidelines (Conventional Commits)

Wonderlab strictly adheres to the **Conventional Commits v1.0.0** specification in English:

- `feat: <description>`: Introduces a new feature for users.
- `fix: <description>`: Fixes a bug.
- `chore: <description>`: Changes build configuration, dependencies, or periodic maintenance.
- `docs: <description>`: Technical documentation changes only.
- `test: <description>`: Adds or refactors unit, integration, or E2E tests.
- `refactor: <description>`: Code change that neither fixes a bug nor adds a feature.
- `ci: <description>`: CI/CD configuration files and scripts.

_Example_: `feat(simulations): add Monty Hall interactive simulation component`

---

## 2. Development Workflow

Wonderlab uses a unified persistent worktree and trunk-based workflow targeting `develop`:

1. **Check Out an Assigned Worktree**:
   Always work within persistent worktree directories (`Wonderlab-worktree-N`) to preserve caching:
   ```bash
   cd /Users/lethanhba/workspace/app/Wonderlab-worktree-1
   git fetch origin
   git checkout -B <type>/<task-name> origin/develop
   ```
2. **Implement Changes**:
   - Strictly follow the core guidelines documented in [AGENTS.md](AGENTS.md).
   - Zero secrets: never commit `.env` files or credentials.
   - Maintain the "Clean Paper & Lab Editorial" design standard for UI components.
3. **Mandatory Verification**:
   Before submitting changes, run the full verification pipeline:
   ```bash
   pnpm check
   ```
   All steps (`format:check`, `lint`, `typecheck`, `test`, `test:e2e`, and `build`) must pass with exit code `0`.
4. **Merge Directly to `develop`**:
   Once all tests and builds pass cleanly:
   ```bash
   git fetch origin && git rebase origin/develop && git push origin HEAD:develop
   git checkout -B worktree-1 origin/develop && git branch -d <type>/<task-name>
   git -C /Users/lethanhba/workspace/app/Wonderlab pull origin develop
   ```
   _Note_: The `main` branch is strictly reserved for production releases and automated CD synchronization.

---

## 3. Definition of Done (DoD)

A contribution is considered complete and ready for integration when:

- [ ] Linter reports zero errors and zero warnings (`pnpm lint`).
- [ ] TypeScript compiler passes in strict mode without errors (`pnpm typecheck`).
- [ ] All unit, integration, and E2E tests pass (`pnpm test`, `pnpm test:e2e`).
- [ ] Both Next.js client and NestJS server compile successfully (`pnpm build`).
- [ ] Corresponding documentation in `docs/` is updated if architectural, API, or deployment details changed.
