import React from 'react';
import { AmbientBackground } from './AmbientBackground';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingProblem } from './LandingProblem';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingKeyFeatures } from './LandingKeyFeatures';
import { LandingBenefits } from './LandingBenefits';
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
    <div className="min-h-screen relative flex flex-col bg-[#F4FBF7] dark:bg-[#070D0C] text-slate-900 dark:text-white transition-colors duration-200 font-sans selection:bg-[#00E599]/30 selection:text-white w-full max-w-full overflow-x-hidden antialiased">
      {/* ── Ambient Background: Obsidian Gradient, 3D Orbs & Constellations ── */}
      <AmbientBackground />

      {/* ── Floating Glassmorphic Navbar ─────────────────────────────────── */}
      <LandingHeader
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToApp={handleNavigateApp}
        onNavigateDocs={onNavigateDocs}
        onNavigateVerify={handleVerify}
      />

      {/* ── Main Content: Hero & Glassmorphic Workflow Sections ───────────── */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* 1. Hero with Status Badge, Two-Line Title, and Horizontal Workflow Cards */}
        <LandingHero
          onNavigateToApp={handleNavigateApp}
          onNavigateVerify={handleVerify}
        />

        {/* 2. The Problem: Why Autonomous Agent Treasuries Break Without Guardrails */}
        <LandingProblem />

        {/* 3. The Solution: Agent Proposes, Policy Enforces, Humans Approve */}
        <LandingHowItWorks />

        {/* 4. Key Features: Named-Account Reputation, Tiered Approvals, Public Board, Fail-Closed */}
        <LandingKeyFeatures
          onNavigateToBoard={handleNavigateApp}
          onNavigateVerify={handleVerify}
        />

        {/* 5. Attacks That Fail: Verified Testnet Receipts */}
        <LandingBenefits />

        {/* 6. Sleek Full-Width Testnet Notice Bar */}
        <LandingStatusStrip onNavigateVerify={handleVerify} />

        {/* 7. Closing Live Demo CTA */}
        <LandingClosingCta
          onNavigateToApp={handleNavigateApp}
          onNavigateVerify={handleVerify}
        />
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
