<div align="center">

# Wonderlab

**Phòng thí nghiệm số tương tác khám phá khoa học, xác suất, nghịch lý và tư duy logic.**

[![GitHub Release](https://img.shields.io/github/v/release/thanhba0505/wonderlab?style=flat-square&color=0284c7&label=version)](https://github.com/thanhba0505/wonderlab/releases)
[![CI Status](https://img.shields.io/github/actions/workflow/status/thanhba0505/wonderlab/ci.yml?branch=main&style=flat-square&label=CI&color=10b981)](https://github.com/thanhba0505/wonderlab/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10-e0234e?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)

[🌐 Trải Nghiệm Trực Tuyến](https://wonderlab-client.onrender.com) • [📖 Kiến Trúc Kỹ Thuật](docs/architecture.md) • [📋 Báo Cáo Sự Cố](https://github.com/thanhba0505/wonderlab/issues)

</div>

---

## 🧭 Dành Cho Người Dùng & Học Giả (Explorer Guide)

### 1. Triết Lý & Mục Tiêu Dự Án

Wonderlab được xây dựng với mục tiêu biến những quy luật toán học trừu tượng, hiện tượng vật lý lượng tử và các bài toán quyết định phản trực giác thành những trải nghiệm tương tác sinh động.

Thay vì tiếp nhận kiến thức một chiều qua công thức lý thuyết, người học được trực tiếp điều khiển các thông số thí nghiệm, kích hoạt hàng nghìn lượt thử nghiệm Monte Carlo tốc độ cao, và tự mình chứng thực sự hội tụ giữa xác suất thực nghiệm và giải tích toán học.

### 2. Các Tính Năng Trải Nghiệm Cốt Lõi

- **Buồng Thí Nghiệm & Mô Phỏng Động**: Không gian tương tác trực quan với phản hồi vật lý xúc giác, cho phép tinh chỉnh linh hoạt các biến số đầu vào và quan sát diễn biến tức thì.
- **Thước Đo Độ Lệch Trực Giác (Intuition Gap Meter)**: Khảo sát trực giác và dự đoán của người học trước mỗi lần thực nghiệm, sau đó so sánh trực diện với kết quả tính toán khoa học để làm nổi bật các cạm bẫy tâm lý nhận thức phổ biến.
- **Biểu Diễn Toán Học Tinh Gọn**: Trình bày bản chất giải tích thông qua các khối phân số toán học thanh lịch, kết hợp biểu đồ radar và đường cong phân phối dữ liệu trực quan.
- **Không Gian Tranh Biện Học Thuật**: Diễn đàn trao đổi chuyên sâu cho phép cộng đồng học giả và người tò mò cùng thảo luận cơ chế, phân tích chiến lược và chia sẻ quan điểm.
- **Bộ Công Cụ Xuất Dữ Liệu Nghiên Cứu**: Hỗ trợ tải toàn bộ lịch sử thử nghiệm, tham số và kết quả đo lường dưới dạng CSV hoặc JSON phục vụ nhu cầu học tập và đối soát dữ liệu.

### 3. Liên Kết Truy Cập Nhanh

- **Trang chủ ứng dụng**: [https://wonderlab-client.onrender.com](https://wonderlab-client.onrender.com)
- **Tài liệu API công khai**: [https://wonderlab-server.onrender.com/api/docs](https://wonderlab-server.onrender.com/api/docs)

---

## 🛠️ Dành Cho Lập Trình Viên & Đóng Góp (Developer Guide)

### 1. Kiến Trúc Monorepo

Dự án được xây dựng theo mô hình **pnpm workspace** monorepo tối ưu hóa cho hiệu năng và tính module:

```text
wonderlab/
├── client/              # Next.js 15 (App Router), React 19, Tailwind CSS, Lucide React, Motion
├── server/              # NestJS 10 REST API, Prisma ORM, Swagger OpenAPI, Terminus Health
├── docs/                # Toàn bộ tài liệu kiến trúc, kiểm thử, CI/CD, deployment và ADRs
├── .github/             # CI/CD Workflows song song, Issue & PR Templates, Release Drafter
├── .agents/skills/      # Bộ quy chuẩn và playbook kỹ thuật dành cho AI Coding Agents
├── scripts/             # Local verification & smoke test automation scripts
├── docker-compose.yml   # PostgreSQL 16 Alpine container (Local loopback development)
└── render.yaml          # Render Cloud Blueprint infrastructure specification
```

### 2. Ngăn Xếp Công Nghệ (Tech Stack)

| Tầng Kiến Trúc          | Công Nghệ Chính                              | Phiên Bản / Tiêu Chuẩn                 |
| :---------------------- | :------------------------------------------- | :------------------------------------- |
| **Giao Diện (Client)**  | Next.js App Router, React, Tailwind CSS      | Next.js 15.1.7, React 19, TS Strict    |
| **Dịch Vụ (Server)**    | NestJS, TypeScript, class-validator, Swagger | NestJS 10.4.15, Node.js 24             |
| **Cơ Sở Dữ Liệu**       | PostgreSQL 16 Alpine, Prisma ORM             | Prisma 5.22, Argon2id Password Hashing |
| **Gói Phụ Thuộc**       | pnpm Workspace (pinned version)              | pnpm 12.11.2                           |
| **Tự Động Hóa (CI/CD)** | GitHub Actions (4 Parallel Jobs), Render CD  | GitHub Actions v4, Docker Compose      |

### 3. Khởi Động Dự Án Cục Bộ (Local Setup)

#### Yêu Cầu Môi Trường

- **Node.js**: `v24.x` / LTS (xem file `.nvmrc`).
- **pnpm**: `12.11.2` (`npm i -g pnpm@12.11.2`).
- **Docker & Docker Compose**: Để chạy PostgreSQL container local.

#### Các Bước Thực Hiện

1. **Clone repository và cài đặt thư viện**:

   ```bash
   git clone https://github.com/thanhba0505/wonderlab.git
   cd wonderlab
   cp .env.example .env
   pnpm install
   ```

2. **Khởi chạy PostgreSQL Container**:

   ```bash
   docker compose up -d postgres
   ```

   _(PostgreSQL được bảo vệ chỉ bind nội bộ loopback tại `127.0.0.1:5434`)_

3. **Chạy ứng dụng trong môi trường phát triển**:
   ```bash
   # Chạy đồng thời cả Frontend và Backend:
   pnpm dev

   # Hoặc chạy riêng từng dịch vụ:
   pnpm dev:client   # Next.js Client tại http://localhost:4100
   pnpm dev:server   # NestJS Server tại http://localhost:4101
   ```

### 4. Quy Trình Kiểm Thử & Đảm Bảo Chất Lượng (Quality Assurance)

Dự án áp dụng quy chuẩn kiểm thử nghiêm ngặt không cho phép bất kỳ cảnh báo hoặc lỗi type nào tồn tại:

```bash
pnpm check          # Chạy toàn bộ pipeline tuần tự: Format -> Lint -> Typecheck -> Unit -> E2E -> Build
pnpm test           # Chạy Unit Tests (Vitest cho client, Jest cho server)
pnpm test:e2e       # Chạy E2E Tests với cơ sở dữ liệu thật
pnpm lint           # Kiểm tra quy chuẩn ESLint
pnpm format:check   # Kiểm tra định dạng Prettier
```

### 5. Hạ Tầng CI/CD Song Song (Decoupled Parallel Pipeline)

Mỗi lần đẩy mã nguồn hoặc mở Pull Request lên nhánh `main`, hệ thống GitHub Actions tự động kích hoạt **4 jobs song song** độc lập:

- **`🎨 Quality & Types`** (~40s): Kiểm tra Prettier, ESLint và TypeScript compiler.
- **`🧪 Unit Tests`** (~31s): Thực thi toàn bộ bộ bài kiểm thử đơn vị độc lập.
- **`🛡️ E2E Tests (Database)`** (~59s): Tự động bật container PostgreSQL 16 Alpine, migrate schema, seed dữ liệu và kiểm thử tích hợp.
- **`📦 Build Applications`** (~57s): Kiểm tra đóng gói production build cho cả Next.js và NestJS sau khi các khâu kiểm thử mã nguồn đạt chuẩn.

### 6. Thư Mục Tài Liệu Kỹ Thuật (`docs/`)

Để tìm hiểu chi tiết các quyết định kiến trúc và hướng dẫn chuyên sâu, vui lòng tham khảo:

- [Kiến trúc hệ thống (`docs/architecture.md`)](docs/architecture.md)
- [Quy chuẩn Giao diện & Trải nghiệm (`docs/frontend.md`)](docs/frontend.md)
- [Quy chuẩn Dịch vụ Backend & API (`docs/backend.md`)](docs/backend.md)
- [Cơ sở dữ liệu & Prisma ORM (`docs/database.md`)](docs/database.md)
- [Hạ tầng CI/CD & Render Deployment (`docs/ci-cd.md`)](docs/ci-cd.md)
- [Hồ sơ Quyết định Kiến trúc (`docs/decisions/`)](docs/decisions/)

---

## 📄 Bản Quyền & Giấy Phép (License)

Mã nguồn được phát hành theo giấy phép [MIT License](LICENSE) © 2026 **thanhba0505**. Toàn quyền sử dụng, sửa đổi và phân phối phục vụ nghiên cứu, giáo dục và cộng đồng khoa học.
