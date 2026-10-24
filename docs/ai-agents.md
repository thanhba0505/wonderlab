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

1. **Context Loading**: The agent must read `AGENTS.md` and the relevant skill playbook in `.agents/skills/` before proposing or editing code.
2. **Scope Discipline**: Never introduce unrequested dependencies, complex database schemas, or speculative features.
3. **Execution Verification**: The agent must execute `pnpm check` and verify that all format, lint, typecheck, test, and build tasks exit with code 0 before concluding the turn.
