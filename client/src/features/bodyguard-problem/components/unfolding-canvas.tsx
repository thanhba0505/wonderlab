'use client';

import React, { useRef, useEffect } from 'react';
import { Point } from '@/features/bodyguard-problem/bodyguard-math';

interface UnfoldingCanvasProps {
  source: Point;
  target: Point;
  guards: Point[];
}

const CANVAS_SIZE = 360;
const CELL_PX = 120; // 3×3 grid × 120px = 360px
const GRID_HALF = 1; // show cells from -1 to +1 (index 0..2)

// Maps a unit-square coordinate to canvas pixels for a given grid cell (ox, oy)
// where ox, oy ∈ {-1, 0, 1}
function cellToPixel(
  unitX: number,
  unitY: number,
  ox: number,
  oy: number,
): { x: number; y: number } {
  // Origin cell (0,0) maps to offset (CELL_PX, CELL_PX) on canvas
  const originOffsetX = GRID_HALF * CELL_PX;
  const originOffsetY = GRID_HALF * CELL_PX;
  return {
    x: originOffsetX + ox * CELL_PX + unitX * CELL_PX,
    y: originOffsetY + oy * CELL_PX + unitY * CELL_PX,
  };
}

// Virtual image of target for a given sign and parity offset
function virtualImage(target: Point, sx: number, sy: number, ox: number, oy: number): Point {
  return {
    x: sx * target.x + ox * 2,
    y: sy * target.y + oy * 2,
  };
}

// Convert an extended-plane point (in the unfolded space) to canvas pixel
// The unfolded space has origin at unit-square origin; canvas origin at (0,0) representing
// the top-left of the 3×3 grid (i.e., cell (-1,-1)).
function extendedToPixel(ex: number, ey: number): { x: number; y: number } {
  return {
    x: (GRID_HALF + ex) * CELL_PX,
    y: (GRID_HALF + ey) * CELL_PX,
  };
}

export function UnfoldingCanvas({
  source,
  target,
  guards,
}: UnfoldingCanvasProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const signs: number[] = [-1, 1];

    // Draw 3×3 grid of reflected cells
    for (let ox = -GRID_HALF; ox <= GRID_HALF; ox++) {
      for (let oy = -GRID_HALF; oy <= GRID_HALF; oy++) {
        const px = (GRID_HALF + ox) * CELL_PX;
        const py = (GRID_HALF + oy) * CELL_PX;

        // Alternating parity shading
        const isFlippedX = Math.abs(ox) % 2 === 1;
        const isFlippedY = Math.abs(oy) % 2 === 1;
        const isReflected = isFlippedX !== isFlippedY;
        ctx.fillStyle = isReflected ? '#f1f5f9' : '#ffffff';
        ctx.fillRect(px, py, CELL_PX, CELL_PX);

        // Cell border
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, CELL_PX, CELL_PX);
      }
    }

    // Highlight the origin (real) cell
    const originPx = GRID_HALF * CELL_PX;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(originPx, originPx, CELL_PX, CELL_PX);

    // Draw straight lines from source to each virtual image of target (within the 3x3 grid)
    const srcExt = extendedToPixel(source.x, source.y);
    for (const sx of signs) {
      for (const sy of signs) {
        for (let ox = -2; ox <= 2; ox++) {
          for (let oy = -2; oy <= 2; oy++) {
            const img = virtualImage(target, sx, sy, ox, oy);
            // Only draw if image falls within visible canvas range
            if (
              img.x < -GRID_HALF - 1 ||
              img.x > GRID_HALF + 2 ||
              img.y < -GRID_HALF - 1 ||
              img.y > GRID_HALF + 2
            )
              continue;
            const imgPx = extendedToPixel(img.x, img.y);
            ctx.strokeStyle = 'rgba(6,182,212,0.25)'; // cyan translucent
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(srcExt.x, srcExt.y);
            ctx.lineTo(imgPx.x, imgPx.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw virtual target images
    for (const sx of signs) {
      for (const sy of signs) {
        for (let ox = -GRID_HALF; ox <= GRID_HALF; ox++) {
          for (let oy = -GRID_HALF; oy <= GRID_HALF; oy++) {
            const img = virtualImage(target, sx, sy, ox, oy);
            const imgPx = extendedToPixel(img.x, img.y);
            // Skip if outside canvas
            if (imgPx.x < 0 || imgPx.x > CANVAS_SIZE || imgPx.y < 0 || imgPx.y > CANVAS_SIZE)
              continue;
            const isReal = sx === 1 && sy === 1 && ox === 0 && oy === 0;
            ctx.fillStyle = isReal ? '#06b6d4' : 'rgba(6,182,212,0.55)';
            ctx.beginPath();
            ctx.arc(imgPx.x, imgPx.y, isReal ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Draw guard points in the origin cell
    guards.forEach(g => {
      const gPx = cellToPixel(g.x, g.y, 0, 0);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(gPx.x, gPx.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw source point (amber, on top)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(srcExt.x, srcExt.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', srcExt.x, srcExt.y - 12);

    const realTgtPx = extendedToPixel(target.x, target.y);
    ctx.fillStyle = '#0e7490';
    ctx.fillText('B', realTgtPx.x, realTgtPx.y - 10);
  }, [source, target, guards]);

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full rounded-lg"
      />
    </div>
  );
}
