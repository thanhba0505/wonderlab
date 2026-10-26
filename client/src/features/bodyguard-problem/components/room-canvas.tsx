'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Point } from '@/features/bodyguard-problem/bodyguard-math';

interface RoomCanvasProps {
  source: Point;
  target: Point;
  guards: Point[];
  maxBounces: number;
  onSourceMove: (p: Point) => void;
  onTargetMove: (p: Point) => void;
}

const CANVAS_SIZE = 400;
const EPS = 1e-8;
const HIT_RADIUS_PX = 8; // pixels for drag hit test
const RAY_RADIUS = 0.012; // unit-space hit radius for rays

function toPixel(v: number): number {
  return v * CANVAS_SIZE;
}

function toUnit(px: number): number {
  return Math.min(1, Math.max(0, px / CANVAS_SIZE));
}

function drawLabeledCircle(
  ctx: CanvasRenderingContext2D,
  pt: Point,
  color: string,
  label: string,
  radius: number,
): void {
  const px = toPixel(pt.x);
  const py = toPixel(pt.y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, px, py - radius - 7);
}

function traceRaySegments(
  source: Point,
  dx: number,
  dy: number,
  guards: Point[],
  target: Point,
  maxBounces: number,
): {
  segments: { x1: number; y1: number; x2: number; y2: number }[];
  hitTarget: boolean;
  blocked: boolean;
} {
  const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
  let x = source.x;
  let y = source.y;
  let cdx = dx;
  let cdy = dy;
  let hitTarget = false;
  let blocked = false;

  for (let bounce = 0; bounce <= maxBounces; bounce++) {
    // Check if current pos near target
    if (Math.hypot(x - target.x, y - target.y) < RAY_RADIUS) {
      hitTarget = true;
      break;
    }
    // Check guard interception at current pos
    if (guards.some(g => Math.hypot(x - g.x, y - g.y) < RAY_RADIUS)) {
      blocked = true;
      break;
    }

    const tX = cdx > 0 ? (1 - x) / cdx : cdx < 0 ? -x / cdx : Infinity;
    const tY = cdy > 0 ? (1 - y) / cdy : cdy < 0 ? -y / cdy : Infinity;
    const t = Math.min(tX, tY);
    const nx = x + cdx * t;
    const ny = y + cdy * t;

    segments.push({ x1: x, y1: y, x2: nx, y2: ny });

    if (Math.abs(t - tX) < EPS) cdx = -cdx;
    if (Math.abs(t - tY) < EPS) cdy = -cdy;
    x = nx;
    y = ny;

    // Check after moving to wall if near target or guard
    if (Math.hypot(x - target.x, y - target.y) < RAY_RADIUS) {
      hitTarget = true;
      break;
    }
    if (guards.some(g => Math.hypot(x - g.x, y - g.y) < RAY_RADIUS)) {
      blocked = true;
      break;
    }
  }

  return { segments, hitTarget, blocked };
}

export function RoomCanvas({
  source,
  target,
  guards,
  maxBounces,
  onSourceMove,
  onTargetMove,
}: RoomCanvasProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<'source' | 'target' | null>(null);

  // Drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Wall mirror indicators - small tick marks on each wall
    const wallColor = '#94a3b8';
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS_SIZE - 2, CANVAS_SIZE - 2);

    // Mirror hatch marks on walls
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    const hatchCount = 10;
    for (let i = 0; i < hatchCount; i++) {
      const pos = (i + 0.5) * (CANVAS_SIZE / hatchCount);
      const hLen = 6;
      // Top wall
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos - hLen / 2, hLen);
      ctx.stroke();
      // Bottom wall
      ctx.beginPath();
      ctx.moveTo(pos, CANVAS_SIZE);
      ctx.lineTo(pos - hLen / 2, CANVAS_SIZE - hLen);
      ctx.stroke();
      // Left wall
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(hLen, pos - hLen / 2);
      ctx.stroke();
      // Right wall
      ctx.beginPath();
      ctx.moveTo(CANVAS_SIZE, pos);
      ctx.lineTo(CANVAS_SIZE - hLen, pos - hLen / 2);
      ctx.stroke();
    }

    // Draw rays
    const rayCount = 36;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i * 2 * Math.PI) / rayCount;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const { segments, hitTarget, blocked } = traceRaySegments(
        source,
        dx,
        dy,
        guards,
        target,
        maxBounces,
      );

      let rayColor: string;
      if (hitTarget) {
        rayColor = '#06b6d4'; // cyan
      } else if (blocked) {
        rayColor = '#ef4444'; // red
      } else {
        rayColor = '#cbd5e1'; // slate-300
      }

      ctx.strokeStyle = rayColor;
      ctx.lineWidth = hitTarget ? 1.5 : 0.8;
      ctx.globalAlpha = hitTarget ? 0.85 : 0.5;
      ctx.beginPath();
      for (const seg of segments) {
        ctx.moveTo(toPixel(seg.x1), toPixel(seg.y1));
        ctx.lineTo(toPixel(seg.x2), toPixel(seg.y2));
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw guards
    guards.forEach((g, idx) => {
      drawLabeledCircle(ctx, g, '#10b981', `G${idx + 1}`, 5);
    });

    // Draw source (amber) and target (cyan) on top
    drawLabeledCircle(ctx, source, '#f59e0b', 'A', 7);
    drawLabeledCircle(ctx, target, '#06b6d4', 'B', 7);
  }, [source, target, guards, maxBounces]);

  const getCanvasPoint = useCallback((e: MouseEvent | React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    return { x: toUnit(canvasX), y: toUnit(canvasY) };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pt = getCanvasPoint(e);
      const pxX = toPixel(pt.x);
      const pxY = toPixel(pt.y);
      const srcX = toPixel(source.x);
      const srcY = toPixel(source.y);
      const tgtX = toPixel(target.x);
      const tgtY = toPixel(target.y);

      if (Math.hypot(pxX - srcX, pxY - srcY) < HIT_RADIUS_PX + 4) {
        dragging.current = 'source';
      } else if (Math.hypot(pxX - tgtX, pxY - tgtY) < HIT_RADIUS_PX + 4) {
        dragging.current = 'target';
      }
    },
    [source, target, getCanvasPoint],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (!dragging.current) return;
      const pt = getCanvasPoint(e);
      if (dragging.current === 'source') onSourceMove(pt);
      else onTargetMove(pt);
    };
    const handleMouseUp = (): void => {
      dragging.current = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [getCanvasPoint, onSourceMove, onTargetMove]);

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full cursor-crosshair rounded-lg"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
