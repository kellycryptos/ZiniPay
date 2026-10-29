import React from 'react';
import { ArrowRight, Github } from 'lucide-react';
import { LandingHero } from './LandingHero';
import { LandingReleaseGate } from './LandingReleaseGate';
import { LandingTaglineSection } from './LandingTaglineSection';
import { LandingVerifiedSection } from './LandingVerifiedSection';
import { LandingAttacksSection } from './LandingAttacksSection';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingTechStack } from './LandingTechStack';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onNavigateToApp: () => void;
}

export function LandingPage({ onNavigateToApp }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-slate-100 selection:bg-[var(--color-passed)] selection:text-black">
      {/* Landing Top Navigation */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/brand/logo-mark.svg"
              alt="ZiniPay Logo"
              className="w-8 h-8 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-strong)] p-1 shrink-0"
            />
            <div>
              <span className="font-bold text-base tracking-tight text-white font-sans">
                ZiniPay
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-[var(--text-muted)] border-l border-[var(--border-subtle)] pl-2">
                Constrained Agent Layer
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/zinipay/zinipay/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Docs
            </a>

            <a
              href="https://github.com/zinipay/zinipay"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-white transition-colors p-1"
              title="Git Repository"
            >
              <Github size={16} />
            </a>

            <button
              type="button"
              onClick={onNavigateToApp}
              className="btn-primary text-xs py-2 px-4 shadow-sm cursor-pointer"
            >
              <span>Open Dashboard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Sections in Exact Order */}
      <main className="flex-1 flex flex-col">
        {/* 1. Hero */}
        <LandingHero onNavigateToApp={onNavigateToApp} />

        {/* 2. Three-way release gate as an animated flow */}
        <LandingReleaseGate />

        {/* 3. Mandatory Word-by-Word Tagline Reveal */}
        <LandingTaglineSection />

        {/* 4. Verified on testnet section */}
        <LandingVerifiedSection />

        {/* 5. Attacks that fail section */}
        <LandingAttacksSection />

        {/* 6. How it works in 4 steps */}
        <LandingHowItWorks />

        {/* 7. Tech stack with primitives actually used */}
        <LandingTechStack />
      </main>

      {/* 8. Footer with GitHub link */}
      <LandingFooter onNavigateToApp={onNavigateToApp} />
    </div>
  );
}
