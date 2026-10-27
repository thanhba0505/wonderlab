'use client';

import React, { useRef, useEffect } from 'react';
import { Point } from '@/features/bodyguard-problem/bodyguard-math';

interface UnfoldingCanvasProps {
  source: Point;
  target: Point;
  guards: Point[];
  showGuards: boolean;
  className?: string;
}

const GRID_EXTENT = 2; // Lattice grid runs from -2 to +2 in x and y (5x5 = 25 rooms)
const TOTAL_CELLS = GRID_EXTENT * 2 + 1; // 5 cells wide & high

/**
 * Computes exact coordinate of target image B' in unfolded tile (u, w).
 * Tile u covers [u, u+1].
 * Even u: normal orientation -> u + x_B
 * Odd u: mirrored orientation -> (u + 1) - x_B
 */
function getUnfoldedTargetImage(target: Point, u: number, w: number): Point {
  const isOddU = ((u % 2) + 2) % 2 === 1;
  const isOddW = ((w % 2) + 2) % 2 === 1;
  return {
    x: isOddU ? u + 1 - target.x : u + target.x,
    y: isOddW ? w + 1 - target.y : w + target.y,
  };
}

export function UnfoldingCanvas({
  source,
  target,
  guards,
  showGuards,
  className = '',
}: UnfoldingCanvasProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High-DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = 24;
    const availSize = Math.min(width, height) - padding * 2;
    const cellSize = Math.max(30, availSize / TOTAL_CELLS);
    const gridOriginX = (width - cellSize * TOTAL_CELLS) / 2;
    const gridOriginY = (height - cellSize * TOTAL_CELLS) / 2;

    // Helper: convert unfolded continuous coord (x, y) with -GRID_EXTENT <= x <= GRID_EXTENT + 1
    const toCanvasPxX = (x: number): number => {
      return gridOriginX + (x + GRID_EXTENT) * cellSize;
    };
    const toCanvasPxY = (y: number): number => {
      return gridOriginY + (y + GRID_EXTENT) * cellSize;
    };

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw 5x5 Lattice Tiles with alternating parity shading
    for (let u = -GRID_EXTENT; u <= GRID_EXTENT; u++) {
      for (let w = -GRID_EXTENT; w <= GRID_EXTENT; w++) {
        const cellX = toCanvasPxX(u);
        const cellY = toCanvasPxY(w);

        const isOddU = ((u % 2) + 2) % 2 === 1;
        const isOddW = ((w % 2) + 2) % 2 === 1;
        const isFlipped = isOddU !== isOddW;

        // Background color
        if (u === 0 && w === 0) {
          ctx.fillStyle = '#f8fafc'; // Real room is crisp
        } else {
          ctx.fillStyle = isFlipped ? '#f1f5f9' : '#ffffff';
        }
        ctx.fillRect(cellX, cellY, cellSize, cellSize);

        // Tile border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(cellX, cellY, cellSize, cellSize);

        // Tile coordinate label in corner
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`(${u},${w})`, cellX + 3, cellY + 3);
      }
    }

    // 2. Bold border for the Central Real Room (0, 0)
    const realRoomX = toCanvasPxX(0);
    const realRoomY = toCanvasPxY(0);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(realRoomX, realRoomY, cellSize, cellSize);

    // "Phòng Thực" badge on real room
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Phòng Thực (0, 0)', realRoomX + cellSize / 2, realRoomY - 4);

    // 3. Draw straight ray lines from source A to all virtual images B'
    const srcX = toCanvasPxX(source.x);
    const srcY = toCanvasPxY(source.y);

    for (let u = -GRID_EXTENT; u <= GRID_EXTENT; u++) {
      for (let w = -GRID_EXTENT; w <= GRID_EXTENT; w++) {
        const img = getUnfoldedTargetImage(target, u, w);
        const imgX = toCanvasPxX(img.x);
        const imgY = toCanvasPxY(img.y);

        // Draw straight ray
        ctx.strokeStyle = showGuards ? 'rgba(239, 68, 68, 0.35)' : 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.lineTo(imgX, imgY);
        ctx.stroke();

        // 4. Draw Midpoint M on the straight ray
        if (showGuards) {
          const midX = (srcX + imgX) / 2;
          const midY = (srcY + imgY) / 2;

          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(midX, midY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 5. Draw all Virtual Images of B across the lattice
    for (let u = -GRID_EXTENT; u <= GRID_EXTENT; u++) {
      for (let w = -GRID_EXTENT; w <= GRID_EXTENT; w++) {
        const img = getUnfoldedTargetImage(target, u, w);
        const imgX = toCanvasPxX(img.x);
        const imgY = toCanvasPxY(img.y);

        const isReal = u === 0 && w === 0;

        if (isReal) {
          ctx.fillStyle = '#0891b2';
          ctx.beginPath();
          ctx.arc(imgX, imgY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#0891b2';
          ctx.font = 'bold 12px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('B', imgX, imgY + 8);
        } else {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.beginPath();
          ctx.arc(imgX, imgY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 6. Draw Guard Points in the Central Room for visual reference
    if (showGuards) {
      guards.forEach(g => {
        const gx = toCanvasPxX(g.x);
        const gy = toCanvasPxY(g.y);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 7. Draw Source Point A in the Central Real Room
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(srcX, srcY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('A', srcX, srcY + 8);
  }, [source, target, guards, showGuards]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white p-2 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] ${className}`}
    >
      <canvas ref={canvasRef} className="h-[420px] w-full max-w-[500px] rounded-lg" />
      <div className="mt-1 flex w-full items-center justify-between px-2 text-xs font-mono text-slate-500">
        <span>Lưới 5×5 trải phẳng (Unfolding Lattice)</span>
        <span>Chấm xanh lá: Trung điểm bảo vệ</span>
      </div>
    </div>
  );
}
