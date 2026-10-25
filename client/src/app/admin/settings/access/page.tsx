'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  AppButton,
} from '@/components/ui';
import { ShieldCheck, MessageSquare, UserPlus, CheckCircle2 } from 'lucide-react';

export default function AdminAccessSettingsPage() {
  const [allowGuestRuns, setAllowGuestRuns] = React.useState<boolean>(true);
  const [allowComments, setAllowComments] = React.useState<boolean>(true);
  const [allowRegistration, setAllowRegistration] = React.useState<boolean>(true);
  const [requireEmailVerify, setRequireEmailVerify] = React.useState<boolean>(true);
  const [savedNotice, setSavedNotice] = React.useState<boolean>(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Chính sách truy cập và phân quyền đã được áp dụng thành công trên hệ thống.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simulation Access Policy */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Chính Sách Chạy Mô Phỏng
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Điều chỉnh quyền thực thi thuật toán xác suất cho người dùng công cộng.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-slate-900">Cho phép khách chạy mô phỏng</div>
                <div className="text-slate-500 text-xs">
                  Khách vãng lai không cần đăng nhập vẫn có thể thực hiện tối đa 1,000 lượt thử ngẫu
                  nhiên.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowGuestRuns(!allowGuestRuns)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowGuestRuns ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                aria-label="Cho phép khách chạy mô phỏng"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    allowGuestRuns ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600 text-xs space-y-1">
              <span className="font-bold text-slate-800">Quyền lợi thành viên đã đăng nhập:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Lưu trữ lịch sử thực nghiệm vào hồ sơ cá nhân</li>
                <li>Thực hiện các phiên mô phỏng lên đến 50,000 lượt thử</li>
                <li>Tham gia gửi bình luận và phản biện khoa học</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Discussion & Community Policy */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-violet-600" />
              Kiểm Soát Thảo Luận & Phản Biện
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Quản trị luồng ý kiến khoa học và cơ chế phản hồi từ cộng đồng.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-slate-900">Tính năng thảo luận cộng đồng</div>
                <div className="text-slate-500 text-xs">
                  Bật hoặc tạm khóa toàn bộ khung thảo luận trên tất cả các phòng Lab.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowComments(!allowComments)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowComments ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                aria-label="Bật tính năng thảo luận"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    allowComments ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600 text-xs space-y-1">
              <span className="font-bold text-slate-800">Quy tắc ứng xử khoa học:</span>
              <p>
                Tất cả thảo luận được kiểm duyệt tự động dựa trên từ khóa và có thể được quản trị
                viên xóa trực tiếp từ trang Kiểm duyệt Bình luận.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Registration & Onboarding */}
        <Card className="border-slate-300/85 bg-white shadow-2xs md:col-span-2">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-600" />
              Chính Sách Đăng Ký Tài Khoản & Bảo Vệ
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Thiết lập quy trình đăng ký thành viên mới và yêu cầu xác thực tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="space-y-0.5 pr-2">
                  <div className="font-bold text-slate-900">Mở đăng ký tự do</div>
                  <div className="text-slate-500 text-xs">
                    Cho phép bất kỳ ai tạo tài khoản thành viên mới tại Wonderlab.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowRegistration(!allowRegistration)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    allowRegistration ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  aria-label="Mở đăng ký tự do"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowRegistration ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="space-y-0.5 pr-2">
                  <div className="font-bold text-slate-900">Bắt buộc xác thực email</div>
                  <div className="text-slate-500 text-xs">
                    Yêu cầu kích hoạt tài khoản qua mã xác minh gửi tới hộp thư điện tử.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireEmailVerify(!requireEmailVerify)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    requireEmailVerify ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  aria-label="Bắt buộc xác thực email"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      requireEmailVerify ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <AppButton size="sm" onClick={handleSave} className="text-xs font-semibold shadow-xs">
                Áp Dụng Chính Sách Truy Cập
              </AppButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
