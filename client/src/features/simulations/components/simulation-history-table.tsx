'use client';

import * as React from 'react';
import { History, RotateCcw, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationRunItem } from '@/lib/telemetry';
import { useTranslation } from '@/i18n';
import { AppPagination } from '@/components/ui/app-pagination';
import { getSimulationHistoryFormatter } from '../utils/simulation-history-registry';

interface SimulationHistoryTableProps {
  simulationSlug?: string;
  runs: SimulationRunItem[];
  isLoading?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onReloadParams?: (params: Record<string, unknown>) => void;
}

export function SimulationHistoryTable({
  simulationSlug = '',
  runs,
  isLoading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  onReloadParams,
}: SimulationHistoryTableProps) {
  const { locale, dict } = useTranslation();
  const hist = dict.simulations.history;
  const formatter = React.useMemo(
    () => getSimulationHistoryFormatter(simulationSlug),
    [simulationSlug],
  );

  const effectiveTotal = total > 0 ? total : runs.length;

  if (runs.length === 0 && !isLoading) {
    return (
      <div className="rounded-xl border border-slate-300/85 bg-white p-6 text-center shadow-xs">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <History className="h-5 w-5" />
        </div>
        <h4 className="mt-3 font-heading text-sm font-bold text-slate-900">{hist.title}</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">{hist.empty_state}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white shadow-xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-blue-700" />
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
            {hist.title}
          </h3>
          <Badge variant="outline" className="font-mono text-xs text-slate-600 bg-white">
            {effectiveTotal} {hist.records}
          </Badge>
        </div>
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {hist.auto_synced}
        </span>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/50 text-xs font-mono uppercase tracking-wider text-slate-600">
              <th className="px-4 py-2.5">{hist.timestamp}</th>
              <th className="px-4 py-2.5">{formatter.columns.paramHeader}</th>
              <th className="px-4 py-2.5 text-right">{hist.trials}</th>
              <th className="px-4 py-2.5 text-right">{formatter.columns.metricHeader}</th>
              <th className="px-4 py-2.5 text-right">{formatter.columns.theoryHeader}</th>
              {onReloadParams && <th className="px-4 py-2.5 text-center">{hist.action}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {runs.map(run => {
              const date = new Date(run.createdAt);
              const timeString = isNaN(date.getTime())
                ? dict.simulations.comments.time_just_now
                : date.toLocaleTimeString(locale === 'en' ? 'en-US' : 'vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

              const params = (run.parameters as Record<string, unknown>) || {};
              const results = (run.results as Record<string, unknown>) || {};

              return (
                <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{timeString}</td>

                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {formatter.renderParameters(params)}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-900 font-bold whitespace-nowrap">
                    {run.trialsCount.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {formatter.renderEmpiricalResult(results, run.trialsCount)}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {formatter.renderTheoreticalComparison(params, results)}
                  </td>

                  {onReloadParams && (
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReloadParams(params)}
                        className="h-6 px-2 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 font-sans gap-1"
                        title={hist.reload_tooltip}
                      >
                        <RotateCcw className="h-3 w-3" />
                        {hist.reload}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {onPageChange && effectiveTotal > 0 ? (
        <AppPagination
          page={page}
          pageSize={pageSize}
          total={effectiveTotal}
          onPageChange={onPageChange}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={onPageSizeChange}
          className="border-t border-slate-200"
        />
      ) : (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/40 px-4 py-2 text-xs text-slate-500 font-sans">
          <span>{hist.showing_max}</span>
          <span className="font-mono text-slate-400 flex items-center gap-1">
            {hist.persistent_storage}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      )}
    </div>
  );
}
