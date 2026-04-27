'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassCard from '@/components/ui/GlassCard';
import type { HumanProfile } from '@/types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const profiles: HumanProfile[] = [
  {
    id: 'sari',
    name: 'Sari',
    from: 'Subsistence Farmer',
    to: 'Agri-Tech Entrepreneur',
    country: 'Indonesia 🇮🇩',
    image: 'https://picsum.photos/seed/sari-farmer/400/400',
    quote: 'My harvest prediction app doubled my yield. Now I help 200 other farmers in my district do the same.',
    timeline: [
      { year: '2018', event: 'Farming 0.5 hectare by hand, earning $800/year' },
      { year: '2019', event: 'First smartphone, discovered weather & market apps' },
      { year: '2020', event: 'Switched to precision farming techniques' },
      { year: '2021', event: 'Yield increased 120%, income tripled' },
      { year: '2023', event: 'Founded agri-tech cooperative with 200 members' },
      { year: '2025', event: 'Earning $12,000/year, advising government on digital agriculture' },
    ],
  },
  {
    id: 'james',
    name: 'James',
    from: 'Factory Worker',
    to: 'Robot Operator & Trainer',
    country: 'Malaysia 🇲🇾',
    image: 'https://picsum.photos/seed/james-worker/400/400',
    quote: 'I thought robots would replace me. Instead, they made me 5x more valuable. I now train others.',
    timeline: [
      { year: '2017', event: 'Assembly line worker, $400/month, repetitive tasks' },
      { year: '2018', event: 'Factory introduced collaborative robots (cobots)' },
      { year: '2019', event: 'Selected for robot operator training program' },
      { year: '2020', event: 'Became certified robot operator, salary doubled' },
      { year: '2022', event: 'Promoted to robot training supervisor' },
      { year: '2025', event: 'Leading factory automation, earning $2,800/month' },
    ],
  },
  {
    id: 'amina',
    name: 'Amina',
    from: 'Market Trader',
    to: 'E-Commerce Seller',
    country: 'Kenya 🇰🇪',
    image: 'https://picsum.photos/seed/amina-trader/400/400',
    quote: 'My market stall reached 50 people a day. My online store reaches 5,000. Modernization is opportunity.',
    timeline: [
      { year: '2019', event: 'Selling vegetables at local market, $5/day average' },
      { year: '2020', event: 'COVID lockdown, discovered mobile money & social selling' },
      { year: '2021', event: 'Launched WhatsApp & Instagram shop' },
      { year: '2022', event: 'Joined regional e-commerce platform' },
      { year: '2023', event: 'Hired 3 employees, shipping nationwide' },
      { year: '2025', event: 'Revenue $45,000/year, mentoring 50 women entrepreneurs' },
    ],
  },
];

function ProfileCard({ profile, index }: { profile: HumanProfile; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current!,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, [index]);

  const visibleTimeline = isExpanded
    ? profile.timeline
    : profile.timeline.slice(0, 3);

  return (
    <div ref={cardRef} className="w-full">
      <GlassCard className="h-full flex flex-col">
        {/* Photo + Name */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#00d4aa]/30">
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#00d4aa]/20 via-transparent to-[#ffd700]/10" />
          </div>
          <div>
            <h3 className="font-heading text-xl md:text-2xl font-bold text-[#e8e8e8]">
              {profile.name}
            </h3>
            <p className="text-[#00d4aa] text-sm md:text-base">{profile.country}</p>
          </div>
        </div>

        {/* From → To transformation */}
        <div className="flex items-center gap-2 md:gap-3 mb-5 p-3 md:p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[#ff6b35] text-xs md:text-sm font-data text-right flex-1 leading-tight">
            {profile.from}
          </span>
          <div className="flex-shrink-0 relative">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="#00d4aa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[#00d4aa] text-xs md:text-sm font-data flex-1 leading-tight">
            {profile.to}
          </span>
        </div>

        {/* Quote */}
        <blockquote className="relative text-[#d4d4d4] text-sm md:text-base italic leading-relaxed mb-6 p-4 rounded-xl bg-[#ffd700]/[0.03] border-l-3 border-[#ffd700]/30">
          <span
            className="absolute -top-2 -left-1 text-[#ffd700]/20 font-heading text-5xl md:text-6xl leading-none select-none"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="relative z-10 pl-4 md:pl-6">{profile.quote}</p>
          <span
            className="absolute -bottom-4 right-2 text-[#ffd700]/20 font-heading text-5xl md:text-6xl leading-none select-none"
            aria-hidden="true"
          >
            &rdquo;
          </span>
        </blockquote>

        {/* Timeline */}
        <div className="mt-auto space-y-3">
          <p className="text-[#4a4a5a] text-[10px] md:text-xs font-data uppercase tracking-wider">
            Transformation Timeline
          </p>
          <div className="relative">
            <div className="absolute left-[6px] top-2 bottom-2 w-[1px] bg-white/10" />
            {visibleTimeline.map((step, i) => (
              <div key={i} className="flex gap-3 relative pl-0">
                <div
                  className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 z-10 ${
                    i === visibleTimeline.length - 1
                      ? 'border-[#ffd700] bg-[#ffd700]/20'
                      : 'border-[#00d4aa] bg-[#0a0a0f]'
                  }`}
                />
                <div className="pb-3">
                  <span className="text-[#ffd700] text-[10px] md:text-xs font-data">{step.year}</span>
                  <p className="text-[#8a8a9a] text-[10px] md:text-xs leading-relaxed">{step.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expand toggle */}
        {profile.timeline.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-[#00d4aa] text-xs font-data hover:text-[#ffd700] transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#00d4aa] rounded"
            aria-expanded={isExpanded}
            data-cursor
          >
            {isExpanded ? 'Show less' : 'Read their full story'}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}
      </GlassCard>
    </div>
  );
}

export default function HumanImpact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const header = sectionRef.current?.querySelector('.impact-header');
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
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
    <section
      ref={sectionRef}
      id="impact"
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: '#0c0c14' }}
      role="region"
      aria-label="Human Impact Stories"
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(255,107,53,0.06), transparent 60%), radial-gradient(ellipse 60% 50% at 70% 70%, rgba(255,215,0,0.04), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 20%, rgba(0,212,170,0.03), transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        {/* Section header */}
        <div className="impact-header text-center mb-12 md:mb-16">
          <p className="text-[#ffd700] text-xs md:text-sm uppercase tracking-[0.3em] font-data mb-4">
            Real Stories
          </p>
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-[#e8e8e8] mb-4 md:mb-6">
            The <span className="text-[#ffd700]">Human</span> Impact
          </h2>
          <p className="text-[#8a8a9a] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Behind every statistic is a person whose life was transformed by modernization.
            These are their stories.
          </p>
        </div>

        {/* Profile cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {profiles.map((profile, i) => (
            <ProfileCard key={profile.id} profile={profile} index={i} />
          ))}
        </div>

        {/* Summary stat */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="glass-card inline-flex items-center gap-4 px-6 py-4">
            <span className="text-[#ff6b35] text-2xl">👨‍👩‍👧‍👦</span>
            <div className="text-left">
              <p className="font-data text-xl md:text-2xl font-bold text-[#ffd700]">3.4 Billion</p>
              <p className="text-[#8a8a9a] text-xs md:text-sm">People whose lives could be transformed by 2035</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
