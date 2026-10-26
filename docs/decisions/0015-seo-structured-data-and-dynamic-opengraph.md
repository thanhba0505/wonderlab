# 15. Kiến trúc SEO Toàn diện, Structured Data (JSON-LD) & Dynamic Open Graph

Date: 2026-10-26

## Status

Accepted

## Context

Wonderlab là nền tảng trực quan hóa các nghịch lý khoa học, toán học xác suất và vật lý lượng tử. Để tối đa hóa khả năng tiếp cận người dùng, gia tăng độ nhận diện thương hiệu trên các công cụ tìm kiếm (Google, Bing) và mang lại trải nghiệm chia sẻ trực quan sinh động trên mạng xã hội (Facebook, Zalo, Twitter, Telegram), hệ thống cần một kiến trúc SEO chuẩn mực:

1. **Lập chỉ mục tự động (Indexing)**: Một tệp chỉ mục sitemap động tự động đồng bộ hóa với registry mô phỏng và kho bài viết tiểu luận, kèm theo tệp `robots.txt` phân quyền thu thập dữ liệu rõ ràng.
2. **Metadata Toàn cục & Chuẩn hóa Canonical**: Đảm bảo tất cả các trang đều có thẻ chuẩn hóa (Canonical URLs), Title Template nhất quán (`%s | Wonderlab`), Open Graph và Twitter Card đầy đủ.
3. **Dữ liệu có cấu trúc (Rich Snippets Schema.org)**: Nhúng JSON-LD chuẩn cho từng bài toán (`LearningResource`, `WebApplication`) và bài viết (`TechArticle`), kèm đường dẫn điều hướng (`BreadcrumbList`).
4. **Ảnh Xem trước Động (Dynamic Open Graph Image)**: Tự động sinh ảnh đại diện 1200x630 thời gian thực theo phong cách "Clean Paper & Lab Editorial", hiển thị hoàn hảo tiếng Việt có dấu.

## Decision

1. **Sitemap & Robots Động (`client/src/app/`)**:
   - `sitemap.ts`: Trích xuất trực tiếp danh sách từ `SIMULATIONS_REGISTRY` và `ESSAYS`. Thiết lập độ ưu tiên và chu kỳ cập nhật khoa học:
     - `/` (priority 1.0, weekly)
     - `/simulations` (priority 0.9, daily)
     - `/simulations/[slug]` (priority 0.9, weekly)
     - `/essays` (priority 0.8, monthly)
     - `/essays/[slug]` (priority 0.8, monthly, ngày cập nhật thực tế)
     - `/requests` (priority 0.8, daily)
   - `robots.ts`: Cho phép `User-agent: *` truy cập toàn bộ các trang nội dung, chặn các đường dẫn nhạy cảm (`/admin`, `/my-account`, `/api/`), và chỉ định vị trí tệp sitemap.

2. **Metadata Base & Title Template (`client/src/app/layout.tsx`)**:
   - Thiết lập `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4100')`.
   - Chuẩn hóa Title Template: `{ default: 'Wonderlab — Khám phá Khoa học, Xác suất & Nghịch lý Trực quan', template: '%s | Wonderlab' }`.
   - Cung cấp các giá trị mặc định cho `alternates.canonical`, `openGraph` (locale `vi_VN`), và `twitter: { card: 'summary_large_image' }`.

3. **Structured Data Schema.org JSON-LD**:
   - `SimulationJsonLd.tsx`: Render đồ thị `@graph` chứa cả thực thể học tập tương tác (`["LearningResource", "WebApplication"]`) lẫn danh sách điều hướng (`BreadcrumbList`: Trang chủ $\to$ Mô phỏng $\to$ [Tên bài toán]).
   - `EssayJsonLd.tsx`: Render đồ thị `@graph` chứa bài viết nghiên cứu kỹ thuật (`TechArticle`) và danh sách điều hướng (`BreadcrumbList`: Trang chủ $\to$ Tiểu luận $\to$ [Tiêu đề]).
   - Bảo mật: Áp dụng kỹ thuật triệt tiêu XSS injection bằng `JSON.stringify(...).replace(/</g, '\\u003c')`.
   - Type Safety: Tuân thủ Zero-`any` bằng type contract nghiêm ngặt và thư viện chuẩn `schema-dts`.

4. **Dynamic Open Graph Image (`client/src/app/simulations/[slug]/opengraph-image.tsx`)**:
   - Tận dụng `ImageResponse` từ `next/og` (công cụ Satori/Resvg) để render ảnh kích thước chuẩn 1200x630.
   - Thẩm mỹ "Clean Paper & Lab Editorial":
     - Nền canvas Slate-100 với lưới tọa độ phòng lab (`linear-gradient` coordinates).
     - Khung thẻ màu trắng sắc nét, viền hairline kỹ thuật (`border-slate-300/85`) và đổ bóng phân tầng.
     - Badge kỹ thuật phân loại chủ đề với bảng màu ngữ nghĩa: Cobalt Blue (Vật lý lượng tử), Amber (Xác suất), Emerald (Lý thuyết trò chơi), Violet (Nghịch lý).
     - Đóng gói cục bộ font chữ `Be Vietnam Pro` (Bold 700 & Regular 400) trong `client/src/assets/fonts/` đảm bảo hiển thị hoàn hảo 100% thanh điệu tiếng Việt, không phụ thuộc kết nối mạng bên ngoài lúc build.
     - Nhãn chứng nhận kỹ thuật chân trang: Logo Wonderlab + "INTERACTIVE SCIENCE SIMULATION" kèm điểm xung nhịp xanh ngọc.

## Consequences

- Mọi bài toán và bài viết xuất bản mới đều tự động có mặt trên sitemap XML và hiển thị giàu thông tin (rich snippets) trên Google Search.
- Khi chia sẻ liên kết trên Zalo, Facebook, Twitter, Telegram, liên kết sẽ hiển thị ảnh thẻ preview đồ họa độ phân giải cao, sắc nét, thể hiện đúng tinh thần khoa học nghiêm cẩn của Wonderlab.
- Mã nguồn đạt tiêu chuẩn tuyệt đối: 100% vượt qua `pnpm check` (format, lint, typecheck, test, e2e, build).
