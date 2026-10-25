# Deployment Guide — Wonderlab

## 1. Overview

Wonderlab is architected for deployment on cloud platforms with first-class Node.js and PostgreSQL support. The primary deployment target is **Render** via Infrastructure-as-Code (`render.yaml`), orchestrating a managed database, NestJS REST API, and Next.js frontend.

---

## 2. Render Blueprint Specification (`render.yaml`)

Wonderlab defines three managed infrastructure resources in `render.yaml`:

### 1. `wonderlab-db` (PostgreSQL 16 Managed Database)

- **Engine**: PostgreSQL 16 Alpine
- **Plan**: `free`
- **Region**: `oregon`
- **Database Name**: `wonderlab`
- **User**: `wonderlab_user`

### 2. `wonderlab-server` (NestJS REST API Service)

- **Runtime**: `node`
- **Plan**: `free`
- **Region**: `oregon`
- **Auto Deploy**: `false` (chỉ triển khai khi có bản phát hành thông qua GitHub Deploy Hook)
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter wonderlab-server db:generate && pnpm --filter wonderlab-server build`
- **Start Command**: `pnpm --filter wonderlab-server prisma migrate deploy && pnpm --filter wonderlab-server db:seed && pnpm --filter wonderlab-server start:prod`
- **Health Check Path**: `/api/v1/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `SERVER_PORT`: `10000` (Render default web port)
  - `DATABASE_URL`: Liên kết tự động qua `fromDatabase` của `wonderlab-db`
  - `JWT_SECRET`: Tự động sinh ngẫu nhiên an toàn qua Render (`generateValue: true`)
  - `CORS_ORIGINS`: Cấu hình qua Render dashboard trỏ về client domain (`https://wonderlab-client.onrender.com`)

### 3. `wonderlab-client` (Next.js App Router Web Service)

- **Runtime**: `node`
- **Plan**: `free`
- **Region**: `oregon`
- **Auto Deploy**: `false`
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter wonderlab-client build`
- **Start Command**: `pnpm --filter wonderlab-client start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `NEXT_PUBLIC_APP_NAME`: `Wonderlab`
  - `NEXT_PUBLIC_API_BASE_URL`: Cấu hình qua Render dashboard trỏ về backend API (`https://wonderlab-server.onrender.com/api/v1`)

---

## 3. Automated CD Pipeline & Real-Time Deployment Tracking

Thay vì kích hoạt rebuild trên từng commit nhỏ lẻ, Render được tích hợp với GitHub Actions thông qua **Deploy Hooks** kết hợp cơ chế **giám sát rollout thời gian thực (Health Polling Loop)**:

1. **Lấy Deploy Hooks trên Render**:
   - `wonderlab-server` -> Settings -> Deploy Hook (`https://api.render.com/deploy/srv-...`).
   - `wonderlab-client` -> Settings -> Deploy Hook (`https://api.render.com/deploy/srv-...`).
2. **Cấu hình GitHub Repository Secrets**:
   - `RENDER_SERVER_DEPLOY_HOOK`
   - `RENDER_CLIENT_DEPLOY_HOOK`
3. **Quy trình xuất bản & triển khai tự động**:
   - Khi lập trình viên đẩy tag phát hành (`git tag vX.Y.Z && git push origin vX.Y.Z`) hoặc bấm **Publish release** trên GitHub:
     - Workflow `🚀 Deploy to Render` (`.github/workflows/deploy.yml`) được kích hoạt.
     - GitHub Actions tạo một deployment duy nhất thuộc môi trường **`Production`** và đặt trạng thái ban đầu là `In Progress` (đang xử lý).
     - Gửi yêu cầu kích hoạt đồng thời 2 webhook Deploy Hook của Render.
     - Khởi chạy script giám sát [`scripts/verify-deployment.sh`](file:///Users/lethanhba/workspace/app/Wonderlab/scripts/verify-deployment.sh) liên tục thăm dò các endpoint sức khỏe thực tế (`https://wonderlab-server.onrender.com/health` và `https://wonderlab-client.onrender.com/health`).
     - **Chỉ khi cả Server và Client đều phản hồi `HTTP 200`, `status: "ok"`, `database: "connected"` và phiên bản khớp với `vX.Y.Z`**, deployment mới được GitHub Actions cập nhật sang trạng thái **Success / Active** (xanh lá).
     - Nếu quá trình build hoặc rollout trên Render bị lỗi hay timeout quá 10 phút, deployment sẽ được đánh dấu **Failed** (đỏ) kèm bảng chẩn đoán lỗi chi tiết trong GitHub Actions Step Summary.

---

## 4. GitHub Environments Architecture

Deployments trên GitHub được tinh gọn và đồng bộ trực tiếp với Render GitHub App:

- **2 môi trường duy nhất**:
  1. `main - wonderlab-client` (trỏ đến `https://wonderlab-client.onrender.com`)
  2. `main - wonderlab-server` (trỏ đến `https://wonderlab-server.onrender.com`)
- **Render GitHub App**: Tự động theo dõi tiến trình build theo thời gian thực (từ lúc bắt đầu build, hiển thị link log dashboard trực tiếp, cho đến khi rollout thành công hoặc thất bại) mà không cần tạo thêm các môi trường trùng lặp trên GitHub Actions.

---

## 5. Production Verification Checklist

- [ ] Xác nhận `https://wonderlab-server.onrender.com/api/v1/health` trả về `{"status":"ok"}` với HTTP 200.
- [ ] Xác nhận `https://wonderlab-client.onrender.com` tải trang chủ và mô phỏng Monty Hall hoạt động trực tiếp.
- [ ] Truy cập `/admin` và kiểm tra chức năng đăng nhập tài khoản quản trị viên.
- [ ] Xác nhận không có lỗi CORS giữa Client và Server trong tab Console của trình duyệt.
