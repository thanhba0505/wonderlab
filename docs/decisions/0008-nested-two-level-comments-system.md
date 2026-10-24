# 8. Kiến trúc Thảo luận Phân cấp (Nested Comments System, Max 2 Levels)

Date: 2026-10-24

## Status

Accepted

## Context

Wonderlab hướng tới việc trở thành một nền tảng khám phá khoa học tương tác cao, nơi người học không chỉ quan sát mô phỏng mà còn có thể thảo luận, đặt câu hỏi phản biện và chia sẻ kết quả thực nghiệm.

Yêu cầu đặt ra:
1. Cho phép người dùng đã xác thực (Authenticated Users) đăng bình luận và phản hồi lẫn nhau.
2. Cấu trúc thảo luận phải rõ ràng, chống việc lồng phân cấp vô hạn (infinite nesting depth) gây vỡ giao diện và phân mảnh luồng hội thoại. Hệ thống cần giới hạn nghiêm ngặt **tối đa 2 cấp (Root comment -> Direct reply)**.
3. Người dùng chưa đăng nhập có thể đọc bình luận và được hướng dẫn đăng nhập nhanh.

## Decision

1. **Prisma Data Model**:
   - Bổ sung bảng `comments` với khóa ngoại tự tham chiếu `parentId`:
     - Bình luận cấp 1 (Root): `parentId = null`.
     - Bình luận cấp 2 (Reply): `parentId = rootComment.id`.
   - Index tối ưu: `[simulation_slug]`, `[parent_id]`, `[created_at DESC]`.
   - Cascade delete: Khi bình luận gốc bị xóa, toàn bộ câu trả lời con sẽ tự động được thu hồi.

2. **Backend Guard Clause (NestJS)**:
   - Trong `CommentsService.create()`:
     - Khi nhận `parentId`, kiểm tra nếu `parentComment.parentId !== null`, API lập tức quăng `BadRequestException` ("Hệ thống chỉ hỗ trợ thảo luận tối đa 2 cấp").
   - Xác thực: Endpoint tạo và xóa bình luận yêu cầu `JwtAuthGuard`. Quyền xóa chỉ thuộc về tác giả hoặc tài khoản có role `ADMIN`.

3. **Frontend Architecture (Next.js 15 App Router)**:
   - Thành phần `CommentSection` được tích hợp tại mỗi trang thí nghiệm (`/simulations/[slug]`).
   - Giao diện Cấp 2 thụt lề nhẹ với chỉ báo nhánh (`border-l-2 border-slate-200`) và tuyệt đối **không hiển thị nút Trả lời** nhằm ngăn chặn tương tác vượt quá 2 cấp.
   - Hỗ trợ form đăng nhập nhanh in-place cho khách chưa xác thực.

## Consequences

- Luồng thảo luận gọn gàng, có tính học thuật cao và trực quan trên cả thiết bị di động và màn hình rộng.
- Chặn đứng 100% rủi ro lồng sâu quá mức ở cả tầng validation backend lẫn tầng render frontend.
