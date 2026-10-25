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
import { Download, FileText, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AdminOverviewData, fetchAdminOverview } from '@/lib/admin-api';
import { getAllSimulations } from '@/features/simulations/registry';

export default function AdminBackupSettingsPage() {
  const [overview, setOverview] = React.useState<AdminOverviewData | null>(null);
  const [exportedNotice, setExportedNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAdminOverview().then(data => setOverview(data));
  }, []);

  const showExportNotice = (msg: string) => {
    setExportedNotice(msg);
    setTimeout(() => setExportedNotice(null), 3500);
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
    showExportNotice('Đã tạo và tải xuống gói dữ liệu sao lưu toàn nền tảng (.JSON)');
  };

  const handleExportSimulationsCsv = () => {
    const allSimulations = getAllSimulations();
    const statsMap = overview?.bySimulation || {};

    const csvHeader = 'Slug,Title,Category,Status,Difficulty,TotalRuns,TotalTrials';
    const csvRows = allSimulations.map(sim => {
      const stats = statsMap[sim.slug] || { runs: 0, trials: 0 };
      return `"${sim.slug}","${sim.title}","${sim.category}","${sim.status}","${sim.difficulty}",${stats.runs},${stats.trials}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [csvHeader, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wonderlab_simulations_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showExportNotice('Đã xuất và tải xuống báo cáo thí nghiệm khoa học (.CSV)');
  };

  return (
    <div className="space-y-6 font-sans">
      {exportedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{exportedNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full System JSON Dump */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-600" />
              Sao Lưu Ngoại Tuyến Toàn Nền Tảng (.JSON)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Lưu trữ bản sao lưu định dạng JSON cho mục đích kiểm toán và nghiên cứu.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <p className="text-slate-600 leading-relaxed">
              Bạn có thể xuất trọn vẹn tệp dữ liệu tổng hợp hoạt động nghiên cứu khoa học bao gồm
              tổng số lượt chạy mô phỏng, phân bố mẫu thử Monte Carlo và số lượng thảo luận thực tế.
            </p>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="font-mono text-xs font-bold text-slate-800">
                Gói dữ liệu sẵn sàng:
              </div>
              <ul className="text-slate-600 text-xs space-y-1 list-disc list-inside">
                <li>Toàn bộ chỉ số thực nghiệm của {overview?.totalRuns ?? 0} lượt chạy</li>
                <li>
                  Thống kê phân bổ theo {Object.keys(overview?.bySimulation ?? {}).length} mô hình
                  toán học
                </li>
                <li>Danh bạ số lượng thành viên và thảo luận khoa học</li>
              </ul>
            </div>

            <AppButton
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleExportFullDump}
              className="text-xs font-semibold border-slate-300 bg-white hover:bg-slate-50 gap-1.5"
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Tải Xuống Gói Dữ Liệu Toàn Nền Tảng (.JSON)
            </AppButton>
          </CardContent>
        </Card>

        {/* Simulations Telemetry CSV */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Báo Cáo Thí Nghiệm & Mô Hình (.CSV)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Xuất dữ liệu dạng bảng phục vụ phân tích thống kê trên Excel hoặc Python Pandas.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-xs font-sans">
            <p className="text-slate-600 leading-relaxed">
              Tệp bảng tính chứa danh mục đầy đủ các mô hình toán học hiện diện trong hệ thống, bao
              gồm phân loại chuyên mục, độ khó, trạng thái phát hành và tổng số mẫu thử Monte Carlo
              đã chạy.
            </p>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="font-mono text-xs font-bold text-slate-800">
                Cấu trúc các cột dữ liệu:
              </div>
              <div className="font-mono text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                Slug, Title, Category, Status, Difficulty, TotalRuns, TotalTrials
              </div>
            </div>

            <AppButton
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleExportSimulationsCsv}
              className="text-xs font-semibold border-slate-300 bg-white hover:bg-slate-50 gap-1.5"
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Xuất Báo Cáo Phòng Thí Nghiệm (.CSV)
            </AppButton>
          </CardContent>
        </Card>

        {/* Data Retention & Integrity */}
        <Card className="border-slate-300/85 bg-white shadow-2xs md:col-span-2">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Nguyên Tắc An Toàn & Bảo Lưu Dữ Liệu Nghiên Cứu
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Các chỉ dẫn kỹ thuật liên quan đến lưu trữ và khôi phục dữ liệu thực nghiệm.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-3 text-xs font-sans text-slate-600">
            <p className="leading-relaxed">
              Dữ liệu mô phỏng tại Wonderlab được lưu trữ theo các chuẩn xác suất mở. Mọi kết quả
              chạy Monte Carlo đều có thể kiểm chứng độc lập thông qua việc tái thực thi với cùng số
              lượng mẫu thử (N).
            </p>
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-blue-900">
              <span className="font-bold">Lưu ý quản trị:</span> Tệp sao lưu JSON chứa thông tin
              thống kê tổng hợp toàn hệ thống. Không chứa thông tin mật khẩu hay dữ liệu bảo mật
              nhạy cảm của tài khoản người dùng.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
