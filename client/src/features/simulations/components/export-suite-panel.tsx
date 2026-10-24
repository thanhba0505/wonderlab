'use client';

import * as React from 'react';
import { FileSpreadsheet, FileJson, Copy, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCsv, exportToJson, copyToClipboard } from '../utils/export-data';

interface ExportSuitePanelProps {
  simulationTitle: string;
  simulationSlug: string;
  parameters: Record<string, unknown>;
  results: Record<string, unknown>;
  historyRows?: (string | number | boolean | null | undefined)[][];
  csvHeaders?: string[];
}

export function ExportSuitePanel({
  simulationTitle,
  simulationSlug,
  parameters,
  results,
  historyRows,
  csvHeaders,
}: ExportSuitePanelProps) {
  const [copiedType, setCopiedType] = React.useState<'report' | 'url' | null>(null);

  const handleExportCsv = () => {
    const defaultHeaders = csvHeaders || ['Parameter_Key', 'Parameter_Value'];
    const defaultRows = historyRows || Object.entries(parameters).map(([k, v]) => [k, String(v)]);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    exportToCsv(`wonderlab-${simulationSlug}-${timestamp}`, defaultHeaders, defaultRows);
  };

  const handleExportJson = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const exportPayload = {
      platform: 'Wonderlab Open Science Platform',
      title: simulationTitle,
      slug: simulationSlug,
      exportedAt: new Date().toISOString(),
      parameters,
      results,
    };
    exportToJson(`wonderlab-${simulationSlug}-${timestamp}`, exportPayload);
  };

  const handleCopyReport = async () => {
    const markdown = [
      `# Báo cáo Thực nghiệm: ${simulationTitle}`,
      `- **Nền tảng**: Wonderlab Interactive Science Platform`,
      `- **Thời điểm**: ${new Date().toLocaleString('vi-VN')}`,
      `- **Mã thí nghiệm**: \`${simulationSlug}\``,
      '',
      `## Tham số đầu vào:`,
      ...Object.entries(parameters).map(([k, v]) => `- **${k}**: \`${String(v)}\``),
      '',
      `## Kết quả thực nghiệm:`,
      ...Object.entries(results).map(([k, v]) => `- **${k}**: \`${String(v)}\``),
      '',
      `> Trích xuất từ Wonderlab (https://wonderlab.local/simulations/${simulationSlug})`,
    ].join('\n');

    const ok = await copyToClipboard(markdown);
    if (ok) {
      setCopiedType('report');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleShareUrl = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    Object.entries(parameters).forEach(([k, v]) => {
      url.searchParams.set(k, String(v));
    });

    const ok = await copyToClipboard(url.toString());
    if (ok) {
      setCopiedType('url');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300/85 bg-white p-3 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          Bộ công cụ Nghiên cứu:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          title="Tải tệp bảng tính CSV"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          Xuất CSV
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          title="Tải tệp JSON dữ liệu"
        >
          <FileJson className="h-3.5 w-3.5 text-blue-600" />
          Xuất JSON
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyReport}
          className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          title="Sao chép báo cáo Markdown"
        >
          {copiedType === 'report' ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Đã chép Markdown!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              Chép Báo cáo
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShareUrl}
          className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          title="Sao chép liên kết chia sẻ tham số"
        >
          {copiedType === 'url' ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Đã chép Link!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5 text-violet-600" />
              Chia sẻ URL
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
