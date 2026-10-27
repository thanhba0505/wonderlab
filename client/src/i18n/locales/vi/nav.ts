import { NavDictionary, HeaderDictionary, FooterDictionary, AdminNavDictionary } from '../../types';

export const navVi: NavDictionary = {
  home: 'Trang chủ',
  simulations: 'Phòng Lab',
  explore: 'Khám phá',
  essays: 'Bài viết',
  requests: 'Đề xuất Lab',
  admin: 'Quản trị',
  login: 'Đăng nhập',
  my_account: 'Tài khoản',
  logout: 'Đăng xuất',
  back: 'Quay lại',
  profile: 'Hồ sơ cá nhân',
  settings: 'Cài đặt tài khoản',
};

export const headerVi: HeaderDictionary = {
  brand: 'WONDERLAB',
  tagline: 'Khám phá Khoa học, Xác suất & Nghịch lý Trực quan',
  language: 'Ngôn ngữ',
  switch_to: 'Chuyển sang {lang}',
  current_lang: 'Tiếng Việt',
};

export const footerVi: FooterDictionary = {
  about_text:
    'Không gian thí nghiệm trực quan cho khoa học, toán học, xác suất và nghịch lý logic. Khám phá cách thế giới vận hành qua những hiện tượng phản trực giác.',
  quick_links: 'Khám phá nhanh',
  community: 'Cộng đồng & Đóng góp',
  copyright: '© {year} Wonderlab. Nền tảng thí nghiệm khoa học mở.',
  lab_experiments: 'Phòng Thí Nghiệm',
  submit_request: 'Đề xuất bài toán mới',
  essays_journal: 'Tập san Khoa học',
  admin_portal: 'Cổng Quản trị',
  sim_monty_hall: 'Nghịch lý Monty Hall',
  sim_birthday: 'Nghịch lý Ngày sinh',
  sim_double_slit: 'Thí nghiệm Hai khe Young',
  sim_prisoners_dilemma: 'Thế lưỡng nan Người tù',
  sim_zeno: 'Nghịch lý Zeno',
  sim_prisoners_hats: 'Bài toán Đội mũ & Bit Chẵn lẻ',
  new_badge: 'Mới',
  open_lab_platform: 'Nền tảng thí nghiệm khoa học mở.',
  experimental_education: 'Khoa học thực nghiệm & Giáo dục khai phóng',
};

export const adminNavVi: AdminNavDictionary = {
  personal_group: 'Cá nhân',
  personal_overview: 'Tổng quan tài khoản',
  personal_profile: 'Hồ sơ cá nhân',
  system_group: 'Hệ thống Quản trị',
  system_dashboard: 'Bảng điều khiển',
  system_simulations: 'Quản lý Mô phỏng',
  system_requests: 'Đề xuất Mô phỏng',
  system_users: 'Quản lý Người dùng',
  system_comments: 'Quản lý Bình luận',
  system_settings: 'Cài đặt Hệ thống',
  settings_general: 'Cấu hình Chung',
  settings_access: 'Bảo mật & Quyền riêng tư',
  settings_backup: 'Sao lưu & Phục hồi',
  collapse_sidebar: 'Thu gọn thanh điều hướng',
  expand_sidebar: 'Mở rộng thanh điều hướng',
  return_to_app: 'Về trang chủ Wonderlab',
};
