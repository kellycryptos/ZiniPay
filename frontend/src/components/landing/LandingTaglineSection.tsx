import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export function LandingTaglineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Core thesis copy (2 lines, anti-hype, mathematical clarity)
  const statement =
    'Autonomous agents should propose bounties, not hold treasury keys. Every payout is verified on-chain, capped by Rust policy, and executed only when human quorum signs.';

  const words = statement.split(' ');

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Start activation when top of section reaches 75% of viewport height
      // Complete activation when top reaches 30% of viewport height
      const start = windowHeight * 0.8;
      const end = windowHeight * 0.25;

      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setScrollProgress(progress);
    };

    const throttledScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', throttledScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', throttledScroll);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-24 sm:py-32 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] relative overflow-hidden"
    >
      {/* Background ambient radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--color-passed)]/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Thesis Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--color-passed)] mb-8">
          <ShieldCheck size={14} className="text-[var(--color-passed)]" />
          <span className="tracking-wider uppercase">Governance Thesis</span>
        </div>

        {/* Scroll-Activated Word-by-Word Text */}
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.25] text-balance max-w-4xl select-none">
          {words.map((word, idx) => {
            const wordThreshold = (idx + 0.5) / words.length;
            const isRevealed = scrollProgress >= wordThreshold;

            return (
              <span
                key={idx}
                className={`inline-block mr-[0.28em] transition-colors duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isRevealed
                    ? 'text-white'
                    : 'text-white/25'
                }`}
              >
                {word}
              </span>
            );
          })}
        </p>

        {/* Supporting mechanism footnote */}
        <div className="mt-8 flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
          <span>Sputnik DAO v2 · Trezu Multi-Sig · PolicyHelper Contract</span>
        </div>
      </div>
    </section>
  );
}
