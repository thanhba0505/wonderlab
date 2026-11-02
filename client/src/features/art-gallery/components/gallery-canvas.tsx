'use client';

import * as React from 'react';
import {
  Point,
  FiskProofResult,
  computeVisibilityPolygon,
  isPointInsidePolygon,
  isSimplePolygon,
  VertexColor,
} from '../art-gallery-math';
import { Eye, EyeOff, Trash2, Sparkles, MapPin, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';
import { GalleryInteractionMode } from './gallery-controls';
import { useGallerySound } from '../utils/gallery-audio';

export interface GalleryCanvasProps {
  polygon: Point[];
  guards: Point[];
  onAddGuard: (point: Point) => void;
  onRemoveGuard: (index: number) => void;
  onUpdatePolygon: (newPolygon: Point[]) => void;
  showTriangulation: boolean;
  showColoring: boolean;
  showBlindSpots: boolean;
  onToggleBlindSpots: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  fiskProof: FiskProofResult;
  mode: GalleryInteractionMode;
}

export const GalleryCanvas: React.FC<GalleryCanvasProps> = ({
  polygon,
  guards,
  onAddGuard,
  onRemoveGuard,
  onUpdatePolygon,
  showTriangulation,
  showColoring,
  showBlindSpots,
  onToggleBlindSpots,
  isSoundEnabled,
  onToggleSound,
  fiskProof,
  mode,
}) => {
  const { dict } = useTranslation();
  const sound = useGallerySound(isSoundEnabled);

  const colorMap: Record<
    VertexColor,
    { label: string; fill: string; ring: string; badge: string }
  > = {
    0: {
      label: dict.sim_art_gallery.color_amber,
      fill: 'fill-amber-500',
      ring: 'stroke-amber-500',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    1: {
      label: dict.sim_art_gallery.color_emerald,
      fill: 'fill-emerald-500',
      ring: 'stroke-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    2: {
      label: dict.sim_art_gallery.color_indigo,
      fill: 'fill-indigo-500',
      ring: 'stroke-indigo-500',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
  };

  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [hoveredVertexIdx, setHoveredVertexIdx] = React.useState<number | null>(null);
  const [draggingVertexIdx, setDraggingVertexIdx] = React.useState<number | null>(null);
  const [isSelfIntersecting, setIsSelfIntersecting] = React.useState<boolean>(false);

  // Compute visibility polygons for all placed guards
  const visibilityPolygons = React.useMemo(() => {
    return guards.map(guard => computeVisibilityPolygon(guard, polygon));
  }, [guards, polygon]);

  // Convert client coordinate to SVG viewBox (500x420)
  const getSvgCoordinates = (clientX: number, clientY: number): Point | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const scaleX = 500 / rect.width;
    const scaleY = 420 / rect.height;

    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);
    return {
      x: Math.max(10, Math.min(490, x)),
      y: Math.max(10, Math.min(410, y)),
    };
  };

  // Click on SVG background
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode === 'drag' || draggingVertexIdx !== null) return;
    if (mode === 'vertex') return;

    const clickPoint = getSvgCoordinates(e.clientX, e.clientY);
    if (!clickPoint) return;

    if (isPointInsidePolygon(clickPoint, polygon)) {
      onAddGuard(clickPoint);
      sound.playDeployGuard(guards.length);
    }
  };

  // Click or drag vertex
  const handleVertexMouseDown = (e: React.MouseEvent, vIdx: number) => {
    e.stopPropagation();
    if (mode === 'drag') {
      setDraggingVertexIdx(vIdx);
      sound.playVertexDrag();
      return;
    }

    const v = polygon[vIdx];
    if (!v) return;

    // Check if a guard already exists at or very near this vertex
    const existingGuardIdx = guards.findIndex(g => Math.hypot(g.x - v.x, g.y - v.y) < 12);
    if (existingGuardIdx !== -1) {
      onRemoveGuard(existingGuardIdx);
      sound.playRemoveGuard();
    } else {
      onAddGuard(v);
      sound.playDeployGuard(guards.length);
    }
  };

  // Mouse move on SVG canvas for dragging
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingVertexIdx === null || mode !== 'drag') return;

    const point = getSvgCoordinates(e.clientX, e.clientY);
    if (!point) return;

    const nextPolygon = polygon.map((p, i) => (i === draggingVertexIdx ? point : p));
    const simple = isSimplePolygon(nextPolygon);
    setIsSelfIntersecting(!simple);
    onUpdatePolygon(nextPolygon);
  };

  // Mouse up to finish dragging
  const handleMouseUp = () => {
    if (draggingVertexIdx !== null) {
      setDraggingVertexIdx(null);
      sound.playVertexDrag();
    }
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (draggingVertexIdx !== null) {
        setDraggingVertexIdx(null);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [draggingVertexIdx]);

  const polygonSvgPoints = polygon.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-300/85 bg-white shadow-xs overflow-hidden">
      {/* Canvas Header / Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-2.5 bg-slate-50/70 text-xs text-slate-600 font-sans">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-2 w-2 rounded-full ${
              isSelfIntersecting ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'
            }`}
          />
          <span className="font-semibold text-slate-800">{dict.sim_art_gallery.canvas_title}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 font-medium">
            {mode === 'vertex'
              ? dict.sim_art_gallery.mode_vertex_placement
              : mode === 'free'
                ? dict.sim_art_gallery.mode_free_placement
                : dict.sim_art_gallery.mode_drag_vertices}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Audio Mute & Blind Spot Toggles */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleBlindSpots}
              className={`p-1 rounded-md border text-xs transition-colors ${
                showBlindSpots
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
              }`}
              title={dict.sim_art_gallery.blind_spots_toggle}
            >
              {showBlindSpots ? (
                <Eye className="h-3.5 w-3.5 text-rose-600" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              className={`p-1 rounded-md border text-xs transition-colors ${
                isSoundEnabled
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-100'
              }`}
              title={dict.sim_art_gallery.sound_toggle}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-blue-600" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-slate-500">
            <span>
              {polygon.length} {dict.sim_art_gallery.vertices_count}
            </span>
            <span>&bull;</span>
            <span>
              {guards.length} {dict.sim_art_gallery.guards_count}
            </span>
            <span>&bull;</span>
            <span className="text-amber-700 font-semibold inline-flex items-center">
              <span>{dict.sim_art_gallery.chvatal_bound_label}&lfloor;</span>
              <MathFraction numerator={polygon.length} denominator="3" />
              <span>&rfloor; = {Math.floor(polygon.length / 3)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative w-full aspect-[5/4.2] max-h-[500px] select-none bg-slate-50/40">
        <svg
          ref={svgRef}
          viewBox="0 0 500 420"
          className={`w-full h-full ${
            mode === 'drag'
              ? draggingVertexIdx !== null
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : 'cursor-crosshair'
          }`}
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
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

            {/* Blind Spots Hatched Pattern (Rose Corridor) */}
            <pattern
              id="blind-spots-pattern"
              width="8"
              height="8"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeOpacity="0.45"
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

          {/* 1. Base Room Interior */}
          {/* Layer A: Base unlit floor */}
          <polygon
            points={polygonSvgPoints}
            className="fill-slate-200/60 stroke-none transition-all duration-200"
          />

          {/* Layer B: Blind Spots Hatched Overlay (if enabled) */}
          {showBlindSpots && (
            <polygon
              points={polygonSvgPoints}
              fill="url(#blind-spots-pattern)"
              className="pointer-events-none transition-all duration-300"
            />
          )}

          {/* 2. Illuminated Visibility Polygons (Additive Light Overlay) */}
          {visibilityPolygons.map((vis, idx) => {
            if (vis.points.length < 3) return null;
            const pointsStr = vis.points.map(p => `${p.x},${p.y}`).join(' ');
            return (
              <g key={`vis-${idx}`} className="pointer-events-none">
                {/* Solid light tint masks blind spot hatch */}
                {showBlindSpots && <polygon points={pointsStr} fill="#fef9c3" fillOpacity="0.85" />}
                {/* Golden illuminated vision cone */}
                <polygon
                  points={pointsStr}
                  fill="rgba(245, 158, 11, 0.28)"
                  stroke="rgba(217, 119, 6, 0.55)"
                  strokeWidth="1.2"
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

          {/* 4. Room Exterior Boundary Walls (Crisp Dark Slate or Alert Red if Self-Intersecting) */}
          <polygon
            points={polygonSvgPoints}
            fill="none"
            stroke={isSelfIntersecting ? '#e11d48' : '#1e293b'}
            strokeWidth={isSelfIntersecting ? 3 : 2.5}
            strokeDasharray={isSelfIntersecting ? '6 4' : 'none'}
            strokeLinejoin="round"
            className="pointer-events-none transition-colors duration-200"
          />

          {/* 5. Polygon Vertices (Interactive Dots) */}
          {polygon.map((v, idx) => {
            const isHovered = hoveredVertexIdx === idx;
            const isDragging = draggingVertexIdx === idx;
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
                className={`${mode === 'drag' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} group`}
                onMouseDown={e => handleVertexMouseDown(e, idx)}
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

                {/* Outer Ring on Hover or Drag */}
                {(isHovered || isDragging) && (
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={mode === 'drag' ? 12 : 9}
                    fill="none"
                    stroke={mode === 'drag' ? '#f59e0b' : '#2563eb'}
                    strokeWidth="2"
                    className={isDragging ? 'opacity-90 animate-pulse' : 'opacity-80'}
                  />
                )}

                {/* Vertex Circle */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={isDragging ? 7.5 : isHovered ? 6.5 : showColoring ? 5.5 : 4.5}
                  fill={fillColor}
                  stroke={mode === 'drag' ? '#b45309' : strokeColor}
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Vertex Index Label */}
                <text
                  x={v.x}
                  y={v.y - 9}
                  textAnchor="middle"
                  className="font-mono text-xs fill-slate-600 font-bold pointer-events-none select-none"
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
                sound.playRemoveGuard();
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

        {/* Self-Intersection Alert Overlay */}
        {isSelfIntersecting && (
          <div className="absolute top-3 inset-x-3 flex justify-center pointer-events-none">
            <div className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3.5 py-1.5 border border-rose-300 shadow-xs text-xs text-rose-800 font-semibold animate-pulse">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{dict.sim_art_gallery.drag_self_intersect_error}</span>
            </div>
          </div>
        )}

        {/* Empty State Overlay */}
        {guards.length === 0 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-1.5 border border-slate-300 shadow-xs text-xs text-slate-600">
              <Eye className="h-4 w-4 text-amber-600 animate-pulse" />
              <span>
                {mode === 'vertex'
                  ? dict.sim_art_gallery.empty_vertex_guide
                  : mode === 'free'
                    ? dict.sim_art_gallery.empty_free_guide
                    : dict.sim_art_gallery.mode_drag_hint}
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
            <span>{dict.sim_art_gallery.fisk_legend_title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {([0, 1, 2] as VertexColor[]).map(c => {
              const count = fiskProof.colorCounts[c];
              const isOptimal = c === fiskProof.optimalColor;
              const meta = colorMap[c];
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
                    {meta.label}: <strong className="font-mono">{count}</strong>{' '}
                    {dict.sim_art_gallery.vertices_unit}
                  </span>
                  {isOptimal && (
                    <span className="text-xs uppercase tracking-wide bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono">
                      {dict.sim_art_gallery.minimal_bound_badge}
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
          <span>{dict.sim_art_gallery.canvas_helper_hint}</span>
        </div>
        {guards.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onRemoveGuard(-1); // -1 to trigger clear all
              sound.playRemoveGuard();
            }}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{dict.sim_art_gallery.clear_all_guards_btn}</span>
          </button>
        )}
      </div>
    </div>
  );
};
