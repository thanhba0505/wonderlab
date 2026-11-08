# Database Configuration & Operations — Wonderlab

## 1. Overview & Dual Environment Architecture

Wonderlab uses a dual-environment PostgreSQL database strategy:

1. **Local Development**: PostgreSQL 16 containerized locally via Docker Compose on loopback port `127.0.0.1:5432`.
2. **Production Environment**: **Neon Serverless PostgreSQL** hosted in AWS Oregon (`us-west-2`), providing autoscaling serverless computes, connection pooling, and automated branch backups without ephemeral trial limits.

ORM and schema migrations across both environments are strictly managed via **Prisma ORM (v6.x)** in `server/prisma/`.

---

## 2. Production Database (Neon Serverless PostgreSQL)

- **Provider**: Neon.tech (AWS Oregon `us-west-2`)
- **Connection Mode**: Pooled connection (`ep-curly-math-ar8nnbms-pooler.c-4.us-west-2.aws.neon.tech`) with `sslmode=require&channel_binding=require`.
- **Active Schemas**:
  - `users`: Administrative user authentication and RBAC (`Role.ADMIN`, `Role.USER`).
  - `simulation_runs`: Stores empirical runs, JSON parameters, Monte Carlo results, trial counts, and anonymous session IDs.
- **Automated Lifecycle**:
  - Applied automatically on deployment via `prisma migrate deploy`.
  - Admin bootstrap seeded via `prisma db seed`.

### Verifying Production Database Connection

```bash
# Query health endpoint
curl -s https://wonderlab-server.onrender.com/api/v1/health | jq .
# Expected output:
# {"status":"ok","service":"wonderlab-server","database":"connected",...}
```

---

## 3. Local Development (Docker Compose)

The local database service is configured in `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: wonderlab-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-wonderlab}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    ports:
      - '127.0.0.1:${POSTGRES_PORT:-5432}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-wonderlab}']
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
```

### Key Security & Operational Traits:

- **Loopback Port Binding**: Strictly bound to `127.0.0.1:${POSTGRES_PORT:-5432}` so the database is never exposed across LAN or public Internet.
- **Port 5432 Standard**: Standardized on port 5432 across the ecosystem (Central Gateway and sub-apps) for consistent local development.
- **Automated Healthcheck**: Runs `pg_isready` inside the container every 5 seconds.
- **Named Volume**: Data persisted in Docker volume `wonderlab_postgres_data`.

---

## 4. Local Database Commands

### Start Database

```bash
docker compose up -d postgres
```

### Check Container Status & Health

```bash
docker compose ps
```

### Apply Migrations Locally

```bash
pnpm --filter wonderlab-server prisma migrate dev
```

### Seed Local Admin Account

```bash
pnpm --filter wonderlab-server db:seed
```

### Stop Database

```bash
docker compose stop postgres
```

### Reset Container (Preserving Volume)

```bash
docker compose down
```

---

## 5. Local Backup & Restore

### Backup local database:

```bash
docker exec -t wonderlab-postgres pg_dump -U postgres wonderlab > backup_$(date +%Y%m%d).sql
```

### Restore local database:

```bash
cat backup_file.sql | docker exec -i wonderlab-postgres psql -U postgres -d wonderlab
```
