'use client';

import React, { useMemo } from 'react';
import { LineChart } from 'lucide-react';
import { calculateTheoreticalProbability } from '../birthday-math';
import { MonteCarloBatchResult } from '../birthday-math';
import { useTranslation } from '@/i18n';

interface ProbabilityChartProps {
  currentN: number;
  monteCarloResult: MonteCarloBatchResult | null;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  currentN,
  monteCarloResult,
}) => {
  const { locale } = useTranslation();
  const isEn = locale === 'en';

  const width = 500;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Tính các điểm trên đường cong xác suất lý thuyết (n từ 2 đến 100)
  const theoreticalPath = useMemo(() => {
    const points: string[] = [];
    for (let n = 2; n <= 100; n++) {
      const p = calculateTheoreticalProbability(n);
      const x = padding.left + ((n - 2) / 98) * plotWidth;
      const y = padding.top + (1 - p) * plotHeight;
      points.push(`${n === 2 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, [plotWidth, plotHeight, padding.left, padding.top]);

  // Tọa độ điểm hiện tại của n
  const currentCoord = useMemo(() => {
    const p = calculateTheoreticalProbability(currentN);
    const x = padding.left + ((currentN - 2) / 98) * plotWidth;
    const y = padding.top + (1 - p) * plotHeight;
    return { x, y, p };
  }, [currentN, plotWidth, plotHeight, padding.left, padding.top]);

  // Tọa độ điểm Monte Carlo nếu có
  const monteCarloCoord = useMemo(() => {
    if (!monteCarloResult) return null;
    const clampedN = Math.max(2, Math.min(100, currentN));
    const x = padding.left + ((clampedN - 2) / 98) * plotWidth;
    const y = padding.top + (1 - monteCarloResult.empiricalRate) * plotHeight;
    return { x, y, p: monteCarloResult.empiricalRate };
  }, [monteCarloResult, currentN, plotWidth, plotHeight, padding.left, padding.top]);

  return (
    <div className="flex flex-col gap-3">
      {/* Title duy nhất, không kẻ line ngay dưới title */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
            {isEn
              ? 'Probability Curve: Theory vs Empirical'
              : 'Đồ thị Xác suất Lý thuyết vs Thực nghiệm'}
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>
              {isEn ? 'Theory: ' : 'Lý thuyết: '}
              {(currentCoord.p * 100).toFixed(1)}%
            </span>
          </span>
          {monteCarloCoord && (
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>
                {isEn ? 'Empirical: ' : 'Thực nghiệm: '}
                {(monteCarloCoord.p * 100).toFixed(1)}%
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[340px] select-none">
          {/* Lưới tọa độ ngang (0%, 25%, 50%, 75%, 100%) */}
          {[0, 0.25, 0.5, 0.75, 1.0].map(level => {
            const y = padding.top + (1 - level) * plotHeight;
            const is50Percent = level === 0.5;

            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={is50Percent ? '#f59e0b' : '#e2e8f0'}
                  strokeWidth={is50Percent ? '1.5' : '1'}
                  strokeDasharray={is50Percent ? '4 3' : undefined}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className={`font-mono text-xs ${
                    is50Percent ? 'fill-amber-600 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {(level * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Lưới tọa độ đứng (các mốc n: 23, 50, 70, 100) */}
          {[23, 50, 70, 100].map(val => {
            const x = padding.left + ((val - 2) / 98) * plotWidth;
            const is23 = val === 23;

            return (
              <g key={val}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={is23 ? '#f59e0b' : '#f1f5f9'}
                  strokeWidth={is23 ? '1.5' : '1'}
                  strokeDasharray={is23 ? '4 3' : undefined}
                />
                <text
                  x={x}
                  y={height - padding.bottom + 15}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-xs"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Đường cong xác suất lý thuyết P(n) */}
          <path
            d={theoreticalPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Điểm hiện tại của n */}
          <circle
            cx={currentCoord.x}
            cy={currentCoord.y}
            r="5"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="2"
          />

          {/* Điểm mốc n = 23 (50.7%) */}
          <circle
            cx={padding.left + ((23 - 2) / 98) * plotWidth}
            cy={padding.top + (1 - 0.5073) * plotHeight}
            r="4"
            fill="#d97706"
          />

          {/* Điểm thực nghiệm Monte Carlo */}
          {monteCarloCoord && (
            <circle
              cx={monteCarloCoord.x}
              cy={monteCarloCoord.y}
              r="6"
              fill="#059669"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}

          {/* Nhãn trục */}
          <text
            x={width / 2}
            y={height - 2}
            textAnchor="middle"
            className="fill-slate-600 text-xs font-medium"
          >
            {isEn ? 'Room population (n)' : 'Số người trong phòng (n)'}
          </text>
        </svg>
      </div>
    </div>
  );
};
