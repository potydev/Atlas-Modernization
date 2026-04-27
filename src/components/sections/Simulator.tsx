'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassCard from '@/components/ui/GlassCard';
import GlowButton from '@/components/ui/GlowButton';
import ProjectionChart from '@/components/viz/ProjectionChart';
import { runProjection, getModernizationColor, getModernizationLabel } from '@/data/simulator-formulas';
import type { BudgetAllocation, ProjectionResult } from '@/types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Simulator() {
  const sectionRef = useRef<HTMLElement>(null);
  const [allocation, setAllocation] = useState<BudgetAllocation>({
    digital_infra: 25,
    education: 25,
    research: 25,
    subsidy: 25,
  });
  const [result, setResult] = useState<ProjectionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const total = allocation.digital_infra + allocation.education + allocation.research + allocation.subsidy;
  const isValid = total === 100;
  const remaining = 100 - total;

  const handleSliderChange = useCallback(
    (key: keyof BudgetAllocation, value: number) => {
      setAllocation((prev) => {
        const newAllocation = { ...prev, [key]: value };
        const newTotal = Object.values(newAllocation).reduce((a, b) => a + b, 0);
        if (newTotal > 100) return prev;
        return newAllocation;
      });
      setShowResults(false);
    },
    []
  );

  const runSimulation = useCallback(() => {
    if (!isValid) return;
    setIsRunning(true);
    setShowResults(false);

    setTimeout(() => {
      const projection = runProjection(allocation);
      setResult(projection);
      setIsRunning(false);
      setShowResults(true);

      fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_digital_infra: allocation.digital_infra,
          budget_education: allocation.education,
          budget_research: allocation.research,
          budget_subsidy: allocation.subsidy,
          projected_gdp: projection.gdpProjection[10],
          projected_employment: projection.employmentProjection[10],
          modernization_index: projection.modernizationIndex,
        }),
      }).catch(() => {});
    }, 1500);
  }, [allocation, isValid]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = sectionRef.current?.querySelector('.sim-title');
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

  const sliderConfig = [
    { key: 'digital_infra' as keyof BudgetAllocation, label: 'Digital Infrastructure', color: '#00d4aa', icon: '🖥️', description: '5G, cloud, data centers' },
    { key: 'education' as keyof BudgetAllocation, label: 'Education & Skills', color: '#a78bfa', icon: '🎓', description: 'STEM, vocational training' },
    { key: 'research' as keyof BudgetAllocation, label: 'R&D Investment', color: '#ffd700', icon: '🔬', description: 'Innovation, patents, labs' },
    { key: 'subsidy' as keyof BudgetAllocation, label: 'Traditional Subsidies', color: '#ff6b35', icon: '🏭', description: 'Legacy sector support' },
  ];

  return (
    <section ref={sectionRef} id="simulator" className="relative py-20 sm:py-32 bg-[#0a0a0f]" aria-label="Budget Simulator">
      <div className="section-container">
        {/* Section header */}
        <div className="sim-title text-center mb-12 sm:mb-16">
          <p className="text-[#ff6b35] text-xs sm:text-sm uppercase tracking-[0.3em] font-data mb-4">
            Interactive
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#e8e8e8] mb-4 sm:mb-6">
            Be the <span className="text-[#ff6b35]">Minister</span> of Modernization
          </h2>
          <p className="text-[#8a8a9a] text-sm sm:text-lg max-w-2xl mx-auto">
            Allocate your national budget across four key areas and see a 10-year economic projection.
            Total must equal exactly 100%.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Budget allocation sliders */}
          <GlassCard className="space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#e8e8e8]">
                Budget Allocation
              </h3>
              <div
                className={`font-data text-sm sm:text-base font-bold px-3 py-1 rounded-full ${
                  isValid
                    ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30'
                    : remaining > 0
                    ? 'bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30'
                    : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30'
                }`}
              >
                {isValid ? '✓ 100%' : remaining > 0 ? `${remaining}% left` : 'Over budget'}
              </div>
            </div>

            {/* Visual budget bar */}
            <div className="w-full h-4 sm:h-5 bg-white/5 rounded-full overflow-hidden flex">
              {sliderConfig.map((config) => (
                <div
                  key={config.key}
                  className="h-full transition-all duration-300 ease-out relative group"
                  style={{
                    width: `${allocation[config.key]}%`,
                    background: config.color,
                    opacity: 0.8,
                  }}
                >
                  {allocation[config.key] > 8 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-[#0a0a0f] font-data">
                      {allocation[config.key]}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Sliders */}
            {sliderConfig.map((config) => (
              <div key={config.key} className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#c8c8c8]">
                    <span className="text-base sm:text-lg">{config.icon}</span>
                    <div>
                      <span className="block leading-tight">{config.label}</span>
                      <span className="block text-[10px] text-[#4a4a5a] leading-tight">{config.description}</span>
                    </div>
                  </label>
                  <span className="font-data text-sm sm:text-base font-bold tabular-nums" style={{ color: config.color }}>
                    {allocation[config.key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocation[config.key]}
                  onChange={(e) => handleSliderChange(config.key, parseInt(e.target.value))}
                  className="atlas-slider"
                  style={{
                    background: `linear-gradient(to right, ${config.color} ${allocation[config.key]}%, rgba(255,255,255,0.1) ${allocation[config.key]}%)`,
                  }}
                  aria-label={`${config.label} budget allocation: ${allocation[config.key]}%`}
                  aria-valuetext={`${allocation[config.key]}%`}
                />
              </div>
            ))}

            <div className="pt-3 sm:pt-4">
              <GlowButton
                variant={isValid ? 'primary' : 'secondary'}
                size="lg"
                className="w-full text-sm sm:text-base"
                onClick={runSimulation}
              >
                {isRunning ? '⏳ Running Projection...' : isValid ? '🚀 Run 10-Year Projection' : `⚠ ${remaining}% remaining`}
              </GlowButton>
            </div>
          </GlassCard>

          {/* Results panel */}
          <div className="space-y-4 sm:space-y-6">
            {result && showResults ? (
              <>
                {/* Modernization Index Scorecard */}
                <GlassCard className="text-center py-6 sm:py-8">
                  <p className="text-[#8a8a9a] text-xs sm:text-sm font-data uppercase tracking-wider mb-2">
                    Your Modernization Index
                  </p>
                  <p
                    className="font-data text-5xl sm:text-6xl font-bold"
                    style={{
                      color: getModernizationColor(result.modernizationIndex),
                      textShadow: `0 0 40px ${getModernizationColor(result.modernizationIndex)}40`,
                    }}
                  >
                    {result.modernizationIndex}
                  </p>
                  <p
                    className="text-xs sm:text-sm font-data mt-2"
                    style={{ color: getModernizationColor(result.modernizationIndex) }}
                  >
                    {getModernizationLabel(result.modernizationIndex)}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-4 w-3/4 mx-auto h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${result.modernizationIndex}%`,
                        background: `linear-gradient(90deg, ${getModernizationColor(result.modernizationIndex)}, ${getModernizationColor(result.modernizationIndex)}80)`,
                      }}
                    />
                  </div>

                  {/* Key metrics row */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[#4a4a5a] text-[10px] font-data uppercase">10yr GDP Growth</p>
                      <p className="text-[#00d4aa] text-lg font-bold font-data">
                        {((result.gdpProjection[10] / result.gdpProjection[0] - 1) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[#4a4a5a] text-[10px] font-data uppercase">Employment Rate</p>
                      <p className="text-[#4ade80] text-lg font-bold font-data">
                        {result.employmentProjection[10].toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Projection Charts */}
                <GlassCard className="p-3 sm:p-4">
                  <ProjectionChart
                    data={result.gdpProjection}
                    labels={result.yearLabels}
                    color="#00d4aa"
                    title="GDP Projection"
                    valueSuffix="x"
                  />
                </GlassCard>

                <GlassCard className="p-3 sm:p-4">
                  <ProjectionChart
                    data={result.employmentProjection}
                    labels={result.yearLabels}
                    color="#4ade80"
                    title="Employment Rate"
                    valueSuffix="%"
                  />
                </GlassCard>
              </>
            ) : (
              <GlassCard className="text-center py-12 sm:py-16">
                <div className="text-3xl sm:text-4xl mb-4">📊</div>
                <p className="text-[#8a8a9a] font-heading text-base sm:text-lg">
                  Adjust your budget allocation and run the projection
                </p>
                <p className="text-[#4a4a5a] text-xs sm:text-sm mt-2 font-data">
                  Total budget must equal exactly 100%
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-1">
                    {sliderConfig.map((config) => (
                      <div
                        key={config.key}
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(allocation[config.key] * 1.5, 4)}px`,
                          background: config.color,
                          opacity: 0.6,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
