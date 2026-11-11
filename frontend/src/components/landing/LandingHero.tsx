import React, { useState } from 'react';
import {
  ArrowRight,
  SlidersHorizontal,
  Users,
  Check,
  Bot,
  ShieldCheck,
  Github,
  Shield,
  Layers,
} from 'lucide-react';

export interface LandingHeroProps {
  onNavigateToApp: () => void;
  onNavigateVerify?: () => void;
}

/** Custom Robot Head Icon with AI Badge */
function RobotAiIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="18" cy="5" r="2" fill="#00E599" />
      <line x1="18" y1="7" x2="18" y2="10" stroke="#00E599" strokeWidth="2" strokeLinecap="round" />
      <rect
        x="6"
        y="10"
        width="24"
        height="18"
        rx="5"
        stroke="#00E599"
        strokeWidth="2.2"
        fill="rgba(0, 229, 153, 0.08)"
      />
      <rect x="11" y="15" width="4" height="4" rx="1" fill="#00E599" />
      <rect x="21" y="15" width="4" height="4" rx="1" fill="#00E599" />
      <line x1="13" y1="23" x2="23" y2="23" stroke="#00E599" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="5" y="27" width="11" height="7" rx="2" fill="#0F1715" stroke="#00E599" strokeWidth="1.2" />
      <text x="7" y="32.5" fill="#00E599" fontSize="5" fontWeight="bold" fontFamily="monospace">
        AI
      </text>
      <circle cx="28" cy="30" r="3" fill="#0F1715" stroke="#00E599" strokeWidth="1.2" />
      <path d="M26.5 30 L27.5 31 L29.5 29" stroke="#00E599" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LandingHero({
  onNavigateToApp,
  onNavigateVerify,
}: LandingHeroProps) {
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleVerify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateVerify) {
      onNavigateVerify();
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-20 overflow-hidden z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        
        {/* 2. Main Headline */}
        <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.12]">
          <span className="block text-slate-900 dark:text-white">
            Let an AI agent propose payments.
          </span>
          <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-200 dark:to-emerald-400 bg-clip-text text-transparent mt-1">
            Keep humans in charge of the money.
          </span>
        </h1>

        {/* 3. Subheadline */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-6 leading-relaxed">
          A fail-closed governance layer for community treasuries on NEAR. An AI agent deliberates on deliverables; the PolicyHelper smart contract enforces reputation and spend caps; human council members approve.
        </p>

        {/* 4. Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 sm:mt-10">
          {/* Primary CTA: Open Public Board → */}
          <button
            type="button"
            onClick={onNavigateToApp}
            className="px-7 py-3.5 rounded-xl bg-[#00E599] hover:bg-[#00ffaa] text-[#070D0C] font-bold text-base transition-all duration-200 shadow-[0_0_30px_rgba(0,229,153,0.5)] hover:shadow-[0_0_42px_rgba(0,229,153,0.7)] flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Open Public Board</span>
            <span className="font-extrabold text-lg leading-none">→</span>
          </button>

          {/* Secondary CTA: GitHub Repo */}
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 hover:border-emerald-500/50 text-slate-800 dark:text-white font-medium text-base transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <Github size={17} />
            <span>GitHub Code</span>
          </a>

          {/* Secondary CTA: Verify On-Chain */}
          <a
            href="/verify"
            onClick={handleVerify}
            className="px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/40 hover:bg-slate-200 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-[#00EC97] font-mono text-sm font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Shield size={15} />
            <span>Verify Testnet Proofs</span>
          </a>
        </div>

        {/* 5. Interactive Horizontal Workflow Cards (The Three-Way Gate) */}
        <div className="w-full max-w-5xl mt-14 sm:mt-16">
          <div className="flex items-center justify-center gap-3.5 overflow-x-auto py-3 px-2 scrollbar-none">
            
            {/* Left Anchor Icon */}
            <div
              className="w-14 h-14 rounded-2xl bg-white/95 dark:bg-[#0F1715]/95 border border-emerald-600/20 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm dark:shadow-lg"
              title="Agent Proposal Engine"
            >
              <RobotAiIcon className="w-8 h-8 drop-shadow-[0_0_10px_rgba(0,229,153,0.5)]" />
            </div>

            {/* Step 1: Agent proposes */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveStep(1)}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveStep(1); }}
              className={`p-4 rounded-2xl flex items-center gap-3.5 min-w-[240px] sm:min-w-[270px] text-left transition-all duration-200 cursor-pointer ${
                activeStep === 1
                  ? 'border-2 border-emerald-500 dark:border-emerald-400 bg-emerald-50/80 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-[#0F1715]/95 dark:to-[#0F1715]/95 shadow-sm dark:shadow-[0_0_25px_rgba(16,185,129,0.22)]'
                  : 'border border-emerald-600/20 dark:border-slate-800 bg-white/95 dark:bg-[#0F1715]/95 hover:border-emerald-500/40 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeStep === 1
                    ? 'bg-emerald-500/15 border border-emerald-400/40 text-[#00E599]'
                    : 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Bot size={22} className={activeStep === 1 ? 'drop-shadow-[0_0_6px_#00E599]' : ''} />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  1. Agent proposes
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Verifies PR & drafts proposal
                </div>
              </div>
            </div>

            {/* Step 2: Policy enforces */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveStep(2)}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveStep(2); }}
              className={`p-4 rounded-2xl flex items-center gap-3.5 min-w-[240px] sm:min-w-[270px] text-left transition-all duration-200 cursor-pointer ${
                activeStep === 2
                  ? 'border-2 border-emerald-500 dark:border-emerald-400 bg-emerald-50/80 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-[#0F1715]/95 dark:to-[#0F1715]/95 shadow-sm dark:shadow-[0_0_25px_rgba(16,185,129,0.22)]'
                  : 'border border-emerald-600/20 dark:border-slate-800 bg-white/95 dark:bg-[#0F1715]/95 hover:border-emerald-500/40 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeStep === 2
                    ? 'bg-emerald-500/15 border border-emerald-400/40 text-[#00E599]'
                    : 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-emerald-600 dark:text-[#00E599]/80'
                }`}
              >
                <SlidersHorizontal
                  size={20}
                  className={activeStep === 2 ? 'drop-shadow-[0_0_6px_#00E599]' : ''}
                />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  2. Policy enforces
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Spend caps & CID burned
                </div>
              </div>
            </div>

            {/* Step 3: Humans approve */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveStep(3)}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveStep(3); }}
              className={`p-4 rounded-2xl flex items-center gap-3.5 min-w-[240px] sm:min-w-[270px] text-left transition-all duration-200 cursor-pointer ${
                activeStep === 3
                  ? 'border-2 border-emerald-500 dark:border-emerald-400 bg-emerald-50/80 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-[#0F1715]/95 dark:to-[#0F1715]/95 shadow-sm dark:shadow-[0_0_25px_rgba(16,185,129,0.22)]'
                  : 'border border-emerald-600/20 dark:border-slate-800 bg-white/95 dark:bg-[#0F1715]/95 hover:border-emerald-500/40 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeStep === 3
                    ? 'bg-emerald-500/15 border border-emerald-400/40 text-[#00E599]'
                    : 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-emerald-600 dark:text-[#00E599]/80'
                }`}
              >
                <Users
                  size={20}
                  className={activeStep === 3 ? 'drop-shadow-[0_0_6px_#00E599]' : ''}
                />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  3. Humans approve
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Sputnik DAO 2-of-2 multi-sig
                </div>
              </div>
            </div>

            {/* Right Anchor Icon */}
            <div
              className="w-14 h-14 rounded-2xl bg-white/95 dark:bg-[#0F1715]/95 border border-emerald-600/20 dark:border-slate-800 flex items-center justify-center text-[#00E599] shrink-0 shadow-sm dark:shadow-lg"
              title="Settled Payout Proof"
            >
              <Check size={20} />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
