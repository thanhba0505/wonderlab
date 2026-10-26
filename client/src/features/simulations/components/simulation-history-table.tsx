'use client';

import * as React from 'react';
import { History, RotateCcw, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationRunItem } from '@/lib/telemetry';
import { useTranslation } from '@/i18n';

interface SimulationHistoryTableProps {
  runs: SimulationRunItem[];
  isLoading?: boolean;
  onReloadParams?: (params: Record<string, unknown>) => void;
}

export function SimulationHistoryTable({
  runs,
  isLoading = false,
  onReloadParams,
}: SimulationHistoryTableProps) {
  const { locale } = useTranslation();
  const isEn = locale === 'en';

  if (runs.length === 0 && !isLoading) {
    return (
      <div className="rounded-xl border border-slate-300/85 bg-white p-6 text-center shadow-xs">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <History className="h-5 w-5" />
        </div>
        <h4 className="mt-3 font-heading text-sm font-bold text-slate-900">
          {isEn
            ? 'No experimental trials recorded in this session'
            : 'Chưa có lượt thực nghiệm nào trong phiên này'}
        </h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
          {isEn
            ? 'Whenever you run a random trial or Monte Carlo batch, the results will automatically appear here for comparative verification.'
            : 'Mỗi lần bạn bấm chạy mô phỏng ngẫu nhiên hoặc Monte Carlo (1.000, 10.000 phép thử), kết quả sẽ được tự động lưu trữ và hiển thị tại đây để đối chiếu.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-blue-700" />
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
            {isEn ? 'Experiment Session Runs' : 'Nhật ký Lượt chạy Thực nghiệm (Session Runs)'}
          </h3>
          <Badge variant="outline" className="font-mono text-xs text-slate-600 bg-white">
            {runs.length} {isEn ? 'records' : 'bản ghi'}
          </Badge>
        </div>
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {isEn ? 'Auto synced' : 'Tự động đồng bộ'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/50 text-xs font-mono uppercase tracking-wider text-slate-600">
              <th className="px-4 py-2.5">{isEn ? 'Timestamp' : 'Thời điểm'}</th>
              <th className="px-4 py-2.5">{isEn ? 'Parameters' : 'Tham số'}</th>
              <th className="px-4 py-2.5 text-right">{isEn ? 'Trials' : 'Số phép thử'}</th>
              <th className="px-4 py-2.5 text-right">
                {isEn ? 'Empirical Rate' : 'Tỷ lệ thực nghiệm'}
              </th>
              <th className="px-4 py-2.5 text-right">
                {isEn ? 'Theory / Error Δ' : 'Lý thuyết / Sai số Δ'}
              </th>
              {onReloadParams && (
                <th className="px-4 py-2.5 text-center">{isEn ? 'Action' : 'Thao tác'}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {runs.map(run => {
              const date = new Date(run.createdAt);
              const timeString = isNaN(date.getTime())
                ? isEn
                  ? 'Just now'
                  : 'Vừa xong'
                : date.toLocaleTimeString(isEn ? 'en-US' : 'vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

              // Format parameters
              const params = run.parameters as Record<string, unknown>;
              const groupSize = params?.groupSize ?? params?.n;
              const doors = params?.doorsCount;

              // Format results
              const results = run.results as Record<string, unknown>;
              const empRate =
                typeof results?.empiricalProbability === 'number'
                  ? results.empiricalProbability
                  : typeof results?.winRate === 'number'
                    ? results.winRate
                    : null;

              const theoRate =
                typeof results?.theoreticalProbability === 'number'
                  ? results.theoreticalProbability
                  : null;

              const delta =
                empRate !== null && theoRate !== null ? Math.abs(empRate - theoRate) : null;

              return (
                <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{timeString}</td>

                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {groupSize !== undefined && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                        <span className="text-slate-400 font-normal">n =</span> {String(groupSize)}
                      </span>
                    )}
                    {doors !== undefined && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                        <span className="text-slate-400 font-normal">
                          {isEn ? 'Doors =' : 'Cửa ='}
                        </span>{' '}
                        {String(doors)}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-900 font-bold whitespace-nowrap">
                    {run.trialsCount.toLocaleString(isEn ? 'en-US' : 'vi-VN')}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {empRate !== null ? (
                      <span className="font-bold text-blue-700">{(empRate * 100).toFixed(2)}%</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {theoRate !== null && delta !== null ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-slate-600">{(theoRate * 100).toFixed(2)}%</span>
                        <span
                          className={`text-xs font-semibold ${
                            delta < 0.01
                              ? 'text-emerald-700'
                              : delta < 0.03
                                ? 'text-blue-600'
                                : 'text-amber-700'
                          }`}
                        >
                          (Δ {(delta * 100).toFixed(2)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {onReloadParams && (
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReloadParams(params)}
                        className="h-6 px-2 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 font-sans gap-1"
                        title={isEn ? 'Reload these parameters' : 'Nạp lại cấu hình này'}
                      >
                        <RotateCcw className="h-3 w-3" />
                        {isEn ? 'Reload' : 'Nạp lại'}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/40 px-4 py-2 text-xs text-slate-500 font-sans">
        <span>
          {isEn
            ? 'Showing up to 25 recent trials from this session'
            : 'Hiển thị tối đa 25 lượt gần nhất của phiên này'}
        </span>
        <span className="font-mono text-slate-400 flex items-center gap-1">
          {isEn ? 'Persistent session storage' : 'Dữ liệu lưu trữ bền vững'}
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
