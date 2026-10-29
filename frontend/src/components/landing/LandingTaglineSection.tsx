import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Bot, ShieldCheck, Users, ArrowRight, type LucideIcon } from 'lucide-react';

interface TaglineLine {
  id: string;
  prefix: string[];
  badge: {
    label: string;
    icon: any;
    accentColor: string;
    badgeStyle: string;
    activeGlow: string;
  };
  suffix: string[];
}

const TAGLINE_LINES: TaglineLine[] = [
  {
    id: 'agent',
    prefix: ['Autonomous', 'agents', 'explore', 'and', 'propose,'],
    badge: {
      label: 'Agent Deliberation',
      icon: Bot,
      accentColor: 'text-cyan-400',
      badgeStyle: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/40',
      activeGlow: 'shadow-[0_0_16px_rgba(34,211,238,0.25)] border-cyan-400/50',
    },
    suffix: ['never', 'holding', 'treasury', 'keys.'],
  },
  {
    id: 'policy',
    prefix: ['Smart', 'contracts', 'enforce', 'strict', 'spend', 'caps,'],
    badge: {
      label: 'Rust Guardrails',
      icon: ShieldCheck,
      accentColor: 'text-[var(--color-passed)]',
      badgeStyle: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
      activeGlow: 'shadow-[0_0_16px_rgba(0,236,151,0.25)] border-emerald-400/50',
    },
    suffix: ['preventing', 'runaway', 'drain.'],
  },
  {
    id: 'quorum',
    prefix: ['And', 'community', 'councils', 'sign', 'in', 'quorum,'],
    badge: {
      label: 'Human Quorum',
      icon: Users,
      accentColor: 'text-amber-400',
      badgeStyle: 'text-amber-300 border-amber-500/30 bg-amber-950/40',
      activeGlow: 'shadow-[0_0_16px_rgba(251,191,36,0.25)] border-amber-400/50',
    },
    suffix: ['before', 'any', 'payout', 'executes.'],
  },
];

export function LandingTaglineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Compute total word count for proportional reveal
  const totalWords = TAGLINE_LINES.reduce(
    (acc, line) => acc + line.prefix.length + line.suffix.length,
    0
  );

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Start activation when top of section reaches 85% of viewport height
      // Complete activation when top reaches 20% of viewport height
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

  // Track global word index across lines
  let globalWordIndex = 0;

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-28 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] relative overflow-hidden"
    >
      {/* Artistic Ambient Color Aura (Cyan + Emerald + Amber) */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[300px] bg-cyan-500/[0.06] blur-[110px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] bg-[var(--color-passed)]/[0.07] blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[420px] h-[300px] bg-amber-500/[0.06] blur-[110px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative Subtle Geometric Orbit Rings */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full border border-white/[0.025] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full border border-white/[0.035] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Playful / Artistic Formula Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-panel-alt)]/90 border border-white/[0.08] text-[11px] font-mono text-slate-300 mb-8 backdrop-blur-md shadow-sm">
          <Sparkles size={13} className="text-amber-400" />
          <span className="font-semibold text-white tracking-wider uppercase">
            The Social Money Balance
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--color-passed)] font-medium">Three-Way Gate</span>
        </div>

        {/* Rhythmic 3-Line Statement with Embedded Interactive Visual Tokens */}
        <div className="flex flex-col gap-5 sm:gap-6 text-xl sm:text-2xl md:text-3xl lg:text-[32px] tracking-tight leading-relaxed sm:leading-[1.5] select-none text-balance font-normal">
          {TAGLINE_LINES.map((line) => {
            const BadgeIcon = line.badge.icon;

            // Prefix words
            const prefixElements = line.prefix.map((word) => {
              const currentWordIdx = globalWordIndex++;
              const threshold = (currentWordIdx + 0.5) / totalWords;
              const isRevealed = scrollProgress >= threshold;

              return (
                <span
                  key={`pre-${currentWordIdx}`}
                  className={`inline-block mr-[0.26em] transition-colors duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isRevealed
                      ? 'text-white font-medium'
                      : 'text-white/25'
                  }`}
                >
                  {word}
                </span>
              );
            });

            // Badge activation check (active when prefix words start clearing)
            const badgeThreshold = globalWordIndex / totalWords;
            const isBadgeActive = scrollProgress >= badgeThreshold;

            // Suffix words
            const suffixElements = line.suffix.map((word) => {
              const currentWordIdx = globalWordIndex++;
              const threshold = (currentWordIdx + 0.5) / totalWords;
              const isRevealed = scrollProgress >= threshold;

              return (
                <span
                  key={`suf-${currentWordIdx}`}
                  className={`inline-block mr-[0.26em] transition-colors duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isRevealed
                      ? 'text-white font-medium'
                      : 'text-white/25'
                  }`}
                >
                  {word}
                </span>
              );
            });

            return (
              <div
                key={line.id}
                className="flex flex-wrap items-center justify-center gap-y-1.5"
              >
                <span>{prefixElements}</span>

                {/* Inline Artistic Visual Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-1.5 rounded-full text-xs font-mono border transition-all duration-300 align-middle ${
                    line.badge.badgeStyle
                  } ${isBadgeActive ? line.badge.activeGlow : 'opacity-60 scale-95'}`}
                >
                  <BadgeIcon size={12} className={line.badge.accentColor} />
                  <span>{line.badge.label}</span>
                </span>

                <span>{suffixElements}</span>
              </div>
            );
          })}
        </div>

        {/* Artistic 3-Step Handshake Pipeline Bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-panel-alt)]/80 border border-white/[0.05]">
            <Bot size={14} className="text-cyan-400" />
            <span className="text-slate-200">01 Propose</span>
          </div>

          <div className="hidden sm:flex items-center text-[var(--text-muted)] opacity-60">
            <span className="w-8 h-px bg-[var(--border-subtle)]" />
            <ArrowRight size={12} className="-ml-1" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-panel-alt)]/80 border border-white/[0.05]">
            <ShieldCheck size={14} className="text-[var(--color-passed)]" />
            <span className="text-slate-200">02 Enforce</span>
          </div>

          <div className="hidden sm:flex items-center text-[var(--text-muted)] opacity-60">
            <span className="w-8 h-px bg-[var(--border-subtle)]" />
            <ArrowRight size={12} className="-ml-1" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-panel-alt)]/80 border border-white/[0.05]">
            <Users size={14} className="text-amber-400" />
            <span className="text-slate-200">03 Decide</span>
          </div>
        </div>

        {/* Micro mechanism anchor */}
        <div className="mt-3 text-[11px] font-mono text-[var(--text-muted)]">
          Fail-Closed Invariant: All three conditions must evaluate true before settlement
        </div>
      </div>
    </section>
  );
}
