'use client';

import * as React from 'react';
import { Ant, CollisionEvent } from '../ants-math';

interface SpacetimeDiagramProps {
  ants: readonly Ant[];
  stickLength: number;
  currentTime: number;
  maxTime: number;
  collisions: readonly CollisionEvent[];
  isGhostMode: boolean;
  selectedAntId: number | null;
}

export function SpacetimeDiagram({
  ants,
  stickLength,
  currentTime,
  maxTime,
  collisions,
  isGhostMode,
  selectedAntId,
}: SpacetimeDiagramProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = React.useState({ width: 900, height: 280 });

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: Math.max(320, containerRef.current.clientWidth),
          height: 280,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const { width, height } = dimensions;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 30;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    ctx.clearRect(0, 0, width, height);

    // 1. Nền lưới toạ độ kỹ thuật (Engineering Grid)
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(paddingLeft, paddingTop, plotWidth, plotHeight);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Các đường lưới vị trí x (mỗi 20cm)
    for (let x = 0; x <= stickLength; x += 20) {
      const px = paddingLeft + (x / stickLength) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(px, paddingTop);
      ctx.lineTo(px, paddingTop + plotHeight);
      ctx.stroke();

      // Nhãn trục x
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(`${x}cm`, px, paddingTop - 8);
    }

    // Các đường lưới thời gian t (mỗi 25s)
    for (let t = 0; t <= maxTime; t += 25) {
      const py = paddingTop + (t / maxTime) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, py);
      ctx.lineTo(paddingLeft + plotWidth, py);
      ctx.stroke();

      // Nhãn trục t
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(`${t}s`, paddingLeft - 8, py + 3);
    }

    // Viền khung
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(paddingLeft, paddingTop, plotWidth, plotHeight);

    // 2. Vẽ các đường quỹ đạo bóng ma thẳng (Ghost Worldlines)
    for (const ant of ants) {
      const startX = paddingLeft + (ant.initialX / stickLength) * plotWidth;
      const startY = paddingTop;

      // Tính điểm kết thúc của đường thẳng
      const exitTime =
        ant.initialDirection === -1
          ? ant.initialX // do speed = 1
          : stickLength - ant.initialX;

      const endX = ant.initialDirection === -1 ? paddingLeft : paddingLeft + plotWidth;

      const endY = paddingTop + (exitTime / maxTime) * plotHeight;

      ctx.save();
      const isSelected = ant.id === selectedAntId;

      if (isGhostMode) {
        // Trong chế độ Ghost, vẽ đường thẳng đi xuyên nổi bật
        ctx.strokeStyle = ant.color;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      } else {
        // Mờ nhẹ ở nền
        ctx.strokeStyle = ant.color;
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Đánh dấu các giao điểm va chạm đã diễn ra trong quá khứ
    for (const ev of collisions) {
      if (ev.time > currentTime) continue;

      const cx = paddingLeft + (ev.x / stickLength) * plotWidth;
      const cy = paddingTop + (ev.time / maxTime) * plotHeight;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Thanh quét thời gian hiện tại (Time Scrubbing Indicator)
    if (currentTime <= maxTime) {
      const currentY = paddingTop + (currentTime / maxTime) * plotHeight;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, currentY);
      ctx.lineTo(paddingLeft + plotWidth, currentY);
      ctx.stroke();

      // Huy hiệu thời gian t hiện tại bên phải
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`t = ${currentTime.toFixed(1)}s`, paddingLeft + plotWidth + 6, currentY + 3);
    }
  }, [ants, dimensions, stickLength, currentTime, maxTime, collisions, isGhostMode, selectedAntId]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-slate-300/85 bg-white p-3 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <h3 className="font-heading text-sm font-semibold text-slate-800">
            Biểu Đồ Không - Thời Gian (Minkowski Spacetime Grid)
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-600">
          Trục ngang: Vị trí $x$ | Trục dọc: Thời gian $t$
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full select-none"
        style={{ height: `${dimensions.height}px` }}
      />
    </div>
  );
}
