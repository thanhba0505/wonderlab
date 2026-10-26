'use client';

import * as React from 'react';
import { Share2, Copy, Check, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCsv, exportToJson, copyToClipboard } from '../utils/export-data';
import { useTranslation } from '@/i18n';
import { getAppBaseUrl } from '@/lib/utils';

interface ExportSuitePanelProps {
  simulationSlug: string;
  simulationTitle: string;
  parameters: Record<string, unknown>;
  results: Record<string, unknown>;
}

export function ExportSuitePanel({
  simulationSlug,
  simulationTitle,
  parameters,
  results,
}: ExportSuitePanelProps) {
  const { locale, dict } = useTranslation();
  const [copiedType, setCopiedType] = React.useState<'report' | 'url' | null>(null);

  const handleExportCsv = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const flatRecord: Record<string, string | number | boolean | null | undefined> = {
      timestamp: new Date().toISOString(),
      simulation: simulationSlug,
      ...(parameters as Record<string, string | number | boolean | null | undefined>),
      ...(results as Record<string, string | number | boolean | null | undefined>),
    };
    const headers = Object.keys(flatRecord);
    const rows = [headers.map(h => flatRecord[h])];
    exportToCsv(`wonderlab-${simulationSlug}-${timestamp}`, headers, rows);
  };

  const handleExportJson = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPayload = {
      meta: {
        platform: 'Wonderlab',
        simulation: simulationSlug,
        title: simulationTitle,
        exportedAt: new Date().toISOString(),
      },
      parameters,
      results,
    };
    exportToJson(`wonderlab-${simulationSlug}-${timestamp}`, exportPayload);
  };

  const handleCopyReport = async () => {
    const exp = dict.simulations.export;
    const dateLocale = locale === 'en' ? 'en-US' : 'vi-VN';
    const markdown = [
      `# ${exp.report_title}: ${simulationTitle}`,
      `- **${exp.report_system}**: Wonderlab Interactive Science Platform`,
      `- **${exp.report_timestamp}**: ${new Date().toLocaleString(dateLocale)}`,
      `- **ID**: \`${simulationSlug}\``,
      '',
      exp.report_input_params,
      ...Object.entries(parameters).map(([k, v]) => `- **${k}**: \`${String(v)}\``),
      '',
      exp.report_results,
      ...Object.entries(results).map(([k, v]) => `- **${k}**: \`${String(v)}\``),
      '',
      exp.extracted_from.replace(
        '{url}',
        `${typeof window !== 'undefined' ? window.location.origin : getAppBaseUrl()}/simulations/${simulationSlug}`,
      ),
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

  const exp = dict.simulations.export;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300/85 bg-white p-3 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          {exp.toolkit_title}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          title={exp.export_csv_tooltip}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          {exp.export_csv}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          title={exp.export_json_tooltip}
        >
          <FileJson className="h-3.5 w-3.5 text-blue-600" />
          {exp.export_json}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyReport}
          className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          title={exp.copy_markdown_tooltip}
        >
          {copiedType === 'report' ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">{exp.markdown_copied}</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              {exp.copy_markdown}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShareUrl}
          className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          title={exp.share_url_tooltip}
        >
          {copiedType === 'url' ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">{exp.url_copied}</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5 text-violet-600" />
              {exp.share_url}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
