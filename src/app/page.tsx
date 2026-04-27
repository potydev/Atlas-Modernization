'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import CustomCursor from '@/components/layout/CustomCursor';
import SmoothScroll from '@/components/layout/SmoothScroll';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';

// Lazy load sections below the fold for performance
const TheProblem = dynamic(() => import('@/components/sections/TheProblem'), { ssr: false });
const Pillars = dynamic(() => import('@/components/sections/Pillars'), { ssr: false });
const DataViz = dynamic(() => import('@/components/sections/DataViz'), { ssr: false });
const Globe = dynamic(() => import('@/components/sections/Globe'), { ssr: false });
const Simulator = dynamic(() => import('@/components/sections/Simulator'), { ssr: false });
const CaseStudies = dynamic(() => import('@/components/sections/CaseStudies'), { ssr: false });
const HumanImpact = dynamic(() => import('@/components/sections/HumanImpact'), { ssr: false });
const Closing = dynamic(() => import('@/components/sections/Closing'), { ssr: false });

function SectionLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#4a4a5a] text-xs font-data">Loading section...</span>
      </div>
    </div>
  );
}

// Section divider component
function SectionDivider({ color = '#00d4aa', flip = false }: { color?: string; flip?: boolean }) {
  return (
    <div className="relative h-px w-full max-w-4xl mx-auto" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${flip ? '270deg' : '90deg'}, transparent, ${color}30, transparent)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navigation />

      <main className="min-h-screen flex flex-col bg-[#0a0a0f]">
        <Hero />

        <div className="py-6">
          <SectionDivider color="#ff6b35" />
        </div>

        <Suspense fallback={<SectionLoader />}>
          <TheProblem />
        </Suspense>

        <div className="py-6">
          <SectionDivider color="#00d4aa" flip />
        </div>

        <Suspense fallback={<SectionLoader />}>
          <Pillars />
        </Suspense>

        <div className="py-6">
          <SectionDivider color="#ffd700" />
        </div>

        <Suspense fallback={<SectionLoader />}>
          <DataViz />
        </Suspense>

        <div className="py-6">
          <SectionDivider color="#4ade80" flip />
        </div>

        <Suspense fallback={<SectionLoader />}>
          <Globe />
        </Suspense>

        <div className="py-6">
          <SectionDivider color="#ff6b35" />
        </div>

        <Suspense fallback={<SectionLoader />}>
          <Simulator />
        </Suspense>

        <div className="py-6">
          <SectionDivider color="#a78bfa" flip />
        </div>

        <Suspense fallback={<SectionLoader />}>
          <CaseStudies />
        </Suspense>

        <div className="py-6">
          <SectionDivider color="#ffd700" />
        </div>

        <Suspense fallback={<SectionLoader />}>
          <HumanImpact />
        </Suspense>

        <div className="py-6">
          <SectionDivider color="#00d4aa" flip />
        </div>

        <Suspense fallback={<SectionLoader />}>
          <Closing />
        </Suspense>

        <Footer />
      </main>
    </SmoothScroll>
  );
}
