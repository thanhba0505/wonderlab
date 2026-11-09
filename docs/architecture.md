# Architecture Documentation — Wonderlab

## 1. System Overview

Wonderlab is an interactive science and logic exploration platform. Its architecture is structured as a full-stack monorepo designed for performance, modularity, and future extensibility (accommodating hundreds of interactive simulations and games).

```mermaid
flowchart TD
    subgraph Users ["Client Tier"]
        Client["Frontend (Next.js 15 / React 19)"]
        UI["Public & Admin UI (Bento Grids, Lab Editorial)"]
        Sim["Simulations (Canvas / WebGL / Math Engines)"]
        Client --> UI
        Client --> Sim
    end

    subgraph Ecosystem ["Ecosystem Services"]
        Gateway["Central Gateway (IAM Master & Slack Alerts)"]
    end

    subgraph Server ["Wonderlab Backend (NestJS 10)"]
        API["REST API (/api/v1)"]
        Auth["Auth & Session Module (HttpOnly Cookie, JWT)"]
        S2S["S2S Module (Bearer Token, timingSafeEqual)"]
        Tele["Simulations & Telemetry Engine"]
        Comm["Nested Comments & Community Requests"]
        API --> Auth
        API --> S2S
        API --> Tele
        API --> Comm
    end

    subgraph Data ["Data Layer"]
        DB[("PostgreSQL 16 (Local) / Neon Serverless (Prod)")]
        UsersTable[("users (Shadow Profile)")]
        ConnectionsTable[("service_connections (S2S Registry)")]
        RunsTable[("simulation_runs & comments")]
        DB --- UsersTable
        DB --- ConnectionsTable
        DB --- RunsTable
    end

    Client -->|REST API / HttpOnly Session| API
    Client -.->|OAuth2 PKCE SSO Redirect| Gateway
    Gateway -->|User Sync (POST /internal/users/sync)| S2S
    S2S -->|Outbound Webhooks / Alerts| Gateway
    Server -->|Prisma ORM v6| DB
```

---

## 2. Monorepo Organization & Boundaries

| Package / Directory  | Technology                         | Role & Boundary                                                                                                                 |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `client/`            | Next.js 15, React 19, Tailwind CSS | High-performance user interface, server components, interactive canvas/SVG simulations. Communicates only via public REST APIs. |
| `server/`            | NestJS 10, Express, Swagger        | Robust TypeScript API service. Handles authentication, simulation telemetry, nested comments, and S2S user synchronization.     |
| `docs/`              | Markdown                           | Comprehensive system, architectural, ADR decisions, and deployment documentation.                                               |
| `.agents/skills/`    | Agent Markdown                     | Standard operating procedures and playbooks for AI coding agents.                                                               |
| `docker-compose.yml` | Docker, PostgreSQL 16 Alpine       | Local database container isolated to loopback network (`127.0.0.1:5432`).                                                       |

---

## 3. Communication Contracts

1. **Client to Server**:
   - Client resolves backend via `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:4101/api/v1`).
   - Server enforces global prefix `/api/v1`.
2. **CORS Policy**:
   - Server allows origins specified in `CORS_ORIGINS` (comma-separated list, default: `http://localhost:4100`).
3. **Data Transfer & Validation**:
   - DTOs validated using `class-validator` and `class-transformer` with `whitelist: true` and `forbidNonWhitelisted: true`.
4. **Service-to-Service (S2S)**:
   - Dynamic service discovery via `service_connections` table.
   - S2S calls are authenticated using timing-safe bearer token verification (`S2SAuthGuard`).

---

## 4. Identity & Single Sign-On (SSO) Architecture

- **Central Gateway IAM**: Central Gateway serves as the single source of truth for user credentials, profile information, and account activation status.
- **Shadow User Pattern**: Wonderlab stores a synchronized shadow user profile (`id`, `username`, `email`, `role`, `avatarUrl`, `isActive`) without maintaining passwords locally.
- **SSO Login Handshake**: Users authenticate through OAuth2 PKCE with Central Gateway. Wonderlab validates the authorization code, upserts the shadow user record, and issues an HttpOnly session cookie.
- **Decoupled Architecture**: See [ADR 0019](file:///Users/lethanhba/workspace/app/Wonderlab/docs/decisions/0019-service-connections-and-iam-user-sync.md).
