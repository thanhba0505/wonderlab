# 9. Kiến trúc Cổng Quản trị Sidebar (Admin Portal Sidebar Architecture)

Date: 2026-10-24

## Status

Accepted

## Context

Giao diện quản trị ban đầu sử dụng cấu trúc 3 tab phẳng và hiển thị trực tiếp các thông số kỹ thuật hạ tầng (NestJS, PostgreSQL, loopback port, thư viện mã hóa). Điều này vi phạm nguyên tắc sản phẩm và không đáp ứng nhu cầu quản trị vận hành thực tế (quản lý mô hình thí nghiệm, danh bạ người dùng, kiểm duyệt thảo luận cộng đồng).

## Decision

1. **Loại bỏ thông số hạ tầng (No Tech Stack Dumps)**:
   - Thay thế việc hiển thị phiên bản máy chủ/database bằng các chỉ số vận hành có ý nghĩa: Tổng lượt chạy mô phỏng, tổng mẫu thử Monte Carlo, số thành viên đăng ký, tổng số bình luận & phản hồi.
2. **Kiến trúc Sidebar (Persistent & Responsive)**:
   - Sidebar cố định trên desktop, hỗ trợ drawer mở rộng trên thiết bị di động.
   - 5 phân hệ chuyên biệt:
     - **Tổng quan (Dashboard)**: 4 thẻ KPIs, nhật ký chạy thí nghiệm thời gian thực, thảo luận mới nhất.
     - **Cài đặt Thí nghiệm (Simulations)**: Bảng danh mục 5 mô hình toán học, toggle phát hành, xuất báo cáo CSV, liên kết kiểm thử trực tiếp.
     - **Quản lý Người dùng (Users)**: Danh bạ thành viên, thống kê hoạt động, nâng/hạ quyền quản trị viên (Admin <-> User).
     - **Kiểm duyệt Bình luận (Comments)**: Bảng kiểm duyệt tập trung tất cả thảo luận phân cấp 2 tầng trên toàn sàn, lọc theo thí nghiệm, tìm kiếm nội dung, xóa vi phạm.
     - **Cài đặt Nền tảng (Settings)**: Bật/tắt chạy mô phỏng cho khách, tạm khóa khung bình luận toàn sàn, xuất sao lưu JSON.
3. **Backend APIs (NestJS)**:
   - Bổ sung `GET /api/v1/simulations/admin/overview`, `GET /api/v1/users`, `PATCH /api/v1/users/:id/role`, `GET /api/v1/admin/comments`.
   - Tất cả endpoint quản trị được bảo vệ bởi `JwtAuthGuard` và `RolesGuard` với yêu cầu bắt buộc `Role.ADMIN`.

## Consequences

- Cổng quản trị đạt chuẩn chuyên nghiệp, trực quan và dễ mở rộng.
- Bảo mật chặt chẽ nhờ cơ chế kiểm tra quyền hạn cấp độ route và phân quyền theo vai trò.
