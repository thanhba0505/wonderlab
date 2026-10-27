'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Point,
  RayTraceResult,
  distanceBetween,
} from '@/features/bodyguard-problem/bodyguard-math';

interface RoomCanvasProps {
  source: Point;
  target: Point;
  guards: Point[];
  rays: RayTraceResult[];
  showGuards: boolean;
  onSourceMove: (p: Point) => void;
  onTargetMove: (p: Point) => void;
  className?: string;
}

const HIT_RADIUS = 0.04; // Hit test radius in unit coordinates for dragging
const PADDING = 28; // Padding around the room in canvas pixels

export function RoomCanvas({
  source,
  target,
  guards,
  rays,
  showGuards,
  onSourceMove,
  onTargetMove,
  className = '',
}: RoomCanvasProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeDrag, setActiveDrag] = useState<'source' | 'target' | null>(null);
  const [hoveredNode, setHoveredNode] = useState<'source' | 'target' | null>(null);

  // Convert unit [0, 1] to canvas pixel coords
  const toCanvasPx = useCallback((val: number, roomSize: number, offset: number): number => {
    return offset + val * roomSize;
  }, []);

  // Convert canvas pixel coords to unit [0, 1]
  const toUnitCoord = useCallback((px: number, roomSize: number, offset: number): number => {
    return Math.min(0.98, Math.max(0.02, (px - offset) / roomSize));
  }, []);

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

    // Compute room square dimensions inside canvas
    const availSize = Math.min(width, height) - PADDING * 2;
    const roomSize = Math.max(100, availSize);
    const offsetX = (width - roomSize) / 2;
    const offsetY = (height - roomSize) / 2;

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle technical grid inside room
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridDivisions = 4;
    for (let i = 1; i < gridDivisions; i++) {
      const gx = offsetX + (i / gridDivisions) * roomSize;
      const gy = offsetY + (i / gridDivisions) * roomSize;
      ctx.beginPath();
      ctx.moveTo(gx, offsetY);
      ctx.lineTo(gx, offsetY + roomSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offsetX, gy);
      ctx.lineTo(offsetX + roomSize, gy);
      ctx.stroke();
    }

    // Mirror Wall Backing Glow
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 8;
    ctx.strokeRect(offsetX, offsetY, roomSize, roomSize);

    // Main Mirror Walls (Hairline border)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, roomSize, roomSize);

    // Draw optical mirror hatch marks (slanted lines behind the wall)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    const hatchCount = 12;
    const hatchLen = 6;
    for (let i = 0; i <= hatchCount; i++) {
      const frac = i / hatchCount;
      const pos = frac * roomSize;

      // Top wall hatches
      ctx.beginPath();
      ctx.moveTo(offsetX + pos, offsetY);
      ctx.lineTo(offsetX + pos - hatchLen, offsetY - hatchLen);
      ctx.stroke();

      // Bottom wall hatches
      ctx.beginPath();
      ctx.moveTo(offsetX + pos, offsetY + roomSize);
      ctx.lineTo(offsetX + pos + hatchLen, offsetY + roomSize + hatchLen);
      ctx.stroke();

      // Left wall hatches
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + pos);
      ctx.lineTo(offsetX - hatchLen, offsetY + pos + hatchLen);
      ctx.stroke();

      // Right wall hatches
      ctx.beginPath();
      ctx.moveTo(offsetX + roomSize, offsetY + pos);
      ctx.lineTo(offsetX + roomSize + hatchLen, offsetY + pos - hatchLen);
      ctx.stroke();
    }

    // Wall coordinate labels (0, 1)
    ctx.fillStyle = '#64748b';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('(0, 1)', offsetX, offsetY - 8);
    ctx.fillText('(1, 1)', offsetX + roomSize, offsetY - 8);
    ctx.textBaseline = 'top';
    ctx.fillText('(0, 0)', offsetX, offsetY + roomSize + 8);
    ctx.fillText('(1, 0)', offsetX + roomSize, offsetY + roomSize + 8);

    // 1. Draw light rays
    for (const ray of rays) {
      if (ray.segments.length === 0) continue;

      let strokeStyle = '#94a3b8'; // Default bouncing ray
      let lineWidth = 1;

      if (ray.blockedByGuard) {
        strokeStyle = 'rgba(239, 68, 68, 0.75)'; // Red for intercepted ray
        lineWidth = 1.4;
      } else if (ray.hitTarget) {
        strokeStyle = 'rgba(6, 182, 212, 0.9)'; // Cyan for target hit
        lineWidth = 1.8;
      }

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      const first = ray.segments[0];
      if (first) {
        ctx.moveTo(
          toCanvasPx(first.x1, roomSize, offsetX),
          toCanvasPx(first.y1, roomSize, offsetY),
        );

        for (const seg of ray.segments) {
          ctx.lineTo(toCanvasPx(seg.x2, roomSize, offsetX), toCanvasPx(seg.y2, roomSize, offsetY));
        }
        ctx.stroke();
      }

      // If blocked by guard, draw impact marker
      if (ray.blockedByGuard && ray.blockedGuardPoint) {
        const gx = toCanvasPx(ray.blockedGuardPoint.x, roomSize, offsetX);
        const gy = toCanvasPx(ray.blockedGuardPoint.y, roomSize, offsetY);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(gx, gy, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Draw Bodyguards (Emerald points)
    if (showGuards) {
      guards.forEach((g, idx) => {
        const gx = toCanvasPx(g.x, roomSize, offsetX);
        const gy = toCanvasPx(g.y, roomSize, offsetY);

        // Guard aura ring
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.beginPath();
        ctx.arc(gx, gy, 9, 0, Math.PI * 2);
        ctx.fill();

        // Guard core
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(gx, gy, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner white dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Minimal guard label
        ctx.fillStyle = '#065f46';
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`G${idx + 1}`, gx, gy + 7);
      });
    }

    // 3. Draw Target Point B (Cyan)
    const bx = toCanvasPx(target.x, roomSize, offsetX);
    const by = toCanvasPx(target.y, roomSize, offsetY);

    // Outer glow for target
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fill();

    // Main circle
    ctx.fillStyle = '#0891b2';
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Target label
    ctx.fillStyle = '#0e7490';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Mục tiêu B (${target.x.toFixed(2)}, ${target.y.toFixed(2)})`, bx, by - 12);

    // 4. Draw Source Point A (Amber)
    const ax = toCanvasPx(source.x, roomSize, offsetX);
    const ay = toCanvasPx(source.y, roomSize, offsetY);

    // Outer glow for source
    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.beginPath();
    ctx.arc(ax, ay, 16, 0, Math.PI * 2);
    ctx.fill();

    // Main circle
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(ax, ay, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Source label
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Nguồn A (${source.x.toFixed(2)}, ${source.y.toFixed(2)})`, ax, ay - 14);
  }, [source, target, guards, rays, showGuards, toCanvasPx]);

  // Pointer event handlers for drag & drop
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const availSize = Math.min(rect.width, rect.height) - PADDING * 2;
    const roomSize = Math.max(100, availSize);
    const offsetX = (rect.width - roomSize) / 2;
    const offsetY = (rect.height - roomSize) / 2;

    const unitX = (px - offsetX) / roomSize;
    const unitY = (py - offsetY) / roomSize;

    // Check hit on source
    if (distanceBetween({ x: unitX, y: unitY }, source) < HIT_RADIUS) {
      setActiveDrag('source');
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // Check hit on target
    if (distanceBetween({ x: unitX, y: unitY }, target) < HIT_RADIUS) {
      setActiveDrag('target');
      canvas.setPointerCapture(e.pointerId);
      return;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const availSize = Math.min(rect.width, rect.height) - PADDING * 2;
    const roomSize = Math.max(100, availSize);
    const offsetX = (rect.width - roomSize) / 2;
    const offsetY = (rect.height - roomSize) / 2;

    const newX = toUnitCoord(px, roomSize, offsetX);
    const newY = toUnitCoord(py, roomSize, offsetY);

    if (activeDrag === 'source') {
      onSourceMove({ x: Math.round(newX * 100) / 100, y: Math.round(newY * 100) / 100 });
      return;
    }

    if (activeDrag === 'target') {
      onTargetMove({ x: Math.round(newX * 100) / 100, y: Math.round(newY * 100) / 100 });
      return;
    }

    // Hover state detection
    const unitX = (px - offsetX) / roomSize;
    const unitY = (py - offsetY) / roomSize;
    if (distanceBetween({ x: unitX, y: unitY }, source) < HIT_RADIUS) {
      setHoveredNode('source');
    } else if (distanceBetween({ x: unitX, y: unitY }, target) < HIT_RADIUS) {
      setHoveredNode('target');
    } else {
      setHoveredNode(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeDrag) {
      canvasRef.current?.releasePointerCapture(e.pointerId);
      setActiveDrag(null);
    }
  };

  const cursorClass = activeDrag
    ? 'cursor-grabbing'
    : hoveredNode
      ? 'cursor-grab'
      : 'cursor-crosshair';

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white p-2 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] ${className}`}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`h-[420px] w-full max-w-[500px] touch-none select-none rounded-lg ${cursorClass}`}
      />
      <div className="mt-1 flex w-full items-center justify-between px-2 text-xs font-mono text-slate-500">
        <span>Kéo A hoặc B để dịch chuyển</span>
        <span>Kích thước: 1.0 × 1.0</span>
      </div>
    </div>
  );
}
