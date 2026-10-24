'use client';

import * as React from 'react';
import { LineChart, BarChart2, Info } from 'lucide-react';
import { QuantumParameters, generateIntensityProfile, wavelengthToRgb } from '../quantum-math';

interface IntensityChartProps {
  params: QuantumParameters;
  hits: number[]; // Array of y coordinates in meters
}

export function IntensityChart({ params, hits }: IntensityChartProps) {
  const yRangeMeters = 0.04; // ±40mm
  const profilePoints = React.useMemo(() => {
    return generateIntensityProfile(params, 120, yRangeMeters);
  }, [params, yRangeMeters]);

  const color = wavelengthToRgb(params.wavelength * 1e9);

  // Compute Empirical Histogram (50 bins)
  const binCount = 50;
  const bins = React.useMemo(() => {
    const counts = new Int32Array(binCount);
    let max = 1;
    for (let i = 0; i < hits.length; i++) {
      const norm = (hits[i] / yRangeMeters + 1) / 2; // [0, 1]
      const idx = Math.floor(norm * binCount);
      if (idx >= 0 && idx < binCount) {
        counts[idx]++;
        if (counts[idx] > max) max = counts[idx];
      }
    }
    return { counts, max };
  }, [hits, yRangeMeters, binCount]);

  // SVG Chart Dimensions
  const svgWidth = 760;
  const svgHeight = 160;
  const paddingX = 30;
  const paddingY = 20;
  const plotW = svgWidth - paddingX * 2;
  const plotH = svgHeight - paddingY * 2;

  // Generate SVG Path for theoretical intensity curve
  const pathD = React.useMemo(() => {
    if (profilePoints.length === 0) return '';
    return profilePoints
      .map((pt, idx) => {
        const x = paddingX + (idx / (profilePoints.length - 1)) * plotW;
        const y = paddingY + (1 - pt.intensity) * plotH;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [profilePoints, plotW, plotH, paddingX, paddingY]);

  return (
    <div className="rounded-2xl border border-slate-300/85 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <LineChart className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-slate-900">
              Phân bố Cường độ Quang học: Lý thuyết vs Thực nghiệm
            </h4>
            <p className="text-xs text-slate-500 font-sans">
              Đường nét liền: Hàm sóng lý thuyết • Các cột mờ: Tần suất va chạm thực tế của{' '}
              {hits.length.toLocaleString('vi-VN')} hạt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span
              className="inline-block h-2.5 w-6 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>Đường cong lý thuyết I(y)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Mật độ thực tế</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Frame */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-[160px] block"
          preserveAspectRatio="none"
        >
          {/* Subtle Grid Lines */}
          <line
            x1={paddingX}
            y1={paddingY + plotH / 2}
            x2={svgWidth - paddingX}
            y2={paddingY + plotH / 2}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX + plotW / 2}
            y1={paddingY}
            x2={paddingX + plotW / 2}
            y2={paddingY + plotH}
            stroke="#334155"
            strokeDasharray="2 2"
          />

          {/* Empirical Histogram Bars */}
          {hits.length > 0 &&
            Array.from({ length: binCount }).map((_, i) => {
              const binW = plotW / binCount;
              const x = paddingX + i * binW;
              const barH = (bins.counts[i] / bins.max) * plotH;
              const y = paddingY + plotH - barH;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={Math.max(1, binW - 1)}
                  height={barH}
                  fill={color}
                  opacity={0.35}
                />
              );
            })}

          {/* Theoretical Curve Path */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Axis Labels */}
        <div className="flex justify-between px-6 pt-1 text-xs font-mono text-slate-400">
          <span>-40 mm</span>
          <span>-20 mm</span>
          <span className="text-slate-200 font-bold">y = 0 (Tâm trục)</span>
          <span>+20 mm</span>
          <span>+40 mm</span>
        </div>
      </div>

      {/* Insight notice */}
      <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <div className="leading-relaxed">
          {params.isObserverActive ? (
            <span>
              <strong>Hàm sóng đã sụp đổ:</strong> Khi máy đo lường hoạt động, biểu đồ không còn các
              vân giao thoa triệt tiêu về 0, mà trở thành tổng hợp của 2 phân bố xác suất cổ điển
              tương ứng với 2 vị trí khe.
            </span>
          ) : (
            <span>
              <strong>Hiệu ứng giao thoa lượng tử:</strong> Ngay cả khi bắn từng hạt photon đơn lẻ
              cách nhau thời gian dài, các điểm va chạm vẫn tự động gom lại thành các đỉnh giao thoa
              sáng và để lại những khoảng tối hoàn hảo (nơi xác suất triệt tiêu bằng 0).
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
