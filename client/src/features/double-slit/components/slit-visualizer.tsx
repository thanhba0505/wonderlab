'use client';

import * as React from 'react';
import { Eye, EyeOff, Radio, Sparkles, Activity } from 'lucide-react';
import { QuantumParameters, wavelengthToRgb } from '../quantum-math';

interface SlitVisualizerProps {
  params: QuantumParameters;
  hits: number[]; // Array of y-coordinates in meters
  lastHitY: number | null;
  isStreaming: boolean;
  totalHits: number;
}

export function SlitVisualizer({
  params,
  hits,
  lastHitY,
  isStreaming,
  totalHits,
}: SlitVisualizerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const color = wavelengthToRgb(params.wavelength * 1e9);

  // Setup animated canvas for laser wave and hit phosphor
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let waveOffset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background - Clean Lab Slate
      ctx.fillStyle = '#0f172a'; // Deep slate
      ctx.fillRect(0, 0, width, height);

      // Subtle technical grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerY = height / 2;
      const emitterX = 50;
      const barrierX = width * 0.42;
      const screenX = width - 80;

      // 2. Draw Optical Bench Axis
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(emitterX, centerY);
      ctx.lineTo(screenX, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Draw Emitter (Súng phát xạ hạt)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.fillRect(emitterX - 35, centerY - 25, 35, 50);
      ctx.strokeRect(emitterX - 35, centerY - 25, 35, 50);

      // Emitter Aperture Glow
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(emitterX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // 4. Wave Propagation (Emitter -> Barrier)
      if (isStreaming) {
        waveOffset = (waveOffset + 1.5) % 20;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      const waveCount = 8;
      for (let i = 0; i < waveCount; i++) {
        const radius = ((i * 20 + waveOffset) % (barrierX - emitterX)) + 5;
        const alpha = Math.max(0, 1 - radius / (barrierX - emitterX));
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(emitterX, centerY, radius, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // 5. Double-Slit Barrier (Tấm chắn 2 khe)
      const barrierWidth = 14;
      const slitGapPx = 28; // visual scale of slit separation
      const slitHeightPx = 10;

      // Top segment
      ctx.fillStyle = '#334155';
      ctx.fillRect(barrierX, 0, barrierWidth, centerY - slitGapPx / 2 - slitHeightPx / 2);
      // Middle block (between the 2 slits)
      ctx.fillRect(
        barrierX,
        centerY - slitGapPx / 2 + slitHeightPx / 2,
        barrierWidth,
        slitGapPx - slitHeightPx,
      );
      // Bottom segment
      ctx.fillRect(
        barrierX,
        centerY + slitGapPx / 2 + slitHeightPx / 2,
        barrierWidth,
        height - (centerY + slitGapPx / 2 + slitHeightPx / 2),
      );

      // Slit markers & coordinates
      const slit1Y = centerY - slitGapPx / 2;
      const slit2Y = centerY + slitGapPx / 2;

      // Highlight opening of slits
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(barrierX, slit1Y - slitHeightPx / 2, barrierWidth, slitHeightPx);
      ctx.fillRect(barrierX, slit2Y - slitHeightPx / 2, barrierWidth, slitHeightPx);
      ctx.globalAlpha = 1.0;

      // 6. Quantum Observer / Detector at Slits
      const observerX = barrierX + barrierWidth + 4;
      if (params.isObserverActive) {
        // Observer ACTIVE: Red glowing sensors
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;

        // Detector 1
        ctx.beginPath();
        ctx.arc(observerX + 6, slit1Y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Detector 2
        ctx.beginPath();
        ctx.arc(observerX + 6, slit2Y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Measurement Ray (Observer ON -> Collapsed particle paths)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(observerX + 12, slit1Y);
        ctx.lineTo(screenX, slit1Y);
        ctx.moveTo(observerX + 12, slit2Y);
        ctx.lineTo(screenX, slit2Y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Observer OFF: Quantum Wave Interference from Slits to Screen
        const distToScreen = screenX - (barrierX + barrierWidth);
        const subWaves = 7;
        for (let i = 0; i < subWaves; i++) {
          const r = ((i * 24 + waveOffset) % distToScreen) + 4;
          const alpha = Math.max(0, 0.45 * (1 - r / distToScreen));
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1.2;

          // Wave from slit 1
          ctx.beginPath();
          ctx.arc(barrierX + barrierWidth, slit1Y, r, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();

          // Wave from slit 2
          ctx.beginPath();
          ctx.arc(barrierX + barrierWidth, slit2Y, r, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      // 7. Phosphor Hit Screen (Màn huỳnh quang)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillRect(screenX, 20, 16, height - 40);
      ctx.strokeRect(screenX, 20, 16, height - 40);

      // Screen Phosphor Glow points from hits
      const yRangeMeters = 0.05; // 5cm
      const halfScreenH = (height - 60) / 2;

      // Draw accumulated phosphor dots
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;

      const sampleLimit = Math.min(hits.length, 3000);
      for (let i = 0; i < sampleLimit; i++) {
        const hitY = hits[i];
        // Map hitY (-0.05m .. +0.05m) to screen pixels
        const hitPixelY = centerY + (hitY / yRangeMeters) * halfScreenH;
        if (hitPixelY >= 25 && hitPixelY <= height - 25) {
          ctx.globalAlpha = 0.65;
          ctx.fillRect(screenX + 2, hitPixelY - 1, 12, 2);
        }
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // 8. Highlight Latest Hit Animation
      if (lastHitY !== null) {
        const latestPixelY = centerY + (lastHitY / yRangeMeters) * halfScreenH;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(screenX + 8, latestPixelY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 9. Histogram Envelope behind screen (Intensity Profile Bar)
      const histBarWidth = 45;
      const binCount = 40;
      const bins = new Int32Array(binCount);
      let maxBinVal = 1;

      for (let i = 0; i < hits.length; i++) {
        const norm = (hits[i] / yRangeMeters + 1) / 2; // [0, 1]
        const binIdx = Math.floor(norm * binCount);
        if (binIdx >= 0 && binIdx < binCount) {
          bins[binIdx]++;
          if (bins[binIdx] > maxBinVal) maxBinVal = bins[binIdx];
        }
      }

      // Draw density histogram bars on the right side
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.45;
      const binHeight = (height - 60) / binCount;
      for (let b = 0; b < binCount; b++) {
        const binY = 30 + b * binHeight;
        const barLen = (bins[b] / maxBinVal) * histBarWidth;
        ctx.fillRect(screenX + 22, binY, barLen, binHeight - 1);
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [params, hits, lastHitY, isStreaming, color]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-md">
      {/* Visualizer Top Bar with Diagnostics */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2.5 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isStreaming ? 'animate-ping bg-emerald-400' : 'bg-blue-400'
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isStreaming ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
              />
            </span>
            <span className="font-bold text-slate-200">
              BUỒNG QUANG HỌC LƯỢNG TỬ • DOUBLE-SLIT BENCH
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-xs">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span className="text-slate-300">λ = {(params.wavelength * 1e9).toFixed(0)}nm</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-300">
            d = {(params.slitDistance * 1e6).toFixed(0)}µm
          </span>
        </div>

        {/* Observer Mode Indicator */}
        <div className="flex items-center gap-2">
          {params.isObserverActive ? (
            <span className="flex items-center gap-1.5 rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/40 animate-pulse">
              <Eye className="h-3.5 w-3.5" />
              OBSERVER ON: HÀM SÓNG SỤP ĐỔ
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/40">
              <EyeOff className="h-3.5 w-3.5" />
              OBSERVER OFF: GIAO THOA SÓNG
            </span>
          )}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={840}
          height={380}
          className="h-[380px] w-full block cursor-crosshair"
        />

        {/* Annotations overlay */}
        <div className="pointer-events-none absolute bottom-3 left-4 flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
            <Radio className="h-3 w-3 text-blue-400" />
            <span>Súng phát xạ (Emitter)</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
            <span>Tấm chắn 2 khe (d = {(params.slitDistance * 1e6).toFixed(0)}µm)</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span>Màn huỳnh quang (D = {params.screenDistance.toFixed(1)}m)</span>
          </div>
        </div>

        {/* Counter Overlay */}
        <div className="pointer-events-none absolute top-3 right-4 rounded-lg bg-slate-950/80 px-3 py-1.5 border border-slate-700/80 font-mono text-xs">
          <span className="text-slate-400">Hạt ghi nhận: </span>
          <span className="font-bold text-white text-sm tabular-nums">
            {totalHits.toLocaleString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
  );
}
