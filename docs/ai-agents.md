# AI Coding Agents & Skills Playbook — Wonderlab

## 1. Overview

Wonderlab is maintained collaboratively with advanced AI coding assistants. To ensure high code quality, consistency, and zero regression, this repository specifies strict operating guidelines in [AGENTS.md](file:///Users/lethanhba/workspace/app/Wonderlab/AGENTS.md) and custom agent skills in `.agents/skills/`.

---

## 2. Agent Skills Inventory

The following skills are located in `.agents/skills/`:

| Skill Name               | Path                                         | Purpose                                 | Key Standards                                                                                                                    |
| ------------------------ | -------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **`frontend-design`**    | `.agents/skills/frontend-design/SKILL.md`    | UI/UX design and interaction standards. | Science lab dark interface (`#080c14`), Anti-AI slop guardrails, tactile feedback, asymmetric Bento grids, zero fake statistics. |
| **`nextjs-development`** | `.agents/skills/nextjs-development/SKILL.md` | Next.js 15 App Router conventions.      | RSC vs Client component boundaries, route grouping `(public)`, metadata handling, strict typing, error boundaries.               |
| **`nestjs-backend`**     | `.agents/skills/nestjs-backend/SKILL.md`     | NestJS 10 architecture patterns.        | Global prefix `/api/v1`, DTO validation pipes, Swagger documentation, health monitoring, clean modules.                          |
| **`testing-debugging`**  | `.agents/skills/testing-debugging/SKILL.md`  | Verification and root-cause debugging.  | Vitest and Jest execution, Supertest E2E testing, systematic verification before claiming completion.                            |
| **`git-workflow`**       | `.agents/skills/git-workflow/SKILL.md`       | Version control standards.              | Conventional Commits v1.0.0, branch conventions, pre-commit secret scanning.                                                     |

---

## 3. How to Activate & Follow Skills

When an AI agent operates on this codebase:

1. **Worktree-Exclusive Pre-Flight Check**: The agent must run `git worktree list` and select an idle worktree (`Wonderlab-worktree-1` through `Wonderlab-worktree-5`). The main workspace `Wonderlab` is strictly an idle root anchor on `develop` — never edit files or code in `Wonderlab`. Always branch off `origin/develop` inside a worktree.
2. **Context Loading**: The agent must read `AGENTS.md` and the relevant skill playbook in `.agents/skills/` before proposing or editing code.
3. **Scope Discipline**: Never introduce unrequested dependencies, complex database schemas, or speculative features.
4. **Execution Verification**: The agent must execute `pnpm check` and verify that all format, lint, typecheck, test, and build tasks exit with code 0 before concluding the turn.
5. **Continuous Knowledge Persistence**: Whenever the user establishes a rule or long-term requirement, or when an enduring technical standard is introduced, autonomously codify it in `AGENTS.md` and `docs/` within the same turn.

---

## 4. Autonomous Knowledge Persistence Protocol

To eliminate repetitive instructions and prevent regressions across sessions, agents must adhere to the **Self-Updating Memory Standard**:

1. **Trigger Criteria**:
   - The user defines a persistent rule, stylistic constraint, or architecture policy meant to hold indefinitely (e.g., naming conventions, styling guardrails, security rules, testing boundaries).
   - A new technical subsystem or feature category is introduced that brings ongoing guidelines (e.g., SEO metadata protocols when SEO is added, caching strategies, state management patterns, error reporting).
   - An architectural decision or engineering workflow is finalized or modified.
2. **Action Plan**:
   - **Repository-Wide Rules**: Add or update the rule directly in [AGENTS.md](file:///Users/lethanhba/workspace/app/Wonderlab/AGENTS.md) under Section 9 (Non-Negotiable Agent Rules) or the corresponding topical section.
   - **Subsystem & Technical Details**: Update the matching file under `docs/` (e.g. `frontend.md`, `backend.md`, `architecture.md`, `testing.md`).
   - **Specialized Playbooks**: If the rule dictates agent workflows or domain design, update or create the relevant playbook in `.agents/skills/`.
3. **Zero-Reminder Invariant**:
   - Never wait for the user to say "update AGENTS.md" or "save to docs".
   - Proactively persist long-term standards into repository files during the same turn the standard is discovered or requested.
