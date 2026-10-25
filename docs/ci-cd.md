# CI/CD Pipeline & GitHub Actions — Wonderlab

## 1. Overview

Wonderlab utilizes GitHub Actions for continuous integration, automated release drafting, and continuous deployment to Render.

Workflows reside in `.github/workflows/`:

- **`ci.yml`** (`🧪 CI`): Kiểm thử, lint, typecheck và build tự động trên mỗi Pull Request và commit push lên nhánh `main` với containerized PostgreSQL 16.
- **`release-drafter.yml`** (`📝 Release Drafter`): Tự động phân tích git commit log theo chuẩn Conventional Commits, tính toán phiên bản SemVer tiếp theo, đồng bộ `package.json` và duy trì bản Draft Release đầy đủ danh sách commits.
- **`deploy.yml`** (`🚀 Deploy to Render`): Tự động trigger triển khai lên Render khi một Release được xuất bản (`release: [published]`) hoặc tag `v*` được đẩy lên (`push: tags: ['v*']`), đồng bộ tiến trình triển khai trực tiếp vào 2 môi trường Render GitHub App chuẩn (`main - wonderlab-client` và `main - wonderlab-server`).

---

## 2. CI Workflow (`.github/workflows/ci.yml`)

The CI workflow runs on `ubuntu-latest` and executes **4 parallel & decoupled jobs** to minimize developer wait times, achieve instant fail-fast feedback, and eliminate unnecessary database container overhead:

1. **`quality` (🎨 Quality & Types)**:
   - **Tài nguyên**: Máy ảo nhẹ không cần database container.
   - **Các bước**: Checkout -> Setup pnpm/Node 24 -> Cài dependencies -> `db:generate` -> `pnpm format:check` -> `pnpm lint` -> `pnpm typecheck`.
   - **Mục tiêu**: Phản hồi lỗi format, linting và kiểu dữ liệu chỉ trong ~30-40s.

2. **`unit-tests` (🧪 Unit Tests)**:
   - **Tài nguyên**: Chạy độc lập, song song với job Quality, không cần database.
   - **Các bước**: Checkout -> Setup pnpm/Node 24 -> Cài dependencies -> `db:generate` -> `pnpm test` (Vitest Client + Jest Server unit tests).
   - **Mục tiêu**: Đảm bảo 100% logic thuật toán, toán học và components hoạt động chuẩn xác trong ~30-35s.

3. **`e2e-tests` (🛡️ E2E Tests - Database)**:
   - **Tài nguyên**: Khởi chạy Service Container `postgres:16-alpine` (port `5434:5432`) kèm health check.
   - **Các bước**: Setup môi trường -> `prisma migrate deploy` -> `db:seed` -> `pnpm test:e2e`.
   - **Mục tiêu**: Kiểm thử tích hợp thực tế với database PostgreSQL thật (xác thực, mã hóa argon2id, session cookies, bình luận, telemetry).

4. **`build` (📦 Build Applications)**:
   - **Ràng buộc**: Chạy sau khi `quality` và `unit-tests` hoàn tất thành công (`needs: [quality, unit-tests]`).
   - **Các bước**: Build production Next.js SSG bundle và NestJS production build (`pnpm build`).

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

Kích hoạt triển khai tự động lên Render khi một Release chính thức được xuất bản hoặc tag phiên bản được gắn:

- **Sự kiện kích hoạt**:
  - `push: tags: ['v*']`: Tự động kích hoạt khi lập trình viên đẩy tag phiên bản (ví dụ `v0.4.0`).
  - `release: [published]`: Tự động trigger deploy lên Render khi nhấn **Publish release** từ bản draft của Release Drafter.
  - `workflow_dispatch`: Hỗ trợ kích hoạt deploy thủ công khẩn cấp cho từng dịch vụ (`client`, `server` hoặc `all`).
- **Render Configuration & Deploy Hooks**:
  - Trong `render.yaml`, cả 2 dịch vụ `wonderlab-server` và `wonderlab-client` đều cấu hình `autoDeploy: false` để Render không deploy tùy tiện trên từng commit nhỏ lẻ, mà chỉ deploy khi release được xuất bản.
  - Thiết lập GitHub Secrets:
    - `RENDER_SERVER_DEPLOY_HOOK`: Webhook URL của `wonderlab-server` trên Render.
    - `RENDER_CLIENT_DEPLOY_HOOK`: Webhook URL của `wonderlab-client` trên Render.
- **Native Render GitHub App Integration**:
  - Quá trình deploy được theo dõi trực tiếp bởi Render GitHub App trên 2 môi trường chuẩn:
    - `main - wonderlab-client` (`https://wonderlab-client.onrender.com`)
    - `main - wonderlab-server` (`https://wonderlab-server.onrender.com`)
  - Render GitHub App tự động cập nhật trạng thái `in_progress`, cung cấp liên kết xem trực tiếp log build trên dashboard của Render và đánh dấu `success` khi rollout hoàn tất.
