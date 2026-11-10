import React from 'react';
import { AmbientBackground } from './AmbientBackground';
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
    <div className="min-h-screen relative flex flex-col bg-[#070D0C] text-white font-sans selection:bg-[#00E599]/30 selection:text-white w-full max-w-full overflow-x-hidden antialiased">
      {/* ── Ambient Background: Obsidian Gradient, 3D Orbs & Constellations ── */}
      <AmbientBackground />

      {/* ── Floating Glassmorphic Navbar ─────────────────────────────────── */}
      <LandingHeader
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToApp={handleNavigateApp}
        onNavigateDocs={onNavigateDocs}
      />

      {/* ── Main Content: Hero & Glassmorphic Workflow Sections ───────────── */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* 1. Hero with Status Badge, Two-Line Title, and Horizontal Workflow Cards */}
        <LandingHero
          onNavigateToApp={handleNavigateApp}
          onNavigateVerify={handleVerify}
        />

        {/* 2. Three Benefit Cards (Dark Glassmorphism) */}
        <LandingBenefits />

        {/* 3. How It Works (Three Steps) */}
        <LandingHowItWorks />

        {/* 4. Sleek Full-Width Testnet Notice Bar */}
        <LandingStatusStrip onNavigateVerify={handleVerify} />

        {/* 5. Closing Live Demo CTA */}
        <LandingClosingCta onNavigateToApp={handleNavigateApp} />
      </main>

      {/* ── Dark Glassmorphic Footer ─────────────────────────────────────── */}
      <LandingFooter
        onNavigateToApp={handleNavigateApp}
        onNavigateDocs={onNavigateDocs}
        onNavigateVerify={handleVerify}
      />
    </div>
  );
}
