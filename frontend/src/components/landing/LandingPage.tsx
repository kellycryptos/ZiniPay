import React from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingBenefits } from './LandingBenefits';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingStatusStrip } from './LandingStatusStrip';
import { LandingClosingCta } from './LandingClosingCta';
import { LandingFooter } from './LandingFooter';

export interface LandingPageProps {
  onNavigateToApp: () => void;
  onNavigateToBoard?: () => void;
  onNavigateDocs?: () => void;
  onNavigateVerify?: () => void;
  network?: 'testnet' | 'mainnet';
}

export function LandingPage({
  onNavigateToApp,
  onNavigateToBoard,
  onNavigateDocs,
  onNavigateVerify,
}: LandingPageProps) {
  const handleNavigateApp = onNavigateToBoard || onNavigateToApp;
  const handleVerify = onNavigateVerify || (() => { window.location.href = '/verify'; });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans selection:bg-[#00EC97]/30 selection:text-white transition-colors duration-200">
      {/* ── Plain Header ──────────────────────────────────────── */}
      <LandingHeader
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToApp={handleNavigateApp}
        onNavigateDocs={onNavigateDocs}
      />

      {/* ── Main Content: 5 Ordered Plain Sections ───────────── */}
      <main className="flex-1 flex flex-col">
        {/* a. Hero */}
        <LandingHero
          onNavigateToApp={handleNavigateApp}
          onNavigateVerify={handleVerify}
        />

        {/* b. Three Benefit Cards */}
        <LandingBenefits />

        {/* c. How It Works (Three Steps) */}
        <LandingHowItWorks />

        {/* d. Honest Status Strip */}
        <LandingStatusStrip onNavigateVerify={handleVerify} />

        {/* e. Closing Section with One Button */}
        <LandingClosingCta onNavigateToApp={handleNavigateApp} />
      </main>

      {/* ── Plain Footer ──────────────────────────────────────── */}
      <LandingFooter
        onNavigateToApp={handleNavigateApp}
        onNavigateDocs={onNavigateDocs}
        onNavigateVerify={handleVerify}
      />
    </div>
  );
}
