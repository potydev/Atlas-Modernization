'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassCard from '@/components/ui/GlassCard';
import { pillars } from '@/data/pillars';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PillarIcon = ({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) => {
  const iconMap: Record<string, React.ReactNode> = {
    server: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <circle cx="6" cy="6" r="1" fill={color} />
        <circle cx="6" cy="18" r="1" fill={color} />
      </svg>
    ),
    cpu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
      </svg>
    ),
    leaf: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
    wallet: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
    'graduation-cap': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  };
  return iconMap[icon] || null;
};

export default function Pillars() {
  const sectionRef = useRef<HTMLElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = sectionRef.current?.querySelector('.pillars-title');
      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      const cards = sectionRef.current?.querySelectorAll('.pillar-card');
      cards?.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="pillars" className="relative py-20 sm:py-32 bg-[#0a0a0f]" aria-label="5 Pillars of Modernization">
      <div className="section-container">
        {/* Section header */}
        <div className="pillars-title text-center mb-12 sm:mb-20">
          <p className="text-[#00d4aa] text-xs sm:text-sm uppercase tracking-[0.3em] font-data mb-4">
            The Framework
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#e8e8e8] mb-4 sm:mb-6">
            5 Pillars of <span className="text-[#00d4aa]">Modernization</span>
          </h2>
          <p className="text-[#8a8a9a] text-sm sm:text-lg max-w-2xl mx-auto">
            The foundation upon which modern economies are built. Each pillar reinforces the others,
            creating a compounding effect on growth.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className={`pillar-card rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] ${
                expandedId === pillar.id ? 'sm:col-span-2 lg:col-span-2' : ''
              }`}
              onClick={() => setExpandedId(expandedId === pillar.id ? null : pillar.id)}
              role="button"
              tabIndex={0}
              aria-expanded={expandedId === pillar.id}
              aria-label={`Toggle details for ${pillar.title}`}
              data-cursor
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpandedId(expandedId === pillar.id ? null : pillar.id);
                }
              }}
            >
              <GlassCard
                hover3D
                className="relative overflow-hidden transition-all duration-500 cursor-pointer"
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ background: pillar.color }}
                />

                <div className="pl-3 sm:pl-4">
                  {/* Icon + Title */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-shrink-0">
                      <PillarIcon icon={pillar.icon} color={pillar.color} size={36} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading text-base sm:text-xl font-bold text-[#e8e8e8]">
                        {pillar.title}
                      </h3>
                      <p className="text-[#8a8a9a] text-xs sm:text-sm mt-1 line-clamp-2">{pillar.description}</p>
                    </div>
                  </div>

                  {/* Stat */}
                  <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
                    <span
                      className="font-data text-2xl sm:text-3xl font-bold"
                      style={{ color: pillar.color }}
                    >
                      {pillar.stat}
                    </span>
                    <span className="text-[#4a4a5a] text-[10px] sm:text-xs leading-tight">{pillar.statLabel}</span>
                  </div>

                  {/* Expanded content */}
                  {expandedId === pillar.id && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/5">
                      <p className="text-[#c8c8c8] text-sm sm:text-base leading-relaxed">{pillar.detail}</p>
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        <span
                          className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-data"
                          style={{
                            background: `${pillar.color}15`,
                            color: pillar.color,
                            border: `1px solid ${pillar.color}30`,
                          }}
                        >
                          Key Driver
                        </span>
                        <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-data bg-white/5 text-[#8a8a9a] border border-white/10">
                          High ROI
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${pillar.color}08, transparent 70%)`,
                  }}
                />
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
