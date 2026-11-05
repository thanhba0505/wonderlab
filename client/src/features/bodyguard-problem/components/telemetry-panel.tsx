'use client';

import React, { useState } from 'react';
import { Point, distanceBetween } from '@/features/bodyguard-problem/bodyguard-math';
import { Shield, ShieldAlert, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface TelemetryPanelProps {
  source: Point;
  target: Point;
  guards: Point[];
  showGuards: boolean;
  blockedCount: number;
  totalTargetedRays: number;
  protectionRate: number;
  hoveredGuardIndex?: number | null;
  onHoverGuard?: (index: number | null) => void;
}

export function TelemetryPanel({
  source,
  target,
  guards,
  showGuards,
  blockedCount,
  totalTargetedRays,
  protectionRate,
  hoveredGuardIndex = null,
  onHoverGuard,
}: TelemetryPanelProps): React.JSX.Element {
  const [isCoordsOpen, setIsCoordsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const distance = distanceBetween(source, target);
  const isFullyProtected = showGuards && guards.length > 0;

  const handleCopyCoords = async () => {
    const text = guards
      .map((g, i) => `G${i + 1}: (${g.x.toFixed(4)}, ${g.y.toFixed(4)})`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <h3 className="font-heading text-[18px] font-bold text-slate-900 tracking-tight">
            Telemetry & Đo Đạc Quang Học Thực Nghiệm
          </h3>
        </div>
        <span className="font-mono text-xs text-slate-500 hidden sm:inline-block">
          Thời gian thực • Định lý Eugene Gutkin (2005)
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Guard Count Card */}
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Số Vệ Sĩ Kích Hoạt
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
              {showGuards ? guards.length : 0}
            </span>
            <span className="font-mono text-xs text-slate-400">/ 16 tối đa</span>
          </div>
          <span className="text-xs text-slate-500">
            {guards.length === 16 ? 'Cấu hình tổng quát' : 'Thu gọn do đối xứng'}
          </span>
        </div>

        {/* Protection Rate Card */}
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Tỷ Lệ Chặn Tia Sáng
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-mono text-2xl font-bold tabular-nums ${
                isFullyProtected ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {protectionRate.toFixed(1)}%
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {blockedCount} / {totalTargetedRays} tia bị triệt tiêu
          </span>
        </div>

        {/* Target State Card */}
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Trạng Thái Mục Tiêu
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            {isFullyProtected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <Shield className="h-3.5 w-3.5" />
                An Toàn 100%
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                <ShieldAlert className="h-3.5 w-3.5" />
                Đang Bị Chiếu Sáng
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            {isFullyProtected ? '0 tia chạm mục tiêu' : 'Mục tiêu bị lộ sáng'}
          </span>
        </div>

        {/* Source & Target Distance Card */}
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Khoảng Cách A → B
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-slate-800 tabular-nums">
              {distance.toFixed(3)}
            </span>
            <span className="font-mono text-xs text-slate-400">đơn vị</span>
          </div>
          <span className="text-xs text-slate-500">
            A({source.x.toFixed(2)}, {source.y.toFixed(2)}) → B({target.x.toFixed(2)},{' '}
            {target.y.toFixed(2)})
          </span>
        </div>
      </div>

      {/* Live Protection Status Banner */}
      <div
        className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
          isFullyProtected
            ? 'border-emerald-200/90 bg-emerald-50/60 text-emerald-950'
            : 'border-amber-200/90 bg-amber-50/60 text-amber-950'
        }`}
      >
        {isFullyProtected ? (
          <>
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">Mục tiêu B được bảo vệ tuyệt đối!</p>
              <p className="mt-0.5 text-xs text-emerald-800/90 leading-relaxed">
                Mọi tia sáng từ nguồn A dù phản xạ 1 hay hàng trăm lần trên 4 bức tường gương đều
                bắt buộc phải đi qua 1 trong {guards.length} điểm vệ sĩ và bị triệt tiêu hoàn toàn
                ngay tại trung điểm hành trình.
              </p>
            </div>
          </>
        ) : (
          <>
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">
                Cảnh báo: Mục tiêu B đang không có bảo vệ!
              </p>
              <p className="mt-0.5 text-xs text-amber-800/90 leading-relaxed">
                Các tia laser từ nguồn A đang liên tục phản xạ và chiếu trúng mục tiêu B từ nhiều
                góc độ khác nhau. Bấm nút <strong>&quot;Vệ Sĩ Đang Tắt&quot;</strong> ở cột điều
                khiển để kích hoạt các điểm chắn toán học.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Collapsible Coordinates Table */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsCoordsOpen(!isCoordsOpen)}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>Bảng Tọa Độ Chi Tiết {guards.length} Điểm Vệ Sĩ (x, y)</span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-slate-700">
              {guards.length} điểm
            </span>
          </span>
          {isCoordsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isCoordsOpen && (
          <div className="border-t border-slate-200/80 p-4 bg-white">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Tọa độ chuẩn hóa trong phòng đơn vị [0, 1]<sup>2</sup> (rê chuột để soi điểm trên
                canvas):
              </span>
              <button
                type="button"
                onClick={handleCopyCoords}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép tọa độ'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {guards.map((g, idx) => {
                const isHovered = hoveredGuardIndex === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => onHoverGuard?.(idx)}
                    onMouseLeave={() => onHoverGuard?.(null)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                      isHovered
                        ? 'border-emerald-500 bg-emerald-50/90 ring-1 ring-emerald-400 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span
                      className={isHovered ? 'text-emerald-800' : 'text-emerald-700 font-semibold'}
                    >
                      G{idx + 1}
                    </span>
                    <span className="tabular-nums">
                      ({g.x.toFixed(4)}, {g.y.toFixed(4)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
