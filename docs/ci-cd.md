# CI/CD Pipeline & GitHub Actions — Wonderlab

## 1. Overview

Wonderlab utilizes GitHub Actions for continuous integration, automated release drafting, and continuous deployment to Render.

Workflows reside in `.github/workflows/`:

- **`ci.yml`** (`🧪 CI`): Kiểm thử, lint, typecheck và build tự động trên mỗi Pull Request và commit push lên nhánh `main` với containerized PostgreSQL 16.
- **`release-drafter.yml`** (`📝 Release Drafter`): Tự động phân tích git commit log theo chuẩn Conventional Commits, tính toán phiên bản SemVer tiếp theo, đồng bộ `package.json` và duy trì bản Draft Release đầy đủ danh sách commits.
- **`deploy.yml`** (`🚀 Deploy to Render`): Tự động trigger triển khai lên Render khi một Release được xuất bản (`release: [published]`) hoặc kích hoạt thủ công (`workflow_dispatch`), ghi nhận trạng thái vào GitHub Deployments theo từng môi trường (`Wonderlab Server`, `Wonderlab Client`, `Wonderlab DB`).

---

## 2. CI Workflow (`.github/workflows/ci.yml`)

The CI job runs on `ubuntu-latest` and executes the following deterministic steps:

1. **PostgreSQL Service**: Khởi chạy container `postgres:16-alpine` trên runner với cấu hình loopback `5434:5432`.
2. **Checkout**: Checks out source code via `actions/checkout@v4`.
3. **Install pnpm**: Sets up `pnpm` pinned to `12.11.2` using `pnpm/action-setup@v4`.
4. **Setup Node.js**: Installs Node 24 with automatic pnpm store caching via `actions/setup-node@v4`.
5. **Install Dependencies**: Runs `pnpm install --frozen-lockfile`.
6. **Generate Prisma Client**: Chạy `pnpm --filter wonderlab-server db:generate` để tạo Prisma Client types trước khi typecheck.
7. **Code Style Check**: Runs `pnpm format:check` using Prettier.
8. **Linting**: Runs `pnpm lint` across client and server.
9. **Type Checking**: Runs `pnpm typecheck` với strict TypeScript.
10. **Prisma Migrations & Seed**: Triển khai `pnpm --filter wonderlab-server prisma migrate deploy` và seed tài khoản Admin vào database CI.
11. **Unit Tests**: Executes `pnpm test` (Vitest cho Next.js client, Jest cho NestJS server).
12. **E2E Tests**: Executes `pnpm test:e2e` (NestJS Health & Authentication contract tests).
13. **Build**: Compiles production bundles via `pnpm build`.

---

## 3. Release Drafter Workflow (`.github/workflows/release-drafter.yml`)

Workflow sử dụng script Python tự động [`.github/scripts/update_draft_release.py`](file:///Users/lethanhba/workspace/app/Wonderlab/.github/scripts/update_draft_release.py) được xây dựng dựa trên kiến trúc của hệ sinh thái `nexus`:

- **Cơ chế thu thập commit**:
  - Không phụ thuộc vào PR labels (giúp ghi nhận 100% commit đẩy trực tiếp lên `main` lẫn qua Pull Requests).
  - Sử dụng `git log` từ tag phát hành chính thức gần nhất đến `HEAD` (hoặc từ commit khởi tạo nếu chưa có tag nào).
- **Phân loại Conventional Commits**:
  - 🚀 **Tính năng mới & Mô phỏng (Features)**: `feat:`, `feat(...):`
  - 🐛 **Sửa lỗi (Bug Fixes)**: `fix:`, `fix(...):`
  - ⚡ **Hiệu năng & Tái cấu trúc (Performance & Refactor)**: `perf:`, `refactor:`
  - 📚 **Tài liệu (Documentation)**: `docs:`, `docs(...):`
  - 🔧 **Bảo trì & CI/CD (Maintenance)**: `chore:`, `ci:`, `test:`, `build:`
- **Định dạng Release Notes**:
  - Mỗi commit có liên kết trực tiếp tới GitHub: `• {msg} ([{short_hash}](https://github.com/.../commit/{full_hash})) by @{author}`.
- **Tính toán SemVer & Đồng bộ**:
  - Tự động nhận diện breaking changes (`BREAKING CHANGE:`, `feat!:`) để bump Major, `feat` để bump Minor, hoặc `fix` để bump Patch.
  - Tự động đồng bộ trường `"version"` trong `package.json`, `client/package.json` và `server/package.json`.
  - Cập nhật hoặc tạo mới bản Draft Release trên GitHub thông qua GitHub CLI (`gh release`).

---

## 4. CD Deployment Workflow (`.github/workflows/deploy.yml`)

Kích hoạt triển khai tự động lên Render khi một Release chính thức được xuất bản:

- **Sự kiện kích hoạt**:
  - `release: [published]`: Tự động trigger deploy lên Render khi nhấn **Publish release** từ bản draft của Release Drafter.
  - `workflow_dispatch`: Hỗ trợ kích hoạt deploy thủ công từng dịch vụ (`client`, `server`, `db` hoặc `all`).
- **Render Configuration & Deploy Hooks**:
  - Trong `render.yaml`, cả 2 dịch vụ `wonderlab-server` và `wonderlab-client` đều cấu hình `autoDeploy: false` để Render không deploy tùy tiện trên từng commit nhỏ lẻ, mà chỉ deploy khi release được xuất bản.
  - Thiết lập GitHub Secrets:
    - `RENDER_SERVER_DEPLOY_HOOK`: Webhook URL của `wonderlab-server` trên Render.
    - `RENDER_CLIENT_DEPLOY_HOOK`: Webhook URL của `wonderlab-client` trên Render.
- **HTTP 2xx & Asynchronous 202 Handling**:
  - Render Deploy Hooks trả về mã `HTTP 202 Accepted` khi tiếp nhận job build ngầm. Script xác thực dải mã thành công `HTTP 200..299` để đảm bảo pipeline thông suốt.
- **GitHub Environments & Deployments Dashboard**:
  - Tự động ghi nhận deployment vào 3 GitHub Environments chuẩn:
    - 🛡️ **`Wonderlab Server`** (`https://wonderlab-server.onrender.com`)
    - 🗄️ **`Wonderlab DB`** (`https://dashboard.render.com`)
    - 💻 **`Wonderlab Client`** (`https://wonderlab-client.onrender.com`)
