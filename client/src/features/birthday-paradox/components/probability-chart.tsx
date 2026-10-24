'use client';

import React, { useMemo } from 'react';
import { LineChart } from 'lucide-react';
import { calculateTheoreticalProbability, MonteCarloBatchResult } from '../birthday-math';

interface ProbabilityChartProps {
  currentN: number;
  monteCarloResult: MonteCarloBatchResult | null;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  currentN,
  monteCarloResult,
}) => {
  const width = 500;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Tính toán các điểm tọa độ đường cong lý thuyết từ n = 2 đến n = 100
  const theoreticalPath = useMemo(() => {
    const points: string[] = [];
    for (let n = 2; n <= 100; n++) {
      const p = calculateTheoreticalProbability(n);
      const x = padding.left + ((n - 2) / 98) * plotWidth;
      const y = padding.top + (1 - p) * plotHeight;
      points.push(`${n === 2 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, [padding.left, padding.top, plotWidth, plotHeight]);

  // Tọa độ điểm hiện tại n trên đường cong
  const currentCoord = useMemo(() => {
    const p = calculateTheoreticalProbability(currentN);
    const clampedN = Math.max(2, Math.min(100, currentN));
    const x = padding.left + ((clampedN - 2) / 98) * plotWidth;
    const y = padding.top + (1 - p) * plotHeight;
    return { x, y, p };
  }, [currentN, padding.left, padding.top, plotWidth, plotHeight]);

  // Tọa độ điểm thực nghiệm Monte Carlo nếu có
  const monteCarloCoord = useMemo(() => {
    if (!monteCarloResult) return null;
    const clampedN = Math.max(2, Math.min(100, currentN));
    const x = padding.left + ((clampedN - 2) / 98) * plotWidth;
    const y = padding.top + (1 - monteCarloResult.empiricalRate) * plotHeight;
    return { x, y, p: monteCarloResult.empiricalRate };
  }, [monteCarloResult, currentN, padding.left, padding.top, plotWidth, plotHeight]);

  // Tọa độ điểm mốc 23 người (50%)
  const milestone23Coord = useMemo(() => {
    const x = padding.left + ((23 - 2) / 98) * plotWidth;
    const y = padding.top + 0.5 * plotHeight;
    return { x, y };
  }, [padding.left, padding.top, plotWidth, plotHeight]);

  return (
    <div className="flex flex-col gap-3">
      {/* Title duy nhất, không kẻ line ngay dưới title */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
            Đồ thị Xác suất Lý thuyết vs Thực nghiệm
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>Lý thuyết: {(currentCoord.p * 100).toFixed(1)}%</span>
          </span>
          {monteCarloCoord && (
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Thực nghiệm: {(monteCarloCoord.p * 100).toFixed(1)}%</span>
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
              <g key={`y-grid-${level}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke={is50Percent ? '#f59e0b' : '#e2e8f0'}
                  strokeWidth={is50Percent ? '1.5' : '1'}
                  strokeDasharray={is50Percent ? '4 3' : undefined}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className={`font-mono text-[10px] ${
                    is50Percent ? 'fill-amber-600 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {(level * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Lưới tọa độ dọc (n = 20, 23, 40, 60, 80, 100) */}
          {[20, 40, 60, 80, 100].map(nVal => {
            const x = padding.left + ((nVal - 2) / 98) * plotWidth;
            return (
              <g key={`x-grid-${nVal}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + plotHeight + 16}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {nVal}
                </text>
              </g>
            );
          })}

          {/* Trục X nhãn n = 23 (vạch đặc biệt) */}
          <line
            x1={milestone23Coord.x}
            y1={padding.top}
            x2={milestone23Coord.x}
            y2={padding.top + plotHeight}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text
            x={milestone23Coord.x}
            y={padding.top + plotHeight + 16}
            textAnchor="middle"
            className="fill-amber-700 font-mono text-[10px] font-bold"
          >
            23★
          </text>

          {/* Đường cong xác suất lý thuyết */}
          <path
            d={theoreticalPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Chỉ báo n hiện tại (đường dóng dọc) */}
          <line
            x1={currentCoord.x}
            y1={padding.top}
            x2={currentCoord.x}
            y2={padding.top + plotHeight}
            stroke="#3b82f6"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Điểm hiện tại trên đường cong lý thuyết */}
          <circle
            cx={currentCoord.x}
            cy={currentCoord.y}
            r="5"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="2"
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
            className="fill-slate-600 text-[10px] font-medium"
          >
            Số người trong phòng (n)
          </text>
        </svg>
      </div>
    </div>
  );
};
