'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  AppButton,
  AppSelect,
  AppTextArea,
} from '@/components/ui';
import { Wrench, Bell, Gauge, CheckCircle2 } from 'lucide-react';

export default function AdminGeneralSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = React.useState<boolean>(false);
  const [enableBanner, setEnableBanner] = React.useState<boolean>(false);
  const [bannerText, setBannerText] = React.useState<string>(
    'Chào mừng đến với Wonderlab — Hệ thống thí nghiệm toán học và xác suất trực quan.',
  );
  const [maxTrialsLimit, setMaxTrialsLimit] = React.useState<number>(50000);
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
          <span>Cài đặt chung đã được cập nhật thành công vào cấu hình vận hành hệ thống.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Identity & Maintenance Mode */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              Chế Độ Vận Hành & Bảo Trì
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Điều chỉnh trạng thái hoạt động công khai của toàn bộ phòng Lab.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-slate-900">Chế độ bảo trì hệ thống</div>
                <div className="text-slate-500 text-xs">
                  Khi bật, người dùng thông thường sẽ thấy màn hình thông báo nâng cấp; chỉ quản trị
                  viên mới có quyền truy cập.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceMode ? 'bg-amber-600' : 'bg-slate-300'
                }`}
                aria-label="Bật tắt chế độ bảo trì"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="text-xs font-bold text-slate-800">Thông tin môi trường:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Nền tảng:</span>
                  <div className="font-mono font-bold text-slate-800">Wonderlab Lab</div>
                </div>
                <div>
                  <span className="text-slate-500">Phiên bản:</span>
                  <div className="font-mono font-bold text-blue-700">0.3.0</div>
                </div>
                <div>
                  <span className="text-slate-500">Múi giờ vận hành:</span>
                  <div className="font-mono text-slate-700">UTC+7 (Asia/Ho_Chi_Minh)</div>
                </div>
                <div>
                  <span className="text-slate-500">Trạng thái:</span>
                  <div className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Sẵn sàng hoạt động
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Computation Limit */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-600" />
              Giới Hạn Năng Lực Tính Toán Monte Carlo
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Kiểm soát tải tính toán trình duyệt để đảm bảo trải nghiệm mượt mà.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <div className="space-y-2">
              <label htmlFor="trials-limit" className="font-bold text-slate-900 block">
                Mức trần số mẫu thử cho mỗi lượt chạy
              </label>
              <p className="text-slate-500 text-xs">
                Giới hạn này ngăn chặn việc quá tải vi xử lý trên các thiết bị cấu hình phổ thông
                khi chạy mô phỏng xác suất lớn.
              </p>
              <AppSelect
                id="trials-limit"
                value={maxTrialsLimit}
                onChange={e => setMaxTrialsLimit(Number(e.target.value))}
                options={[
                  { value: 1000, label: '1,000 mẫu thử (Tiết kiệm tài nguyên)' },
                  { value: 10000, label: '10,000 mẫu thử (Khuyến nghị chuẩn)' },
                  { value: 50000, label: '50,000 mẫu thử (Độ chính xác cao)' },
                  { value: 100000, label: '100,000 mẫu thử (Nghiên cứu chuyên sâu)' },
                ]}
              />
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600 text-xs space-y-1">
              <span className="font-bold text-slate-800">Khuyến cáo kỹ thuật:</span>
              <p>
                Thuật toán Monte Carlo thực thi trực tiếp trên luồng trình duyệt người dùng. Mức
                trần{' '}
                <span className="font-mono font-bold text-slate-900">
                  {maxTrialsLimit.toLocaleString('vi-VN')}
                </span>{' '}
                mẫu thử giúp duy trì tỷ lệ 60 khung hình/giây.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Global Announcement Banner */}
        <Card className="border-slate-300/85 bg-white shadow-2xs md:col-span-2">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600" />
              Băng Rôn Thông Báo Toàn Nền Tảng
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Hiển thị thông điệp trực tiếp trên thanh đầu trang cho toàn thể người dùng truy cập
              Lab.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Hiển thị băng rôn thông báo</div>
                <div className="text-slate-500 text-xs">
                  Bật thanh thông báo nổi bật xuất hiện trên toàn bộ các trang mô phỏng.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnableBanner(!enableBanner)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableBanner ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                aria-label="Bật tắt băng rôn thông báo"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enableBanner ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {enableBanner && (
              <AppTextArea
                id="banner-text"
                label="Nội dung thông báo hiển thị"
                rows={2}
                value={bannerText}
                onChange={e => setBannerText(e.target.value)}
                placeholder="Nhập nội dung thông điệp gửi tới cộng đồng nghiên cứu..."
                showCount
                maxLength={500}
              />
            )}

            <div className="pt-2 flex justify-end">
              <AppButton size="sm" onClick={handleSave} className="text-xs font-semibold shadow-xs">
                Lưu Thay Đổi Cài Đặt Chung
              </AppButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
