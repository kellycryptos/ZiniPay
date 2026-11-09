import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface LandingClosingCtaProps {
  onNavigateToApp: () => void;
}

export function LandingClosingCta({ onNavigateToApp }: LandingClosingCtaProps) {
  return (
    <section className="py-16 sm:py-24 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-6 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Try the live demo
        </h2>
        <p className="max-w-xl text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
          Explore how automated limits and two-person approval keep payments safe in real time.
        </p>
        <button
          type="button"
          onClick={onNavigateToApp}
          className="px-6 py-3.5 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center gap-2 group"
        >
          <span>Open Dashboard</span>
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}
