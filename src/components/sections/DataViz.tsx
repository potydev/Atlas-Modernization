'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BarChartRace from '@/components/viz/BarChartRace';
import SankeyDiagram from '@/components/viz/SankeyDiagram';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DataViz() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<'race' | 'sankey'>('race');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = sectionRef.current?.querySelector('.dataviz-title');
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="data" className="relative py-20 sm:py-32 bg-[#0a0a0f]" aria-label="Data Visualization">
      <div className="section-container">
        {/* Section header */}
        <div className="dataviz-title text-center mb-12 sm:mb-16">
          <p className="text-[#ffd700] text-xs sm:text-sm uppercase tracking-[0.3em] font-data mb-4">
            The Data
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#e8e8e8] mb-4 sm:mb-6">
            Numbers Don&apos;t <span className="text-[#ffd700]">Lie</span>
          </h2>
          <p className="text-[#8a8a9a] text-sm sm:text-lg max-w-2xl mx-auto">
            Watch how economies transform over two decades. The race for modernization
            is reshaping the global economic order.
          </p>
        </div>

        {/* Tab switcher with ARIA tabs */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8" role="tablist" aria-label="Data visualization type">
          <button
            onClick={() => setActiveTab('race')}
            role="tab"
            aria-selected={activeTab === 'race'}
            aria-controls="dataviz-panel"
            id="tab-race"
            className={`tap-target min-w-[120px] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-data transition-all duration-300 ${
              activeTab === 'race'
                ? 'bg-[#00d4aa] text-[#0a0a0f]'
                : 'glass-card text-[#8a8a9a] hover:text-[#e8e8e8]'
            }`}
            data-cursor
          >
            📊 GDP Race
          </button>
          <button
            onClick={() => setActiveTab('sankey')}
            role="tab"
            aria-selected={activeTab === 'sankey'}
            aria-controls="dataviz-panel"
            id="tab-sankey"
            className={`tap-target min-w-[120px] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-data transition-all duration-300 ${
              activeTab === 'sankey'
                ? 'bg-[#00d4aa] text-[#0a0a0f]'
                : 'glass-card text-[#8a8a9a] hover:text-[#e8e8e8]'
            }`}
            data-cursor
          >
            🔄 Sector Flow
          </button>
        </div>

        {/* Visualization */}
        <div className="max-w-5xl mx-auto overflow-hidden" id="dataviz-panel" role="tabpanel" aria-labelledby={activeTab === 'race' ? 'tab-race' : 'tab-sankey'}>
          {activeTab === 'race' ? <BarChartRace /> : <SankeyDiagram />}
        </div>
      </div>
    </section>
  );
}
