# AGENTS.md — Wonderlab AI Coding Guidelines

Welcome to **Wonderlab**. This document is the primary source of truth and authoritative set of rules for AI coding assistants working in this repository.

> [!CRITICAL]
>
> ### 🚨 BẮT BUỘC: GIAO THỨC TIỀN KIỂM TRA WORKTREE (WORKTREE PRE-FLIGHT PROTOCOL)
>
> **Trước khi gõ bất kỳ lệnh git nào, đọc/sửa bất kỳ file nào, hoặc tạo bất kỳ branch nào**:
>
> 1. **BẮT BUỘC** chạy `git worktree list` đầu tiên để kiểm tra tình trạng phân bổ worktree trên máy.
> 2. Nếu thư mục chính `Wonderlab` đang ở bất kỳ nhánh nào khác `main` sạch (tức đang có tác vụ song song khác đang chạy):
>    - **TUYỆT ĐỐI KHÔNG** được chạy `git checkout`, `git checkout -b`, `git stash`, hay chỉnh sửa file trong thư mục chính `Wonderlab`!
>    - **PHẢI CHUYỂN NGAY LẬP TỨC** sang làm việc độc lập tại một trong hai persistent worktree có sẵn:
>      - `Wonderlab-worktree-1` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-1`)
>      - `Wonderlab-worktree-2` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-2`)
> 3. Mọi thao tác chỉnh sửa file (`edit_file`, `write_file`) và chạy lệnh (`run_command`) PHẢI sử dụng đường dẫn tuyệt đối hoặc lệnh `cd` bên trong thư mục worktree đã chọn.
> 4. Vi phạm việc nhảy nhánh trên workspace chính gây xung đột git, ghi đè stash và làm hỏng tiến trình của các tác vụ AI khác đang chạy song song!

---

## 1. Product Overview

Wonderlab is an interactive web platform dedicated to exploring science, probability, paradoxes, logic puzzles, thought experiments, visual simulations, and mind games.

- **Audience**: General public with curiosity for science, math, and logic; no formal prerequisite knowledge required.
- **Mission**: Demystify counter-intuitive concepts into hands-on visual experiences where users directly manipulate parameters, observe outcomes, and develop intuitive understanding.
- **Current Scope**: Monorepo foundation stage. Includes Next.js client with high-fidelity dark-mode homepage and admin placeholder, NestJS backend with `/health` endpoint, Docker Compose for local PostgreSQL, comprehensive tooling, test suites, and CI/CD.

---

## 2. Monorepo Architecture

Wonderlab uses a unified **pnpm workspace** monorepo:

```text
wonderlab/
├── client/          # Next.js 15 App Router frontend
├── server/          # NestJS 10 REST API backend
├── docs/            # Engineering & architecture documentation
├── .github/         # CI/CD workflows, issue templates, PR template
├── .agents/skills/  # Project-specific AI agent playbooks
├── scripts/         # Local development & verification scripts
├── docker-compose.yml # Local PostgreSQL container service
└── render.yaml      # Render blueprint deployment specification
```

### Boundaries & Responsibilities:

- **Client (`/client`)**: User interface, routing, interactive simulations, client-side state. Communicates with server via REST (`NEXT_PUBLIC_API_BASE_URL`).
- **Server (`/server`)**: Standalone REST API backend. Global prefix `/api/v1`. Swagger documentation at `/api/docs`. Currently exposes only `/health`.
- **Database (`docker-compose.yml`)**: Local PostgreSQL 16 on loopback `127.0.0.1:5434`. Not connected to server in foundation phase; ORM choice is intentionally deferred.

---

## 3. Technology & Version Policy

- **Node.js**: `v24.x` / LTS (see `.nvmrc`).
- **Package Manager**: `pnpm@12.11.2` (pinned in root `package.json`). Never use `npm` or `yarn`. Never edit `pnpm-lock.yaml` manually.
- **Client**: Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS, Lucide React, Motion.
- **Server**: NestJS 10, TypeScript strict, `@nestjs/terminus`, `@nestjs/swagger`, `class-validator`, `class-transformer`.
- **Database**: PostgreSQL 16 Alpine containerized with Docker Compose.

---

## 4. Environment & Security Rules

1. **Zero Secret Leakage**: Never commit `.env`, `.env.local`, API tokens, or database passwords. All environment files with secrets must be ignored by `.gitignore`.
2. **Client Boundaries**: Only variables prefixed with `NEXT_PUBLIC_` are accessible in client bundles. Never place server secrets or credentials in `NEXT_PUBLIC_*`.
3. **Database Security**: Local PostgreSQL must bind exclusively to `127.0.0.1` (loopback) to prevent public network exposure.
4. **Admin Route**: `/admin` is a secure administrative console requiring active `Role.ADMIN` authentication verified via HttpOnly session cookies. Unauthenticated visitors are routed through the authentication wall.
5. **CORS Policy**: CORS origins must be explicitly matched against `CORS_ORIGINS` environment variables.

---

## 5. UI/UX Design Principles & Anti-AI Standards for Wonderlab

- **Visual Aesthetic**: "Clean Paper & Lab Editorial" — high-craft scientific editorial design with slate-100 canvas (`#f1f5f9`), crisp white surfaces (`#ffffff`), hairline technical borders (`border-slate-300/85`), layered depth (`shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]`), and semantic accents (Cobalt, Violet, Amber, Emerald).
- **Typography Architecture**:
  - `Be Vietnam Pro` (Sans) for optical Vietnamese readability, balanced tone diacritics, and relaxed reading lines.
  - `Space Grotesk` (Heading) for geometric, authoritative scientific titles (`text-slate-900`).
  - `JetBrains Mono` (Mono) with `tabular-nums` for simulation counters, probabilities, and formulas.
  - **Minimum Font Size Standard ($\ge 12\text{px}$)**: Strictly forbid any font size below `12px` (`text-xs`). Never use `text-[11px]`, `text-[10px]`, `text-[9px]`, `text-[8px]`, or any micro-text. All captions, badges, metadata, and helper text must be at least `text-xs` (12px / 0.75rem) to guarantee visual accessibility and clean editorial sharpness.
  - **Section Headings Standard (18px)**: Standardize all primary section headings (`h2`) in simulation workflows and editorial views to `18px` (`text-[18px]` or `text-lg`), keeping titles clean, prominent, and proportional without aggressive oversized headers.
- **Anti-AI Slop Guardrails**:
  1. _No unmotivated purple/pink linear gradients_ on buttons or text.
  2. _No muddy glassmorphism everywhere_ (`backdrop-blur` stacked blindly). Use crisp, opaque surfaces.
  3. _No cookie-cutter 3-column identical card grids_. Use asymmetric Bento Grids and editorial rhythms.
  4. _No SaaS buzzword copy_ ("Supercharge your mind", "Revolutionary platform"). Keep copy intellectually curious, authentic, and scientific.
  5. _No oversized toy-like border radiuses_. Calibrate radii: `rounded-md` (badges/inputs), `rounded-lg` (buttons), `rounded-xl` (cards).
  6. _No multi-nested border boxes (> 2 layers)_. Never wrap container boxes inside cards when children already have borders. Use borderless background tints (`bg-slate-100/70`), left accents (`border-l-4`), or dividers.
  7. _No internal tech stack boasting or leaking dev endpoints to public UI_.
     - **NEVER** expose internal library/algorithm names (e.g. `Argon2id`, `HttpOnly Cookie`, `OWASP compliant`, `Prisma`, `JWT`) on public forms or user screens.
     - **NEVER** place internal developer links, localhost ports, or raw health endpoints (e.g. `http://localhost:4101/api/docs`, `NestJS Server API: Sẵn sàng hoạt động (/api/v1/health)`) in public footers or public navigation.
     - **NEVER** dump framework version strings into client UI copy.
  8. _No micro font sizes (< 12px)_. Never use arbitrary micro font sizes (`text-[11px]`, `text-[10px]`, `text-[9px]`, `text-[8px]`). The minimum allowed font size across the entire platform is strictly 12px (`text-xs`). Section headings are standardized to `18px` (`text-[18px]`).
  9. _No developer self-narration, code concepts, config names, or architecture descriptions on user UI_.
     - **NEVER** expose architecture models, backend implementation details, configuration labels, code concepts, or developer self-narration on any user-facing screens or public UI.
     - **Strictly Forbidden Examples**:
       - Architecture/pattern jargon: `"Mô hình phản biện 2 cấp"`, `"cấu trúc lồng 2 cấp (Root -> Reply)"`, `"xử lý bất đồng bộ"`, `"REST API"`, `"MVC pattern"`.
       - Formatting / implementation self-narration: `"Biểu diễn phân số & số mũ"`, `"render trực tiếp từ state"`, `"dữ liệu tính toán live"`, `"cấu hình tham số"`, `"component"`.
       - Developer / code jargon: Variable names, database column names, internal algorithm versions, config keys.
     - **Rule of Thumb**: If a phrase describes _how the software is coded, configured, or architected_ rather than the _scientific subject matter or authentic user action_, it MUST NOT appear in the UI. Keep all copy strictly scientific, editorial, and natural.
- **No Faux Data**: Never display mock user counters, fake review badges, or placeholder vanity statistics. Show honest simulation counters calculated live in the browser.
- **No Lorem Ipsum**: All copy must be meaningful, scientific, engaging, and in Vietnamese or English according to user language settings.
- **Interactive Authenticity & Tactile Feel**: Every clickable element (e.g. Monty Hall doors) must function accurately with physical feedback (`active:scale-[0.98]`) and update mathematical probabilities live with `font-mono tabular-nums`.
- **Accessibility & Motion**: Respect `prefers-reduced-motion`. Provide clear keyboard focus indicators (`focus-visible:ring-2 focus-visible:ring-cyan-400`).

---

## 6. Coding & TypeScript Conventions

- **TypeScript Strict Mode**: No `any`. Explicit function return types and interface contracts.
- **Clean Code & Guard Clauses**: Validate inputs early; return early. Avoid nested `if/else` past 2 levels.
- **Naming**: Intent-revealing names (`isDoorRevealed`, `calculateMontyProbabilities`). No abbreviations or single-character variables except standard loop indices.
- **Imports**: Group imports (standard/external first, internal path aliases `@/...` second, relative third).

---

## 7. Testing & Verification Policy

Always run the unified root scripts before declaring work complete:

```bash
pnpm format:check   # Prettier formatting verification
pnpm lint           # ESLint across all workspaces
pnpm typecheck      # TypeScript typecheck for client and server
pnpm test           # Unit tests across packages
pnpm test:e2e       # Server E2E tests
pnpm build          # Production builds for client and server
pnpm check          # Runs all verification steps in sequence
```

---

## 8. Git & Workflow Conventions

- Commit format: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`).
- Always verify working tree and secrets with `git status` before committing.
- Never force push (`--force`) to `main`.
- **Branching & PR Workflow**:
  - **Never commit directly to `main`**: All development must take place on dedicated branches (`feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`).
  - **PR Creation & User-Only Merge**:
    - Upon completing code and passing `pnpm check`, push the branch and open a Pull Request (PR) targeted at `main`.
    - **Agents must NEVER merge PRs into `main`**. Only the repository owner/user merges PRs.
  - **Auto-Delete Branches & Post-Merge Handling**:
    - GitHub repository is configured with _Automatically delete head branches_ on merge.
    - When a branch is merged and deleted by the user, pull latest `main` (`git checkout main && git pull origin main`) and branch off `main` for subsequent tasks. Never attempt to resurrect or continue committing onto a merged/deleted branch.
  - **Concurrent Tasks & Persistent Worktree Pool**:
    - The repository maintains two persistent Git Worktrees alongside the main workspace:
      - `Wonderlab` (Main workspace): Client on `http://localhost:4100`, Server on `http://localhost:4101`.
      - `Wonderlab-worktree-1`: Client on `http://localhost:4200`, Server on `http://localhost:4201`.
      - `Wonderlab-worktree-2`: Client on `http://localhost:4300`, Server on `http://localhost:4301`.
      - PostgreSQL: Shared container on `127.0.0.1:5434` (`docker compose up -d`).
    - **Step-by-Step Worktree Selection (Bắt buộc cho mọi Agent Turn)**:
      ```bash
      # 1. Kiểm tra danh sách worktree
      git worktree list

      # 2. Nếu thư mục chính Wonderlab bận (đang ở nhánh khác main), chuyển sang worktree trống:
      cd /Users/lethanhba/workspace/app/Wonderlab-worktree-1
      git fetch origin
      git checkout main && git pull origin main && git checkout -b feat/<task-name>
      ```
    - **Persistent Retention Policy**: Do NOT delete the worktrees upon task completion. Keeping them persistent preserves `node_modules`, Prisma artifacts, and build caches, eliminating repetitive installation overhead.
    - **Reusing Worktrees Across Tasks**: When a task PR is merged and the remote branch is auto-deleted, reset the worktree to the latest `main`:
      ```bash
      git checkout main && git pull origin main && git checkout -b feat/<next-task>
      ```
    - Worktrees guarantee zero port collision, zero dirty stash risk, and total process isolation for parallel development.
- **Single Source of Truth for Versioning**:
  - Root `package.json` is the sole, authoritative source of truth for the project version (`version`).
  - Both `client` (`next.config.ts` -> `process.env.NEXT_PUBLIC_APP_VERSION`) and `server` (`server/src/common/version.ts`) dynamically consume this single root version.
  - Never hardcode version strings in health endpoints, Swagger, or application copy.
  - **Version Update Policy**: Phiên bản mã nguồn (`package.json`) chỉ được cập nhật khi **chính thức phát hành Release** (sự kiện `release: [published]` hoặc tag release `push: tags: ['v*']`), tuyệt đối **KHÔNG** cập nhật phiên bản khi đang ở trạng thái bản nháp (Draft Release) hoặc khi push commit thông thường lên `main`.
- **Tag-Driven Deployment Only (Publish Tag)**:
  - **NEVER** deploy to Render manually or trigger ad-hoc `workflow_dispatch` runs for regular releases.
  - Deployments to Render must **ONLY** be triggered by publishing a Git tag (`push: tags: ['v*']`) or publishing an official GitHub Release (`release: [published]`).
  - This ensures every deployment is deterministic, traceable, and tied to an immutable release tag with automated release notes.

---

## 9. Non-Negotiable Agent Rules

1. **Mandatory Worktree Pre-Flight Protocol**: Run `git worktree list` on your very first turn. If the main workspace `Wonderlab` has active work or another branch checked out, you MUST execute all work inside `Wonderlab-worktree-1` or `Wonderlab-worktree-2`. NEVER checkout branches or touch files in `Wonderlab` during concurrent tasks.
2. **Read Before Writing**: Inspect existing files and documentation before editing.
3. **No Unrequested Scope Creep**: Do not add user management, authentication, payment, or complex databases until explicitly requested.
4. **No Fake Completions**: Never declare tests or builds have succeeded without actually executing them and inspecting the output.
5. **Preserve Documentation Integrity**: Update docs in `docs/` whenever architectural decisions or workflows change.
6. **Publish-Tag Deployments Only**: Never trigger production deployments to Render via manual commands or arbitrary scripts. Always use official tag releases (`git tag vX.Y.Z && git push origin vX.Y.Z` or publishing a GitHub Release).
7. **No Direct Commits to Main & User Merges Only**: Never commit directly to `main`. Always create a feature/fix branch, open a PR, and let the user review and merge.
