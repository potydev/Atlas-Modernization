'use client';

import { useEffect, useRef, useState } from 'react';

interface ProjectionChartProps {
  data: number[];
  labels: string[];
  color: string;
  title: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export default function ProjectionChart({
  data,
  labels,
  color,
  title,
  valuePrefix = '',
  valueSuffix = '',
}: ProjectionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [resizeVersion, setResizeVersion] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const handleResize = () => {
      setResizeVersion((prev) => prev + 1);
    };

    if (typeof ResizeObserver !== 'undefined' && parent) {
      const observer = new ResizeObserver(() => handleResize());
      observer.observe(parent);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 30, right: 15, bottom: 25, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data) * 1.1;
    const minVal = Math.min(...data) * 0.9;
    const range = maxVal - minVal || 1;

    // Animate the chart drawing
    let progress = 0;
    const startTime = performance.now();
    const duration = 1200;

    const animate = (currentTime: number) => {
      progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease out cubic

      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();
      }

      // Calculate visible points based on animation progress
      const visibleCount = Math.ceil(data.length * easedProgress);
      const points = data.slice(0, visibleCount).map((val, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartW,
        y: padding.top + chartH - ((val - minVal) / range) * chartH,
      }));

      if (points.length < 2) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, `${color}25`);
      gradient.addColorStop(0.5, `${color}10`);
      gradient.addColorStop(1, `${color}00`);

      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Dots
      points.forEach((p, i) => {
        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `${color}20`;
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // X-axis labels
      ctx.fillStyle = '#4a4a5a';
      ctx.font = '9px var(--font-jetbrains-mono), monospace';
      ctx.textAlign = 'center';
      const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];
      labelIndices.forEach((i) => {
        if (i < visibleCount && points[i]) {
          ctx.fillText(labels[i], points[i].x, height - 5);
        }
      });

      // Y-axis labels
      ctx.textAlign = 'right';
      ctx.font = '9px var(--font-jetbrains-mono), monospace';
      ctx.fillStyle = '#4a4a5a';
      ctx.fillText(`${valuePrefix}${maxVal.toFixed(1)}${valueSuffix}`, padding.left - 5, padding.top + 5);
      ctx.fillText(`${valuePrefix}${minVal.toFixed(1)}${valueSuffix}`, padding.left - 5, padding.top + chartH);

      // Title
      ctx.fillStyle = '#8a8a9a';
      ctx.font = '11px var(--font-space-grotesk), sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, padding.left, padding.top - 10);

      // End value
      if (progress >= 1 && points.length > 0) {
        const lastPoint = points[points.length - 1];
        ctx.fillStyle = color;
        ctx.font = 'bold 11px var(--font-jetbrains-mono), monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${valuePrefix}${data[data.length - 1].toFixed(2)}${valueSuffix}`, width - padding.right, padding.top - 10);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [data, labels, color, title, valuePrefix, valueSuffix, resizeVersion]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: 'clamp(180px, 32vh, 240px)' }}
      aria-label={`${title} chart showing projection from ${labels[0]} to ${labels[labels.length - 1]}`}
    />
  );
}
