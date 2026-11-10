import React from 'react';
import { ArrowRight, Github, Shield, ExternalLink } from 'lucide-react';

export interface LandingClosingCtaProps {
  onNavigateToApp: () => void;
  onNavigateVerify?: () => void;
}

export function LandingClosingCta({
  onNavigateToApp,
  onNavigateVerify,
}: LandingClosingCtaProps) {
  const handleVerify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateVerify) {
      onNavigateVerify();
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <section className="relative py-16 sm:py-24 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden p-10 sm:p-16 rounded-3xl bg-white/95 dark:bg-[#0F1715]/95 border border-emerald-600/20 dark:border-slate-800 shadow-sm dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col items-center text-center">
          {/* Subtle Ambient Emerald Accent within the Card */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[70px] pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-[#00EC97] font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
            <span>NEAR HACKATHON · Social Money Track</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white relative z-10">
            Judge-Ready. Verified On-Chain.
          </h2>
          <p className="max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed relative z-10">
            Explore live proposals on the public board, test the 60-second verification suite, or inspect the audited Rust contracts on GitHub.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 relative z-10">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="px-8 py-4 rounded-xl bg-[#00E599] hover:bg-[#00ffaa] text-[#070D0C] font-bold text-base transition-all duration-200 shadow-[0_0_30px_rgba(0,229,153,0.5)] hover:shadow-[0_0_45px_rgba(0,229,153,0.7)] flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Open Public Board</span>
              <span className="font-extrabold text-xl leading-none">→</span>
            </button>

            <a
              href="https://github.com/kellycryptos/ZiniPay"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-base transition-colors flex items-center gap-2 shadow-sm"
            >
              <Github size={18} />
              <span>GitHub Repository</span>
            </a>

            <a
              href="/verify"
              onClick={handleVerify}
              className="px-6 py-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-[#00EC97] font-mono text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Shield size={16} />
              <span>Run On-Chain Verifier</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
