import React, { useEffect, useRef, useState } from 'react';

const TAGLINE_LINES = [
  {
    id: 'agent',
    words: ['Autonomous', 'agents', 'verify', 'and', 'propose,', 'never', 'holding', 'treasury', 'keys.'],
  },
  {
    id: 'policy',
    words: ['Smart', 'contracts', 'enforce', 'strict', 'spend', 'caps', 'and', 'anti-replay', 'on-chain.'],
  },
  {
    id: 'quorum',
    words: ['Community', 'councils', 'sign', 'in', 'multi-sig', 'quorum', 'before', 'any', 'payout', 'executes.'],
  },
];

export function LandingTaglineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const totalWords = TAGLINE_LINES.reduce((acc, line) => acc + line.words.length, 0);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      const start = windowHeight * 0.85;
      const end = windowHeight * 0.2;

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

  let globalWordIndex = 0;

  return (
    <section
      ref={containerRef}
      className="py-24 sm:py-32 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <div className="font-display flex flex-col gap-6 sm:gap-8 text-2xl sm:text-3xl md:text-4xl tracking-tight leading-relaxed select-none text-balance font-medium">
          {TAGLINE_LINES.map((line) => {
            const wordElements = line.words.map((word) => {
              const currentWordIdx = globalWordIndex++;
              const threshold = (currentWordIdx + 0.5) / totalWords;
              const isRevealed = scrollProgress >= threshold;

              return (
                <span
                  key={`word-${currentWordIdx}`}
                  className={`inline-block mr-[0.28em] transition-colors duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isRevealed ? 'text-white font-medium' : 'text-white/20'
                  }`}
                >
                  {word}
                </span>
              );
            });

            return (
              <div key={line.id} className="flex flex-wrap items-center justify-center">
                {wordElements}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
