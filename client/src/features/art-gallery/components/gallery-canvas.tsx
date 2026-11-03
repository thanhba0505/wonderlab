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
import {
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Hand,
  Shield,
  Move,
} from 'lucide-react';
import { MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';
import { GalleryInteractionMode } from './gallery-controls';
import { useGallerySound } from '../utils/gallery-audio';

export interface GalleryCanvasProps {
  polygon: Point[];
  guards: Point[];
  onAddGuard: (point: Point) => void;
  onRemoveGuard: (index: number) => void;
  onUpdatePolygon: (newPolygon: Point[], newGuards?: Point[]) => void;
  showTriangulation: boolean;
  showColoring: boolean;
  showBlindSpots: boolean;
  onToggleBlindSpots: () => void;
  fiskProof: FiskProofResult;
  mode: GalleryInteractionMode;
  onChangeMode: (mode: GalleryInteractionMode) => void;
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
  fiskProof,
  mode,
  onChangeMode,
}) => {
  const { dict } = useTranslation();
  const sound = useGallerySound();

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

  // Pan and Zoom states
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState<number>(1.0);
  const [isPanning, setIsPanning] = React.useState<boolean>(false);

  // Track guards attached to the currently dragged vertex
  const attachedGuardIndicesRef = React.useRef<number[]>([]);
  const polygonRef = React.useRef<Point[]>(polygon);
  polygonRef.current = polygon;
  const guardsRef = React.useRef<Point[]>(guards);
  guardsRef.current = guards;

  const panStartRef = React.useRef<{
    clientX: number;
    clientY: number;
    initialPanX: number;
    initialPanY: number;
    isMoving: boolean;
  } | null>(null);

  // Dynamic ViewBox calculations centered on (250, 210)
  const baseWidth = 600;
  const baseHeight = 500;
  const viewBoxWidth = baseWidth / zoom;
  const viewBoxHeight = baseHeight / zoom;
  const viewBoxX = 250 - viewBoxWidth / 2 - pan.x;
  const viewBoxY = 210 - viewBoxHeight / 2 - pan.y;

  // Compute visibility polygons for all placed guards
  const visibilityPolygons = React.useMemo(() => {
    return guards.map(guard => computeVisibilityPolygon(guard, polygon));
  }, [guards, polygon]);

  // Convert client coordinate to exact SVG user coordinates using getScreenCTM().inverse()
  const getSvgCoordinates = React.useCallback((clientX: number, clientY: number): Point | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(ctm.inverse());
    return {
      x: Math.round(transformed.x),
      y: Math.round(transformed.y),
    };
  }, []);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(3.0, Number((prev * 1.2).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, Number((prev / 1.2).toFixed(2))));
  };

  const handleResetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom(prev => {
      const next = Math.max(0.5, Math.min(3.0, prev * zoomFactor));
      return Number(next.toFixed(2));
    });
  };

  // Mousedown on SVG background to initiate Panning or Click
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Only primary mouse button
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
      isMoving: false,
    };
  };

  // Mousedown on a vertex
  const handleVertexMouseDown = (e: React.MouseEvent, vIdx: number) => {
    // In Pan mode, do not intercept click so canvas can pan without conflict
    if (mode === 'pan') {
      return;
    }

    e.stopPropagation();

    // In Reshape mode, start dragging this vertex and any attached guard(s)
    if (mode === 'drag') {
      setDraggingVertexIdx(vIdx);
      const v = polygonRef.current[vIdx];
      if (v) {
        const attached = guardsRef.current
          .map((g, idx) => ({ idx, dist: Math.hypot(g.x - v.x, g.y - v.y) }))
          .filter(item => item.dist <= 14)
          .map(item => item.idx);
        attachedGuardIndicesRef.current = attached;
      } else {
        attachedGuardIndicesRef.current = [];
      }
      sound.playVertexDrag();
      return;
    }

    const v = polygon[vIdx];
    if (!v) return;

    // In Guard mode, clicking a vertex toggles a guard
    if (mode === 'guard') {
      const existingGuardIdx = guards.findIndex(g => Math.hypot(g.x - v.x, g.y - v.y) < 14);
      if (existingGuardIdx !== -1) {
        onRemoveGuard(existingGuardIdx);
        sound.playRemoveGuard();
      } else {
        onAddGuard(v);
        sound.playDeployGuard(guards.length);
      }
    }
  };

  // Mousedown on an existing guard
  const handleGuardMouseDown = (e: React.MouseEvent, idx: number) => {
    if (mode === 'pan') {
      return;
    }
    e.stopPropagation();

    // In Reshape mode, dragging a guard placed at a vertex drags the vertex & guard together
    if (mode === 'drag') {
      const g = guardsRef.current[idx];
      if (!g) return;

      let closestVIdx = -1;
      let minDist = 14;
      polygonRef.current.forEach((v, vIdx) => {
        const d = Math.hypot(v.x - g.x, v.y - g.y);
        if (d <= minDist) {
          minDist = d;
          closestVIdx = vIdx;
        }
      });

      if (closestVIdx !== -1) {
        setDraggingVertexIdx(closestVIdx);
        const v = polygonRef.current[closestVIdx];
        if (v) {
          const attached = guardsRef.current
            .map((guardItem, gIdx) => ({
              idx: gIdx,
              dist: Math.hypot(guardItem.x - v.x, guardItem.y - v.y),
            }))
            .filter(item => item.dist <= 14)
            .map(item => item.idx);
          attachedGuardIndicesRef.current = attached;
        } else {
          attachedGuardIndicesRef.current = [idx];
        }
        sound.playVertexDrag();
      }
      return;
    }

    // In Guard mode, clicking an existing guard removes it
    if (mode === 'guard') {
      onRemoveGuard(idx);
      sound.playRemoveGuard();
    }
  };

  // Mouse move on SVG canvas for dragging vertex or panning map
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    // 1. Vertex Dragging (Only active in 'drag' mode)
    if (draggingVertexIdx !== null && mode === 'drag') {
      const point = getSvgCoordinates(e.clientX, e.clientY);
      if (!point) return;

      const clampedPoint: Point = {
        x: Math.max(-100, Math.min(600, point.x)),
        y: Math.max(-100, Math.min(520, point.y)),
      };

      const currentPoly = polygonRef.current;
      const currentGuards = guardsRef.current;

      const nextPolygon = currentPoly.map((p, i) => (i === draggingVertexIdx ? clampedPoint : p));
      const simple = isSimplePolygon(nextPolygon);
      setIsSelfIntersecting(!simple);

      let nextGuards = currentGuards;
      if (attachedGuardIndicesRef.current.length > 0) {
        nextGuards = currentGuards.map((g, i) =>
          attachedGuardIndicesRef.current.includes(i) ? clampedPoint : g,
        );
      }

      onUpdatePolygon(nextPolygon, nextGuards);
      return;
    }

    // 2. Map Panning (Active in 'pan' mode, or when dragging background in any mode)
    if (panStartRef.current) {
      const deltaX = e.clientX - panStartRef.current.clientX;
      const deltaY = e.clientY - panStartRef.current.clientY;

      if (!panStartRef.current.isMoving && Math.hypot(deltaX, deltaY) > 3) {
        panStartRef.current.isMoving = true;
        setIsPanning(true);
      }

      if (panStartRef.current.isMoving) {
        const rect = svgRef.current?.getBoundingClientRect();
        const svgScale = rect && rect.width > 0 ? viewBoxWidth / rect.width : 1;
        setPan({
          x: panStartRef.current.initialPanX + deltaX * svgScale,
          y: panStartRef.current.initialPanY + deltaY * svgScale,
        });
      }
    }
  };

  // Mouse up on SVG canvas
  const handleSvgMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingVertexIdx !== null) {
      setDraggingVertexIdx(null);
      attachedGuardIndicesRef.current = [];
      sound.playVertexDrag();
    }

    if (panStartRef.current) {
      const wasMoving = panStartRef.current.isMoving;
      panStartRef.current = null;
      setIsPanning(false);

      // If mouse didn't drag/pan, it was a deliberate click
      if (!wasMoving) {
        // In 'guard' mode, clicking the floor places a guard (snapping to vertex if nearby)
        if (mode === 'guard') {
          const clickPoint = getSvgCoordinates(e.clientX, e.clientY);
          if (clickPoint && isPointInsidePolygon(clickPoint, polygon)) {
            // Check if click was close to a vertex (within 14px)
            const nearVertex = polygon.find(
              v => Math.hypot(v.x - clickPoint.x, v.y - clickPoint.y) < 14,
            );
            const targetPoint = nearVertex ?? clickPoint;

            // Check if guard already exists here
            const existingIdx = guards.findIndex(
              g => Math.hypot(g.x - targetPoint.x, g.y - targetPoint.y) < 14,
            );
            if (existingIdx !== -1) {
              onRemoveGuard(existingIdx);
              sound.playRemoveGuard();
            } else {
              onAddGuard(targetPoint);
              sound.playDeployGuard(guards.length);
            }
          }
        }
      }
    }
  };

  // Global mouseup safeguard
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (draggingVertexIdx !== null) {
        setDraggingVertexIdx(null);
        attachedGuardIndicesRef.current = [];
      }
      if (panStartRef.current) {
        panStartRef.current = null;
        setIsPanning(false);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [draggingVertexIdx]);

  // Context-aware cursor computation
  const getCanvasCursorClass = () => {
    if (isPanning || draggingVertexIdx !== null) return 'cursor-grabbing';
    if (mode === 'pan') return 'cursor-grab';
    if (mode === 'drag') return 'cursor-grab';
    return 'cursor-default';
  };

  const getFloorCursorClass = () => {
    if (isPanning) return 'cursor-grabbing';
    if (mode === 'pan') return 'cursor-grab';
    if (mode === 'guard') return 'cursor-crosshair';
    if (mode === 'drag') return 'cursor-grab';
    return 'cursor-default';
  };

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
          <span className="text-slate-700 font-medium inline-flex items-center gap-1.5">
            {mode === 'pan' && <Hand className="h-3.5 w-3.5 text-blue-600" />}
            {mode === 'guard' && <Shield className="h-3.5 w-3.5 text-blue-600" />}
            {mode === 'drag' && <Move className="h-3.5 w-3.5 text-amber-600" />}
            <span>
              {mode === 'pan'
                ? dict.sim_art_gallery.tool_pan
                : mode === 'guard'
                  ? dict.sim_art_gallery.tool_guard
                  : dict.sim_art_gallery.tool_drag}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Blind Spot Toggle */}
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

      {/* Main Spacious Interactive SVG Canvas with Action Toolbar & Pan/Zoom */}
      <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] select-none bg-slate-50/40 overflow-hidden">
        {/* Floating Action Toolbar Dock on the Canvas */}
        <div className="absolute top-3 left-3 flex items-center gap-1 p-1 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-300/85 shadow-sm z-10">
          <button
            type="button"
            onClick={() => onChangeMode('pan')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              mode === 'pan'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={dict.sim_art_gallery.tool_pan_desc}
          >
            <Hand className="h-4 w-4" />
            <span className="hidden sm:inline font-sans">{dict.sim_art_gallery.tool_pan}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('guard')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              mode === 'guard'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={dict.sim_art_gallery.tool_guard_desc}
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline font-sans">{dict.sim_art_gallery.tool_guard}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('drag')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              mode === 'drag'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={dict.sim_art_gallery.tool_drag_desc}
          >
            <Move className="h-4 w-4" />
            <span className="hidden sm:inline font-sans">{dict.sim_art_gallery.tool_drag}</span>
          </button>
        </div>

        {/* Floating Zoom & Pan Controls in Top-Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-300/80 shadow-xs text-xs text-slate-700 z-10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors active:scale-95"
            title={dict.sim_art_gallery.zoom_in}
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="px-2 py-1 rounded-md hover:bg-slate-100 font-mono text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            title={dict.sim_art_gallery.reset_view}
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors active:scale-95"
            title={dict.sim_art_gallery.zoom_out}
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors active:scale-95"
            title={dict.sim_art_gallery.reset_view}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Interactive SVG Canvas */}
        <svg
          ref={svgRef}
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className={`w-full h-full ${getCanvasCursorClass()}`}
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            {/* Laboratory Coordinate Grid (Infinite repeat) */}
            <pattern id="lab-grid-pattern" width="25" height="25" patternUnits="userSpaceOnUse">
              <path
                d="M 25 0 L 0 0 0 25"
                fill="none"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="1"
              />
            </pattern>

            {/* Blind Spots Hatched Pattern (Rose Corridor) */}
            <pattern
              id="blind-spots-pattern"
              width="10"
              height="10"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="10"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeOpacity="0.45"
              />
            </pattern>

            {/* Gradient for Guard Illumination */}
            <radialGradient id="guard-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Grid Background spanning entire active viewBox */}
          <rect
            x={viewBoxX - 2000}
            y={viewBoxY - 2000}
            width={viewBoxWidth + 4000}
            height={viewBoxHeight + 4000}
            fill="url(#lab-grid-pattern)"
          />

          {/* 1. Base Room Interior */}
          {/* Layer A: Base unlit floor */}
          <polygon
            points={polygonSvgPoints}
            className={`fill-slate-200/65 stroke-none transition-all duration-200 ${getFloorCursorClass()}`}
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
                {showBlindSpots && <polygon points={pointsStr} fill="#fef9c3" fillOpacity="0.88" />}
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

          {/* 5. Polygon Vertices (Interactive Dots & Handles) */}
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
                className={
                  mode === 'pan'
                    ? 'cursor-grab'
                    : mode === 'drag'
                      ? 'cursor-grab active:cursor-grabbing'
                      : 'cursor-pointer'
                }
                onMouseDown={e => handleVertexMouseDown(e, idx)}
                onMouseEnter={() => setHoveredVertexIdx(idx)}
                onMouseLeave={() => setHoveredVertexIdx(null)}
              >
                {/* Expanded Invisible Hitbox for effortless interaction */}
                <circle cx={v.x} cy={v.y} r="16" fill="transparent" />

                {/* Optimal Guard Pulse Halo */}
                {isOptimalGuardVertex && (
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r="14"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="animate-ping opacity-60 pointer-events-none"
                  />
                )}

                {/* Outer Ring on Hover or Drag */}
                {(isHovered || isDragging) && (
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={mode === 'drag' ? 13 : 10}
                    fill="none"
                    stroke={mode === 'drag' ? '#f59e0b' : '#2563eb'}
                    strokeWidth="2.5"
                    className={`${isDragging ? 'opacity-90 animate-pulse' : 'opacity-80'} pointer-events-none`}
                  />
                )}

                {/* Vertex Circle */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={isDragging ? 8 : isHovered ? 7 : showColoring ? 6 : 5}
                  fill={fillColor}
                  stroke={mode === 'drag' ? '#b45309' : strokeColor}
                  strokeWidth="2"
                  className="transition-all duration-150 pointer-events-none"
                />

                {/* Vertex Index Label */}
                <text
                  x={v.x}
                  y={v.y - 11}
                  textAnchor="middle"
                  className="font-mono text-xs fill-slate-700 font-bold pointer-events-none select-none drop-shadow-2xs"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}

          {/* 6. Active Guard Markers (Icons / Illuminated Beacons) */}
          {guards.map((g, idx) => {
            const isAttachedDragging =
              draggingVertexIdx !== null && attachedGuardIndicesRef.current.includes(idx);

            return (
              <g
                key={`guard-${idx}`}
                className={
                  mode === 'pan'
                    ? 'cursor-grab'
                    : mode === 'drag'
                      ? 'cursor-grab active:cursor-grabbing group'
                      : 'cursor-pointer group'
                }
                onMouseDown={e => handleGuardMouseDown(e, idx)}
                onMouseEnter={() => {
                  if (mode === 'drag') {
                    const vIdx = polygon.findIndex(v => Math.hypot(v.x - g.x, v.y - g.y) <= 14);
                    if (vIdx !== -1) {
                      setHoveredVertexIdx(vIdx);
                    }
                  }
                }}
                onMouseLeave={() => {
                  if (mode === 'drag') {
                    setHoveredVertexIdx(null);
                  }
                }}
              >
                {/* Expanded Hitbox */}
                <circle cx={g.x} cy={g.y} r="18" fill="transparent" />

                {/* Outer Pulse Ring */}
                <circle
                  cx={g.x}
                  cy={g.y}
                  r={isAttachedDragging ? 20 : 18}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={isAttachedDragging ? '2.5' : '1.5'}
                  className={`${isAttachedDragging ? 'opacity-90 animate-pulse' : 'animate-ping opacity-40'} pointer-events-none`}
                />

                {/* Guard Background Badge */}
                <circle
                  cx={g.x}
                  cy={g.y}
                  r={isAttachedDragging ? 13 : 12}
                  fill="#b45309"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className={`shadow-sm transition-colors duration-150 pointer-events-none ${
                    mode === 'drag'
                      ? 'group-hover:fill-amber-600'
                      : mode === 'guard'
                        ? 'group-hover:fill-rose-600'
                        : ''
                  }`}
                />

                {/* Guard Inner Core */}
                <circle cx={g.x} cy={g.y} r="4.5" fill="#ffffff" className="pointer-events-none" />

                {/* Guard Number / Label */}
                <text
                  x={g.x}
                  y={g.y + 24}
                  textAnchor="middle"
                  className="font-mono text-xs font-bold fill-slate-900 drop-shadow-xs pointer-events-none select-none"
                >
                  G{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Self-Intersection Alert Overlay */}
        {isSelfIntersecting && (
          <div className="absolute top-14 inset-x-3 flex justify-center pointer-events-none z-10">
            <div className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3.5 py-1.5 border border-rose-300 shadow-xs text-xs text-rose-800 font-semibold animate-pulse">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{dict.sim_art_gallery.drag_self_intersect_error}</span>
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

      {/* Action Footer (Only shown when guards exist to clear) */}
      {guards.length > 0 && (
        <div className="flex items-center justify-end border-t border-slate-200/80 px-4 py-2 bg-white text-xs">
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
        </div>
      )}
    </div>
  );
};
