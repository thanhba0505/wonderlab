'use client';

import React, { useState, useEffect } from 'react';
import { Point, calculateBodyguardPoints } from '@/features/bodyguard-problem/bodyguard-math';
import { RoomCanvas } from '@/features/bodyguard-problem/components/room-canvas';
import { UnfoldingCanvas } from '@/features/bodyguard-problem/components/unfolding-canvas';
import { ControlDeck } from '@/features/bodyguard-problem/components/control-deck';
import { TelemetryPanel } from '@/features/bodyguard-problem/components/telemetry-panel';

export function BodyguardSimulation(): React.JSX.Element {
  const [source, setSource] = useState<Point>({ x: 0.2, y: 0.3 });
  const [target, setTarget] = useState<Point>({ x: 0.7, y: 0.8 });
  const [guards, setGuards] = useState<Point[]>([]);
  const [showGuards, setShowGuards] = useState<boolean>(true);
  const [maxBounces, setMaxBounces] = useState<number>(20);

  useEffect(() => {
    const pts = calculateBodyguardPoints(source, target);
    setGuards(pts);
  }, [source, target]);

  const visibleGuards = showGuards ? guards : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Section Title */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-[18px] font-bold text-slate-900 tracking-tight">
          Buồng Thực Nghiệm
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-mono">
          Kéo điểm A và B trực tiếp trên canvas để quan sát hành vi phản xạ theo thời gian thực.
        </p>
      </div>

      {/* Control Deck */}
      <ControlDeck
        source={source}
        target={target}
        showGuards={showGuards}
        setShowGuards={setShowGuards}
        maxBounces={maxBounces}
        setMaxBounces={setMaxBounces}
      />

      {/* Canvases */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-semibold text-slate-600 uppercase tracking-widest">
            Buồng gương
          </span>
          <RoomCanvas
            source={source}
            target={target}
            guards={visibleGuards}
            maxBounces={maxBounces}
            onSourceMove={setSource}
            onTargetMove={setTarget}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-semibold text-slate-600 uppercase tracking-widest">
            Không gian gương mở rộng
          </span>
          <UnfoldingCanvas source={source} target={target} guards={visibleGuards} />
        </div>
      </div>

      {/* Telemetry Panel */}
      <TelemetryPanel source={source} target={target} guards={guards} showGuards={showGuards} />
    </div>
  );
}
