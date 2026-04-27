'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type LenisWithControls = Lenis & {
  resize?: () => void;
};

declare global {
  interface Window {
    __lenis?: LenisWithControls;
  }
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    }) as LenisWithControls;

    lenisRef.current = lenis;
    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const handleRefresh = () => {
      lenis.resize?.();
    };
    ScrollTrigger.addEventListener('refresh', handleRefresh);

    const requestRefresh = () => {
      ScrollTrigger.refresh();
    };
    const rafId = window.requestAnimationFrame(requestRefresh);
    window.addEventListener('load', requestRefresh);
    window.addEventListener('resize', requestRefresh);
    window.addEventListener('orientationchange', requestRefresh);

    // Use GSAP's ticker to drive Lenis instead of a separate RAF loop.
    // This ensures Lenis and GSAP ScrollTrigger update in the same
    // animation frame, preventing timing conflicts with pin/scrub.
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('load', requestRefresh);
      window.removeEventListener('resize', requestRefresh);
      window.removeEventListener('orientationchange', requestRefresh);
      ScrollTrigger.removeEventListener('refresh', handleRefresh);
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(tickerCallback);
      if (window.__lenis === lenis) {
        delete window.__lenis;
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
