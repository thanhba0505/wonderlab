'use client';

import * as React from 'react';
import Link from 'next/link';
import { Binary, Sparkles, Orbit, ArrowRight } from 'lucide-react';

interface NodeData {
  id: number;
  cx: number;
  cy: number;
  label: string;
  r: number;
  color: string;
  formula: string;
  insight: string;
  tag: string;
  href?: string;
}

export function HeroVisual() {
  const [activeNode, setActiveNode] = React.useState<number>(1);

  const nodes: NodeData[] = [
    {
      id: 1,
      cx: 75,
      cy: 90,
      label: 'Monty Hall',
      r: 18,
      color: '#2563eb',
      formula: 'P(Thắng | Đổi) = 2/3 ≈ 66.7%',
      insight: 'Xác suất tăng gấp đôi khi chuyển đổi quyết định ban đầu.',
      tag: 'XÁC SUẤT ĐIỀU KIỆN',
      href: '/simulations/monty-hall',
    },
    {
      id: 2,
      cx: 180,
      cy: 48,
      label: 'Sóng Khe Đôi',
      r: 15,
      color: '#7c3aed',
      formula: 'd · sin(θ) = m · λ',
      insight: 'Hạt ánh sáng tự giao thoa với chính nó trong không gian.',
      tag: 'LƯỢNG TỬ',
      href: '/simulations/double-slit',
    },
    {
      id: 3,
      cx: 285,
      cy: 85,
      label: 'Nghịch Lý Fermi',
      r: 16,
      color: '#d97706',
      formula: 'N = R* · fp · ne · fl · fi',
      insight: 'Nếu vũ trụ bao la, tại sao chúng ta chưa thấy tín hiệu nào?',
      tag: 'THIÊN VĂN & TRIẾT HỌC',
    },
    {
      id: 4,
      cx: 110,
      cy: 175,
      label: 'Cân Bằng Nash',
      r: 16,
      color: '#059669',
      formula: 'ui(si*, s-i*) ≥ ui(si, s-i*)',
      insight: 'Trạng thái không bên nào có động lực đơn phương thay đổi.',
      tag: 'LÝ THUYẾT TRÒ CHƠI',
      href: '/simulations/prisoners-dilemma',
    },
    {
      id: 5,
      cx: 245,
      cy: 165,
      label: 'Định Lý Bayes',
      r: 19,
      color: '#0284c7',
      formula: 'P(A|B) = [P(B|A) · P(A)] / P(B)',
      insight: 'Cách cập nhật niềm tin duy lý khi có bằng chứng mới.',
      tag: 'SUY LUẬN XÁC SUẤT',
    },
  ];

  const currentNode = nodes.find(n => n.id === activeNode) ?? nodes[0];

  return (
    <div className="relative w-full max-w-md mx-auto rounded-2xl border border-slate-300/85 bg-white p-5 shadow-lg shadow-slate-300/40 overflow-hidden">
      {/* Background laboratory grid */}
      <div className="absolute inset-0 lab-grid opacity-60 pointer-events-none" />

      {/* Top telemetry status bar */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="text-blue-700 font-semibold tracking-wider">CHAMBER: ONLINE</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Orbit className="h-3.5 w-3.5 text-violet-600 animate-spin" />
          <span>COORDS: 45.2°N 12.8°W</span>
        </div>
      </div>

      {/* Interactive SVG Network */}
      <div className="relative my-2 aspect-[4/3] w-full">
        <svg
          viewBox="0 0 360 220"
          className="w-full h-full select-none"
          aria-label="Mô phỏng mạng lưới các thí nghiệm khoa học trực quan"
        >
          <defs>
            <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="centerGlowLight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Center Glow */}
          <circle cx="180" cy="110" r="100" fill="url(#centerGlowLight)" />

          {/* Coordinate guides */}
          <line
            x1="180"
            y1="20"
            x2="180"
            y2="200"
            stroke="#e2e8f0"
            strokeDasharray="2 4"
            strokeWidth="1"
          />
          <line
            x1="30"
            y1="110"
            x2="330"
            y2="110"
            stroke="#e2e8f0"
            strokeDasharray="2 4"
            strokeWidth="1"
          />

          {/* Connection lines */}
          <line
            x1="75"
            y1="90"
            x2="180"
            y2="48"
            stroke={activeNode === 1 || activeNode === 2 ? '#2563eb' : '#cbd5e1'}
            strokeWidth={activeNode === 1 || activeNode === 2 ? '2' : '1.5'}
          />
          <line
            x1="180"
            y1="48"
            x2="285"
            y2="85"
            stroke={activeNode === 2 || activeNode === 3 ? '#7c3aed' : '#cbd5e1'}
            strokeWidth={activeNode === 2 || activeNode === 3 ? '2' : '1.5'}
          />
          <line
            x1="75"
            y1="90"
            x2="110"
            y2="175"
            stroke={activeNode === 1 || activeNode === 4 ? '#2563eb' : '#cbd5e1'}
            strokeWidth={activeNode === 1 || activeNode === 4 ? '2' : '1.5'}
          />
          <line
            x1="110"
            y1="175"
            x2="245"
            y2="165"
            stroke={activeNode === 4 || activeNode === 5 ? '#059669' : '#cbd5e1'}
            strokeWidth={activeNode === 4 || activeNode === 5 ? '2' : '1.5'}
          />
          <line
            x1="245"
            y1="165"
            x2="285"
            y2="85"
            stroke={activeNode === 5 || activeNode === 3 ? '#0284c7' : '#cbd5e1'}
            strokeWidth={activeNode === 5 || activeNode === 3 ? '2' : '1.5'}
          />
          <line
            x1="180"
            y1="48"
            x2="245"
            y2="165"
            stroke="#cbd5e1"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Interactive Nodes */}
          {nodes.map(node => {
            const isActive = activeNode === node.id;
            return (
              <g
                key={node.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => setActiveNode(node.id)}
                onMouseEnter={() => setActiveNode(node.id)}
              >
                {/* Outer halo */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={isActive ? node.r + 8 : node.r + 2}
                  fill={node.color}
                  fillOpacity={isActive ? 0.2 : 0.05}
                  className="transition-all duration-300"
                />

                {/* Core disk */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={node.r}
                  fill="#ffffff"
                  stroke={node.color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  filter={isActive ? 'url(#glowLight)' : undefined}
                />

                {/* Inner center particle */}
                <circle cx={node.cx} cy={node.cy} r={isActive ? 4 : 2.5} fill={node.color} />

                {/* Node Label */}
                <text
                  x={node.cx}
                  y={node.cy + node.r + 14}
                  textAnchor="middle"
                  fontSize="12"
                  fill={isActive ? '#0f172a' : '#475569'}
                  fontWeight={isActive ? '700' : '600'}
                  fontFamily="var(--font-mono), monospace"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Inspector / HUD Card */}
      <div
        className="relative z-10 rounded-xl bg-slate-50/95 border-l-4 p-4 shadow-2xs transition-all duration-200"
        style={{ borderLeftColor: currentNode.color }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div
            className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-200"
            style={{ color: currentNode.color }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{currentNode.tag}</span>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            ID: #{String(currentNode.id).padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-1.5 mb-2">
          <span className="text-sm font-bold text-slate-900 tracking-tight font-heading">
            {currentNode.label}
          </span>
          <span className="inline-block text-xs font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs tabular-nums">
            {currentNode.formula}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">{currentNode.insight}</p>

        {/* HUD Instrument Status & Action Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-500">
            {currentNode.href ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span>Phòng lab sẵn sàng</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                <span>Mô hình lý thuyết</span>
              </>
            )}
          </span>

          {currentNode.href ? (
            <Link
              href={currentNode.href}
              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 transition-colors group"
            >
              <span>Vào phòng lab</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span className="text-slate-600">Dữ liệu tham chiếu</span>
          )}
        </div>
      </div>

      {/* Bottom prompt */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-mono text-slate-500">
        <Binary className="h-3.5 w-3.5 text-blue-600" />
        <span>Rê chuột hoặc nhấp vào các nút để kiểm tra mô hình</span>
      </div>
    </div>
  );
}
