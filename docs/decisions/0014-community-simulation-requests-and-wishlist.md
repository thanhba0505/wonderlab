# 14. Kiến trúc Đề xuất Thí nghiệm & Lộ trình Cộng đồng (Simulation Requests & Wishlist)

Date: 2026-10-25

## Status

Accepted

## Context

Wonderlab trực quan hóa các bài toán và nghịch lý khoa học. Nhu cầu từ người học, sinh viên và cộng đồng yêu khoa học về việc đề xuất những bài toán mới (như Nghịch lý Fermi, Con mèo của Schrödinger, Nghịch lý Russell, Bài toán Ba vật thể...) là rất lớn.

Hệ thống cần một cơ chế để:

1. Cho phép cả người dùng có tài khoản lẫn khách vãng lai gửi đề xuất bài toán kèm phân loại chủ đề khoa học, điểm phản trực giác và ý tưởng tương tác.
2. Cung cấp cơ chế bình chọn dân chủ (Upvote) có khả năng chống trùng lặp / spam (theo `userId` hoặc `clientSession`), hỗ trợ Toggle Vote.
3. Cung cấp vòng đời trạng thái minh bạch từ `PENDING` $\to$ `UNDER_REVIEW` $\to$ `PLANNED` $\to$ `IN_DEVELOPMENT` $\to$ `COMPLETED` (kèm slug dẫn vào phòng Lab) hoặc `REJECTED`.
4. Cung cấp không gian quản trị và kiểm duyệt chuyên sâu cho Ban biên tập Wonderlab (`/admin/requests`).

## Decision

1. **Cơ sở dữ liệu (Prisma)**:
   - Thêm Enum `SimulationRequestStatus`: `PENDING`, `UNDER_REVIEW`, `PLANNED`, `IN_DEVELOPMENT`, `COMPLETED`, `REJECTED`.
   - Bảng `simulation_requests`: Lưu thông tin chi tiết bài toán, người gửi, số vote (`vote_count`), ghi chú của ban biên tập (`admin_notes`), và slug liên kết (`target_slug`).
   - Bảng `simulation_request_votes`: Đảm bảo tính duy nhất qua composite unique constraints: `@@unique([requestId, userId])` và `@@unique([requestId, clientSession])`.

2. **Backend (NestJS Module `simulation-requests`)**:
   - Sử dụng `OptionalJwtAuthGuard` trên các endpoint công cộng để tự động nhận diện người dùng đăng nhập mà không chặn khách vãng lai.
   - Khi tạo đề xuất mới, tự động khởi tạo 1 phiếu vote ban đầu cho người gửi trong cùng một transaction database.
   - Thao tác Toggle Vote: Nếu đã vote thì xóa bản ghi vote và giảm `voteCount`; nếu chưa vote thì tạo bản ghi và tăng `voteCount`.
   - Bảo vệ các thao tác thẩm định và xóa mềm bằng `JwtAuthGuard` + `RolesGuard` với quyền `Role.ADMIN`.

3. **Frontend (Next.js 15 App Router & React 19)**:
   - Route công cộng `/requests`: Hiển thị danh sách đề xuất dạng Lab Editorial Cards, hỗ trợ lọc theo trạng thái, chủ đề, sắp xếp theo số vote hoặc thời gian, và tìm kiếm tức thì.
   - Modal `RequestModal`: Tái sử dụng UI Kit chuẩn (`AppModal`, `AppInput`, `AppSelect`, `AppButton`), kiểm tra hợp lệ dữ liệu khoa học.
   - Touchpoints: CTA Banner tại trang danh mục `/simulations`, liên kết trên thanh điều hướng Header và Footer.
   - Cổng quản trị `/admin/requests`: Sử dụng `AppTableFilter` tích hợp trong `AdminSidebar` phục vụ thẩm định và cập nhật phản hồi chuyên môn.

## Consequences

- Tạo ra kênh tương tác mở và lộ trình minh bạch thúc đẩy sự gắn kết của cộng đồng người yêu khoa học.
- Đảm bảo hiệu năng cao với index phân cấp trên database và cơ chế phân trang chuẩn mực.
- Tuyệt đối tuân thủ các quy tắc Anti-AI Slop của Wonderlab: không số liệu giả, phông chữ tối thiểu $\ge 12\text{px}$, thiết kế kỹ thuật sắc nét "Clean Paper & Lab Editorial".
