'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// Hotspot data
const hotspots = [
  { name: 'Singapore', lat: 1.35, lng: 103.82, modernizationIndex: 92, color: '#00d4aa', region: 'Asia' },
  { name: 'Estonia', lat: 58.6, lng: 25.01, modernizationIndex: 88, color: '#00d4aa', region: 'Europe' },
  { name: 'Rwanda', lat: -1.94, lng: 29.87, modernizationIndex: 58, color: '#ffd700', region: 'Africa' },
  { name: 'South Korea', lat: 35.91, lng: 127.77, modernizationIndex: 91, color: '#00d4aa', region: 'Asia' },
  { name: 'UAE', lat: 23.42, lng: 53.85, modernizationIndex: 85, color: '#00d4aa', region: 'Middle East' },
  { name: 'Israel', lat: 31.05, lng: 34.85, modernizationIndex: 90, color: '#00d4aa', region: 'Middle East' },
  { name: 'India', lat: 20.59, lng: 78.96, modernizationIndex: 62, color: '#ffd700', region: 'Asia' },
  { name: 'China', lat: 35.86, lng: 104.2, modernizationIndex: 78, color: '#4ade80', region: 'Asia' },
  { name: 'Brazil', lat: -14.24, lng: -51.93, modernizationIndex: 55, color: '#ffd700', region: 'South America' },
  { name: 'Indonesia', lat: -0.79, lng: 113.92, modernizationIndex: 52, color: '#ff6b35', region: 'Asia' },
  { name: 'Kenya', lat: -0.02, lng: 37.91, modernizationIndex: 48, color: '#ff6b35', region: 'Africa' },
  { name: 'Nigeria', lat: 9.08, lng: 8.68, modernizationIndex: 42, color: '#ff6b35', region: 'Africa' },
];

// Arc connections
const arcConnections = [
  { start: 'Singapore', end: 'Indonesia', color: ['#00d4aa', '#ff6b35'] },
  { start: 'Estonia', end: 'Kenya', color: ['#00d4aa', '#ff6b35'] },
  { start: 'South Korea', end: 'India', color: ['#00d4aa', '#ffd700'] },
  { start: 'UAE', end: 'Nigeria', color: ['#00d4aa', '#ff6b35'] },
  { start: 'Israel', end: 'Rwanda', color: ['#00d4aa', '#ffd700'] },
  { start: 'China', end: 'Brazil', color: ['#4ade80', '#ffd700'] },
  { start: 'Singapore', end: 'India', color: ['#00d4aa', '#ffd700'] },
  { start: 'South Korea', end: 'Indonesia', color: ['#00d4aa', '#ff6b35'] },
];

const arcsData = arcConnections.map((conn) => {
  const startSpot = hotspots.find((h) => h.name === conn.start);
  const endSpot = hotspots.find((h) => h.name === conn.end);
  return {
    startLat: startSpot?.lat ?? 0,
    startLng: startSpot?.lng ?? 0,
    endLat: endSpot?.lat ?? 0,
    endLng: endSpot?.lng ?? 0,
    color: conn.color,
  };
});

// Flat map SVG for mobile
function FlatWorldMap({ onSpotClick }: { onSpotClick: (spot: typeof hotspots[0]) => void }) {
  const toX = (lng: number) => ((lng + 180) / 360) * 960 + 20;
  const toY = (lat: number) => ((90 - lat) / 180) * 480 + 10;

  return (
    <svg viewBox="0 0 1000 500" className="w-full h-full" style={{ minHeight: '280px' }}>
      <rect x="0" y="0" width="1000" height="500" fill="#0a0a0f" />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} x1="20" y1={10 + i * 70} x2="980" y2={10 + i * 70} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={20 + i * 80} y1="10" x2={20 + i * 80} y2="490" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      ))}
      <path d="M 150 80 L 200 60 L 250 80 L 280 120 L 290 170 L 270 200 L 240 230 L 220 250 L 190 240 L 170 210 L 140 200 L 120 170 L 110 130 L 130 100 Z" fill="rgba(0,212,170,0.06)" stroke="rgba(0,212,170,0.1)" strokeWidth="0.5" />
      <path d="M 230 270 L 260 260 L 290 280 L 310 320 L 300 370 L 280 410 L 260 430 L 240 420 L 230 380 L 220 340 L 215 300 Z" fill="rgba(0,212,170,0.06)" stroke="rgba(0,212,170,0.1)" strokeWidth="0.5" />
      <path d="M 460 70 L 490 60 L 530 70 L 540 100 L 530 130 L 510 140 L 490 130 L 470 120 L 455 100 Z" fill="rgba(0,212,170,0.06)" stroke="rgba(0,212,170,0.1)" strokeWidth="0.5" />
      <path d="M 470 170 L 510 160 L 550 180 L 570 230 L 560 290 L 540 340 L 510 360 L 480 340 L 460 290 L 450 240 L 455 200 Z" fill="rgba(0,212,170,0.06)" stroke="rgba(0,212,170,0.1)" strokeWidth="0.5" />
      <path d="M 550 50 L 620 40 L 700 50 L 770 70 L 810 100 L 820 140 L 800 180 L 760 200 L 720 190 L 680 200 L 640 190 L 600 170 L 570 140 L 555 100 Z" fill="rgba(0,212,170,0.06)" stroke="rgba(0,212,170,0.1)" strokeWidth="0.5" />
      <path d="M 720 210 L 760 200 L 800 210 L 820 240 L 810 260 L 780 270 L 750 260 L 730 240 Z" fill="rgba(0,212,170,0.06)" stroke="rgba(0,212,170,0.1)" strokeWidth="0.5" />
      <path d="M 770 310 L 830 300 L 870 310 L 880 350 L 860 380 L 820 390 L 780 370 L 770 340 Z" fill="rgba(0,212,170,0.06)" stroke="rgba(0,212,170,0.1)" strokeWidth="0.5" />
      {arcConnections.map((conn, i) => {
        const startSpot = hotspots.find((h) => h.name === conn.start);
        const endSpot = hotspots.find((h) => h.name === conn.end);
        if (!startSpot || !endSpot) return null;
        const x1 = toX(startSpot.lng), y1 = toY(startSpot.lat);
        const x2 = toX(endSpot.lng), y2 = toY(endSpot.lat);
        const midX = (x1 + x2) / 2, midY = Math.min(y1, y2) - 30;
        return (
          <path key={`arc-${i}`} d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
            fill="none" stroke="rgba(0,212,170,0.15)" strokeWidth="0.5" strokeDasharray="3 2" />
        );
      })}
      {hotspots.map((spot) => {
        const cx = toX(spot.lng), cy = toY(spot.lat);
        return (
          <g key={spot.name} onClick={() => onSpotClick(spot)} style={{ cursor: 'pointer' }}>
            <circle cx={cx} cy={cy} r="12" fill="none" stroke={spot.color} strokeWidth="0.5" opacity="0.3">
              <animate attributeName="r" from="8" to="16" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r="8" fill={spot.color} opacity="0.15" />
            <circle cx={cx} cy={cy} r="4" fill={spot.color} opacity="0.8" />
            <text x={cx} y={cy - 10} textAnchor="middle" fill="#e8e8e8" fontSize="7" fontFamily="var(--font-jetbrains-mono)" opacity="0.6" className="hidden sm:block">
              {spot.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Loading skeleton
function GlobeSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4" style={{ minHeight: '400px' }}>
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-2 border-[#00d4aa]/20 border-t-[#00d4aa] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#00d4aa] animate-pulse" />
        </div>
      </div>
      <p className="text-[#4a4a5a] text-xs font-data animate-pulse">Initializing globe...</p>
    </div>
  );
}

// Inner component that renders the actual 3D Globe
function GlobeRenderer({
  globeRef,
  dimensions,
  handlePointHover,
  handlePointClick,
}: {
  globeRef: React.RefObject<any>;
  dimensions: { width: number; height: number };
  handlePointHover: (point: any) => void;
  handlePointClick: (point: any) => void;
}) {
  const [GlobeComponent, setGlobeComponent] = useState<typeof import('react-globe.gl').default | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('react-globe.gl')
      .then((mod) => {
        if (!cancelled) setGlobeComponent(() => mod.default);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => { cancelled = true; };
  }, []);

  if (loadError) {
    return <FlatWorldMap onSpotClick={() => {}} />;
  }

  if (!GlobeComponent) {
    return <GlobeSkeleton />;
  }

  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <GlobeComponent
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere={true}
        atmosphereColor="#00d4aa"
        atmosphereAltitude={0.18}
        showGraticules={true}
        showClouds={false}
        animateIn={true}

        // Points
        pointsData={hotspots}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius={0.55}
        pointLabel={(d: any) => {
          const spot = d as typeof hotspots[0];
          return `<div style="background: rgba(10,10,15,0.95); border: 1px solid ${spot.color}; border-radius: 8px; padding: 10px 14px; font-family: 'JetBrains Mono', monospace;">
            <div style="color: ${spot.color}; font-weight: bold; font-size: 14px; margin-bottom: 4px;">${spot.name}</div>
            <div style="color: #8a8a9a; font-size: 11px;">Modernization Index</div>
            <div style="color: ${spot.color}; font-size: 22px; font-weight: bold;">${spot.modernizationIndex}</div>
            <div style="margin-top: 6px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.05); overflow: hidden;">
              <div style="height: 100%; width: ${spot.modernizationIndex}%; background: ${spot.color}; border-radius: 2px;"></div>
            </div>
          </div>`;
        }}
        onPointHover={handlePointHover}
        onPointClick={handlePointClick}
        pointsMerge={false}

        // Arcs
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude={0.15}
        arcStroke={0.3}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={4000}
        arcCircularResolution={6}
        arcsTransitionDuration={1000}
      />
    </div>
  );
}

// ─── Globe animation state machine ───
// IDLE      → auto-rotating freely
// DRAGGING  → user is dragging, OrbitControls handles camera
// RETURNING → smooth ease-out transition from drag position back to auto-rotation
type GlobeState = 'idle' | 'dragging' | 'returning';

export default function GlobeSection() {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const [hoveredSpot, setHoveredSpot] = useState<typeof hotspots[0] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'globe' | 'map'>('globe');
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // ─── Animation state (all refs to avoid re-renders breaking RAF) ───
  const stateRef = useRef<GlobeState>('idle');
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Returning state: smooth transition back to auto-rotation
  const returnStartRef = useRef({ lat: 20, lng: 0, alt: 2 }); // position when returning starts
  const returnProgressRef = useRef(0); // 0 → 1 over the transition
  const RETURN_DURATION = 90; // ~1.5 seconds at 60fps
  const AUTO_ROTATE_SPEED = 0.15; // degrees per frame

  // Target values for auto-rotation
  const TARGET_LAT = 20;
  const TARGET_ALT = 2;

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setViewMode('map');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const nextWidth = Math.round(width);
        const nextHeight = Math.round(height);

        // Ignore transient zero/small measurements during mode switches.
        if (nextWidth <= 1 || nextHeight <= 1) continue;

        setDimensions((prev) => {
          const normalized = {
            width: Math.max(nextWidth, 300),
            height: Math.max(nextHeight, 300),
          };

          if (prev.width === normalized.width && prev.height === normalized.height) {
            return prev;
          }

          return normalized;
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Ensure dimensions snap back to container size when returning from Flat Map.
  useEffect(() => {
    if (viewMode !== 'globe') return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextWidth = Math.round(rect.width);
    const nextHeight = Math.round(rect.height);

    if (nextWidth <= 1 || nextHeight <= 1) return;

    setDimensions({
      width: Math.max(nextWidth, 300),
      height: Math.max(nextHeight, 300),
    });
  }, [viewMode]);

  const handlePointHover = useCallback((point: any) => {
    if (point) {
      const spot = hotspots.find((h) => h.name === point.name);
      if (spot) setHoveredSpot(spot);
    } else {
      setHoveredSpot(null);
    }
  }, []);

  const handlePointClick = useCallback((point: any) => {
    if (point) {
      const spot = hotspots.find((h) => h.name === point.name);
      if (spot) setHoveredSpot(spot);
    }
  }, []);

  // ─── Pointer events for drag detection ───
  useEffect(() => {
    const container = containerRef.current;
    if (!container || viewMode !== 'globe') return;

    const handlePointerDown = () => {
      stateRef.current = 'dragging';
      // Cancel any pending return
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };

    const handlePointerUp = () => {
      if (stateRef.current !== 'dragging') return;

      // Wait 1.5 seconds after user stops dragging, then begin smooth return
      dragTimeoutRef.current = setTimeout(() => {
        const globe = globeRef.current;
        if (globe && typeof globe.pointOfView === 'function') {
          try {
            const current = globe.pointOfView();
            if (current) {
              // Capture the current position as the start of the return transition
              returnStartRef.current = {
                lat: current.lat ?? TARGET_LAT,
                lng: current.lng ?? rotationRef.current,
                alt: current.altitude ?? TARGET_ALT,
              };
              // Set rotationRef to current lng so auto-rotation continues from here
              rotationRef.current = current.lng ?? rotationRef.current;
            }
          } catch {
            // Globe not ready, use current ref values
            returnStartRef.current = {
              lat: TARGET_LAT,
              lng: rotationRef.current,
              alt: TARGET_ALT,
            };
          }
        }
        // Start the smooth return transition
        returnProgressRef.current = 0;
        stateRef.current = 'returning';
      }, 1500);
    };

    container.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };
  }, [viewMode]);

  // ─── Main animation loop ───
  useEffect(() => {
    if (viewMode !== 'globe') return;

    let animationId: number;

    // Smooth ease-out curve (cubic)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    // Lerp with shortest path for longitude (handles wrapping)
    const lerpLng = (from: number, to: number, t: number) => {
      let diff = to - from;
      // Normalize to [-180, 180] for shortest path
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      return from + diff * t;
    };

    const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

    const animate = () => {
      const globe = globeRef.current;
      if (!globe || typeof globe.pointOfView !== 'function') {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const state = stateRef.current;

      if (state === 'idle') {
        // ─── Normal auto-rotation ───
        rotationRef.current += AUTO_ROTATE_SPEED;
        try {
          globe.pointOfView({ lat: TARGET_LAT, lng: rotationRef.current, altitude: TARGET_ALT });
        } catch { /* skip frame */ }
      }
      else if (state === 'returning') {
        // ─── Smooth transition back to auto-rotation ───
        returnProgressRef.current += 1 / RETURN_DURATION;

        if (returnProgressRef.current >= 1) {
          // Transition complete → switch to idle auto-rotation
          returnProgressRef.current = 1;
          stateRef.current = 'idle';
          rotationRef.current = returnStartRef.current.lng + AUTO_ROTATE_SPEED * RETURN_DURATION * easeOutCubic(1);
          try {
            globe.pointOfView({ lat: TARGET_LAT, lng: rotationRef.current, altitude: TARGET_ALT });
          } catch { /* skip frame */ }
        } else {
          const t = easeOutCubic(returnProgressRef.current);
          const start = returnStartRef.current;

          // Lat & Alt: smooth lerp to target
          const currentLat = lerp(start.lat, TARGET_LAT, t);
          const currentAlt = lerp(start.alt, TARGET_ALT, t);

          // Lng: smooth blend from "frozen at start" to "full auto-rotation speed"
          // Use eased t for both position interpolation AND rotation acceleration
          // This creates a smooth "easing in" of rotation speed
          const autoRotateOffset = AUTO_ROTATE_SPEED * RETURN_DURATION * t;
          const currentLng = start.lng + autoRotateOffset;

          // Update rotationRef so when we switch to idle, it continues smoothly
          rotationRef.current = currentLng;

          try {
            globe.pointOfView({ lat: currentLat, lng: currentLng, altitude: currentAlt });
          } catch { /* skip frame */ }
        }
      }
      // state === 'dragging': do nothing, OrbitControls handles the camera

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [viewMode]);

  return (
    <section id="globe" className="relative py-20 sm:py-32 bg-[#0a0a0f]" aria-label="Modernization Globe">
      <div className="section-container">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[#4ade80] text-xs sm:text-sm uppercase tracking-[0.3em] font-data mb-4">
            Global View
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#e8e8e8] mb-4 sm:mb-6">
            The Modernization <span className="text-[#4ade80]">Globe</span>
          </h2>
          <p className="text-[#8a8a9a] text-sm sm:text-lg max-w-2xl mx-auto">
            Explore how nations rank on the Modernization Index. {viewMode === 'globe' ? 'Drag to rotate, scroll to zoom. Hover points for details.' : 'Tap hotspots for details.'}
          </p>
        </div>

        {/* View toggle (desktop only) */}
        {!isMobile && (
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => setViewMode('globe')}
              className={`tap-target px-4 py-2 rounded-full text-xs font-data transition-all ${viewMode === 'globe' ? 'bg-[#4ade80] text-[#0a0a0f]' : 'glass-card text-[#8a8a9a]'}`}
              data-cursor
            >
              🌍 3D Globe
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`tap-target px-4 py-2 rounded-full text-xs font-data transition-all ${viewMode === 'map' ? 'bg-[#4ade80] text-[#0a0a0f]' : 'glass-card text-[#8a8a9a]'}`}
              data-cursor
            >
              🗺️ Flat Map
            </button>
          </div>
        )}

        <div className="max-w-5xl mx-auto relative">
          {/* Globe or Map */}
          <div
            ref={containerRef}
            className="glass-card p-3 sm:p-4 min-h-[320px] sm:min-h-[450px] max-h-[600px] relative overflow-hidden"
          >
            {viewMode === 'globe' ? (
              <div className="w-full h-full" style={{ cursor: 'grab' }}>
                <GlobeRenderer
                  globeRef={globeRef}
                  dimensions={dimensions}
                  handlePointHover={handlePointHover}
                  handlePointClick={handlePointClick}
                />
              </div>
            ) : (
              <FlatWorldMap onSpotClick={setHoveredSpot} />
            )}
          </div>

          {/* Tooltip */}
          {hoveredSpot && (
            <div className="absolute left-3 right-3 bottom-3 sm:left-auto sm:right-8 sm:top-8 sm:bottom-auto sm:w-[280px] glass-card p-3 sm:p-4 pointer-events-none z-30" style={{ animation: 'fadeInTooltip 0.2s ease' }}>
              <h4 className="font-heading text-base sm:text-lg font-bold" style={{ color: hoveredSpot.color }}>
                {hoveredSpot.name}
              </h4>
              <p className="text-[#8a8a9a] text-xs mt-1">Modernization Index</p>
              <p className="font-data text-2xl sm:text-3xl font-bold" style={{ color: hoveredSpot.color }}>
                {hoveredSpot.modernizationIndex}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${hoveredSpot.modernizationIndex}%`, background: hoveredSpot.color }} />
              </div>
              <p className="text-[#4a4a5a] text-[10px] mt-2 font-data">{hoveredSpot.region}</p>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00d4aa]" />
              <span className="text-[#8a8a9a] text-[10px] sm:text-xs font-data">High (75+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffd700]" />
              <span className="text-[#8a8a9a] text-[10px] sm:text-xs font-data">Medium (50-74)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff6b35]" />
              <span className="text-[#8a8a9a] text-[10px] sm:text-xs font-data">Emerging (&lt;50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-dashed border-[#4ade80]/40" />
              <span className="text-[#8a8a9a] text-[10px] sm:text-xs font-data">Modernization Flows</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
