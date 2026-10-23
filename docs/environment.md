# Environment Variables Specification — Wonderlab

This document describes all environment variables used by Wonderlab across Client, Server, and Database environments.

---

## 1. Variable Inventory

| Variable                   | Service         | Required?        | Default / Local Example                       | Description                                                     |
| -------------------------- | --------------- | ---------------- | --------------------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`     | Client          | Optional         | `Wonderlab`                                   | Application display name.                                       |
| `NEXT_PUBLIC_APP_URL`      | Client          | Optional         | `http://localhost:3000`                       | Canonical public URL of the web client.                         |
| `NEXT_PUBLIC_API_BASE_URL` | Client          | Required         | `http://localhost:3001/api/v1`                | Public REST API base URL accessible by browser.                 |
| `NODE_ENV`                 | Client & Server | Required         | `development` / `production`                  | Node execution environment.                                     |
| `SERVER_PORT`              | Server          | Optional         | `3001` (Render: `10000`)                      | Port on which the NestJS HTTP listener binds.                   |
| `CORS_ORIGINS`             | Server          | Required in Prod | `http://localhost:3000,http://localhost:3002` | Whitelisted origins permitted to perform cross-origin requests. |
| `POSTGRES_DB`              | Database        | Required         | `wonderlab`                                   | Database name for PostgreSQL container.                         |
| `POSTGRES_USER`            | Database        | Required         | `wonderlab`                                   | Master user for PostgreSQL container.                           |
| `POSTGRES_PASSWORD`        | Database        | Required         | _(local dev secret)_                          | Master password for PostgreSQL container.                       |
| `POSTGRES_PORT`            | Database        | Optional         | `5433`                                        | Host port exposed for loopback (`127.0.0.1`).                   |
| `POSTGRES_HOST`            | Database        | Optional         | `127.0.0.1`                                   | Hostname for local DB clients (DBeaver, psql).                  |

---

## 2. Security Boundaries

- **Client Bundle Safety**: Variables without the `NEXT_PUBLIC_` prefix are stripped by Next.js during build and never sent to client browsers. Never prefix database passwords or secrets with `NEXT_PUBLIC_`.
- **Database Loopback**: Port 5433 is strictly bound to `127.0.0.1` in `docker-compose.yml`, preventing external network connections.
- **Production Overrides on Render**:
  - In Render, configure `NEXT_PUBLIC_API_BASE_URL` on the Client Web Service pointing to `https://<your-server-service>.onrender.com/api/v1`.
  - Configure `CORS_ORIGINS` on the Server Web Service pointing to `https://<your-client-service>.onrender.com`.
