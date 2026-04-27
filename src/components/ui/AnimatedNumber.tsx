'use client';

import { useEffect, useRef } from 'react';
import type { AnimatedNumberProps } from '@/types';

export default function AnimatedNumber({
  target,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedNumberProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number>();
  const hasAnimatedRef = useRef(false);
  const prevTargetRef = useRef(0);
  const currentDisplayRef = useRef(0);

  // Helper: animate from `from` to `to` using requestAnimationFrame
  const animateFromTo = (from: number, to: number) => {
    const element = elementRef.current;
    if (!element) return;

    // Cancel any in-flight animation
    if (animationRef.current != null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      currentDisplayRef.current = current;

      if (element) {
        element.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Effect 1: Initial IntersectionObserver animation (0 → target)
  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimatedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          prevTargetRef.current = target;
          observer.disconnect();

          animateFromTo(0, target);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []); // Run once on mount

  // Effect 2: Re-animate when target changes (after initial animation)
  useEffect(() => {
    // Only re-animate if we've already done the initial animation
    // and the target actually changed
    if (!hasAnimatedRef.current) return;
    if (prevTargetRef.current === target) return;

    const from = currentDisplayRef.current;
    prevTargetRef.current = target;

    animateFromTo(from, target);
  }, [target, duration, prefix, suffix, decimals]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={elementRef}
      className={`font-data tabular-nums ${className}`}
    >
      {prefix}0{suffix}
    </span>
  );
}
