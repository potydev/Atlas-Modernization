'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';

type LenisControls = {
  scrollTo: (target: HTMLElement | number, options?: { duration?: number }) => void;
  start?: () => void;
  stop?: () => void;
};

const NAV_LINKS = [
  { label: 'The Problem', id: 'problem' },
  { label: 'Pillars', id: 'pillars' },
  { label: 'Data', id: 'data' },
  { label: 'Globe', id: 'globe' },
  { label: 'Simulator', id: 'simulator' },
] as const;

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pledgeCount, setPledgeCount] = useState(2847);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);

      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(Math.min(progress, 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section
  useEffect(() => {
    const sections = ['hero', 'problem', 'pillars', 'data', 'globe', 'simulator', 'cases', 'impact', 'closing'];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Fetch pledge count
  useEffect(() => {
    async function fetchPledgeCount() {
      try {
        const res = await fetch('/api/pledges');
        if (res.ok) {
          const data = await res.json();
          if (data.total) {
            setPledgeCount(data.total);
          }
        }
      } catch {
        // Default to 2847
      }
    }
    fetchPledgeCount();
  }, []);

  // Custom cursor class
  useEffect(() => {
    document.body.classList.add('custom-cursor-active');
    return () => {
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const lenis = (window as typeof window & { __lenis?: LenisControls }).__lenis;

    if (mobileOpen) {
      lenis?.stop?.();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start?.();
      document.body.style.overflow = '';
    }

    return () => {
      lenis?.start?.();
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile menu with Escape for keyboard accessibility
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Ensure menu closes when switching to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollWithEngine = useCallback((target: HTMLElement | number) => {
    const lenis = (window as typeof window & { __lenis?: LenisControls }).__lenis;

    if (lenis) {
      lenis.scrollTo(target, { duration: 1 });
      return;
    }

    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollTo = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    scrollWithEngine(target);
    setMobileOpen(false);
  }, [scrollWithEngine]);

  const scrollToTop = useCallback(() => {
    scrollWithEngine(0);
    setMobileOpen(false);
  }, [scrollWithEngine]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-card backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        {/* Scroll progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 z-10">
          <div
            className="h-full bg-gradient-to-r from-[#00d4aa] via-[#ffd700] to-[#ff6b35] transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        <div className="section-container flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 group tap-target"
            aria-label="Scroll to top"
          >
            <span
              className="font-heading text-xl lg:text-2xl font-bold tracking-wider"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                color: '#00d4aa',
              }}
            >
              ATLAS
            </span>
          </button>

          {/* Center Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`relative tap-target px-1 text-sm tracking-wide transition-colors bg-transparent border-none cursor-pointer ${
                  activeSection === link.id
                    ? 'text-[#00d4aa]'
                    : 'text-[#e8e8e8]/70 hover:text-[#e8e8e8]'
                }`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#00d4aa] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right: Pledge Counter */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => scrollTo('closing')}
              className="tap-target flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00d4aa]/20 bg-[#00d4aa]/5 hover:bg-[#00d4aa]/10 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#00d4aa]" />
              <span
                className="text-xs font-medium text-[#00d4aa]"
                style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
              >
                {pledgeCount.toLocaleString()}
              </span>
              <span className="text-xs text-[#e8e8e8]/50">pledged</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="tap-target lg:hidden relative w-11 h-11 flex flex-col items-center justify-center gap-1.5 bg-transparent border-none cursor-pointer z-[60]"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
          >
            <span
              className="block w-6 h-0.5 bg-[#e8e8e8] transition-all duration-300 origin-center"
              style={{
                transform: mobileOpen
                  ? 'rotate(45deg) translate(3px, 3px)'
                  : 'none',
              }}
            />
            <span
              className="block w-6 h-0.5 bg-[#e8e8e8] transition-all duration-300"
              style={{
                opacity: mobileOpen ? 0 : 1,
                transform: mobileOpen ? 'translateX(-8px)' : 'none',
              }}
            />
            <span
              className="block w-6 h-0.5 bg-[#e8e8e8] transition-all duration-300 origin-center"
              style={{
                transform: mobileOpen
                  ? 'rotate(-45deg) translate(3px, -3px)'
                  : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <div
        id="mobile-nav-menu"
        className="fixed inset-0 z-[55] lg:hidden flex flex-col items-center justify-center transition-all duration-500 overflow-y-auto px-6 py-20"
        style={{
          background: 'rgba(10, 10, 15, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        aria-hidden={!mobileOpen}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setMobileOpen(false);
          }
        }}
      >
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          {NAV_LINKS.map((link, i) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`tap-target px-3 text-xl sm:text-2xl font-heading tracking-wide transition-all duration-300 bg-transparent border-none cursor-pointer ${
                activeSection === link.id ? 'text-[#00d4aa]' : 'text-[#e8e8e8]/70 hover:text-[#00d4aa]'
              }`}
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: mobileOpen ? 1 : 0,
                transitionDelay: mobileOpen ? `${i * 80}ms` : '0ms',
              }}
            >
              {link.label}
            </button>
          ))}

          {/* Mobile pledge counter */}
          <button
            onClick={() => { scrollTo('closing'); }}
            className="tap-target flex items-center gap-2 px-4 py-2 rounded-full border border-[#00d4aa]/20 bg-[#00d4aa]/5 mt-4"
            style={{
              opacity: mobileOpen ? 1 : 0,
              transitionDelay: mobileOpen ? `${NAV_LINKS.length * 80}ms` : '0ms',
              transition: 'opacity 0.3s ease',
            }}
          >
            <Users className="w-4 h-4 text-[#00d4aa]" />
            <span
              className="text-sm font-medium text-[#00d4aa]"
              style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              {pledgeCount.toLocaleString()}
            </span>
            <span className="text-sm text-[#e8e8e8]/50">pledged</span>
          </button>
        </div>
      </div>
    </>
  );
}
