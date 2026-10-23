# Contributing to Wonderlab

Cảm ơn bạn đã đóng góp cho Wonderlab! Để đảm bảo chất lượng kỹ thuật, tính ổn định và tính mở rộng lâu dài của dự án, vui lòng tuân thủ các quy chuẩn dưới đây.

---

## 1. Quy tắc Commit (Conventional Commits)

Wonderlab áp dụng chuẩn **Conventional Commits v1.0.0**:

- `feat: <nội dung>`: Thêm tính năng mới cho người dùng.
- `fix: <nội dung>`: Sửa lỗi.
- `chore: <nội dung>`: Cập nhật cấu hình, dependency hoặc việc bảo trì định kỳ.
- `docs: <nội dung>`: Thay đổi tài liệu kỹ thuật.
- `test: <nội dung>`: Bổ sung hoặc tái cấu trúc bộ kiểm thử.
- `refactor: <nội dung>`: Cải tiến cấu trúc mã nguồn không làm thay đổi hành vi.
- `ci: <nội dung>`: Thay đổi cấu hình workflow CI/CD.

_Ví dụ_: `feat: add Monty Hall simulation interactive component`

---

## 2. Quy trình làm việc (Workflow)

1. **Tạo nhánh mới**:
   ```bash
   git checkout -b feat/your-feature-name
   # hoặc
   git checkout -b fix/issue-description
   ```
2. **Thực hiện thay đổi**:
   - Đảm bảo tuân thủ các quy tắc trong [AGENTS.md](AGENTS.md).
   - Không đưa bí mật (API token, mật khẩu DB) vào code.
3. **Chạy kiểm tra bắt buộc trước khi tạo Pull Request**:
   ```bash
   pnpm check
   ```
   Tất cả các lệnh con (`format:check`, `lint`, `typecheck`, `test`, `test:e2e`, `build`) phải kết thúc với mã thoát 0.
4. **Mở Pull Request**:
   - Sử dụng PR template có sẵn.
   - Mô tả rõ thay đổi và các bước kiểm thử đã thực hiện.

---

## 3. Tiêu chí hoàn thành (Definition of Done)

Một Pull Request chỉ được chấp nhận sáp nhập khi:

- [ ] Không có cảnh báo hoặc lỗi linter (`pnpm lint`).
- [ ] Không có lỗi kiểu dữ liệu TypeScript (`pnpm typecheck`).
- [ ] Toàn bộ unit tests và E2E tests đều chạy thành công (`pnpm test`, `pnpm test:e2e`).
- [ ] Cả client và server đều build thành công (`pnpm build`).
- [ ] Cập nhật tài liệu tương ứng trong `docs/` nếu có thay đổi kiến trúc hoặc môi trường.
