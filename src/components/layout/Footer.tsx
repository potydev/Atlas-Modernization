'use client';

export default function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-white/5 bg-[#0a0a0f]" role="contentinfo">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold text-[#00d4aa]">ATLAS</span>
            <span className="text-[#4a4a5a] text-sm">·</span>
            <span className="text-[#4a4a5a] text-sm font-data">The Modernization Atlas</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-[#4a4a5a] text-[10px] md:text-xs font-data">Built with</span>
            {['Next.js 16', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Three.js', 'D3.js'].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[#8a8a9a] text-[10px] md:text-xs font-data"
                >
                  {tech}
                </span>
              )
            )}
          </div>
          <p className="text-[#4a4a5a] text-xs font-data">
            &copy; 2025 &middot; Growing the Economy Through Modernization
          </p>
        </div>
      </div>
    </footer>
  );
}
