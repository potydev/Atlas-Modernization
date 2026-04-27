'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassCard from '@/components/ui/GlassCard';
import GlowButton from '@/components/ui/GlowButton';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Pledge {
  id: string;
  name: string;
  country: string | null;
  message: string;
  created_at: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  xOffset: number;
}

// Mock pledges for demo
const mockPledges: Pledge[] = [
  { id: '1', name: 'Ahmad R.', country: 'Indonesia', message: 'Modernization is our future. I pledge to support digital education.', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: '2', name: 'Sarah K.', country: 'Kenya', message: 'From market trader to e-commerce. Modernization changed my life.', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: '3', name: 'Chen W.', country: 'China', message: 'Green technology is not optional, it is essential.', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', name: 'Maria S.', country: 'Brazil', message: 'Inclusivity in modernization ensures no one is left behind.', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '5', name: 'Karl E.', country: 'Estonia', message: 'We proved that small nations can lead in digital governance.', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '6', name: 'Priya M.', country: 'India', message: 'Digital India transformed 1.4 billion lives. The journey continues.', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '7', name: 'David L.', country: 'Singapore', message: 'Smart Nation starts with smart citizens. Education first.', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: '8', name: 'Fatima A.', country: 'UAE', message: 'From oil to knowledge economy — our transformation inspires the world.', created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
];

// Time-ago formatter
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (diffMs < 60000) return 'just now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  if (diffMs < 604800000) return `${Math.floor(diffMs / 86400000)}d ago`;
  return `${Math.floor(diffMs / 604800000)}w ago`;
}

// Particle colors
const particleColors = ['#00d4aa', '#ffd700', '#ff6b35', '#a78bfa', '#4ade80', '#f472b6'];

export default function Closing() {
  const sectionRef = useRef<HTMLElement>(null);
  const [pledges, setPledges] = useState<Pledge[]>(mockPledges);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPledges, setTotalPledges] = useState(2847);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingDots] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.15 + 0.05,
    }))
  );

  // Form validation state
  const nameValid = name.trim().length >= 2;
  const messageValid = message.trim().length >= 10;

  // Spawn particle burst
  const spawnParticles = useCallback((baseX: number, baseY: number) => {
    const count = 16;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: baseX + (Math.random() - 0.5) * 10,
      y: baseY + (Math.random() - 0.5) * 10,
      color: particleColors[i % particleColors.length],
      size: Math.random() * 6 + 3,
      angle: (i / count) * 360,
      speed: Math.random() * 80 + 40,
      xOffset: Math.random() * 160 - 80,
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1800);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = sectionRef.current?.querySelector('.closing-title');
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

  // Fetch pledges from API on mount
  useEffect(() => {
    async function fetchPledges() {
      try {
        const res = await fetch('/api/pledges');
        if (res.ok) {
          const data = await res.json();
          if (data.pledges && data.pledges.length > 0) {
            setPledges(data.pledges.slice(0, 10));
            setTotalPledges(data.total || data.pledges.length);
          }
        }
      } catch {
        // Use mock data if API fails
      }
    }
    fetchPledges();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!nameValid || !messageValid) return;

      setIsSubmitting(true);

      const newPledge: Pledge = {
        id: Date.now().toString(),
        name: name.trim(),
        country: country.trim() || null,
        message: message.trim(),
        created_at: new Date().toISOString(),
      };

      try {
        const res = await fetch('/api/pledges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPledge),
        });

        if (res.ok) {
          setPledges((prev) => [newPledge, ...prev].slice(0, 10));
          setTotalPledges((prev) => prev + 1);
          spawnParticles(50, 30);
        }
      } catch {
        setPledges((prev) => [newPledge, ...prev].slice(0, 10));
        setTotalPledges((prev) => prev + 1);
        spawnParticles(50, 30);
      }

      setName('');
      setCountry('');
      setMessage('');
      setIsSubmitting(false);
    },
    [name, country, message, nameValid, messageValid, spawnParticles]
  );

  // Social share handlers
  const shareText = useMemo(
    () => `I just pledged my support for modernization! Join ${totalPledges}+ people at The Modernization Atlas.`,
    [totalPledges]
  );

  const handleShareTwitter = useCallback(() => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, [shareText]);

  const handleShareLinkedIn = useCallback(() => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, []);

  const handleShareWhatsApp = useCallback(() => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, [shareText]);

  return (
    <section
      ref={sectionRef}
      id="closing"
      className="relative py-20 md:py-32 bg-[#0a0a0f] overflow-hidden"
      role="region"
      aria-label="Pledge for Modernization"
    >
      {/* Floating background dots animation */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {floatingDots.map((dot) => (
          <div
            key={dot.id}
            className="absolute rounded-full bg-[#00d4aa]"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              opacity: dot.opacity,
              animation: `floatDot ${dot.duration}s ease-in-out ${dot.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Slowly moving gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,212,170,0.03), transparent 70%)',
          animation: 'gradientShift 15s ease-in-out infinite alternate',
        }}
        aria-hidden="true"
      />

      {/* Particle effects for new pledges */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `particleBurst 1.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
            '--burst-angle': `${p.angle}deg`,
            '--burst-speed': `${p.speed}px`,
            '--burst-x-offset': `${p.xOffset}px`,
          } as React.CSSProperties}
        />
      ))}

      <div className="section-container relative z-10">
        {/* Title */}
        <div className="closing-title text-center mb-12 md:mb-16">
          <h2 className="font-heading text-3xl md:text-5xl lg:text-7xl font-bold text-[#e8e8e8] mb-4 md:mb-6">
            Modernization is not a choice.
            <br />
            <span className="text-[#00d4aa]">It&apos;s a race.</span>
          </h2>
          <p className="text-[#8a8a9a] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Join thousands who believe in the power of modernization to transform economies and lives.
          </p>
        </div>

        {/* Pledge counter — much more prominent */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex flex-col items-center gap-2">
            <span className="text-[#4a4a5a] text-xs md:text-sm font-data uppercase tracking-[0.2em]">
              People Have Pledged
            </span>
            <div className="relative">
              <AnimatedNumber
                target={totalPledges}
                duration={2}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#ffd700]"
              />
              {/* Glow behind number */}
              <div className="absolute inset-0 blur-2xl bg-[#ffd700]/10 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Pledge form */}
          <GlassCard className="p-5 md:p-6">
            <h3 className="font-heading text-lg md:text-xl font-bold text-[#e8e8e8] mb-5 md:mb-6">
              Make Your Pledge
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name field */}
              <div>
                <label
                  htmlFor="pledge-name"
                  className="text-[#8a8a9a] text-sm mb-1 block font-data"
                >
                  Name *
                </label>
                <div className="relative">
                  <input
                    id="pledge-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-[#e8e8e8] placeholder-[#4a4a5a] focus:outline-none transition-colors pr-10 ${
                      name.length > 0
                        ? nameValid
                          ? 'border-[#00d4aa]/50 focus:border-[#00d4aa]'
                          : 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-[#00d4aa]'
                    }`}
                    placeholder="Your name"
                    maxLength={50}
                    required
                    aria-required="true"
                    aria-invalid={name.length > 0 && !nameValid}
                  />
                  {nameValid && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00d4aa]" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Country field */}
              <div>
                <label
                  htmlFor="pledge-country"
                  className="text-[#8a8a9a] text-sm mb-1 block font-data"
                >
                  Country
                </label>
                <input
                  id="pledge-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e8e8e8] placeholder-[#4a4a5a] focus:border-[#00d4aa] focus:outline-none transition-colors"
                  placeholder="Your country"
                  maxLength={50}
                />
              </div>

              {/* Message field */}
              <div>
                <label
                  htmlFor="pledge-message"
                  className="text-[#8a8a9a] text-sm mb-1 block font-data"
                >
                  Your Message *{' '}
                  <span className="text-[#4a4a5a]">({200 - message.length} chars left)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="pledge-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-[#e8e8e8] placeholder-[#4a4a5a] focus:outline-none transition-colors resize-none pr-10 ${
                      message.length > 0
                        ? messageValid
                          ? 'border-[#00d4aa]/50 focus:border-[#00d4aa]'
                          : 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-[#00d4aa]'
                    }`}
                    placeholder="What does modernization mean to you?"
                    rows={3}
                    maxLength={200}
                    required
                    aria-required="true"
                    aria-invalid={message.length > 0 && !messageValid}
                  />
                  {messageValid && (
                    <span className="absolute right-3 top-3 text-[#00d4aa]" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              <GlowButton
                variant="primary"
                size="lg"
                className="w-full"
                type="submit"
              >
                {isSubmitting ? '⏳ Submitting...' : '✊ Make Your Pledge'}
              </GlowButton>
            </form>

            {/* Share on social media */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-[#4a4a5a] text-xs font-data mb-3 uppercase tracking-wider">
                Spread the word
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleShareTwitter}
                  className="tap-target flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a8a9a] hover:text-[#e8e8e8] text-xs font-data transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                  aria-label="Share on Twitter"
                  data-cursor
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </button>
                <button
                  onClick={handleShareLinkedIn}
                  className="tap-target flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a8a9a] hover:text-[#e8e8e8] text-xs font-data transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                  aria-label="Share on LinkedIn"
                  data-cursor
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="tap-target flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a8a9a] hover:text-[#e8e8e8] text-xs font-data transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                  aria-label="Share on WhatsApp"
                  data-cursor
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Recent pledges */}
          <div className="flex flex-col">
            <h3 className="font-heading text-lg md:text-xl font-bold text-[#e8e8e8] mb-4">
              Recent Pledges
            </h3>
            <div
              className="max-h-[400px] md:max-h-[520px] overflow-y-auto space-y-3 pr-1 md:pr-2 flex-1"
              style={{ scrollbarWidth: 'thin' }}
            >
              {pledges.map((pledge, i) => (
                <GlassCard key={pledge.id} className="p-3 md:p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: `hsl(${(i * 47) % 360}, 60%, 25%)`,
                        color: `hsl(${(i * 47) % 360}, 80%, 70%)`,
                      }}
                      aria-hidden="true"
                    >
                      {pledge.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[#e8e8e8] text-sm font-semibold">
                          {pledge.name}
                        </span>
                        {pledge.country && (
                          <span className="text-[#4a4a5a] text-xs font-data">
                            · {pledge.country}
                          </span>
                        )}
                        <span className="text-[#4a4a5a] text-[10px] md:text-xs font-data ml-auto">
                          {timeAgo(pledge.created_at)}
                        </span>
                      </div>
                      <p className="text-[#8a8a9a] text-sm mt-1 leading-relaxed">
                        {pledge.message}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
