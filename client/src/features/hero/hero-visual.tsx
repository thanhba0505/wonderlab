'use client';

import * as React from 'react';

export function HeroVisual() {
  const [activeNode, setActiveNode] = React.useState<number | null>(null);

  const nodes = [
    { id: 1, cx: 60, cy: 90, label: 'Xác suất P(A)', r: 18, color: '#06b6d4' },
    { id: 2, cx: 160, cy: 45, label: 'Giao thoa sóng', r: 14, color: '#8b5cf6' },
    { id: 3, cx: 260, cy: 80, label: 'Nghịch lý Fermi', r: 16, color: '#f59e0b' },
    { id: 4, cx: 110, cy: 170, label: 'Cân bằng Nash', r: 15, color: '#10b981' },
    { id: 5, cx: 220, cy: 165, label: 'Định lý Bayes', r: 20, color: '#06b6d4' },
    { id: 6, cx: 310, cy: 140, label: 'Con tàu Theseus', r: 13, color: '#8b5cf6' },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-4 shadow-2xl shadow-cyan-950/30 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 lab-grid opacity-40 pointer-events-none" />

      {/* SVG Interactive Constellation */}
      <svg
        viewBox="0 0 360 240"
        className="w-full h-full relative z-10 select-none"
        aria-label="Mạng lưới các khái niệm khoa học Wonderlab"
      >
        <defs>
          <linearGradient id="cyanViolet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Connection lines */}
        <line
          x1="60"
          y1="90"
          x2="160"
          y2="45"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <line x1="160" y1="45" x2="260" y2="80" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="60" y1="90" x2="110" y2="170" stroke="#1e293b" strokeWidth="1.5" />
        <line
          x1="110"
          y1="170"
          x2="220"
          y2="165"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        <line
          x1="220"
          y1="165"
          x2="260"
          y2="80"
          stroke="#8b5cf6"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        <line
          x1="260"
          y1="80"
          x2="310"
          y2="140"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <line x1="220" y1="165" x2="310" y2="140" stroke="#1e293b" strokeWidth="1.5" />

        {/* Dynamic Nodes */}
        {nodes.map(node => {
          const isActive = activeNode === node.id;
          return (
            <g
              key={node.id}
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              {/* Pulse circle */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={isActive ? node.r + 6 : node.r + 2}
                fill={node.color}
                fillOpacity={isActive ? 0.25 : 0.08}
                className="transition-all"
              />
              {/* Core node */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill="#0f172a"
                stroke={node.color}
                strokeWidth={isActive ? 2.5 : 1.5}
                filter="url(#glow)"
              />
              {/* Inner dot */}
              <circle cx={node.cx} cy={node.cy} r={3} fill={node.color} />
              {/* Label */}
              <text
                x={node.cx}
                y={node.cy + node.r + 14}
                textAnchor="middle"
                fontSize="9"
                fill={isActive ? '#38bdf8' : '#94a3b8'}
                fontWeight={isActive ? '700' : '500'}
                fontFamily="ui-monospace, monospace"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="text-center mt-1">
        <span className="text-[11px] font-mono text-slate-400">
          Chạm vào các nút để kích hoạt các liên kết tư duy
        </span>
      </div>
    </div>
  );
}
