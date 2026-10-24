# Frontend Architecture & Guidelines — Wonderlab

## 1. Stack & Rationale

- **Framework**: Next.js 15 (App Router).
- **Runtime / Library**: React 19.
- **Styling**: Tailwind CSS 3.4 with custom design tokens.
- **Component Primitives**: shadcn/ui pattern with `class-variance-authority` (CVA).
- **Icons**: Lucide React.
- **Testing**: Vitest + jsdom for simulation state and utility verification.

---

## 2. Directory Structure

```text
client/
├── public/                 # Static assets, icons, manifest
├── src/
│   ├── app/
│   │   ├── (public)/       # Public route group (clean URLs)
│   │   │   └── page.tsx    # Homepage
│   │   ├── admin/          # Authenticated Admin Telemetry & Control Console (In-body page form)
│   │   │   └── page.tsx
│   │   ├── error.tsx       # Route error boundary
│   │   ├── global-error.tsx # Root HTML error boundary
│   │   ├── not-found.tsx   # Custom 404 page
│   │   ├── layout.tsx      # Root HTML shell, fonts, AuthProvider, header/footer
│   │   └── globals.css     # Clean Paper design tokens, lab grid pattern, custom scrollbars
│   ├── components/
│   │   ├── ui/             # shadcn atomic components (button, card, badge)
│   │   └── layout/         # Shell components (header with session state, footer)
│   ├── features/           # Domain feature components
│   │   ├── hero/           # Interactive telemetry chamber visual
│   │   ├── monty-hall/     # Interactive Monty Hall simulation & test
│   │   ├── explore/        # Asymmetric Bento grid with micro-simulations
│   │   ├── curated/        # Curated science experiences
│   │   └── editorial/      # Thought-provoking essays & quotes
│   ├── lib/
│   │   ├── auth-context.tsx # React Context for HttpOnly cookie authentication
│   │   ├── utils.ts        # cn() helper and API base URL resolver
│   │   └── utils.test.ts
│   └── types/              # Domain TypeScript interfaces (Category, Article, AuthUser)
├── components.json         # shadcn/ui configuration
├── next.config.ts          # Next.js compiler settings
└── tailwind.config.ts      # Design tokens, color system, animations
```

---

## 3. Design System, Human Craft & Anti-AI Guidelines

- **Visual Aesthetic: Clean Paper & Lab Editorial**: Thiết kế xuất bản khoa học thủ công cao cấp với canvas nền slate-100 (`#f1f5f9`), thẻ phòng thí nghiệm trắng sáng (`#ffffff`), hairline viền kỹ thuật (`border-slate-300/85`), và đổ bóng phân tầng nhẹ nhàng (`shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]`).
- **Typography Architecture**:
  - **Body Text**: `Be Vietnam Pro` — tối ưu cho dấu tiếng Việt với x-height cân đối và trải nghiệm đọc thư thái.
  - **Headings & Display**: `Space Grotesk` — font sans hình học chuẩn xác với tracking chặt chẽ (`tracking-tight text-slate-900`) mang âm hưởng tạp chí khoa học.
  - **Data & Mathematics**: `JetBrains Mono` kết hợp `tabular-nums` cho các bộ đếm số liệu, tỷ lệ xác suất và công thức vật lý ($P(A)$, $\lambda = 532nm$).
- **Anti-AI Slop Guardrails**:
  - _Không dùng gradient tím/hồng tùy tiện_ trên nút bấm hoặc chữ. Mọi màu sắc mang ý nghĩa ngữ nghĩa chuẩn:
    - 🔵 **Cobalt Blue (`#2563eb`)**: Vật lý, quang học và hành động chính.
    - 🟠 **Warm Amber (`#d97706`)**: Xác suất, biến ngẫu nhiên và cảnh báo.
    - 🟢 **Emerald Green (`#059669`)**: Kết quả tối ưu, định lý chứng minh và thành công.
    - 🟣 **Deep Violet (`#7c3aed`)**: Nghịch lý, logic học và thí nghiệm tưởng tượng.
  - _Không dùng kính mờ đục (muddy glassmorphism)_; sử dụng bề mặt phẳng rõ ràng, tương phản cao.
  - _Không dùng lưới 3 cột rập khuôn_; Bento Grid bất đối xứng với các mô phỏng tương tác mini (chuyển đổi sóng 2 khe, gieo xúc xắc thời gian thực, ma trận Thế lưỡng nan của người tù).
  - _Không dùng ngôn từ sáo rỗng kiểu AI (SaaS fluff copy)_; văn phong trực diện, kích thích tò mò và giàu tính học thuật.
  - _Không phô diễn công nghệ nội bộ hoặc lộ endpoint ra UI_:
    - Tuyệt đối không khoe tên thuật toán mã hóa (Argon2id, OWASP, HttpOnly Token) trên form đăng nhập hoặc chân trang.
    - Tuyệt đối không đưa link dev localhost (`http://localhost:4101/api/docs`), không gắn badge trạng thái server API `/api/v1/health` hoặc phiên bản framework ra ngoài giao diện công khai.
- **Tactile Laboratory Feel**: Phản hồi vật lý khi click (`active:scale-[0.98]`), bo góc chuẩn hóa (6px badge/input, 8px button, 12px card, 16px container), tọa độ kỹ thuật và chỉ báo xung nhịp.
- **Border Architecture & Max 2-Layer Depth (Chống Đóng Khung Lồng Hộp)**:
  - Tuyệt đối không đóng khung vượt quá 2 tầng viền (`Card` viền ngoài -> Phần tử tương tác/đo đạc viền trong).
  - Nghiêm cấm bọc container trung gian bằng viền 4 cạnh khi bên trong đã có phần tử viền. Thay vào đó, sử dụng nền phân vùng không viền (`bg-slate-100/70`), thanh chỉ thị cạnh trái (`border-l-4`), hoặc đường kẻ phân cách một chiều.
- **In-Body Authentication Architecture (Không Modal Popup)**:
  - Khi người dùng bấm đăng nhập hoặc truy cập `/admin`, hệ thống điều hướng trực tiếp đến trang toàn màn hình với form đăng nhập nằm trong body của trang.
  - Không sử dụng modal trôi nổi (floating dialog) để đảm bảo trải nghiệm đăng nhập liền mạch, an toàn và hỗ trợ trình quản lý mật khẩu của trình duyệt tối ưu.

---

## 4. Scrollbar Architecture & Accessibility

Nhằm loại bỏ thanh cuộn dày 17px thô kệch mặc định của hệ điều hành và đồng bộ với phong cách "Clean Paper & Lab Editorial", giao diện được trang bị thanh cuộn kỹ thuật tùy biến cao cấp:

- **Thiết kế Floating Pill Thumb**:
  - Kích thước thanh cuộn mảnh: **9px** (cả dọc và ngang).
  - Con trượt (thumb) bo tròn hoàn toàn (`border-radius: 9999px`) với viền trong suốt `2px solid transparent` và `background-clip: content-box` tạo cảm giác con trượt nổi thanh thoát giữa rãnh cuộn.
  - Bảng màu kỹ thuật:
    - Thumb bình thường: Slate-400 (`rgba(148, 163, 184, 0.65)`).
    - Thumb khi hover: Slate-500 (`rgba(100, 116, 139, 0.85)`).
    - Thumb khi active (kéo giữ): Slate-600 (`rgba(71, 85, 105, 0.95)`).
    - Track nền: Slate-100 (`rgba(241, 245, 249, 0.65)`).
- **Hỗ trợ chuẩn W3C và Fallback WebKit**:
  - Chuẩn W3C: `scrollbar-width: thin` và `scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track)` áp dụng toàn cục trên `html`, `body` và `*`.
  - Bộ selector WebKit (`::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, `::-webkit-scrollbar-track`) đảm bảo hiển thị hoàn hảo trên Chromium, Edge, Safari và macOS.
- **Tiêu chuẩn Trợ năng (Accessibility) & High Contrast**:
  - Tích hợp `@media (prefers-contrast: more)` tự động kích hoạt thumb màu đen tuyền (`#0f172a`) trên track trắng sáng (`#f8fafc`) cho người dùng kích hoạt chế độ tương phản cao trong hệ điều hành.
  - Không áp dụng animation/transition trên `scrollbar-color` để phòng ngừa lỗi giật nháy trên WebKit/macOS.
- **Utility Classes**:
  - `.no-scrollbar`: Ẩn hoàn toàn thanh cuộn nhưng vẫn duy trì khả năng trượt nội dung cho các thanh công cụ trượt ngang hoặc danh sách cuộn mượt.

---

## 5. Simulation Telemetry & Scientific Export Suite

Nhằm nâng cao tính khoa học và thực nghiệm có thể tái lặp (reproducibility), giao diện phòng lab được tích hợp bộ công cụ nền tảng:

- **Client Telemetry Pipeline (`useSimulationTelemetry`)**:
  - Tự động cấp phát và duy trì Session UUID ẩn danh trong `localStorage`.
  - Non-blocking async dispatch: Mọi lượt chạy Monte Carlo (1.000, 10.000 phòng) được ghi nhận ngầm lên REST API mà không gây nghẽn render (< 16ms frame budget).
  - Tự động fallback ngoại tuyến khi mất kết nối mạng.
- **Bảng Nhật ký Thực nghiệm (`SimulationHistoryTable`)**:
  - Hiển thị danh sách các lần chạy của phiên làm việc hiện tại: thời điểm, tham số $n$, quy mô mẫu, tỉ lệ thực nghiệm, xác suất lý thuyết và sai số $\Delta$.
  - Cung cấp nút **"Nạp lại"** cho phép người dùng khôi phục ngay trạng thái tham số của một lần thử trong quá khứ.
- **Bộ Công cụ Xuất Dữ liệu Nghiên cứu (`ExportSuitePanel`)**:
  - **Xuất CSV**: Tạo file bảng tính chuẩn RFC 4180 phục vụ phân tích dữ liệu chuyên sâu trong Excel, Google Sheets, Python Pandas hoặc R.
  - **Xuất JSON**: Xuất schema dữ liệu đầy đủ của buồng thử.
  - **Chép Báo cáo**: Sao chép tóm tắt kết quả định dạng Markdown/LaTeX vào clipboard.
  - **Chia sẻ URL**: Đồng bộ tham số phòng lab vào URL query parameters (`?n=23`) với tính năng 1-click copy link.
- **Bộ đếm Telemetry Cộng đồng (`GlobalTelemetryWidget`)**:
  - Hiển thị số liệu thực tế thời gian thực tích lũy của toàn bộ cộng đồng người dùng Wonderlab.
  - Tuân thủ nguyên tắc số 5 trong AGENTS.md (_No Faux Data_): 100% số liệu thật từ PostgreSQL.

---

## 6. Intuition Gap & Hypothesis Testing Engine

Để chuyển dịch từ việc quan sát thụ động sang phương pháp học tập chủ động (Active Inquiry Learning), mỗi phòng lab được trang bị công cụ kiểm tra giả thuyết trước thực nghiệm:

- **Khảo sát Dự đoán Trước Thực nghiệm (`IntuitionChallengeCard`)**:
  - Đưa ra câu hỏi tình huống toán học kích thích trực giác trước khi người dùng can thiệp vào mô hình.
  - Tự động lưu lựa chọn vào `localStorage` (`wonderlab_guess_<slug>`) để ghi nhớ trạng thái phiên.
- **Thước đo Độ lệch Trực giác (Intuition Gap Meter)**:
  - Đo lường khoảng cách sai lệch giữa niềm tin chủ quan và định lý khách quan: $\Delta_{gap} = |P_{guess} - P_{truth}| \times 100\%$.
  - Phân loại trực giác:
    - $\Delta < 5\%$: _Trực giác Ngoại cảm_ (Nhà quan sát sắc bén).
    - $5\% \le \Delta \le 30\%$: _Độ lệch Vừa phải_.
    - $\Delta > 30\%$: _Mắc Bẫy Trực giác Tuyến tính_.
- **Giải mã Tâm lý Nhận thức (Cognitive Bias Explainer)**:
  - Phân tích cội nguồn tiến hóa của các cạm bẫy tư duy (Bẫy Tư duy Tuyến tính $O(n^2)$, Ảo tưởng Xác suất Đồng đều $50/50$, v.v.).
- **Tích hợp Telemetry**:
  - Tự động gắn kèm `userPrediction` và `intuitionGap` vào lượt chạy Monte Carlo để lưu trữ và tổng hợp trên hệ thống.
