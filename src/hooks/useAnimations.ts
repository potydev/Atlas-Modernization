'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useScrollProgress() {
  const progressRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = docHeight > 0 ? scrollTop / docHeight : 0;
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return progressRef;
}

export function useGsapTimeline() {
  const tlRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
      }
    };
  }, []);

  const getTimeline = useCallback(() => {
    return tlRef.current;
  }, []);

  return { tlRef, getTimeline };
}

export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const isInViewRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView: isInViewRef };
}
