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
}

export function TelemetryPanel({
  source,
  target,
  guards,
  showGuards,
  blockedCount,
  totalTargetedRays,
  protectionRate,
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
    <div className="flex flex-col gap-4 rounded-xl border border-slate-300 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <h3 className="font-heading text-[18px] font-bold text-slate-900 tracking-tight">
            Telemetry & Đo Đạc Thực Nghiệm
          </h3>
        </div>
        <span className="font-mono text-xs text-slate-500">
          Thời gian thực • Định lý Gutkin (2005)
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Guard Count Card */}
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Số Vệ Sĩ Kích Hoạt
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-emerald-700">
              {showGuards ? guards.length : 0}
            </span>
            <span className="font-mono text-xs text-slate-400">/ 16 tối đa</span>
          </div>
          <span className="text-xs text-slate-500">
            {guards.length === 16 ? 'Cấu hình tổng quát' : 'Thu gọn do đối xứng'}
          </span>
        </div>

        {/* Protection Rate Card */}
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Tỷ Lệ Chặn Tia Sáng
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-mono text-2xl font-bold ${
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
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
        <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Khoảng Cách Nguồn - Đích
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-slate-800">
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
        className={`flex items-start gap-3 rounded-lg border p-3.5 text-sm ${
          isFullyProtected
            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
            : 'border-amber-200 bg-amber-50/80 text-amber-900'
        }`}
      >
        {isFullyProtected ? (
          <>
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold">Mục tiêu B được bảo vệ tuyệt đối!</p>
              <p className="mt-0.5 text-xs text-emerald-800">
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
              <p className="font-semibold">Cảnh báo: Mục tiêu B đang không có bảo vệ!</p>
              <p className="mt-0.5 text-xs text-amber-800">
                Các tia laser từ nguồn A đang liên tục phản xạ và chiếu trúng mục tiêu B từ nhiều
                góc độ khác nhau. Bấm nút <strong>&quot;Vệ Sĩ Đang Tắt&quot;</strong> ở trên để kích
                hoạt 16 điểm chắn toán học.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Collapsible Coordinates Table */}
      <div className="rounded-lg border border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => setIsCoordsOpen(!isCoordsOpen)}
          className="flex w-full items-center justify-between p-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100/60"
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
          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Tọa độ chuẩn hóa trong phòng đơn vị [0, 1]²:
              </span>
              <button
                type="button"
                onClick={handleCopyCoords}
                className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Đã sao chép!' : 'Sao chép tọa độ'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {guards.map((g, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs"
                >
                  <span className="font-semibold text-emerald-700">G{idx + 1}</span>
                  <span className="text-slate-800">
                    ({g.x.toFixed(4)}, {g.y.toFixed(4)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
