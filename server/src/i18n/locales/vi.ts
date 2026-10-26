import { ServerDictionary } from '../i18n.types';

export const viTranslations: ServerDictionary = {
  auth: {
    invalid_credentials: 'Tên đăng nhập hoặc mật khẩu không chính xác',
    google_account_only:
      'Tài khoản này được đăng ký qua Google. Vui lòng đăng nhập bằng Google hoặc thiết lập mật khẩu.',
    account_disabled: 'Tài khoản này đã bị vô hiệu hóa hoặc đã xóa.',
    email_not_verified: 'Email chưa được xác thực. Vui lòng xác thực email trước khi đăng nhập.',
    username_exists: 'Tên người dùng đã tồn tại trên hệ thống.',
    email_exists: 'Email này đã được sử dụng bởi một tài khoản khác.',
    invalid_or_expired_otp: 'Mã xác thực không đúng hoặc đã hết hạn.',
    otp_resent: 'Mã xác thực mới đã được gửi tới email của bạn.',
    email_verified_success: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.',
    password_reset_success:
      'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.',
    password_changed_success: 'Đổi mật khẩu thành công.',
    old_password_incorrect: 'Mật khẩu hiện tại không chính xác.',
    password_already_set: 'Tài khoản đã có mật khẩu. Vui lòng sử dụng tính năng Đổi mật khẩu.',
    password_set_success: 'Thiết lập mật khẩu thành công.',
    unauthorized: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.',
    forbidden: 'Bạn không có quyền thực hiện hành động này.',
  },
  mail: {
    subject_register: 'Xác thực đăng ký tài khoản Wonderlab',
    subject_reset_password: 'Khôi phục mật khẩu Wonderlab',
    purpose_register: 'XÁC THỰC ĐĂNG KÝ TÀI KHOẢN',
    purpose_reset_password: 'KHÔI PHỤC MẬT KHẨU',
    otp_code_label: 'MÃ XÁC THỰC 6 SỐ',
    otp_validity: 'Thời hạn hiệu lực: 15 phút. Vui lòng không chia sẻ mã này.',
  },
  common: {
    internal_error: 'Đã xảy ra lỗi trên hệ thống.',
    invalid_data: 'Dữ liệu không hợp lệ.',
    resource_not_found: 'Tài nguyên yêu cầu không tồn tại.',
    success: 'Thao tác thành công.',
  },
  comments: {
    not_found: 'Bình luận không tồn tại hoặc đã bị xóa.',
    deleted: 'Xóa bình luận thành công.',
  },
  simulation_requests: {
    not_found: 'Yêu cầu mô phỏng không tồn tại.',
  },
  users: {
    not_found: 'Người dùng không tồn tại.',
  },
};
