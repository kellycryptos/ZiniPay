import React from 'react';
import { AppHeader } from '../navigation/AppHeader';
import { UniversalFooter } from '../navigation/UniversalFooter';
import { LandingHero } from './LandingHero';
import { LandingProblemSection } from './LandingProblemSection';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingEnforcedVsAdvisory } from './LandingEnforcedVsAdvisory';
import { LandingWhatYouCanDo } from './LandingWhatYouCanDo';
import { LandingSafetyLimits } from './LandingSafetyLimits';
import { LandingFaqSection } from './LandingFaqSection';
import { LandingVerifyCallout } from './LandingVerifyCallout';

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
  network = 'testnet',
}: LandingPageProps) {
  const handleVerify = onNavigateVerify || (() => { window.location.href = '/verify'; });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--color-passed)] selection:text-black font-sans transition-colors duration-200">
      {/* ── Universal Header ──────────────────────────────────── */}
      <AppHeader
        currentPath="/"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateBoard={onNavigateToBoard || onNavigateToApp}
        onNavigateDocs={onNavigateDocs}
        onNavigateVerify={handleVerify}
        network={network}
      />

      {/* ── 8 Ordered Landing Sections for Users ─────────────── */}
      <main className="flex-1 flex flex-col">
        {/* 1. Hero: Plain and short with two actions and 3 short points */}
        <LandingHero
          onNavigateToApp={onNavigateToApp}
          onNavigateToBoard={onNavigateToBoard}
          onNavigateVerify={handleVerify}
        />

        {/* 2. The Problem: Giving an agent treasury access is risky */}
        <LandingProblemSection />

        {/* 3. How a Payout Works in 3 Steps */}
        <LandingHowItWorks />

        {/* 4. What Is Enforced On-Chain vs. Advisory */}
        <LandingEnforcedVsAdvisory />

        {/* 5. What You Can Do Today */}
        <LandingWhatYouCanDo onNavigateToApp={onNavigateToApp} />

        {/* 6. Safety Limits and Honest Status */}
        <LandingSafetyLimits />

        {/* 7. FAQ for Users */}
        <LandingFaqSection />

        {/* 8. Verify It Yourself Link */}
        <LandingVerifyCallout onNavigateVerify={handleVerify} />
      </main>

      {/* ── Universal Footer ──────────────────────────────────── */}
      <UniversalFooter
        onNavigateBoard={onNavigateToBoard || onNavigateToApp}
        onNavigateDocs={onNavigateDocs}
        onNavigateVerify={handleVerify}
        network={network}
      />
    </div>
  );
}
