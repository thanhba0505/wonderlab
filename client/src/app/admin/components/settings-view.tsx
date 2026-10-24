'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AdminOverviewData } from '@/lib/admin-api';

interface SettingsViewProps {
  overview: AdminOverviewData | null;
}

export function SettingsView({ overview }: SettingsViewProps) {
  const [allowGuestRuns, setAllowGuestRuns] = React.useState<boolean>(true);
  const [allowComments, setAllowComments] = React.useState<boolean>(true);
  const [savedNotice, setSavedNotice] = React.useState<boolean>(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExportFullDump = () => {
    const dumpData = {
      exportTimestamp: new Date().toISOString(),
      platform: 'Wonderlab Scientific Portal',
      version: '0.3.0',
      overview,
    };
    const blob = new Blob([JSON.stringify(dumpData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wonderlab_system_dump_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-300/85 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">CÀI ĐẶT HỆ THỐNG</Badge>
            <span className="text-xs font-mono text-slate-400">Vận hành nền tảng</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mt-1">
            Cấu Hình & Chính Sách Vận Hành
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
            Quản trị quyền truy cập công cộng, kiểm soát luồng thảo luận và xuất sao lưu hệ thống.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportFullDump}
          className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Xuất Báo cáo JSON
        </Button>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Cấu hình nền tảng đã được lưu thành công vào bộ nhớ phiên làm việc.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Policy & Access Controls */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Chính Sách Truy Cập & Mô Phỏng
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Điều chỉnh quyền thực thi thuật toán Monte Carlo cho khách vãng lai.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Cho phép khách chạy mô phỏng</div>
                <div className="text-slate-500 text-[11px]">
                  Khách vãng lai không cần đăng nhập vẫn có thể thực hiện tối đa 1000 lượt thử.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowGuestRuns(!allowGuestRuns)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowGuestRuns ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    allowGuestRuns ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Tính năng thảo luận cộng đồng</div>
                <div className="text-slate-500 text-[11px]">
                  Bật hoặc tạm khóa toàn bộ khung bình luận 2 cấp trên tất cả các phòng Lab.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowComments(!allowComments)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowComments ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    allowComments ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={handleSave} className="text-xs font-semibold shadow-sm">
                Áp dụng thay đổi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Diagnostics & Backups */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <Download className="h-4 w-4 text-emerald-600" />
              Sao Lưu & Xuất Dữ Liệu
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Lưu trữ bản sao lưu ngoại tuyến cho mục đích nghiên cứu và báo cáo.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <p className="text-slate-600 leading-relaxed">
              Bạn có thể xuất trọn vẹn tệp dữ liệu tổng hợp hoạt động nghiên cứu khoa học bao gồm
              tổng số lượt chạy mô phỏng, phân bố mẫu thử Monte Carlo và số lượng thảo luận thực tế.
            </p>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="font-mono text-[11px] font-bold text-slate-800">
                Gói dữ liệu sẵn sàng:
              </div>
              <ul className="text-slate-600 text-[11px] space-y-1 list-disc list-inside">
                <li>Toàn bộ chỉ số thực nghiệm của {overview?.totalRuns ?? 0} lượt chạy</li>
                <li>
                  Thống kê phân bổ theo {Object.keys(overview?.bySimulation ?? {}).length} mô hình
                  toán học
                </li>
                <li>Danh bạ số lượng thành viên và thảo luận khoa học</li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportFullDump}
              className="w-full text-xs font-semibold border-slate-300 bg-white hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Tải Xuống Gói Dữ Liệu Toàn Nền Tảng (.JSON)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
