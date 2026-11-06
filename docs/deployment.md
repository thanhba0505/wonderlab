# Deployment Guide — Wonderlab

## 1. Overview

Wonderlab is architected with a decoupled, high-performance hybrid deployment strategy:

- **Frontend Client (`client/`)**: Deployed to **Vercel** via Next.js App Router for zero cold-start, global Edge delivery, and instant response times.
- **Backend Server (`server/`)**: Deployed to **Render** via Infrastructure-as-Code (`render.yaml`) orchestrating a NestJS REST API and PostgreSQL database.

---

## 2. Infrastructure Specification

### 1. `wonderlab-client` (Vercel Production)

- **Platform**: Vercel (Hobby Tier)
- **Framework**: Next.js 15 App Router
- **Root Directory**: `client`
- **Build Command**: `pnpm --filter wonderlab-client build`
- **Production Domains**:
  - `https://wonderlab.io.vn` (Apex domain)
  - `https://www.wonderlab.io.vn` (Subdomain)
  - `https://wonderlab-client.vercel.app` (Vercel default)
- **Environment Variables**:
  - `NEXT_PUBLIC_APP_NAME`: `Wonderlab`
  - `NEXT_PUBLIC_APP_URL`: `https://wonderlab.io.vn`
  - `NEXT_PUBLIC_API_BASE_URL`: `https://wonderlab-server.onrender.com/api/v1`

### 2. `wonderlab-server` (Render Web Service)

- **Runtime**: Node.js 24
- **Plan**: `free`
- **Region**: `oregon`
- **Auto Deploy**: `false` (triggered via GitHub Deploy Hook on published release)
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter wonderlab-server db:generate && pnpm --filter wonderlab-server build`
- **Start Command**: `pnpm --filter wonderlab-server prisma migrate deploy && pnpm --filter wonderlab-server db:seed && pnpm --filter wonderlab-server start:prod`
- **Health Check Path**: `/api/v1/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `SERVER_PORT`: `10000`
  - `DATABASE_URL`: Linked from `wonderlab-db`
  - `JWT_SECRET`: Secure generated value
  - `CORS_ORIGINS`: `https://wonderlab.io.vn,https://wonderlab-client.vercel.app`

### 3. `wonderlab-db` (Render PostgreSQL Database)

- **Engine**: PostgreSQL 16
- **Plan**: `free`
- **Region**: `oregon`
- **Database Name**: `wonderlab`
- **User**: `wonderlab_user`

---

## 3. Automated CD Pipeline & Deployment Tracking

Deployments are triggered on published releases (`git tag vX.Y.Z`) via `.github/workflows/deploy.yml`:

1. **Backend Rollout**: Calls `RENDER_SERVER_DEPLOY_HOOK` to build and deploy the NestJS API.
2. **Frontend Rollout**: Uses `vercel --prod` via `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
3. **Health Verification**: Runs `scripts/verify-deployment.sh` to poll live health endpoints (`https://wonderlab.io.vn/health` and `https://wonderlab-server.onrender.com/api/v1/health`).

---

## 4. Production Verification Checklist

- [ ] Confirm `https://wonderlab.io.vn` renders cleanly via Vercel with HTTP 200 and valid SSL.
- [ ] Confirm `https://wonderlab.io.vn/health` returns `{"status":"ok"}`.
- [ ] Confirm `https://wonderlab-server.onrender.com/api/v1/health` returns `{"status":"ok"}`.
- [ ] Verify CORS preflight succeeds from `https://wonderlab.io.vn` to `wonderlab-server`.
