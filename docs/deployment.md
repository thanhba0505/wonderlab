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

## 3. Automated CD Pipeline (Deploy on Release)

Thay vì kích hoạt rebuild trên từng commit nhỏ lẻ, Render được tích hợp với GitHub Actions thông qua **Deploy Hooks**:

1. **Lấy Deploy Hooks trên Render**:
   - `wonderlab-server` -> Settings -> Deploy Hook (`https://api.render.com/deploy/srv-...`).
   - `wonderlab-client` -> Settings -> Deploy Hook (`https://api.render.com/deploy/srv-...`).
2. **Cấu hình GitHub Repository Secrets**:
   - `RENDER_SERVER_DEPLOY_HOOK`
   - `RENDER_CLIENT_DEPLOY_HOOK`
3. **Quy trình xuất bản & triển khai tự động**:
   - Khi tạo hoặc cập nhật mã nguồn, GitHub Action `📝 Release Drafter` duy trì bản nháp Draft Release với đầy đủ commits.
   - Khi lập trình viên bấm **Publish release** trên GitHub:
     - Workflow `🚀 Deploy to Render` (`.github/workflows/deploy.yml`) được kích hoạt.
     - Gọi đồng thời 2 webhook Deploy Hook của Render (xác thực mã `HTTP 202 Accepted`).
     - Ghi nhận trạng thái triển khai vào các GitHub Environments:
       - 🛡️ **`Wonderlab Server`**
       - 🗄️ **`Wonderlab DB`**
       - 💻 **`Wonderlab Client`**
     - Render kéo code mới nhất, chạy Prisma migration, seed dữ liệu và khởi động production build.

---

## 4. Render GitHub App vs GitHub Actions Deployments

- Khi Render kết nối với GitHub repo, **Render GitHub App** mặc định báo cáo tiến trình build với định dạng `${branch} - ${serviceName}` (`main - wonderlab-server`, `main - wonderlab-client`) kèm liên kết log trực tiếp.
- Song song đó, **GitHub Actions CD** ghi nhận các environment chính thức với tên hiển thị trực quan (`Wonderlab Server`, `Wonderlab Client`, `Wonderlab DB`).

---

## 5. Production Verification Checklist

- [ ] Xác nhận `https://wonderlab-server.onrender.com/api/v1/health` trả về `{"status":"ok"}` với HTTP 200.
- [ ] Xác nhận `https://wonderlab-client.onrender.com` tải trang chủ và mô phỏng Monty Hall hoạt động trực tiếp.
- [ ] Truy cập `/admin` và kiểm tra chức năng đăng nhập tài khoản quản trị viên.
- [ ] Xác nhận không có lỗi CORS giữa Client và Server trong tab Console của trình duyệt.
