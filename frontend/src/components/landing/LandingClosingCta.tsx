import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface LandingClosingCtaProps {
  onNavigateToApp: () => void;
}

export function LandingClosingCta({ onNavigateToApp }: LandingClosingCtaProps) {
  return (
    <section className="relative py-16 sm:py-24 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden p-10 sm:p-16 rounded-3xl bg-white/85 dark:bg-[#0F1715]/90 border border-emerald-600/20 dark:border-slate-800 backdrop-blur-md shadow-sm dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col items-center text-center">
          {/* Subtle Ambient Emerald Accent within the Card */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[70px] pointer-events-none -z-10" />

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white relative z-10">
            Try the live demo
          </h2>
          <p className="max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed relative z-10">
            Explore how automated limits and two-person approval keep payments safe in real time.
          </p>

          <button
            type="button"
            onClick={onNavigateToApp}
            className="mt-8 px-8 py-4 rounded-xl bg-[#00E599] hover:bg-[#00ffaa] text-[#070D0C] font-bold text-base transition-all duration-200 shadow-[0_0_30px_rgba(0,229,153,0.5)] hover:shadow-[0_0_45px_rgba(0,229,153,0.7)] flex items-center gap-2 cursor-pointer active:scale-[0.98] relative z-10"
          >
            <span>Open Dashboard</span>
            <span className="font-extrabold text-xl leading-none">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
