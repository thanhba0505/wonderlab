# Wonderlab

> **Nền tảng tương tác khám phá khoa học, xác suất, nghịch lý và tư duy logic trực quan.**

Wonderlab biến những khái niệm trừu tượng, phản trực giác trong toán học, vật lý và lý thuyết trò chơi thành trải nghiệm trực giác bằng cách cho phép người dùng tự tay thao tác các tham số, chạy mô phỏng Monte Carlo và quan sát kết quả thực tế.

---

## 1. Kiến trúc Monorepo

Dự án được tổ chức dưới dạng monorepo sử dụng **pnpm workspace**:

```text
wonderlab/
├── client/              # Frontend: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui
├── server/              # Backend: NestJS 10 REST API, Swagger OpenAPI, Terminus Health
├── docs/                # Tài liệu kỹ thuật, kiến trúc, môi trường, kiểm thử, deployment & ADRs
├── .github/             # GitHub Actions CI/CD workflows, Issue & PR templates
├── .agents/skills/      # AI coding agent playbooks (frontend, nextjs, nestjs, testing, git)
├── scripts/             # Smoke test & automation scripts
├── docker-compose.yml   # PostgreSQL 16 Alpine container (local development)
└── render.yaml          # Render Blueprint deployment definition
```

---

## 2. Công nghệ sử dụng

| Tầng                | Công nghệ                                                      | Phiên bản                        |
| ------------------- | -------------------------------------------------------------- | -------------------------------- |
| **Frontend**        | Next.js, React, TypeScript, Tailwind CSS, Lucide React, Motion | Next.js 15.1.7, React 19, TS 5.7 |
| **Backend**         | NestJS, TypeScript, class-validator, Swagger OpenAPI           | NestJS 10.4.15, TS 5.7           |
| **Database**        | PostgreSQL Alpine (Docker Compose)                             | PostgreSQL 16                    |
| **Package Manager** | pnpm (quản lý workspace và dependency locking)                 | 12.11.2                          |
| **CI / CD**         | GitHub Actions, Render Blueprints                              | GitHub Actions v4                |

---

## 3. Yêu cầu môi trường (Prerequisites)

- **Node.js**: `v24.x` / LTS (khuyên dùng Node 22 hoặc 24, xem `.nvmrc`).
- **pnpm**: `12.11.2` (`npm i -g pnpm@12.11.2`).
- **Docker & Docker Compose**: Để chạy PostgreSQL container local.
- **Git**: 2.40+.

---

## 4. Hướng dẫn khởi tạo & Chạy dự án

### Bước 1: Clone repository & Cài đặt dependencies

```bash
git clone https://github.com/thanhba0505/wonderlab.git
cd wonderlab
cp .env.example .env
pnpm install
```

### Bước 2: Khởi động PostgreSQL Container

```bash
docker compose up -d postgres
```

Kiểm tra trạng thái healthy:

```bash
docker compose ps
```

### Bước 3: Chạy ứng dụng local

```bash
# Chạy cả Client và Server đồng thời:
pnpm dev

# Hoặc chạy riêng biệt:
pnpm dev:client   # Next.js tại http://localhost:3000 (hoặc :3002 nếu 3000 bận)
pnpm dev:server   # NestJS tại http://localhost:3001
```

---

## 5. Địa chỉ truy cập Local (Local URLs)

- **Website Client (Homepage)**: [http://localhost:3000](http://localhost:3000) (hoặc [http://localhost:3002](http://localhost:3002))
- **Admin Placeholder**: [http://localhost:3000/admin](http://localhost:3000/admin) (hoặc [http://localhost:3002/admin](http://localhost:3002/admin))
- **Backend Health Check**: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)
- **Swagger API Documentation**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **PostgreSQL**: `127.0.0.1:5433` (được bảo vệ chỉ bind loopback)

---

## 6. Scripts quan trọng

Chạy từ thư mục gốc của repository:

| Script                    | Mô tả                                                |
| ------------------------- | ---------------------------------------------------- |
| `pnpm dev`                | Chạy song song cả client và server                   |
| `pnpm build`              | Build production cho cả client và server             |
| `pnpm lint`               | Kiểm tra ESLint với 0 cảnh báo cho phép              |
| `pnpm format:check`       | Kiểm tra quy chuẩn format Prettier                   |
| `pnpm format`             | Tự động format toàn bộ mã nguồn                      |
| `pnpm typecheck`          | Kiểm tra kiểu dữ liệu TypeScript nghiêm ngặt         |
| `pnpm test`               | Chạy unit tests (Vitest cho client, Jest cho server) |
| `pnpm test:e2e`           | Chạy E2E tests kiểm thử health endpoint của server   |
| `pnpm check`              | Chạy toàn bộ pipeline kiểm tra trước khi commit      |
| `./scripts/smoke-test.sh` | Kiểm tra trực tiếp HTTP 200 trên các endpoint local  |

---

## 7. Tài liệu chi tiết (`docs/`)

- [Kiến trúc hệ thống (`docs/architecture.md`)](docs/architecture.md)
- [Hướng dẫn phát triển (`docs/development.md`)](docs/development.md)
- [Cấu hình biến môi trường (`docs/environment.md`)](docs/environment.md)
- [Quy chuẩn Frontend (`docs/frontend.md`)](docs/frontend.md)
- [Quy chuẩn Backend (`docs/backend.md`)](docs/backend.md)
- [Hướng dẫn Cơ sở dữ liệu (`docs/database.md`)](docs/database.md)
- [Chiến lược Kiểm thử (`docs/testing.md`)](docs/testing.md)
- [Hướng dẫn Triển khai (`docs/deployment.md`)](docs/deployment.md)
- [Tài liệu CI/CD (`docs/ci-cd.md`)](docs/ci-cd.md)
- [Quy chuẩn AI Coding Agents (`docs/ai-agents.md`)](docs/ai-agents.md)
- [Quyết định kiến trúc (`docs/decisions/`)](docs/decisions/)

---

## 8. License

Mã nguồn mở phục vụ nghiên cứu, giáo dục và cộng đồng khoa học.
