'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const problemData = [
  { stat: '60%', label: 'of GDP in developing nations comes from traditional sectors', icon: '🏭' },
  { stat: '2.5B', label: 'workers in jobs vulnerable to automation', icon: '👷' },
  { stat: '$4.7T', label: 'annual productivity gap between modernized and non-modernized economies', icon: '📊' },
];

const narrativeParagraphs = [
  'Across the developing world, economies are still running on infrastructure built for the industrial age. Factories that should be smart remain stubbornly analog. Financial systems that should be inclusive remain exclusive.',
  'The gap isn\'t just technological — it\'s existential. Nations that fail to modernize don\'t just fall behind; they fall out of the global economy entirely.',
  'But here\'s the opportunity: modernization isn\'t about catching up. It\'s about leaping forward. The countries that embrace digital transformation, green energy, and human capital investment aren\'t just surviving — they\'re thriving.',
];

export default function TheProblem() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const paragraphsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getIsMobile = () => window.innerWidth < 1024;
    const ctx = gsap.context(() => {
      // Sticky left panel only on desktop
      if (leftRef.current && !getIsMobile()) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: leftRef.current,
          pinSpacing: false,
        });
      }

      // Paragraph stagger reveal
      if (paragraphsRef.current) {
        const paragraphs = paragraphsRef.current.querySelectorAll('.narrative-p');
        paragraphs.forEach((p) => {
          const mobile = getIsMobile();
          gsap.fromTo(
            p,
            { opacity: 0, x: mobile ? 0 : 60, y: mobile ? 30 : 0 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: p,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // Data points float in
      const dataPoints = sectionRef.current?.querySelectorAll('.data-point');
      dataPoints?.forEach((point, i) => {
        gsap.fromTo(
          point,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: point,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Factory SVG crack lines
      const cracks = sectionRef.current?.querySelectorAll('.factory-crack');
      cracks?.forEach((crack, i) => {
        gsap.fromTo(
          crack,
          { strokeDashoffset: 100 },
          {
            strokeDashoffset: 0,
            duration: 1.2,
            delay: i * 0.3,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative bg-[#0a0a0f] overflow-x-hidden"
      style={{ minHeight: 'clamp(100vh, 200vh, 2500px)' }}
      aria-label="The Problem - Why modernization matters"
    >
      <div className="section-container">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
          {/* Left: SVG illustration (sticky on desktop) */}
          <div ref={leftRef} className="lg:w-5/12 flex items-center justify-center pt-16 lg:pt-20">
            <div className="relative w-full max-w-sm lg:max-w-md">
              <svg viewBox="0 0 400 400" className="w-full h-auto" aria-hidden="true">
                {/* Old factory */}
                <g className="factory-old">
                  <rect x="60" y="180" width="120" height="140" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="2" />
                  <rect x="200" y="220" width="80" height="100" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="2" />
                  <rect x="80" y="120" width="30" height="60" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="2" />
                  <rect x="140" y="140" width="25" height="40" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="2" />
                  <rect x="80" y="210" width="20" height="25" fill="#2a2a3e" rx="2" />
                  <rect x="120" y="210" width="20" height="25" fill="#2a2a3e" rx="2" />
                  <rect x="80" y="260" width="20" height="25" fill="#2a2a3e" rx="2" />
                  <rect x="120" y="260" width="20" height="25" fill="#2a2a3e" rx="2" />
                  <rect x="100" y="290" width="40" height="30" fill="#2a2a3e" rx="2" />
                  <circle cx="95" cy="100" r="12" fill="rgba(100,100,100,0.3)" />
                  <circle cx="85" cy="80" r="15" fill="rgba(100,100,100,0.2)" />
                  <circle cx="75" cy="55" r="18" fill="rgba(100,100,100,0.1)" />
                </g>
                {/* Crack lines */}
                <line className="factory-crack" x1="120" y1="180" x2="135" y2="220" stroke="#ff6b35" strokeWidth="2" strokeDasharray="100" opacity="0.7" />
                <line className="factory-crack" x1="135" y1="220" x2="125" y2="260" stroke="#ff6b35" strokeWidth="1.5" strokeDasharray="100" opacity="0.6" />
                <line className="factory-crack" x1="160" y1="220" x2="175" y2="260" stroke="#ff6b35" strokeWidth="2" strokeDasharray="100" opacity="0.5" />
                <line className="factory-crack" x1="200" y1="260" x2="220" y2="290" stroke="#ff6b35" strokeWidth="1.5" strokeDasharray="100" opacity="0.7" />
                {/* Modern elements */}
                <g opacity="0.3">
                  <rect x="280" y="180" width="60" height="30" fill="#00d4aa" rx="2" opacity="0.4" />
                  <rect x="280" y="215" width="60" height="30" fill="#00d4aa" rx="2" opacity="0.3" />
                  <line x1="310" y1="140" x2="310" y2="180" stroke="#00d4aa" strokeWidth="2" opacity="0.5" />
                  <circle cx="310" cy="135" r="5" fill="#00d4aa" opacity="0.5" />
                  <path d="M 295 130 Q 310 115 325 130" fill="none" stroke="#00d4aa" strokeWidth="1" opacity="0.3" />
                  <path d="M 290 125 Q 310 105 330 125" fill="none" stroke="#00d4aa" strokeWidth="1" opacity="0.2" />
                </g>
                <g opacity="0.2">
                  <path d="M 240 250 L 270 250" stroke="#00d4aa" strokeWidth="2" />
                  <path d="M 265 245 L 275 250 L 265 255" fill="none" stroke="#00d4aa" strokeWidth="2" />
                </g>
              </svg>

              {/* Floating badges */}
              <div className="absolute top-4 right-4 data-point">
                <div className="glass-card px-3 py-2 text-xs">
                  <span className="text-[#ff6b35] font-data font-bold">⚠ Legacy</span>
                </div>
              </div>
              <div className="absolute bottom-12 left-4 data-point">
                <div className="glass-card px-3 py-2 text-xs">
                  <span className="text-[#00d4aa] font-data font-bold">→ Modern</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Narrative text */}
          <div ref={rightRef} className="lg:w-7/12 py-16 lg:py-40">
            <p className="text-[#ff6b35] text-xs sm:text-sm uppercase tracking-[0.3em] font-data mb-3">
              The Problem
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#e8e8e8] mb-3">
              Why the Old Model is <span className="text-[#ff6b35]">Broken</span>
            </h2>
            <p className="text-[#4a4a5a] text-xs sm:text-sm uppercase tracking-[0.2em] font-data mb-10 sm:mb-12">
              The cost of standing still
            </p>

            <div ref={paragraphsRef} className="space-y-6 sm:space-y-8">
              {narrativeParagraphs.map((text, i) => (
                <p
                  key={i}
                  className="narrative-p text-base sm:text-lg md:text-xl text-[#c8c8c8] leading-relaxed opacity-0"
                >
                  {text}
                </p>
              ))}
            </div>

            {/* Data points */}
            <div className="mt-12 sm:mt-16 space-y-3 sm:space-y-4">
              {problemData.map((item, i) => (
                <div
                  key={i}
                  className="data-point glass-card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 opacity-0"
                >
                  <span className="text-xl sm:text-2xl">{item.icon}</span>
                  <div>
                    <span className="font-data text-xl sm:text-2xl font-bold text-[#ffd700]">
                      {item.stat}
                    </span>
                    <p className="text-[#8a8a9a] text-xs sm:text-sm mt-1">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
