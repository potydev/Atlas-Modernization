'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassCard from '@/components/ui/GlassCard';
import { caseStudies } from '@/data/case-studies';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Country flag map
const countryFlags: Record<string, string> = {
  estonia: '🇪🇪',
  singapore: '🇸🇬',
  rwanda: '🇷🇼',
  'south-korea': '🇰🇷',
};

export default function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const lastSlideIndexRef = useRef(0);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop: Horizontal scroll using CSS sticky + GSAP scrub (NO pin)
  useEffect(() => {
    if (isMobile) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const totalScroll = () => (caseStudies.length - 1) * window.innerWidth;

    // Set section height = 1 viewport + scroll distance
    // This creates the vertical scroll space needed for the horizontal animation
    const setSectionHeight = () => {
      section.style.height = `${window.innerHeight + totalScroll()}px`;
    };
    setSectionHeight();

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -totalScroll(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalScroll()}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const slideIndex = Math.round(self.progress * (caseStudies.length - 1));
            if (slideIndex !== lastSlideIndexRef.current) {
              lastSlideIndexRef.current = slideIndex;
              setActiveSlide(slideIndex);
            }
            scrollTriggerRef.current = self;
          },
        },
      });
    }, sectionRef);

    const handleResize = () => {
      setSectionHeight();
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  // Mobile: scroll-snap detection
  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;

    const carousel = carouselRef.current;
    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = carousel.offsetWidth;
      const newIndex = Math.round(scrollLeft / slideWidth);
      if (newIndex !== activeSlide && newIndex >= 0 && newIndex < caseStudies.length) {
        setActiveSlide(newIndex);
      }
    };

    carousel.addEventListener('scroll', handleScroll, { passive: true });
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [isMobile, activeSlide]);

  // Navigate to a specific slide
  const scrollToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= caseStudies.length) return;

      setActiveSlide(index);
      lastSlideIndexRef.current = index;

      if (isMobile && carouselRef.current) {
        const slideWidth = carouselRef.current.offsetWidth;
        carouselRef.current.scrollTo({
          left: slideWidth * index,
          behavior: 'smooth',
        });
      } else if (!isMobile && scrollTriggerRef.current) {
        const st = scrollTriggerRef.current;
        const progress = index / (caseStudies.length - 1);
        const scrollTarget = (st.start ?? 0) + progress * ((st.end ?? 0) - (st.start ?? 0));
        window.scrollTo({
          top: scrollTarget,
          behavior: 'smooth',
        });
      }
    },
    [isMobile]
  );

  // Touch swipe handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      touchEndX.current = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && activeSlide < caseStudies.length - 1) {
          scrollToSlide(activeSlide + 1);
        } else if (diff < 0 && activeSlide > 0) {
          scrollToSlide(activeSlide - 1);
        }
      }
    },
    [activeSlide, scrollToSlide]
  );

  const progressPercent = ((activeSlide + 1) / caseStudies.length) * 100;

  return (
    <section
      ref={sectionRef}
      id="cases"
      className="relative bg-[#0a0a0f]"
      role="region"
      aria-label="Case Studies of Modernization"
    >
      {/* ============ MOBILE: CSS scroll-snap carousel ============ */}
      {isMobile && (
        <>
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 z-30">
            <div
              className="h-full bg-gradient-to-r from-[#00d4aa] to-[#ffd700] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={activeSlide + 1}
              aria-valuemin={1}
              aria-valuemax={caseStudies.length}
              aria-label={`Case study ${activeSlide + 1} of ${caseStudies.length}`}
            />
          </div>

          <div className="pt-24 pb-8 section-container">
            <p className="text-[#a78bfa] text-xs sm:text-sm uppercase tracking-[0.3em] font-data mb-4">
              Success Stories
            </p>
            <h2 className="font-heading text-3xl font-bold text-[#e8e8e8] mb-3">
              Nations That <span className="text-[#a78bfa]">Leaped</span> Forward
            </h2>
            <p className="text-[#8a8a9a] text-sm max-w-2xl leading-relaxed">
              Four countries that chose modernization and transformed their economies within a generation.
            </p>
          </div>

          <div className="section-container mb-4 flex items-center justify-between">
            <span className="text-[#4a4a5a] text-xs font-data" aria-live="polite">
              Case Study {activeSlide + 1} of {caseStudies.length}
            </span>
            <span className="text-lg" aria-hidden="true">
              {countryFlags[caseStudies[activeSlide]?.id] || ''}
            </span>
          </div>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="list"
            aria-label="Case study carousel"
          >
            {caseStudies.map((study, i) => (
              <div
                key={study.id}
                className="w-full flex-shrink-0 snap-center px-4 pb-8"
                role="listitem"
                aria-label={`Case study ${i + 1}: ${study.country}`}
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-6">
                  <img
                    src={study.image}
                    alt={`Modernization in ${study.country}`}
                    className="w-full h-full object-cover scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-4xl" aria-hidden="true">{study.flag}</span>
                    <h3 className="font-heading text-2xl font-bold text-white mt-1">{study.country}</h3>
                    <p className="text-[#8a8a9a] text-xs font-data">{study.period}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-5">
                  {study.metrics.map((metric, j) => (
                    <GlassCard key={j} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-[#8a8a9a] text-xs font-data">{metric.label}</p>
                        <p className="font-data text-lg font-bold text-[#ffd700]">{metric.value}</p>
                      </div>
                      <span className="text-[#00d4aa] text-xs font-data bg-[#00d4aa]/10 px-2 py-1 rounded-full">
                        {metric.change}
                      </span>
                    </GlassCard>
                  ))}
                </div>

                <GlassCard className="p-4">
                  <p className="text-[#c8c8c8] leading-[1.75] text-sm max-w-none">{study.narrative}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ============ DESKTOP: CSS Sticky + GSAP horizontal scrub ============ */}
      {!isMobile && (
        <div className="sticky top-0 h-screen overflow-hidden relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 z-30">
            <div
              className="h-full bg-gradient-to-r from-[#00d4aa] to-[#ffd700] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={activeSlide + 1}
              aria-valuemin={1}
              aria-valuemax={caseStudies.length}
              aria-label={`Case study ${activeSlide + 1} of ${caseStudies.length}`}
            />
          </div>

          <div
            ref={trackRef}
            className="absolute inset-0 flex h-full will-change-transform"
            style={{ width: `${caseStudies.length * 100}vw` }}
            role="list"
            aria-label="Case studies horizontal scroll"
          >
            {caseStudies.map((study, i) => (
              <div
                key={study.id}
                className="flex-shrink-0 flex items-center justify-center relative"
                style={{ width: '100vw', height: '100vh' }}
                role="listitem"
                aria-label={`Case study ${i + 1}: ${study.country}`}
              >
                {/* Title — shown on first panel */}
                {i === 0 && (
                  <div className="absolute top-6 left-8 lg:left-16 z-10">
                    <p className="text-[#a78bfa] text-xs md:text-sm uppercase tracking-[0.3em] font-data mb-2">
                      Success Stories
                    </p>
                    <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-[#e8e8e8] mb-2">
                      Nations That <span className="text-[#a78bfa]">Leaped</span> Forward
                    </h2>
                    <p className="text-[#8a8a9a] text-sm md:text-base max-w-xl leading-relaxed">
                      Four countries that chose modernization and transformed their economies within a generation.
                    </p>
                  </div>
                )}

                <div className="max-w-6xl w-full grid grid-cols-2 gap-8 lg:gap-12 items-center px-8 lg:px-16">
                  {/* Image */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                    <img
                      src={study.image}
                      alt={`Modernization in ${study.country}`}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 via-[#0a0a0f]/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00d4aa]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute bottom-6 left-6">
                      <span className="text-4xl" aria-hidden="true">{study.flag}</span>
                      <h3 className="font-heading text-2xl lg:text-3xl font-bold text-white mt-1">{study.country}</h3>
                      <p className="text-[#8a8a9a] text-xs font-data mt-0.5">{study.period}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">{study.flag}</span>
                      <div>
                        <h4 className="font-heading text-lg font-bold text-[#e8e8e8]">{study.country}</h4>
                        <span className="text-[#4a4a5a] text-[10px] font-data">{study.period}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {study.metrics.map((metric, j) => (
                        <GlassCard key={j} className="text-center p-3">
                          <p className="text-[#8a8a9a] text-[9px] font-data mb-1 uppercase tracking-wider">{metric.label}</p>
                          <p className="font-data text-base font-bold text-[#ffd700]">{metric.value}</p>
                          <p className="text-[#00d4aa] text-[9px] font-data mt-0.5">{metric.change}</p>
                        </GlassCard>
                      ))}
                    </div>

                    <GlassCard className="p-4">
                      <p className="text-[#c8c8c8] leading-[1.7] text-sm max-w-xl">{study.narrative}</p>
                    </GlassCard>
                  </div>
                </div>

                {/* Navigation dots */}
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20"
                  role="tablist"
                  aria-label="Case study navigation"
                >
                  {caseStudies.map((s, j) => (
                    <button
                      key={s.id}
                      onClick={() => scrollToSlide(j)}
                      className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] ${
                        j === activeSlide
                          ? 'w-10 h-3.5 bg-[#00d4aa] shadow-[0_0_12px_rgba(0,212,170,0.4)]'
                          : 'w-3.5 h-3.5 bg-white/20 hover:bg-white/40'
                      }`}
                      role="tab"
                      aria-selected={j === activeSlide}
                      aria-label={`View case study: ${s.country}`}
                      data-cursor
                    >
                      <span className="sr-only">{s.country}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
