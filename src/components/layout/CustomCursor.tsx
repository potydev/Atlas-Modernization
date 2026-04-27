'use client';

import { useEffect, useRef, useCallback } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const targetPos = useRef<CursorPosition>({ x: 0, y: 0 });
  const ringPos = useRef<CursorPosition>({ x: 0, y: 0 });
  const isTouchDevice = useRef(false);
  const cursorType = useRef<'default' | 'hover' | 'text'>('default');

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetPos.current = { x: e.clientX, y: e.clientY };

    // Dot follows precisely
    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    }
  }, []);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[data-cursor]')
    ) {
      cursorType.current = 'hover';
    } else if (
      target.closest('p') ||
      target.closest('h1') ||
      target.closest('h2') ||
      target.closest('h3') ||
      target.closest('h4') ||
      target.closest('h5') ||
      target.closest('h6') ||
      target.closest('span') ||
      target.closest('[data-cursor-text]')
    ) {
      cursorType.current = 'text';
    } else {
      cursorType.current = 'default';
    }
  }, []);

  const handleMouseOut = useCallback(() => {
    cursorType.current = 'default';
  }, []);

  useEffect(() => {
    // Detect touch device - skip event listeners if true
    isTouchDevice.current =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice.current) return;

    // Add class to body so cursor:none only applies when custom cursor is active
    document.body.classList.add('custom-cursor-active');

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });

    let rafId: number;

    const animate = () => {
      // Ring follows with lerp
      ringPos.current.x +=
        (targetPos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y +=
        (targetPos.current.y - ringPos.current.y) * 0.15;

      if (ringRef.current) {
        let size = 32;
        let opacity = 1;

        if (cursorType.current === 'hover') {
          size = 48;
          opacity = 0.5;
        } else if (cursorType.current === 'text') {
          size = 20;
        }

        const half = size / 2;
        ringRef.current.style.transform = `translate(${ringPos.current.x - half}px, ${ringPos.current.y - half}px)`;
        ringRef.current.style.width = `${size}px`;
        ringRef.current.style.height = `${size}px`;
        ringRef.current.style.opacity = `${opacity}`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(rafId);
    };
  }, [handleMouseMove, handleMouseOver, handleMouseOut]);

  return (
    <>
      {/* Dot - hidden on touch devices via CSS @media (hover: none) */}
      <div
        ref={dotRef}
        className="custom-cursor pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#00d4aa',
          zIndex: 99999,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />
      {/* Ring - hidden on touch devices via CSS @media (hover: none) */}
      <div
        ref={ringRef}
        className="custom-cursor pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid #00d4aa',
          zIndex: 99999,
          pointerEvents: 'none',
          willChange: 'transform, width, height, opacity',
          transition:
            'width 0.25s ease, height 0.25s ease, opacity 0.25s ease, border-color 0.25s ease',
        }}
      />
    </>
  );
}
