'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// Particle system for network node background
class ParticleNetwork {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
  private animationId: number = 0;
  private mouseX = -9999;
  private mouseY = -9999;
  private connectionDist: number;
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.connectionDist = window.innerWidth < 768 ? 100 : 150;
    this.resize();
    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.connectionDist = window.innerWidth < 768 ? 100 : 150;
  }

  initParticles() {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 30 : Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        size: Math.random() * 2 + (isMobile ? 0.5 : 1),
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  }

  updateMouse(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }

  animate() {
    if (this.destroyed) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const cd = this.connectionDist;

    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      const dx = p.x - this.mouseX;
      const dy = p.y - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < cd && dist > 0) {
        p.vx += (dx / dist) * 0.05;
        p.vy += (dy / dist) * 0.05;
      }

      p.vx *= 0.99;
      p.vy *= 0.99;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cd) {
          const opacity = (1 - dist / cd) * 0.15;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(0, 212, 170, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }

    // Draw particles
    this.particles.forEach((p) => {
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(0, 212, 170, ${p.opacity * 0.15})`;
      this.ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(0, 212, 170, ${p.opacity})`;
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.animationId);
  }
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const gdpCounterRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<ParticleNetwork | null>(null);
  const hasShownGdpRef = useRef(false);
  const [showGdp, setShowGdp] = useState(false);

  // Initialize particle network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    networkRef.current = new ParticleNetwork(canvas);

    const handleResize = () => {
      networkRef.current?.resize();
      networkRef.current?.initParticles();
    };
    const handleMouseMove = (e: MouseEvent) => networkRef.current?.updateMouse(e.clientX, e.clientY);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      networkRef.current?.destroy();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Character reveal animation for title
      const title = titleRef.current;
      if (title) {
        const text = title.textContent || '';
        title.innerHTML = text
          .split('')
          .map(
            (char) =>
              `<span class="char" style="display:inline-block;opacity:0;transform:translateY(40px)">${char === ' ' ? '&nbsp;' : char}</span>`
          )
          .join('');

        const chars = title.querySelectorAll('.char');
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          stagger: 0.03,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.5,
        });
      }

      // Subtitle fade in
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 2.5,
          }
        );
      }

      // Scroll indicator fade in + bounce
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 1,
          duration: 1,
          delay: 3.5,
        });
        gsap.to(scrollIndicatorRef.current, {
          y: 10,
          duration: 0.8,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          delay: 4,
        });
      }

    }, sectionRef);

    // GDP counter: show after 3 seconds OR after 3s when user scrolls at all
    const gdpTimer = setTimeout(() => {
      if (!hasShownGdpRef.current) {
        hasShownGdpRef.current = true;
        setShowGdp(true);
      }
    }, 3000);

    // Also show on scroll if 3+ seconds have passed
    const scrollHandler = () => {
      if (hasShownGdpRef.current) return;
      hasShownGdpRef.current = true;
      setShowGdp(true);
    };
    // Only add scroll listener after 3 seconds (so early accidental scrolls don't trigger)
    const scrollTimer = setTimeout(() => {
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }, 3000);

    return () => {
      ctx.revert();
      clearTimeout(gdpTimer);
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', scrollHandler);
    };
  }, []);

  // GDP counter animation
  useEffect(() => {
    if (!showGdp || !gdpCounterRef.current) return;

    const target = 105;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (gdpCounterRef.current) {
          gdpCounterRef.current.textContent = `$${obj.val.toFixed(1)}T`;
        }
      },
    });
  }, [showGdp]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen min-h-[100svh] flex items-center justify-center overflow-hidden"
      aria-label="Hero section - The Modernization Atlas"
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0.6 }}
        aria-hidden="true"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-transparent to-[#0a0a0f] z-10" />

      {/* Radial glow behind text */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,212,170,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6">
        {showGdp ? (
          <div className="flex flex-col items-center gap-4 sm:gap-6 animate-in fade-in duration-700">
            <p className="text-[#4a4a5a] text-xs sm:text-sm uppercase tracking-[0.3em] font-data">
              Global GDP 2024
            </p>
            <div
              ref={gdpCounterRef}
              className="font-data text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-[#ffd700]"
              style={{ textShadow: '0 0 60px rgba(255,215,0,0.3), 0 0 120px rgba(255,215,0,0.1)' }}
              aria-live="polite"
              aria-label="Global GDP counter"
            >
              $0T
            </div>
            <p className="text-[#8a8a9a] text-base sm:text-lg md:text-xl max-w-lg">
              And it&apos;s being <span className="text-[#00d4aa] font-semibold">rewritten by modernization</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#00d4aa]/50" />
              <span className="text-[#4a4a5a] text-[10px] font-data uppercase tracking-wider">Scroll to explore</span>
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#00d4aa]/50" />
            </div>
          </div>
        ) : (
          <>
            <h1
              ref={titleRef}
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#e8e8e8] leading-tight mb-6 sm:mb-8"
            >
              The world economy is being rewritten
            </h1>
            <p
              ref={subtitleRef}
              className="text-base sm:text-xl md:text-2xl text-[#00d4aa] font-heading opacity-0"
            >
              Not by policy alone. By modernization.
            </p>
          </>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-0"
      >
        <span className="text-[#4a4a5a] text-[10px] sm:text-xs uppercase tracking-[0.2em] font-data">
          Scroll to explore
        </span>
        <div className="w-[1px] h-6 sm:h-8 bg-gradient-to-b from-[#00d4aa] to-transparent" />
      </div>
    </section>
  );
}
