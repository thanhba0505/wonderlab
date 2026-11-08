<div align="center">

# Wonderlab

**Interactive digital laboratory exploring science, probability, paradoxes, and logical reasoning.**

[![GitHub Release](https://img.shields.io/github/v/release/thanhba0505/wonderlab?style=flat-square&color=0284c7&label=version)](https://github.com/thanhba0505/wonderlab/releases)
[![CI Status](https://img.shields.io/github/actions/workflow/status/thanhba0505/wonderlab/ci.yml?branch=main&style=flat-square&label=CI&color=10b981)](https://github.com/thanhba0505/wonderlab/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10-e0234e?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Neon Database](https://img.shields.io/badge/Database-Neon_Postgres-00e599?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)

[🌐 Live Experience](https://wonderlab.io.vn) • [📖 Architecture Documentation](docs/architecture.md) • [📋 Contributing Guide](CONTRIBUTING.md) • [🐛 Report Issue](https://github.com/thanhba0505/wonderlab/issues)

</div>

---

## 🧭 Explorer & Learner Guide

### 1. Philosophy & Mission

Wonderlab transforms abstract mathematical laws, quantum physics phenomena, and counterintuitive decision dilemmas into tactile, engaging digital experiments.

Rather than memorizing passive textbook equations, learners directly manipulate experimental parameters, trigger high-speed Monte Carlo simulations (up to 10,000+ trials), and witness firsthand the convergence between empirical data and analytical theory.

### 2. Core Interactive Features

- **Interactive Science Lab & Dynamic Simulations**: Tactile visual benches with immediate physics feedback, enabling real-time variable tweaking and instant state transitions.
- **Intuition Gap Challenge**: Assesses the learner's pre-conceived intuition against analytical reality, highlighting cognitive heuristics and probability biases.
- **Clean Mathematical Typography**: Scientific equations rendered via calibrated fractions, mathematical notation, and interactive distribution curves.
- **Academic Discussion & Peer Insights**: A threaded discussion engine for community learners, researchers, and educators to debate strategies and mechanistic explanations.
- **Research Data Export Suite**: One-click export of experimental trials, runs, and parameters to CSV or JSON formats for statistical analysis.

### 3. Quick Links

- **Production App**: [https://wonderlab.io.vn](https://wonderlab.io.vn)
- **Interactive OpenAPI / Swagger Documentation**: [https://wonderlab-server.onrender.com/api/docs](https://wonderlab-server.onrender.com/api/docs)
- **Service Health Probe**: [https://wonderlab.io.vn/health](https://wonderlab.io.vn/health)

---

## 🛠️ Developer & Contributor Guide

### 1. Monorepo Architecture

Wonderlab is structured as a unified **pnpm workspace** monorepo designed for performance, modularity, and strict type safety:

```text
wonderlab/
├── client/              # Next.js 15 (App Router), React 19, Tailwind CSS, Lucide React, Motion
├── server/              # NestJS 10 REST API, Prisma ORM, Swagger OpenAPI, Terminus Health
├── docs/                # Architectural guides, testing policy, CI/CD, deployment, and ADRs
├── .github/             # Parallel CI/CD workflows, issue templates, PR templates, release automation
├── .agents/skills/      # Coding guidelines, design principles, and playbooks for AI agents
├── scripts/             # Local verification and deployment verification scripts
├── docker-compose.yml   # PostgreSQL 16 Alpine container (Local loopback development)
├── render.client.yaml   # Dedicated Render Frontend Blueprint specification
└── render.server.yaml   # Dedicated Render Backend Blueprint specification
```

### 2. Modern Tech Stack

| Layer                    | Primary Technology                                        | Version / Standard                           |
| :----------------------- | :-------------------------------------------------------- | :------------------------------------------- |
| **Frontend (`client/`)** | Next.js App Router, React, Tailwind CSS                   | Next.js 15.5.29, React 19, TypeScript Strict |
| **Backend (`server/`)**  | NestJS REST API, TypeScript, Swagger                      | NestJS 10.4.15, Node.js 24                   |
| **Database**             | Neon Serverless PostgreSQL (Prod) / PostgreSQL 16 (Local) | Prisma ORM 6.x, Argon2id Password Hashing    |
| **Package Manager**      | pnpm Workspace (pinned lockfile)                          | pnpm 12.11.2                                 |
| **Deployment & Hosting** | Render (Frontend & Backend isolated workspaces)           | Render Web Services, Custom Domain SSL       |
| **Automation & CI/CD**   | GitHub Actions (Parallel verification pipelines)          | GitHub Actions v4, Docker Compose            |

### 3. Local Development Setup

#### Prerequisites

- **Node.js**: `v24.x` / LTS (see `.nvmrc`)
- **pnpm**: `12.11.2` (`npm i -g pnpm@12.11.2`)
- **Docker & Docker Compose**: For local PostgreSQL container

#### Getting Started

1. **Clone repository and install dependencies**:

   ```bash
   git clone https://github.com/thanhba0505/wonderlab.git
   cd wonderlab
   cp .env.example .env
   pnpm install
   ```

2. **Start the Local PostgreSQL Container**:

   ```bash
   docker compose up -d postgres
   ```

   _(PostgreSQL securely binds to loopback `127.0.0.1:5432`)_

3. **Run Development Servers**:
   ```bash
   # Concurrently run both Frontend and Backend:
   pnpm dev

   # Or run individually:
   pnpm dev:client   # Next.js Client on http://localhost:4100
   pnpm dev:server   # NestJS Server on http://localhost:4101
   ```

### 4. Quality Assurance & Verification Pipeline

Every contribution is subject to a strict verification pipeline. Zero warnings and zero type errors are tolerated:

```bash
pnpm check          # Full pipeline: Format -> Lint -> Typecheck -> Unit Tests -> E2E Tests -> Build
pnpm test           # Unit Tests (Vitest for client, Jest for server)
pnpm test:e2e       # E2E Tests against isolated PostgreSQL database
pnpm lint           # ESLint verification with 0 warnings policy
pnpm format:check   # Prettier code formatting check
```

### 5. Decoupled Parallel CI/CD Pipelines

Upon pushing commits or opening Pull Requests to `main`, GitHub Actions automatically triggers **4 parallel jobs**:

- **`🎨 Quality & Types`** (~40s): Prettier, ESLint, and strict TypeScript compilation.
- **`🧪 Unit Tests`** (~31s): Runs isolated unit tests across client and server.
- **`🛡️ E2E Tests (Database)`** (~59s): Spawns PostgreSQL 16 Alpine container, deploys Prisma migrations, seeds data, and runs API tests.
- **`📦 Build Applications`** (~57s): Verifies production compilation for both Next.js and NestJS.

Production deployments trigger on published GitHub Releases (`v*`), rolling out backend migrations, deploying frontend assets, and verifying live health endpoints.

### 6. Technical Documentation Index (`docs/`)

Explore in-depth architectural decisions, guidelines, and specifications:

- [System Architecture (`docs/architecture.md`)](docs/architecture.md)
- [Frontend Engineering & UI Standards (`docs/frontend.md`)](docs/frontend.md)
- [Backend Services & API Architecture (`docs/backend.md`)](docs/backend.md)
- [Database Configuration & Operations (`docs/database.md`)](docs/database.md)
- [Deployment & Cloud Infrastructure (`docs/deployment.md`)](docs/deployment.md)
- [CI/CD Automation & Release Pipeline (`docs/ci-cd.md`)](docs/ci-cd.md)
- [Architecture Decision Records (`docs/decisions/`)](docs/decisions/)

---

## 📄 License

Wonderlab is licensed under the [MIT License](LICENSE) © 2026 **thanhba0505**. Open source and freely usable for educational, research, and non-commercial scientific exploration.
