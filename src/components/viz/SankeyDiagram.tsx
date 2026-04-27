'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface SankeyNode {
  name: string;
  category: string;
  color: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

const nodes: SankeyNode[] = [
  { name: 'Agriculture', category: 'traditional', color: '#ff6b35' },
  { name: 'Manufacturing', category: 'traditional', color: '#fb923c' },
  { name: 'Raw Materials', category: 'traditional', color: '#f87171' },
  { name: 'Subsistence Farming', category: 'traditional', color: '#ef4444' },
  { name: 'Agri-Tech', category: 'modern', color: '#00d4aa' },
  { name: 'Smart Manufacturing', category: 'modern', color: '#4ade80' },
  { name: 'Digital Services', category: 'modern', color: '#34d399' },
  { name: 'Green Energy', category: 'modern', color: '#22d3ee' },
  { name: 'Fintech', category: 'modern', color: '#38bdf8' },
];

const links: SankeyLink[] = [
  { source: 0, target: 4, value: 35 },
  { source: 1, target: 5, value: 40 },
  { source: 2, target: 6, value: 25 },
  { source: 3, target: 4, value: 20 },
  { source: 0, target: 7, value: 15 },
  { source: 1, target: 6, value: 20 },
  { source: 2, target: 7, value: 15 },
  { source: 3, target: 8, value: 25 },
  { source: 0, target: 8, value: 10 },
  { source: 1, target: 5, value: 15 },
];

// Shimmer loading skeleton
function SankeySkeleton() {
  return (
    <div className="glass-card p-4">
      <h3 className="text-center text-sm text-[#8a8a9a] font-data uppercase tracking-wider mb-4">
        Sector Transformation Flow
      </h3>
      <div className="space-y-4" style={{ height: 'clamp(280px, 50vh, 420px)' }}>
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded shimmer" />
                <div className="w-16 h-3 rounded shimmer" />
              </div>
            ))}
          </div>
          <div className="text-[#4a4a5a] text-lg">→</div>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-16 h-3 rounded shimmer" />
                <div className="w-4 h-4 rounded shimmer" />
              </div>
            ))}
          </div>
        </div>
        {/* Simulated flow lines */}
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="w-px h-12 shimmer rounded" />
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shimmer" />
          <div className="w-20 h-3 rounded shimmer" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shimmer" />
          <div className="w-20 h-3 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function SankeyDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isReady, setIsReady] = useState(false);

  const drawDiagram = useCallback(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 800;
    const isMobile = width < 500;
    const height = isMobile ? 340 : 420;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const horizontalMargin = isMobile
      ? Math.max(36, Math.round(width * 0.15))
      : Math.max(90, Math.round(width * 0.14));

    const margin = { top: 20, right: horizontalMargin, bottom: 20, left: horizontalMargin };
    const innerWidth = Math.max(120, width - margin.left - margin.right);
    const innerHeight = Math.max(180, height - margin.top - margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const traditionalNodes = [0, 1, 2, 3];
    const modernNodes = [4, 5, 6, 7, 8];

    const nodeWidth = isMobile ? 14 : 18;
    const nodePadding = isMobile ? (width < 420 ? 10 : 14) : 20;

    // Position traditional nodes on left
    const leftHeight = traditionalNodes.length * (nodeWidth + nodePadding) - nodePadding;
    const leftStart = (innerHeight - leftHeight) / 2;

    const nodePositions = nodes.map((_, i) => {
      if (i < 4) {
        return {
          x: 0,
          y: leftStart + i * (nodeWidth + nodePadding),
          width: nodeWidth,
          height: nodeWidth,
        };
      } else {
        const modernHeight = modernNodes.length * (nodeWidth + nodePadding) - nodePadding;
        const modernStart = (innerHeight - modernHeight) / 2;
        return {
          x: innerWidth - nodeWidth,
          y: modernStart + (i - 4) * (nodeWidth + nodePadding),
          width: nodeWidth,
          height: nodeWidth,
        };
      }
    });

    // Defs for gradients
    const defs = svg.append('defs');

    links.forEach((link, i) => {
      const sourceNode = nodes[link.source];
      const targetNode = nodes[link.target];
      const gradientId = `link-gradient-${i}`;

      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', nodePositions[link.source].x + nodePositions[link.source].width + margin.left)
        .attr('x2', nodePositions[link.target].x + margin.left);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', sourceNode.color)
        .attr('stop-opacity', 0.6);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', targetNode.color)
        .attr('stop-opacity', 0.6);
    });

    // Draw links with gradient
    links.forEach((link, i) => {
      const source = nodePositions[link.source];
      const target = nodePositions[link.target];
      const sourceY = source.y + source.height / 2;
      const targetY = target.y + target.height / 2;
      const midX = (source.x + source.width + target.x) / 2;

      const path = d3.path();
      path.moveTo(source.x + source.width, sourceY);
      path.bezierCurveTo(midX, sourceY, midX, targetY, target.x, targetY);

      g.append('path')
        .attr('d', path.toString())
        .attr('fill', 'none')
        .attr('stroke', `url(#link-gradient-${i})`)
        .attr('stroke-width', Math.max(1.5, link.value / 6))
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .delay(i * 80)
        .attr('opacity', 1);
    });

    // Draw nodes with glow
    nodePositions.forEach((pos, i) => {
      const node = nodes[i];
      const color = node.color;

      // Glow effect
      g.append('rect')
        .attr('x', pos.x - 2)
        .attr('y', pos.y - 2)
        .attr('width', pos.width + 4)
        .attr('height', pos.height + 4)
        .attr('fill', color)
        .attr('rx', 6)
        .attr('opacity', 0.15)
        .attr('filter', 'blur(4px)');

      // Main node
      g.append('rect')
        .attr('x', pos.x)
        .attr('y', pos.y)
        .attr('width', pos.width)
        .attr('height', pos.height)
        .attr('fill', color)
        .attr('rx', 4)
        .attr('opacity', 0)
        .transition()
        .duration(600)
        .delay(i * 60)
        .attr('opacity', 0.9);

      // Labels
      const labelX = i < 4 ? pos.x - 8 : pos.x + pos.width + 8;
      const anchor = i < 4 ? 'end' : 'start';

      g.append('text')
        .attr('x', labelX)
        .attr('y', pos.y + pos.height / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', anchor)
        .attr('fill', '#e8e8e8')
        .attr('font-size', isMobile ? '9px' : '11px')
        .attr('font-family', 'var(--font-space-grotesk)')
        .attr('font-weight', '500')
        .attr('opacity', 0)
        .transition()
        .duration(400)
        .delay(i * 60 + 200)
        .attr('opacity', 1)
        .text(nodes[i].name);
    });

    // Column headers
    const headerY = -8;
    g.append('text')
      .attr('x', 0)
      .attr('y', headerY)
      .attr('text-anchor', 'start')
      .attr('fill', '#ff6b35')
      .attr('font-size', isMobile ? '8px' : '10px')
      .attr('font-family', 'var(--font-jetbrains-mono)')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.1em')
      .text('TRADITIONAL');

    g.append('text')
      .attr('x', innerWidth)
      .attr('y', headerY)
      .attr('text-anchor', 'end')
      .attr('fill', '#00d4aa')
      .attr('font-size', isMobile ? '8px' : '10px')
      .attr('font-family', 'var(--font-jetbrains-mono)')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.1em')
      .text('MODERN');

    // Arrow in the middle
    const arrowX = innerWidth / 2;
    const arrowY = innerHeight / 2;
    g.append('text')
      .attr('x', arrowX)
      .attr('y', arrowY)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#4a4a5a')
      .attr('font-size', isMobile ? '16px' : '20px')
      .text('→');

    g.append('text')
      .attr('x', arrowX)
      .attr('y', arrowY + (isMobile ? 16 : 20))
      .attr('text-anchor', 'middle')
      .attr('fill', '#4a4a5a')
      .attr('font-size', isMobile ? '6px' : '8px')
      .attr('font-family', 'var(--font-jetbrains-mono)')
      .attr('letter-spacing', '0.15em')
      .text('TRANSFORMATION');

  }, []);

  useEffect(() => {
    drawDiagram();
    // Defer ready state to avoid synchronous setState in effect
    const raf = requestAnimationFrame(() => setIsReady(true));
    const handleResize = () => drawDiagram();
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [drawDiagram]);

  if (!isReady) {
    return <SankeySkeleton />;
  }

  return (
    <div className="glass-card p-4">
      <h3 className="text-center text-sm text-[#8a8a9a] font-data uppercase tracking-wider mb-4">
        Sector Transformation Flow
      </h3>
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: 'clamp(280px, 50vh, 420px)' }}
        aria-label="Sankey diagram showing sector transformation from traditional to modern"
        role="img"
      />
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff6b35]" />
          <span className="text-[#8a8a9a] text-xs font-data">Traditional Sectors</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00d4aa]" />
          <span className="text-[#8a8a9a] text-xs font-data">Modern Sectors</span>
        </div>
      </div>
    </div>
  );
}
