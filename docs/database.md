# Database Configuration & Operations — Wonderlab

## 1. Overview & Current Scope

- **PostgreSQL 16**: Containerized locally via Docker Compose (`docker-compose.yml`) on loopback port `5434`.
- **ORM & Migrations**: Managed via **Prisma ORM (v6.x)** in `server/prisma/`.
- **Active Schemas**:
  - `users`: Administrative user authentication and RBAC.
  - `simulation_runs`: Stores empirical runs, JSON parameters, results, trials count, execution duration, and anonymous session IDs.
- **Seeding**: Bootstrapped via `server/prisma/seed.ts` creating a default administrative account with Argon2id password hashing.

---

## 2. Docker Compose Configuration

The local database service is configured in `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: wonderlab-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-wonderlab}
      POSTGRES_USER: ${POSTGRES_USER:-wonderlab}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-wonderlab_dev_pass}
    ports:
      - '127.0.0.1:${POSTGRES_PORT:-5434}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-wonderlab} -d ${POSTGRES_DB:-wonderlab}']
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
```

### Key Security & Operational Traits:

- **Loopback Port Binding**: Strictly bound to `127.0.0.1:${POSTGRES_PORT:-5434}` so the database is never accessible across LAN or the public Internet.
- **Port 5434 Default**: Avoids collision with native PostgreSQL servers running on standard port 5432 or other local services.
- **Automated Healthcheck**: Runs `pg_isready` inside the container every 5 seconds.
- **Named Volume**: Data is stored persistently in Docker volume `wonderlab_postgres_data`.

---

## 3. Operational Commands

### Start Database

```bash
docker compose up -d postgres
```

### Check Container Status & Health

```bash
docker compose ps
```

### Inspect Container Logs

```bash
docker compose logs -f postgres
```

### Stop Database

```bash
docker compose stop postgres
```

### Remove Container (Preserving Data Volume)

```bash
docker compose down
```

---

## 4. Connecting via Client Tools

Use GUI tools like **DBeaver**, **TablePlus**, or CLI `psql`:

- **Host**: `127.0.0.1` (or `localhost`)
- **Port**: `5434`
- **Database**: `wonderlab`
- **Username**: `wonderlab`
- **Password**: _(value of `POSTGRES_PASSWORD` in `.env`)_

CLI example:

```bash
psql -h 127.0.0.1 -p 5434 -U wonderlab -d wonderlab
```

---

## 5. Basic Backup & Restore

### Backup local database:

```bash
docker exec -t wonderlab-postgres pg_dump -U wonderlab wonderlab > backup_$(date +%Y%m%d).sql
```

### Restore local database:

```bash
cat backup_file.sql | docker exec -i wonderlab-postgres psql -U wonderlab -d wonderlab
```
