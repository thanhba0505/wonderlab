'use client';

import * as React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Ant, TheoreticalBounds } from '../ants-math';

interface TelemetryPanelProps {
  currentTime: number;
  maxTime: number;
  ants: readonly Ant[];
  totalCollisions: number;
  bounds: TheoreticalBounds;
  selectedAntId: number | null;
  onClearSelectedAnt: () => void;
}

export function TelemetryPanel({
  currentTime,
  maxTime,
  ants,
  totalCollisions,
  bounds,
  selectedAntId,
  onClearSelectedAnt,
}: TelemetryPanelProps) {
  const activeCount = ants.filter(a => !a.isFallen).length;
  const fallenLeft = ants.filter(a => a.exitSide === 'left').length;
  const fallenRight = ants.filter(a => a.exitSide === 'right').length;

  const selectedAnt = selectedAntId !== null ? ants.find(a => a.id === selectedAntId) : null;
  const timeProgress = Math.min(100, (currentTime / maxTime) * 100);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-300/85 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]">
      {/* 1. Header: Đồng hồ đo thời gian & Tiến trình T_max */}
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Thời Gian Trôi Qua (Elapsed Time)</span>
          </div>

          <div className="font-mono text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {currentTime.toFixed(2)}
            <span className="text-xs font-normal text-slate-600 ml-1">giây</span>
          </div>
        </div>

        {/* Thanh tiến trình giới hạn T_max = 100s */}
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all duration-100 ${
                currentTime > bounds.theoreticalCompletionTime ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${timeProgress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-mono text-slate-600">
            <span>t = 0.0s</span>
            <span>
              Lý thuyết kết thúc:{' '}
              <strong className="text-slate-800">
                {bounds.theoreticalCompletionTime.toFixed(1)}s
              </strong>
            </span>
            <span>Cận tối đa: 100.0s</span>
          </div>
        </div>
      </div>

      {/* 2. Lưới 4 chỉ số khoa học thời gian thực */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {/* Số kiến còn lại */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
          <div className="text-xs font-mono text-slate-600">Kiến còn lại</div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
            {activeCount}{' '}
            <span className="text-xs font-normal text-slate-600">/ {ants.length}</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-600">Đã rơi: {ants.length - activeCount}</div>
        </div>

        {/* Thoát bên trái */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
          <div className="text-xs font-mono text-slate-600">Rơi sang trái</div>
          <div className="mt-1 font-mono text-lg font-bold text-blue-600 tabular-nums">
            {fallenLeft}
            <span className="text-xs font-normal text-slate-600">
              {' '}
              / {bounds.expectedLeftExits}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-slate-600">
            {fallenLeft === bounds.expectedLeftExits
              ? '✓ Trùng khớp lý thuyết'
              : 'Đang di chuyển...'}
          </div>
        </div>

        {/* Thoát bên phải */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
          <div className="text-xs font-mono text-slate-600">Rơi sang phải</div>
          <div className="mt-1 font-mono text-lg font-bold text-purple-600 tabular-nums">
            {fallenRight}
            <span className="text-xs font-normal text-slate-600">
              {' '}
              / {bounds.expectedRightExits}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-slate-600">
            {fallenRight === bounds.expectedRightExits
              ? '✓ Trùng khớp lý thuyết'
              : 'Đang di chuyển...'}
          </div>
        </div>

        {/* Tổng số va chạm */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
          <div className="text-xs font-mono text-slate-600">Tổng va chạm</div>
          <div className="mt-1 font-mono text-lg font-bold text-amber-600 tabular-nums">
            {totalCollisions}
          </div>
          <div className="mt-0.5 text-xs text-slate-600">Tối đa: ~{bounds.totalIntersections}</div>
        </div>
      </div>

      {/* 3. Bảng soi chi tiết cá thể kiến đang được chọn (Selected Ant Inspector) */}
      {selectedAnt ? (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedAnt.color }}
              />
              <span className="font-heading text-xs font-bold text-slate-900">
                Đang theo dấu cá thể: #{selectedAnt.id}
              </span>
            </div>

            <button
              type="button"
              onClick={onClearSelectedAnt}
              className="text-xs font-mono text-amber-700 hover:underline"
            >
              Bỏ theo dấu
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono sm:grid-cols-4">
            <div>
              <span className="text-slate-600">Vị trí hiện tại:</span>{' '}
              <strong className="text-slate-800">{selectedAnt.x.toFixed(2)} cm</strong>
            </div>
            <div>
              <span className="text-slate-600">Vị trí ban đầu:</span>{' '}
              <strong className="text-slate-800">{selectedAnt.initialX.toFixed(2)} cm</strong>
            </div>
            <div>
              <span className="text-slate-600">Hướng di chuyển:</span>{' '}
              <strong className="text-slate-800">
                {selectedAnt.direction === 1 ? 'Sang Phải (→)' : 'Sang Trái (←)'}
              </strong>
            </div>
            <div>
              <span className="text-slate-600">Số lần va chạm:</span>{' '}
              <strong className="text-amber-800">{selectedAnt.collisionCount} lần</strong>
            </div>
          </div>

          <div className="text-xs text-slate-700">
            {selectedAnt.isFallen ? (
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã rơi khỏi mép {selectedAnt.exitSide === 'left' ? 'trái' : 'phải'} tại thời điểm{' '}
                {selectedAnt.exitTime?.toFixed(2)}s.
              </span>
            ) : (
              <span>
                Đang di chuyển trên thước với vận tốc 1.0 cm/s. Nhờ định lý bảo toàn thứ tự, chú
                kiến này sẽ không bao giờ vượt qua các con kiến có số thứ tự khác.
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/40 p-2 text-center text-xs text-slate-600">
          💡 Click vào bất kỳ con kiến nào trên thanh gỗ để xem chi tiết hành trình và số lần va
          chạm của riêng cá thể đó.
        </div>
      )}
    </div>
  );
}
