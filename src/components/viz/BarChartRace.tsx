'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import gdpData from '@/data/gdp-by-country.json';
import type { GDPCountryData } from '@/types';

const COLORS: Record<string, string> = {
  'United States': '#00d4aa',
  'China': '#ff6b35',
  'Japan': '#ffd700',
  'Germany': '#4ade80',
  'India': '#a78bfa',
  'United Kingdom': '#f472b6',
  'France': '#38bdf8',
  'Brazil': '#fb923c',
  'Italy': '#818cf8',
  'Canada': '#34d399',
  'South Korea': '#f87171',
  'Russia': '#22d3ee',
  'Australia': '#a3e635',
  'Spain': '#c084fc',
  'Indonesia': '#fbbf24',
};

const DEFAULT_COLORS = ['#00d4aa', '#ff6b35', '#ffd700', '#4ade80', '#a78bfa', '#f472b6', '#38bdf8', '#fb923c', '#818cf8', '#34d399', '#f87171', '#22d3ee'];

const years = gdpData[0].values.map((v) => v.year);

// Country flag emojis
const FLAGS: Record<string, string> = {
  'United States': '🇺🇸', 'China': '🇨🇳', 'Japan': '🇯🇵', 'Germany': '🇩🇪',
  'India': '🇮🇳', 'United Kingdom': '🇬🇧', 'France': '🇫🇷', 'Brazil': '🇧🇷',
  'Italy': '🇮🇹', 'Canada': '🇨🇦', 'South Korea': '🇰🇷', 'Russia': '🇷🇺',
  'Australia': '🇦🇺', 'Spain': '🇪🇸', 'Indonesia': '🇮🇩',
};

// Smooth interpolation for GDP values between year steps
function getInterpolatedGDP(country: GDPCountryData, fractionalIndex: number): number {
  const lowerIdx = Math.floor(fractionalIndex);
  const upperIdx = Math.min(lowerIdx + 1, country.values.length - 1);
  const t = fractionalIndex - lowerIdx;

  const lowerVal = country.values[lowerIdx]?.gdp ?? 0;
  const upperVal = country.values[upperIdx]?.gdp ?? 0;

  // Smoothstep for natural easing between years
  const easedT = t * t * (3 - 2 * t);
  return lowerVal + (upperVal - lowerVal) * easedT;
}

// Shimmer loading skeleton
function BarChartSkeleton() {
  return (
    <div className="w-full">
      <div className="text-center mb-4 sm:mb-6">
        <span className="text-[#8a8a9a] text-xs sm:text-sm font-data uppercase tracking-wider">
          GDP by Country ·
        </span>
        <span className="font-data text-4xl sm:text-5xl font-bold text-transparent ml-2 inline-block w-16 shimmer rounded">
          &nbsp;
        </span>
      </div>
      <div className="glass-card p-2 sm:p-4">
        <div className="space-y-3 p-4" style={{ height: 'clamp(300px, 50vh, 450px)' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="h-5 rounded shimmer"
                style={{
                  width: `${70 - i * 6}%`,
                  opacity: 1 - i * 0.08,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Data type for chart bars
interface BarData {
  country: string;
  code: string;
  gdp: number;
}

// Smooth bar state for lerping
interface BarState {
  y: number;
  width: number;
  gdp: number;
}

interface RenderBarData extends BarData {
  visualY: number;
  visualWidth: number;
  visualGdp: number;
}

export default function BarChartRace() {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isReady, setIsReady] = useState(false);

  // ─── Smooth animation state (refs for RAF) ───
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastYearUpdateRef = useRef(0);
  const needsRenderRef = useRef(true); // Track if bars need to settle

  // ─── Smooth bar positions (lerp between frames) ───
  // Current visual state of each bar (what's actually rendered)
  const barStatesRef = useRef<Map<string, BarState>>(new Map());
  // Target state of each bar (what we're lerping towards)
  const barTargetsRef = useRef<Map<string, BarState>>(new Map());
  // Lerp factor — how quickly bars move to target (0-1, higher = faster)
  const LERP_FACTOR = 0.14;
  // Threshold to consider a bar "settled" at its target
  const SETTLE_THRESHOLD = 0.5;

  // Keep refs in sync with state
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const getColor = (country: string, index: number) => {
    return COLORS[country] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  const getChartLayout = useCallback(() => {
    const containerEl = chartContainerRef.current;
    const svgEl = svgRef.current;

    const width = Math.max(
      320,
      Math.round(containerEl?.clientWidth || svgEl?.clientWidth || 800)
    );
    const height = Math.max(
      300,
      Math.round(containerEl?.clientHeight || svgEl?.clientHeight || 450)
    );

    const isCompact = width < 680;
    const rightMargin = isCompact
      ? Math.max(120, Math.round(width * 0.32))
      : Math.max(170, Math.round(width * 0.24));

    const margin = { top: 20, right: rightMargin, bottom: 20, left: 10 };

    return {
      width,
      height,
      margin,
      innerWidth: Math.max(40, width - margin.left - margin.right),
      innerHeight: Math.max(40, height - margin.top - margin.bottom),
      isCompact,
    };
  }, []);

  // ─── Compute target bar positions from data ───
  const computeTargets = useCallback(
    (fractionalIndex: number): BarData[] => {
      const { innerWidth, innerHeight, isCompact } = getChartLayout();
      const barCount = isCompact ? 8 : 12;

      const data: BarData[] = gdpData
        .map((d: GDPCountryData) => ({
          country: d.country,
          code: d.code,
          gdp: getInterpolatedGDP(d, fractionalIndex),
        }))
        .sort((a, b) => b.gdp - a.gdp)
        .slice(0, barCount);

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.gdp) || 1])
        .range([0, innerWidth]);

      const y = d3
        .scaleBand()
        .domain(data.map((d) => d.country))
        .range([0, innerHeight])
        .padding(0.2);

      // Update targets
      barTargetsRef.current.clear();
      data.forEach((d) => {
        barTargetsRef.current.set(d.country, {
          y: y(d.country) || 0,
          width: x(d.gdp),
          gdp: d.gdp,
        });
      });

      return data;
    },
    [getChartLayout]
  );

  // ─── Lerp bar states towards targets and render ───
  const renderFrame = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    const { width, height, margin, innerHeight, isCompact } = getChartLayout();

    svg.attr('width', width).attr('height', height);

    const y = d3
      .scaleBand()
      .domain(Array.from(barTargetsRef.current.keys()))
      .range([0, innerHeight])
      .padding(0.2);

    const bandHeight = y.bandwidth();

    // ─── Lerp each bar's current state towards target ───
    let allSettled = true;

    for (const [country, target] of barTargetsRef.current) {
      const current = barStatesRef.current.get(country);
      if (current) {
        // Smooth lerp
        current.y += (target.y - current.y) * LERP_FACTOR;
        current.width += (target.width - current.width) * LERP_FACTOR;
        current.gdp += (target.gdp - current.gdp) * LERP_FACTOR;

        // Check if settled
        if (
          Math.abs(current.y - target.y) > SETTLE_THRESHOLD ||
          Math.abs(current.width - target.width) > SETTLE_THRESHOLD
        ) {
          allSettled = false;
        }
      } else {
        // New bar — start from off-screen bottom for smooth enter
        barStatesRef.current.set(country, {
          y: target.y + 60, // Start below for enter animation
          width: 0,
          gdp: target.gdp,
        });
        allSettled = false;
      }
    }

    // Remove bars that are no longer in targets
    for (const country of barStatesRef.current.keys()) {
      if (!barTargetsRef.current.has(country)) {
        barStatesRef.current.delete(country);
      }
    }

    // Update needsRender flag
    needsRenderRef.current = !allSettled;

    // ─── Build data array from current lerped states ───
    const data: RenderBarData[] = [];
    for (const [country, state] of barStatesRef.current) {
      const target = barTargetsRef.current.get(country);
      if (!target) continue;
      const countryData = gdpData.find((d) => d.country === country);
      data.push({
        country,
        code: countryData?.code || country.substring(0, 2),
        gdp: target.gdp,
        visualY: state.y,
        visualWidth: state.width,
        visualGdp: state.gdp,
      });
    }

    // Sort by visual Y position (top = highest GDP)
    data.sort((a, b) => a.visualY - b.visualY);

    const g = svg.select<SVGGElement>('.chart-group').empty()
      ? svg
          .append<SVGGElement>('g')
          .attr('class', 'chart-group')
          .attr('transform', `translate(${margin.left},${margin.top})`)
      : svg.select<SVGGElement>('.chart-group');

    const fontSize = isCompact ? '9px' : '12px';
    const valueFontSize = isCompact ? '8px' : '11px';

    // ─── Bars ───
    const bars = g.selectAll<SVGRectElement, RenderBarData>('.bar')
      .data(data, (d) => d.country);

    bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('rx', 3)
      .attr('fill', (d, i) => getColor(d.country, i))
      .merge(bars)
      .attr('y', (d) => d.visualY)
      .attr('height', bandHeight)
      .attr('width', (d) => Math.max(0, d.visualWidth))
      .attr('fill', (d, i) => getColor(d.country, i))
      .attr('opacity', 0.9);

    bars.exit().remove();

    // ─── Country labels ───
    const labels = g.selectAll<SVGTextElement, RenderBarData>('.bar-label')
      .data(data, (d) => d.country);

    labels.enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('dy', '0.35em')
      .attr('font-size', fontSize)
      .attr('fill', '#e8e8e8')
      .attr('font-family', 'var(--font-jetbrains-mono)')
      .merge(labels)
      .attr('x', (d) => d.visualWidth + 6)
      .attr('y', (d) => d.visualY + bandHeight / 2)
      .text((d) => {
        const flag = FLAGS[d.country] || '';
        const gdpStr = d.visualGdp >= 1000
          ? `$${(d.visualGdp / 1000).toFixed(1)}T`
          : `$${d.visualGdp.toFixed(d.visualGdp < 10 ? 1 : 0)}B`;
        return isCompact ? `${flag} ${d.code}` : `${flag} ${d.country} ${gdpStr}`;
      });

    labels.exit().remove();

    // ─── Value labels inside bars ───
    const valueLabels = g.selectAll<SVGTextElement, RenderBarData>('.bar-value')
      .data(data, (d) => d.country);

    valueLabels.enter()
      .append('text')
      .attr('class', 'bar-value')
      .attr('dy', '0.35em')
      .attr('font-size', valueFontSize)
      .attr('fill', '#0a0a0f')
      .attr('font-weight', 'bold')
      .attr('font-family', 'var(--font-jetbrains-mono)')
      .attr('text-anchor', 'end')
      .merge(valueLabels)
      .attr('x', (d) => Math.min(d.visualWidth - 6, d.visualWidth * 0.85))
      .attr('y', (d) => d.visualY + bandHeight / 2)
      .text((d) =>
        d.visualWidth > 50
          ? `$${d.visualGdp >= 1000 ? (d.visualGdp / 1000).toFixed(1) + 'T' : d.visualGdp.toFixed(d.visualGdp < 10 ? 1 : 0) + 'B'}`
          : ''
      );

    valueLabels.exit().remove();
  }, [getChartLayout]);

  // ─── Initial setup ───
  useEffect(() => {
    progressRef.current = 0;
    computeTargets(0);
    // Initialize bar states directly at target (no lerp on first frame)
    for (const [country, target] of barTargetsRef.current) {
      barStatesRef.current.set(country, { ...target });
    }
    renderFrame();
    const raf = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ─── Handle resize ───
  useEffect(() => {
    const syncToContainerSize = () => {
      computeTargets(progressRef.current);
      // On resize, snap states to targets immediately
      for (const [country, target] of barTargetsRef.current) {
        barStatesRef.current.set(country, { ...target });
      }
      renderFrame();
    };

    if (typeof ResizeObserver !== 'undefined') {
      const containerEl = chartContainerRef.current;
      if (!containerEl) return;

      const observer = new ResizeObserver(() => {
        syncToContainerSize();
      });

      observer.observe(containerEl);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', syncToContainerSize);
    return () => window.removeEventListener('resize', syncToContainerSize);
  }, [computeTargets, renderFrame]);

  // ─── RAF-based smooth animation loop ───
  useEffect(() => {
    // Base speed: how many year-indices per second at 1x
    const BASE_SPEED = 0.35;

    const animate = (timestamp: number) => {
      const playing = isPlayingRef.current;

      // When not playing and bars are settled, sleep but keep loop alive
      if (!playing && !needsRenderRef.current) {
        lastTimeRef.current = null;
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      // When not playing but bars still settling, keep rendering lerp
      if (!playing) {
        lastTimeRef.current = null;
        renderFrame();
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Clamp delta to avoid huge jumps after tab switch
      const clampedDelta = Math.min(deltaMs, 100);

      // Advance progress
      const increment = (clampedDelta / 1000) * BASE_SPEED * speedRef.current;
      progressRef.current += increment;

      const maxProgress = years.length - 1;
      if (progressRef.current >= maxProgress) {
        progressRef.current = maxProgress;
        setCurrentYearIndex(maxProgress);
        setIsPlaying(false);
        computeTargets(maxProgress);
        renderFrame();
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Throttle React state updates for the year display
      const now = performance.now();
      if (now - lastYearUpdateRef.current > 80) {
        const newYearIdx = Math.min(Math.round(progressRef.current), years.length - 1);
        setCurrentYearIndex(newYearIdx);
        lastYearUpdateRef.current = now;
      }

      // Update targets and render with lerp
      computeTargets(progressRef.current);
      renderFrame();

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [computeTargets, renderFrame]);

  // ─── When user clicks a year on the timeline ───
  const handleYearClick = useCallback((index: number) => {
    progressRef.current = index;
    setCurrentYearIndex(index);
    setIsPlaying(false);
    lastTimeRef.current = null;
    computeTargets(index);
    // Snap to target when user explicitly clicks
    for (const [country, target] of barTargetsRef.current) {
      barStatesRef.current.set(country, { ...target });
    }
    needsRenderRef.current = false;
    renderFrame();
  }, [computeTargets, renderFrame]);

  // ─── Play/Pause ───
  const handlePlayPause = useCallback(() => {
    if (currentYearIndex >= years.length - 1 && !isPlaying) {
      progressRef.current = 0;
      setCurrentYearIndex(0);
      computeTargets(0);
      for (const [country, target] of barTargetsRef.current) {
        barStatesRef.current.set(country, { ...target });
      }
      renderFrame();
    }
    needsRenderRef.current = true;
    setIsPlaying((prev) => !prev);
  }, [currentYearIndex, isPlaying, computeTargets, renderFrame]);

  if (!isReady) {
    return <BarChartSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Year display with glow */}
      <div className="text-center mb-4 sm:mb-6">
        <span className="text-[#8a8a9a] text-xs sm:text-sm font-data uppercase tracking-wider">
          GDP by Country ·
        </span>
        <span
          className="font-data text-4xl sm:text-5xl font-bold text-[#ffd700] ml-2"
          style={{ textShadow: '0 0 30px rgba(255,215,0,0.3)' }}
        >
          {years[currentYearIndex]}
        </span>
      </div>

      {/* Chart */}
      <div className="glass-card p-2 sm:p-4">
        <div
          ref={chartContainerRef}
          className="w-full"
          style={{ height: 'clamp(300px, 50vh, 450px)' }}
        >
          <svg
            ref={svgRef}
            className="block h-full w-full"
            role="img"
            aria-label="Bar chart race showing GDP by country over time"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
        <button
          onClick={handlePlayPause}
          className="tap-target glass-card px-3 sm:px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors text-xs sm:text-sm"
          data-cursor
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#00d4aa">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#00d4aa">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
          <span className="text-[#e8e8e8] font-data">
            {isPlaying ? 'Pause' : 'Play'}
          </span>
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-[#4a4a5a] text-[10px] sm:text-xs font-data">Speed:</span>
          {[0.5, 1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`tap-target px-2 py-1 rounded text-[10px] sm:text-xs font-data transition-all ${
                speed === s
                  ? 'bg-[#00d4aa] text-[#0a0a0f]'
                  : 'bg-white/5 text-[#8a8a9a] hover:bg-white/10'
              }`}
              data-cursor
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Year timeline */}
      <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-3 sm:mt-4 px-2">
        {years.map((year, i) => (
          <button
            key={year}
            onClick={() => handleYearClick(i)}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-200 flex-1 max-w-[32px] ${
              i === currentYearIndex
                ? 'bg-[#00d4aa]'
                : i < currentYearIndex
                ? 'bg-[#00d4aa]/40'
                : 'bg-white/10'
            }`}
            aria-label={`Go to year ${year}`}
            data-cursor
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 px-2">
        <span className="text-[#4a4a5a] text-[10px] sm:text-xs font-data">{years[0]}</span>
        <span className="text-[#4a4a5a] text-[10px] sm:text-xs font-data">{years[years.length - 1]}</span>
      </div>
    </div>
  );
}
