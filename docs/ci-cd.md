# CI/CD Pipeline & GitHub Actions — Wonderlab

## 1. Overview

Wonderlab utilizes GitHub Actions for continuous integration and automated quality gates.

Workflows reside in `.github/workflows/`:

- **`ci.yml`**: Validates every pull request and push to the `main` branch with containerized PostgreSQL.
- **`release-drafter.yml`**: Tự động tổng hợp và cập nhật bản thảo release notes (draft) theo chuẩn Conventional Commits.
- **`deploy.yml`**: Tự động trigger triển khai lên Render khi một Release được xuất bản (`release: [published]`) hoặc trigger thủ công (`workflow_dispatch`).

---

## 2. CI Workflow (`.github/workflows/ci.yml`)

The CI job runs on `ubuntu-latest` and executes the following deterministic steps:

1. **PostgreSQL Service**: Khởi chạy container `postgres:16-alpine` trên runner với cấu hình loopback.
2. **Checkout**: Checks out source code via `actions/checkout@v4`.
3. **Install pnpm**: Sets up `pnpm` pinned to `12.11.2` using `pnpm/action-setup@v4`.
4. **Setup Node.js**: Installs Node 24 with automatic pnpm store caching via `actions/setup-node@v4`.
5. **Install Dependencies**: Runs `pnpm install --frozen-lockfile`.
6. **Code Style Check**: Runs `pnpm format:check` using Prettier.
7. **Linting**: Runs `pnpm lint` across client and server.
8. **Type Checking**: Runs `pnpm typecheck` with strict TypeScript.
9. **Prisma Migrations & Seed**: Triển khai `pnpm prisma migrate deploy` và seed tài khoản Admin vào database CI.
10. **Unit Tests**: Executes `pnpm test`.
11. **E2E Tests**: Executes `pnpm test:e2e` (NestJS Health & Authentication contract tests).
12. **Build**: Compiles production bundles via `pnpm build`.

---

## 3. Release Drafter Workflow (`.github/workflows/release-drafter.yml`)

- Cấu hình tại `.github/release-drafter.yml`.
- Tự động gom nhóm commit/PR theo nhãn:
  - 🚀 **Tính năng mới & Mô phỏng (Features)**: `feat`, `feature`
  - 🐛 **Sửa lỗi (Bug Fixes)**: `fix`, `bug`
  - ⚡ **Hiệu năng & Tái cấu trúc (Performance & Refactor)**: `perf`, `refactor`
  - 📚 **Tài liệu (Documentation)**: `docs`
  - 🔧 **Bảo trì & CI/CD (Maintenance)**: `chore`, `ci`, `test`
- Tự động tính toán Semantic Version tiếp theo (Major / Minor / Patch) và duy trì bản Draft Release trên GitHub.

---

## 4. CD Deployment Workflow (`.github/workflows/deploy.yml`)

Kích hoạt triển khai tự động lên Render khi một Release chính thức được xuất bản:

- **Sự kiện kích hoạt**:
  - `release: [published]`: Tự động trigger deploy lên Render khi nhấn **Publish release** từ bản draft của Release Drafter.
  - `workflow_dispatch`: Hỗ trợ kích hoạt deploy thủ công từng dịch vụ (`client`, `server`, hoặc `all`).
- **Render Configuration**:
  - Trong `render.yaml`, cả 2 dịch vụ `wonderlab-server` và `wonderlab-client` đều cấu hình `autoDeploy: false` để Render không deploy tùy tiện trên từng commit nhỏ lẻ, mà chỉ deploy khi release được xuất bản.
  - Thiết lập GitHub Secrets:
    - `RENDER_SERVER_DEPLOY_HOOK`: Webhook URL của `wonderlab-server` trên Render.
    - `RENDER_CLIENT_DEPLOY_HOOK`: Webhook URL của `wonderlab-client` trên Render.
