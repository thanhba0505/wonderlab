'use client';

import * as React from 'react';
import { Ant, CollisionEvent } from '../ants-math';

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1.0 down to 0.0
  color: string;
}

interface FallingAntVisual {
  id: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  direction: 1 | -1;
}

interface StickCanvasProps {
  ants: readonly Ant[];
  stickLength: number;
  currentTime: number;
  isGhostMode: boolean;
  selectedAntId: number | null;
  onSelectAnt: (id: number | null) => void;
  recentCollisions: readonly CollisionEvent[];
}

export function StickCanvas({
  ants,
  stickLength,
  currentTime,
  isGhostMode,
  selectedAntId,
  onSelectAnt,
  recentCollisions,
}: StickCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Particles và falling animation lưu trữ trong ref để tránh re-render React
  const sparksRef = React.useRef<SparkParticle[]>([]);
  const fallingAntsRef = React.useRef<FallingAntVisual[]>([]);
  const prevCollisionsCountRef = React.useRef<number>(0);
  const prevAntsStateRef = React.useRef<Map<number, boolean>>(new Map());

  // Kích thước canvas responsive
  const [dimensions, setDimensions] = React.useState({ width: 900, height: 260 });

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setDimensions({
          width: Math.max(320, width),
          height: 240,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Xử lý tạo tia sáng (Sparks) khi có va chạm mới
  React.useEffect(() => {
    if (recentCollisions.length > prevCollisionsCountRef.current) {
      const newCount = recentCollisions.length - prevCollisionsCountRef.current;
      const latestEvents = recentCollisions.slice(-newCount);

      const margin = 50;
      const effectiveWidth = dimensions.width - 2 * margin;

      for (const ev of latestEvents) {
        const canvasX = margin + (ev.x / stickLength) * effectiveWidth;
        const canvasY = dimensions.height / 2;

        // Sinh 6 hạt tia lửa màu vàng hổ phách
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.2 + Math.random() * 2.5;
          sparksRef.current.push({
            x: canvasX,
            y: canvasY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color: Math.random() > 0.5 ? '#f59e0b' : '#fbbf24',
          });
        }
      }
    }
    prevCollisionsCountRef.current = recentCollisions.length;
  }, [recentCollisions, dimensions, stickLength]);

  // Xử lý hiệu ứng rơi parabol khi kiến vừa chạm mép
  React.useEffect(() => {
    const margin = 50;
    const effectiveWidth = dimensions.width - 2 * margin;
    const rulerY = dimensions.height / 2;

    for (const ant of ants) {
      const wasFallen = prevAntsStateRef.current.get(ant.id) ?? false;
      if (ant.isFallen && !wasFallen) {
        const canvasX = ant.exitSide === 'left' ? margin : margin + effectiveWidth;

        fallingAntsRef.current.push({
          id: ant.id,
          startX: canvasX,
          startY: rulerY,
          x: canvasX,
          y: rulerY,
          vy: 0.5,
          alpha: 1.0,
          color: ant.color,
          direction: ant.direction,
        });
      }
      prevAntsStateRef.current.set(ant.id, ant.isFallen);
    }
  }, [ants, dimensions, stickLength]);

  // Vòng lặp render Canvas
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
    const margin = 50;
    const rulerWidth = width - 2 * margin;
    const rulerY = height / 2;
    const rulerHeight = 28;

    // 1. Nền canvas Slate-50 sạch sẽ phong cách Lab Paper
    ctx.clearRect(0, 0, width, height);

    // 2. Vẽ vùng ranh giới rơi ở 2 đầu (Exit Drop Zones)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.04)';
    // Mép trái
    ctx.fillRect(0, rulerY - 40, margin, rulerHeight + 80);
    // Mép phải
    ctx.fillRect(margin + rulerWidth, rulerY - 40, margin, rulerHeight + 80);

    // Đường biên đỏ đứt nét tại x = 0 và x = L
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(margin, rulerY - 50);
    ctx.lineTo(margin, rulerY + 60);
    ctx.moveTo(margin + rulerWidth, rulerY - 50);
    ctx.lineTo(margin + rulerWidth, rulerY + 60);
    ctx.stroke();
    ctx.setLineDash([]);

    // Nhãn 0cm và 100cm tại mép rơi
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('0 cm', margin, rulerY - 56);
    ctx.fillText(`${stickLength} cm`, margin + rulerWidth, rulerY - 56);

    // 3. Vẽ Thước gỗ kỹ thuật (The Ruler)
    const rulerGrad = ctx.createLinearGradient(
      0,
      rulerY - rulerHeight / 2,
      0,
      rulerY + rulerHeight / 2,
    );
    rulerGrad.addColorStop(0, '#fef3c7'); // Hổ phách nhạt (Gỗ bào mịn)
    rulerGrad.addColorStop(1, '#fde68a');

    ctx.fillStyle = rulerGrad;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(margin, rulerY - rulerHeight / 2, rulerWidth, rulerHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Vẽ các vạch chia độ trên thước (Ticks)
    const tickStep = stickLength <= 50 ? 1 : 2; // Khoảng cách giữa các vạch
    for (let cm = 0; cm <= stickLength; cm += tickStep) {
      const tx = margin + (cm / stickLength) * rulerWidth;
      const isMajor = cm % 10 === 0;
      const isMid = cm % 5 === 0 && !isMajor;

      const tickLen = isMajor ? 12 : isMid ? 8 : 4;
      ctx.strokeStyle = isMajor ? '#78350f' : isMid ? '#92400e' : '#b45309';
      ctx.lineWidth = isMajor ? 1.5 : 1;

      ctx.beginPath();
      ctx.moveTo(tx, rulerY + rulerHeight / 2 - tickLen);
      ctx.lineTo(tx, rulerY + rulerHeight / 2);
      ctx.stroke();

      // Số đo cm cho các vạch lớn (Major)
      if (isMajor && cm > 0 && cm < stickLength) {
        ctx.fillStyle = '#78350f';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${cm}`, tx, rulerY + rulerHeight / 2 + 13);
      }
    }

    // 4. Vẽ lớp bóng ma (Ghost Mode) nếu được kích hoạt
    if (isGhostMode) {
      for (const ant of ants) {
        // Chỉ vẽ bóng ma nếu nó còn nằm trong phạm vi hiển thị
        if (ant.ghostX >= -5 && ant.ghostX <= stickLength + 5) {
          const gx = margin + (ant.ghostX / stickLength) * rulerWidth;
          const gy = rulerY - 32; // Nổi nhẹ phía trên

          ctx.save();
          ctx.globalAlpha = 0.45;
          ctx.strokeStyle = ant.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 2]);

          // Vòng tròn hào quang bóng ma
          ctx.beginPath();
          ctx.arc(gx, gy, 8, 0, Math.PI * 2);
          ctx.stroke();

          // Mũi tên chỉ hướng của bóng ma (không bao giờ đổi hướng)
          const arrowDir = ant.initialDirection;
          ctx.fillStyle = ant.color;
          ctx.beginPath();
          ctx.moveTo(gx + arrowDir * 9, gy);
          ctx.lineTo(gx + arrowDir * 3, gy - 4);
          ctx.lineTo(gx + arrowDir * 3, gy + 4);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }
    }

    // 5. Vẽ đàn kiến thật trên mặt thanh gỗ
    for (const ant of ants) {
      if (ant.isFallen) continue;

      const ax = margin + (ant.x / stickLength) * rulerWidth;
      const ay = rulerY - rulerHeight / 2 - 2; // Đi trên mép trên của thanh thước
      const isSelected = ant.id === selectedAntId;

      ctx.save();

      // Vòng tròn nổi bật nếu đang được chọn
      if (isSelected) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ax, ay - 6, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Nhãn ID trên đầu
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`#${ant.id}`, ax, ay - 24);
      }

      // Vẽ hình chú kiến vector khoa học tinh gọn
      const dir = ant.direction; // 1 hoặc -1
      const gait = Math.sin(currentTime * 18 + ant.id); // Chu kỳ bước chân

      // Chân kiến (6 chân nhỏ)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      for (let leg = -1; leg <= 1; leg++) {
        const legOffset = leg * 3;
        const legSwing = (leg % 2 === 0 ? gait : -gait) * 2;
        ctx.beginPath();
        ctx.moveTo(ax + legOffset, ay - 4);
        ctx.lineTo(ax + legOffset + legSwing * dir, ay);
        ctx.stroke();
      }

      // Thân kiến gồm 3 phần (Bụng, Ngực, Đầu)
      // Phần Bụng (Abdomen)
      ctx.fillStyle = ant.color;
      ctx.beginPath();
      ctx.ellipse(ax - dir * 5, ay - 5, 4.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Phần Ngực (Thorax)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(ax, ay - 5, 3, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Phần Đầu (Head)
      ctx.fillStyle = ant.color;
      ctx.beginPath();
      ctx.arc(ax + dir * 4.5, ay - 5, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Râu kiến (Antennae)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax + dir * 6, ay - 6);
      ctx.lineTo(ax + dir * 9, ay - 9);
      ctx.moveTo(ax + dir * 6, ay - 4);
      ctx.lineTo(ax + dir * 9, ay - 2);
      ctx.stroke();

      ctx.restore();
    }

    // 6. Vẽ các chú kiến đang rơi parabol (Falling Ants Animation)
    for (let i = fallingAntsRef.current.length - 1; i >= 0; i--) {
      const fAnt = fallingAntsRef.current[i];
      if (!fAnt) continue;

      fAnt.y += fAnt.vy;
      fAnt.vy += 0.4; // Trọng lực g
      fAnt.alpha -= 0.025; // Mờ dần

      if (fAnt.alpha <= 0 || fAnt.y > height + 20) {
        fallingAntsRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, fAnt.alpha);
      ctx.fillStyle = fAnt.color;
      ctx.beginPath();
      ctx.arc(fAnt.x, fAnt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Cập nhật và vẽ các hạt tia lửa va chạm (Spark Particles)
    for (let i = sparksRef.current.length - 1; i >= 0; i--) {
      const p = sparksRef.current[i];
      if (!p) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;

      if (p.life <= 0) {
        sparksRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8 * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [ants, dimensions, stickLength, currentTime, isGhostMode, selectedAntId]);

  // Xử lý Click để chọn kiến
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const margin = 50;
    const rulerWidth = dimensions.width - 2 * margin;

    // Chuyển đổi clickX sang cm trên thước
    const clickedCm = ((clickX - margin) / rulerWidth) * stickLength;

    // Tìm con kiến gần nhất trong phạm vi click (< 3cm)
    let closestAnt: Ant | null = null;
    let minDistance = 3.0; // cm

    for (const ant of ants) {
      if (ant.isFallen) continue;
      const dist = Math.abs(ant.x - clickedCm);
      if (dist < minDistance) {
        minDistance = dist;
        closestAnt = ant;
      }
    }

    if (closestAnt) {
      onSelectAnt(closestAnt.id === selectedAntId ? null : closestAnt.id);
    } else {
      onSelectAnt(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-slate-300/85 bg-white p-2 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden"
    >
      {/* Huy hiệu chế độ Ghost Mode */}
      {isGhostMode && (
        <div className="absolute top-3 left-4 flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-mono text-amber-700 border border-amber-300/60 pointer-events-none">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Bóng ma đi xuyên (Ghost Equivalence Active)</span>
        </div>
      )}

      <div className="absolute top-3 right-4 text-xs font-mono text-slate-600 pointer-events-none">
        Click vào bất kỳ con kiến nào để soi tọa độ
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full cursor-pointer select-none"
        style={{ height: `${dimensions.height}px` }}
      />
    </div>
  );
}
