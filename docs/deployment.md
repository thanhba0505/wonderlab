# Deployment Guide — Wonderlab

## 1. Overview

Wonderlab is architected with a decoupled dual-blueprint deployment model on **Render**:

- **Frontend Client (`client/`)**: Deployed to a dedicated Render Frontend Workspace via `render.client.yaml`.
- **Backend Server (`server/`)**: Deployed to a dedicated Render Backend Workspace via `render.server.yaml`.

This model guarantees that each service receives its own isolated monthly quota of **750 Free instance hours**, preventing resource contention and cold-start cascade between client and server.

---

## 2. Infrastructure Specification

### 1. `wonderlab-client` (Frontend Workspace — `render.client.yaml`)

- **Runtime**: Node.js 24
- **Plan**: `free` (750 hours/month isolated quota)
- **Region**: `oregon`
- **Auto Deploy**: `false` (triggered via GitHub Deploy Hook on published release)
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter wonderlab-client build`
- **Start Command**: `pnpm --filter wonderlab-client start`
- **Health Check Path**: `/health`
- **Domains**:
  - `https://wonderlab.io.vn` (Apex domain)
  - `https://www.wonderlab.io.vn` (Subdomain)
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `NEXT_PUBLIC_APP_NAME`: `Wonderlab`
  - `NEXT_PUBLIC_APP_URL`: `https://wonderlab.io.vn`
  - `NEXT_PUBLIC_API_BASE_URL`: `https://wonderlab-server.onrender.com/api/v1`

### 2. `wonderlab-server` (Backend Workspace — `render.server.yaml`)

- **Runtime**: Node.js 24
- **Plan**: `free` (750 hours/month isolated quota)
- **Region**: `oregon`
- **Auto Deploy**: `false` (triggered via GitHub Deploy Hook on published release)
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter wonderlab-server db:generate && pnpm --filter wonderlab-server build`
- **Start Command**: `pnpm --filter wonderlab-server prisma migrate deploy && pnpm --filter wonderlab-server db:seed && pnpm --filter wonderlab-server start:prod`
- **Health Check Path**: `/api/v1/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `SERVER_PORT`: `10000`
  - `DATABASE_URL`: Connection string for PostgreSQL (supports external providers: Supabase, Neon)
  - `JWT_SECRET`: Secure generated value
  - `CORS_ORIGINS`: `https://wonderlab.io.vn`

---

## 3. Automated CD Pipeline & Deployment Tracking

Deployments are triggered on published releases (`git tag vX.Y.Z`) via `.github/workflows/deploy.yml`:

1. **Server Rollout**: Calls `RENDER_SERVER_DEPLOY_HOOK` to build and deploy the NestJS API.
2. **Client Rollout**: Calls `RENDER_CLIENT_DEPLOY_HOOK` to build and deploy the Next.js Frontend.
3. **Health Verification**: Runs `scripts/verify-deployment.sh` to poll live health endpoints (`https://wonderlab.io.vn/health` and `https://wonderlab-server.onrender.com/api/v1/health`).
4. **GitHub Deployments Integration**: Render GitHub App automatically maintains the two synchronized environments:
   - 🟢 `main - wonderlab-client`
   - 🟢 `main - wonderlab-server`

---

## 4. Production Verification Checklist

- [ ] Confirm `https://wonderlab.io.vn` renders cleanly via Render with HTTP 200 and valid SSL.
- [ ] Confirm `https://wonderlab.io.vn/health` returns `{"status":"ok","service":"wonderlab-client"}`.
- [ ] Confirm `https://wonderlab-server.onrender.com/api/v1/health` returns `{"status":"ok","database":"connected"}`.
- [ ] Verify CORS preflight succeeds from `https://wonderlab.io.vn` to `wonderlab-server`.
