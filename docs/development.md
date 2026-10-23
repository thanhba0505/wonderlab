# Local Development Guide — Wonderlab

## 1. Prerequisites

Before setting up Wonderlab, verify the following tools are installed:

- **Node.js**: `v24.x` (or `v22.x` / LTS). Verified with Node `v24.19.0`.
- **pnpm**: `12.11.2` (managed via Corepack or installed globally: `npm i -g pnpm@12.11.2`).
- **Docker & Docker Compose**: Docker 24+ with Compose v2+.
- **Git**: 2.40+.

---

## 2. Initial Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/thanhba0505/wonderlab.git
   cd wonderlab
   ```

2. **Configure Environment Variables**:

   ```bash
   cp .env.example .env
   ```

3. **Install Workspace Dependencies**:
   ```bash
   pnpm install
   ```

---

## 3. Starting Local Services

### Step A: Start PostgreSQL Container

```bash
docker compose up -d postgres
```

Check health:

```bash
docker compose ps
```

### Step B: Run Both Client & Server Concurrently

```bash
pnpm dev
```

Alternatively, run individually in separate terminal sessions:

- **Client**: `pnpm dev:client` (starts Next.js at `http://localhost:3000`)
- **Server**: `pnpm dev:server` (starts NestJS at `http://localhost:3001`)

---

## 4. Key Local URLs

| Service               | Address                                                                    | Description                               |
| --------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| **Frontend Homepage** | [http://localhost:3000](http://localhost:3000)                             | Public science lab & simulation hub       |
| **Admin Placeholder** | [http://localhost:3000/admin](http://localhost:3000/admin)                 | Future administration layout preview      |
| **Server Health API** | [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health) | Microservice health check contract        |
| **Swagger OpenAPI**   | [http://localhost:3001/api/docs](http://localhost:3001/api/docs)           | Interactive API exploration documentation |
| **PostgreSQL**        | `localhost:5432`                                                           | Bound to `127.0.0.1` (loopback only)      |

---

## 5. Pre-Commit Verification Workflow

Always verify your changes before submitting commits:

```bash
pnpm check
```

This runs `format:check`, `lint`, `typecheck`, `test`, `test:e2e`, and `build`.
