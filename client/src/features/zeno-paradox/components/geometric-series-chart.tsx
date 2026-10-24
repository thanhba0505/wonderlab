'use client';

import * as React from 'react';
import { TrendingUp, Infinity as InfinityIcon, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ZenoParameters, ZenoStep, calculateOvertakePoint } from '../zeno-math';

interface GeometricSeriesChartProps {
  params: ZenoParameters;
  steps: ZenoStep[];
  currentStepIndex: number;
  onStepSelect?: (index: number) => void;
}

export function GeometricSeriesChart({
  params,
  steps,
  currentStepIndex,
  onStepSelect,
}: GeometricSeriesChartProps) {
  const analytical = calculateOvertakePoint(params);
  const targetT = analytical.overtakeTime;

  // Render SVG dimensions
  const chartHeight = 180;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = 600;

  const displaySteps = steps.slice(0, 10);

  // SVG Scalers
  const getX = (index: number) => {
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    return paddingLeft + (index / Math.max(1, displaySteps.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    const ratio = targetT > 0 ? Math.min(1, Math.max(0, val / (targetT * 1.05))) : 0;
    return chartHeight - paddingBottom - ratio * usableHeight;
  };

  // Generate SVG polyline path for cumulative time S_n
  const pointsPath = displaySteps
    .map((s, idx) => `${getX(idx)},${getY(s.cumulativeTime)}`)
    .join(' ');

  return (
    <div className="flex flex-col gap-4 pt-6 border-t border-slate-200/80">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Chuỗi Hội Tụ Hình Học: Tổng Vô Hạn = Đại Lượng Hữu Hạn
            </h3>
            <p className="text-xs text-slate-500">
              Minh chứng toán học: Tổng của vô hạn số hạng nhỏ dần hội tụ chính xác về giới hạn{' '}
              {targetT.toFixed(3)}s
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="font-mono text-xs border-blue-200 bg-blue-50/70 text-blue-800"
        >
          <InfinityIcon className="mr-1 h-3.5 w-3.5" />
          lim(Sn) = T* = {targetT.toFixed(3)}s
        </Badge>
      </div>

      {/* 2. Asymptotic Convergence Curve (SVG) */}
      <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible font-mono text-xs"
        >
          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={getY(0)}
            x2={chartWidth - paddingRight}
            y2={getY(0)}
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Asymptote target line (T*) */}
          <line
            x1={paddingLeft}
            y1={getY(targetT)}
            x2={chartWidth - paddingRight}
            y2={getY(targetT)}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={chartWidth - paddingRight + 5}
            y={getY(targetT) + 3}
            fill="#ef4444"
            fontWeight="bold"
          >
            T* = {targetT.toFixed(2)}s
          </text>

          {/* Y Axis labels */}
          <text x={paddingLeft - 8} y={getY(0) + 3} textAnchor="end" fill="#64748b">
            0s
          </text>
          <text x={paddingLeft - 8} y={getY(targetT * 0.5) + 3} textAnchor="end" fill="#64748b">
            {(targetT * 0.5).toFixed(1)}s
          </text>
          <text x={paddingLeft - 8} y={getY(targetT) + 3} textAnchor="end" fill="#ef4444">
            {targetT.toFixed(1)}s
          </text>

          {/* Cumulative points line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsPath}
          />

          {/* Individual step points */}
          {displaySteps.map((s, idx) => {
            const cx = getX(idx);
            const cy = getY(s.cumulativeTime);
            const isSelected = currentStepIndex === idx;

            return (
              <g key={idx} className="cursor-pointer" onClick={() => onStepSelect?.(idx)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#7c3aed' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fill={isSelected ? '#7c3aed' : '#64748b'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  #{idx}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. Steps Accumulation Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <th className="py-2 px-3 font-semibold">Chặng (n)</th>
              <th className="py-2 px-3 font-semibold">Thời gian chặng (Δt)</th>
              <th className="py-2 px-3 font-semibold">Tổng tích lũy (Sn)</th>
              <th className="py-2 px-3 font-semibold">Khoảng cách còn lại</th>
              <th className="py-2 px-3 font-semibold">% Hội tụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displaySteps.map((s, idx) => {
              const isSelected = currentStepIndex === idx;

              return (
                <tr
                  key={idx}
                  onClick={() => onStepSelect?.(idx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-violet-50/80 font-bold text-violet-950'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-2 px-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isSelected ? 'bg-violet-600' : 'bg-slate-300'
                        }`}
                      />
                      #{s.step}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-700">+{s.deltaTime.toFixed(4)}s</td>
                  <td className="py-2 px-3 text-blue-700">{s.cumulativeTime.toFixed(4)}s</td>
                  <td className="py-2 px-3 text-slate-600">{s.remainingGap.toFixed(4)}m</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-600 rounded-full"
                          style={{ width: `${Math.min(100, s.fractionOfTotalTime)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">
                        {s.fractionOfTotalTime.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Calculus Truth Callout */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 font-sans leading-relaxed">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
        <div>
          <span className="font-bold font-heading">Định lý Cấp số nhân Lùi vô hạn:</span> Với tỷ số
          vận tốc công bội $r = v_T / v_A ={' '}
          {(params.tortoiseSpeed / params.achillesSpeed).toFixed(2)} &lt; 1$, tổng chuỗi vô hạn $1 +
          r + r^2 + \dots = 1 / (1 - r) = {analytical.convergenceRate.toFixed(2)}$. Do đó, dẫu Zeno
          có thể chia nhỏ hành trình thành vô số bước toán học, toàn bộ vô số bước ấy diễn ra trọn
          vẹn trong vỏn vẹn <strong className="font-mono">{targetT.toFixed(2)} giây</strong> ngoài
          thực tế!
        </div>
      </div>
    </div>
  );
}
