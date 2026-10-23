# Deployment Guide — Wonderlab

## 1. Overview

Wonderlab is architected for deployment on cloud platforms with first-class Node.js support. The primary deployment target is **Render** via infrastructure-as-code (`render.yaml`).

---

## 2. Render Blueprint Specification (`render.yaml`)

Wonderlab defines two managed web services in `render.yaml`:

### 1. `wonderlab-server` (NestJS Web Service)

- **Runtime**: `node`
- **Plan**: `free` / `starter`
- **Region**: `oregon` (or user preference)
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter server build`
- **Start Command**: `pnpm --filter server start:prod`
- **Health Check Path**: `/api/v1/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `SERVER_PORT`: `10000` (Render default web port)
  - `CORS_ORIGINS`: Set to your client domain, e.g. `https://wonderlab-client.onrender.com`

### 2. `wonderlab-client` (Next.js Web Service)

- **Runtime**: `node`
- **Plan**: `free` / `starter`
- **Region**: `oregon`
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter client build`
- **Start Command**: `pnpm --filter client start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `NEXT_PUBLIC_APP_NAME`: `Wonderlab`
  - `NEXT_PUBLIC_API_BASE_URL`: `https://<wonderlab-server-name>.onrender.com/api/v1`

---

## 3. Deployment Steps via Render Dashboard

1. **Connect GitHub Repository**:
   - In Render, click **New +** -> **Blueprint**.
   - Select the `wonderlab` repository.
2. **Review Services**:
   - Render will parse `render.yaml` and discover both `wonderlab-server` and `wonderlab-client`.
3. **Configure Environment Secrets**:
   - Once the server is assigned its Render URL, update `NEXT_PUBLIC_API_BASE_URL` on the client service.
   - Set `CORS_ORIGINS` on the server service to the client's public domain.
4. **Deploy**:
   - Click **Apply Blueprint**. Render builds and deploys both services automatically.

---

## 4. Production Checklist

- [ ] Ensure `NEXT_PUBLIC_API_BASE_URL` contains `https://` in production.
- [ ] Ensure `CORS_ORIGINS` does not contain wildcard `*` if credentials are required.
- [ ] Confirm `/api/v1/health` returns HTTP 200 before routing live traffic.
- [ ] For persistent production data in subsequent phases, provision a managed PostgreSQL instance on Render or Supabase and populate connection strings.
