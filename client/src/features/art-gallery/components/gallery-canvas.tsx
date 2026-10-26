'use client';

import * as React from 'react';
import {
  Point,
  FiskProofResult,
  computeVisibilityPolygon,
  isPointInsidePolygon,
  VertexColor,
} from '../art-gallery-math';
import { Eye, Trash2, Sparkles, MapPin } from 'lucide-react';

export interface GalleryCanvasProps {
  polygon: Point[];
  guards: Point[];
  onAddGuard: (point: Point) => void;
  onRemoveGuard: (index: number) => void;
  showTriangulation: boolean;
  showColoring: boolean;
  fiskProof: FiskProofResult;
  isVertexOnlyMode: boolean;
}

const COLOR_MAP: Record<VertexColor, { label: string; fill: string; ring: string; badge: string }> =
  {
    0: {
      label: 'Màu A (Hổ phách)',
      fill: 'fill-amber-500',
      ring: 'stroke-amber-500',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    1: {
      label: 'Màu B (Ngọc bích)',
      fill: 'fill-emerald-500',
      ring: 'stroke-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    2: {
      label: 'Màu C (Tím lam)',
      fill: 'fill-indigo-500',
      ring: 'stroke-indigo-500',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
  };

export const GalleryCanvas: React.FC<GalleryCanvasProps> = ({
  polygon,
  guards,
  onAddGuard,
  onRemoveGuard,
  showTriangulation,
  showColoring,
  fiskProof,
  isVertexOnlyMode,
}) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [hoveredVertexIdx, setHoveredVertexIdx] = React.useState<number | null>(null);

  // Compute visibility polygons for all placed guards
  const visibilityPolygons = React.useMemo(() => {
    return guards.map(guard => computeVisibilityPolygon(guard, polygon));
  }, [guards, polygon]);

  // Convert SVG coordinate from mouse click
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 500 / rect.width;
    const scaleY = 420 / rect.height;

    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);
    const clickPoint: Point = { x: clickX, y: clickY };

    // If vertex-only mode, only allow clicking near vertices
    if (isVertexOnlyMode) {
      return;
    }

    // Check if clicked point is inside room
    if (isPointInsidePolygon(clickPoint, polygon)) {
      onAddGuard(clickPoint);
    }
  };

  const handleVertexClick = (e: React.MouseEvent, vIdx: number) => {
    e.stopPropagation();
    const v = polygon[vIdx];
    if (!v) return;

    // Check if a guard already exists at or very near this vertex
    const existingGuardIdx = guards.findIndex(g => Math.hypot(g.x - v.x, g.y - v.y) < 10);
    if (existingGuardIdx !== -1) {
      onRemoveGuard(existingGuardIdx);
    } else {
      onAddGuard(v);
    }
  };

  const polygonSvgPoints = polygon.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-300/85 bg-white shadow-xs overflow-hidden">
      {/* Canvas Header / Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-2.5 bg-slate-50/70 text-xs text-slate-600 font-sans">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">Bản Vẽ Phòng & Không Gian Tầm Nhìn</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">
            {isVertexOnlyMode ? 'Chế độ: Đặt tại đỉnh phòng' : 'Chế độ: Tự do trong phòng'}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-500">
          <span>{polygon.length} Đỉnh</span>
          <span>&bull;</span>
          <span>{guards.length} Người gác</span>
          <span>&bull;</span>
          <span className="text-amber-700 font-semibold">
            Cận Chvátal: &lfloor;{polygon.length}/3&rfloor; = {Math.floor(polygon.length / 3)}
          </span>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative w-full aspect-[5/4.2] max-h-[500px] select-none bg-slate-50/40">
        <svg
          ref={svgRef}
          viewBox="0 0 500 420"
          className="w-full h-full cursor-crosshair"
          onClick={handleSvgClick}
        >
          <defs>
            {/* Subtle Laboratory Coordinate Grid */}
            <pattern id="lab-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(148, 163, 184, 0.15)"
                strokeWidth="1"
              />
            </pattern>

            {/* Gradient for Guard Illumination */}
            <radialGradient id="guard-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="500" height="420" fill="url(#lab-grid-pattern)" />

          {/* 1. Base Room Interior (Unlit / Shadowed Area) */}
          <polygon
            points={polygonSvgPoints}
            className="fill-slate-200/50 stroke-none transition-all duration-200"
          />

          {/* 2. Illuminated Visibility Polygons (Additive Light Overlay) */}
          {visibilityPolygons.map((vis, idx) => {
            if (vis.points.length < 3) return null;
            const pointsStr = vis.points.map(p => `${p.x},${p.y}`).join(' ');
            return (
              <g key={`vis-${idx}`} className="pointer-events-none">
                <polygon
                  points={pointsStr}
                  fill="rgba(245, 158, 11, 0.22)"
                  stroke="rgba(217, 119, 6, 0.45)"
                  strokeWidth="1"
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* 3. Triangulation Diagonals (Steve Fisk Proof Layer) */}
          {showTriangulation &&
            fiskProof.diagonals.map((diag, idx) => (
              <line
                key={`diag-${idx}`}
                x1={diag.p1.x}
                y1={diag.p1.y}
                x2={diag.p2.x}
                y2={diag.p2.y}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.75"
                className="pointer-events-none"
              />
            ))}

          {/* 4. Room Exterior Boundary Walls (Crisp Dark Slate Border) */}
          <polygon
            points={polygonSvgPoints}
            fill="none"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="pointer-events-none"
          />

          {/* 5. Polygon Vertices (Interactive Dots) */}
          {polygon.map((v, idx) => {
            const isHovered = hoveredVertexIdx === idx;
            const vertexColor = fiskProof.vertexColors[idx] ?? 0;
            const isOptimalGuardVertex = showColoring && fiskProof.guardVertexIndices.includes(idx);

            let fillColor = '#ffffff';
            let strokeColor = '#0f172a';

            if (showColoring) {
              if (vertexColor === 0) {
                fillColor = '#f59e0b'; // Amber
                strokeColor = '#b45309';
              } else if (vertexColor === 1) {
                fillColor = '#10b981'; // Emerald
                strokeColor = '#047857';
              } else {
                fillColor = '#6366f1'; // Indigo
                strokeColor = '#4338ca';
              }
            }

            return (
              <g
                key={`vertex-${idx}`}
                className="cursor-pointer group"
                onClick={e => handleVertexClick(e, idx)}
                onMouseEnter={() => setHoveredVertexIdx(idx)}
                onMouseLeave={() => setHoveredVertexIdx(null)}
              >
                {/* Optimal Guard Pulse Halo */}
                {isOptimalGuardVertex && (
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r="12"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Outer Ring on Hover */}
                {isHovered && (
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r="9"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    className="opacity-80"
                  />
                )}

                {/* Vertex Circle */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={isHovered ? 6 : showColoring ? 5.5 : 4}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Vertex Index Label */}
                <text
                  x={v.x}
                  y={v.y - 8}
                  textAnchor="middle"
                  className="font-mono text-xs fill-slate-500 font-bold pointer-events-none select-none"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}

          {/* 6. Active Guard Markers (Icons / Illuminated Beacons) */}
          {guards.map((g, idx) => (
            <g
              key={`guard-${idx}`}
              className="cursor-pointer group"
              onClick={e => {
                e.stopPropagation();
                onRemoveGuard(idx);
              }}
            >
              {/* Outer Pulse Ring */}
              <circle
                cx={g.x}
                cy={g.y}
                r="16"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                className="animate-ping opacity-40"
              />

              {/* Guard Background Badge */}
              <circle
                cx={g.x}
                cy={g.y}
                r="11"
                fill="#b45309"
                stroke="#ffffff"
                strokeWidth="2"
                className="shadow-sm group-hover:fill-rose-600 transition-colors duration-150"
              />

              {/* Guard Inner Core */}
              <circle cx={g.x} cy={g.y} r="4" fill="#ffffff" />

              {/* Guard Number / Label */}
              <text
                x={g.x}
                y={g.y + 22}
                textAnchor="middle"
                className="font-mono text-xs font-bold fill-slate-800 drop-shadow-xs pointer-events-none select-none"
              >
                G{idx + 1}
              </text>
            </g>
          ))}
        </svg>

        {/* Empty State Overlay */}
        {guards.length === 0 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-1.5 border border-slate-300 shadow-xs text-xs text-slate-600">
              <Eye className="h-4 w-4 text-amber-600 animate-pulse" />
              <span>
                {isVertexOnlyMode
                  ? 'Bấm vào một đỉnh bất kỳ (chấm tròn) để đặt lính gác quan sát'
                  : 'Bấm vào bất kỳ đâu trong căn phòng hoặc tại đỉnh để bố trí lính gác'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Color Legend (Visible when Fisk Coloring is enabled) */}
      {showColoring && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-2.5 bg-slate-50/80 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Tô 3 màu theo định lý Steve Fisk:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {([0, 1, 2] as VertexColor[]).map(c => {
              const count = fiskProof.colorCounts[c];
              const isOptimal = c === fiskProof.optimalColor;
              const meta = COLOR_MAP[c];
              return (
                <div
                  key={`color-badge-${c}`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-sans ${
                    isOptimal
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold ring-1 ring-emerald-400'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      c === 0 ? 'bg-amber-500' : c === 1 ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                  />
                  <span>
                    {meta.label}: <strong className="font-mono">{count}</strong> đỉnh
                  </span>
                  {isOptimal && (
                    <span className="text-xs uppercase tracking-wide bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono">
                      Cực tiểu &le; &lfloor;n/3&rfloor;
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Helper Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 px-4 py-2 bg-white text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-blue-600" />
          <span>Click lính gác đã đặt để xóa | Click đỉnh để bật/tắt lính</span>
        </div>
        {guards.length > 0 && (
          <button
            onClick={() => onRemoveGuard(-1)} // -1 to trigger clear all
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Xóa toàn bộ lính</span>
          </button>
        )}
      </div>
    </div>
  );
};
