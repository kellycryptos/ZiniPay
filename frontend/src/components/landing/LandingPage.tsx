import React, { useState } from 'react';
import { AppHeader } from '../navigation/AppHeader';
import { UniversalFooter } from '../navigation/UniversalFooter';
import { LandingHero } from './LandingHero';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingFeaturesSection } from './LandingFeaturesSection';
import { LandingVerifiedSection } from './LandingVerifiedSection';
import { LandingAttacksSection } from './LandingAttacksSection';
import { LandingRealVsSimulated } from './LandingRealVsSimulated';
import { LandingTracksSection } from './LandingTracksSection';
import { LandingFaqSection } from './LandingFaqSection';
import { VerificationModal } from '../dashboard/VerificationModal';

export interface LandingPageProps {
  onNavigateToApp: () => void;
  onNavigateToBoard?: () => void;
  onNavigateDocs?: () => void;
  network?: 'testnet' | 'mainnet';
}

export function LandingPage({
  onNavigateToApp,
  onNavigateToBoard,
  onNavigateDocs,
  network = 'testnet',
}: LandingPageProps) {
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  const handleOpenVerify = () => setVerificationModalOpen(true);
  const handleCloseVerify = () => setVerificationModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-slate-100 selection:bg-[var(--color-passed)] selection:text-black font-sans">
      {/* ── Keyless Verification Suite Modal ──────────────────── */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={handleCloseVerify}
        network={network}
      />

      {/* ── Universal Header ──────────────────────────────────── */}
      <AppHeader
        currentPath="/"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateBoard={onNavigateToBoard || onNavigateToApp}
        onNavigateDocs={onNavigateDocs}
        onOpenVerifyModal={handleOpenVerify}
        network={network}
      />

      {/* ── Main Landing Sections in Exact Mandated Order ─────── */}
      <main className="flex-1 flex flex-col">
        {/* Section 1: Hero ("Let AI agents ask for money. Never let them take it.") */}
        <LandingHero
          onNavigateToApp={onNavigateToApp}
          onNavigateToBoard={onNavigateToBoard}
          onOpenVerifyModal={handleOpenVerify}
        />

        {/* Section 2: Problem & Solution in Plain Language (Agent proposes, PolicyHelper enforces, Humans approve) */}
        <LandingHowItWorks onNavigateToApp={onNavigateToApp} />

        {/* Section 3: Feature Cards (On-chain reputation, tier caps, public board, fail-closed policy, live verify) */}
        <LandingFeaturesSection />

        {/* Section 4: Proof Strip (Real counts read from verified.json linking to explorer) & Verified Run Ledger */}
        <LandingVerifiedSection />

        {/* Section 5: Attacks Blocked (Replay, case-variant, over-cap, unauthorized, cooldown with real panic text) */}
        <LandingAttacksSection />

        {/* Section 6: What is Real and What is Simulated (Plain 2-column table) */}
        <LandingRealVsSimulated />

        {/* Section 7: Hackathon Tracks (Social Money & AI Security with evidence links) */}
        <LandingTracksSection onNavigateToApp={onNavigateToApp} />

        {/* Section 8: FAQ (5 Questions) & Final Call to Action */}
        <LandingFaqSection
          onNavigateToApp={onNavigateToApp}
          onOpenVerifyModal={handleOpenVerify}
        />
      </main>

      {/* ── Universal Footer ──────────────────────────────────── */}
      <UniversalFooter
        onNavigateBoard={onNavigateToBoard || onNavigateToApp}
        onNavigateDocs={onNavigateDocs}
        onOpenVerifyModal={handleOpenVerify}
        network={network}
      />
    </div>
  );
}
