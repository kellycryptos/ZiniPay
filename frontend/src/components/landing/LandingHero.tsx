import React, { useState } from 'react';
import {
  ArrowRight,
  SlidersHorizontal,
  Users,
  Check,
  Bot,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface LandingHeroProps {
  onNavigateToApp: () => void;
  onNavigateVerify?: () => void;
}

/** Custom Robot Head Icon with AI Badge matching the visual reference */
function RobotAiIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Antenna */}
      <circle cx="18" cy="5" r="2" fill="#00E599" />
      <line x1="18" y1="7" x2="18" y2="10" stroke="#00E599" strokeWidth="2" strokeLinecap="round" />
      {/* Robot Head Outer Box */}
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
      {/* Eyes */}
      <rect x="11" y="15" width="4" height="4" rx="1" fill="#00E599" />
      <rect x="21" y="15" width="4" height="4" rx="1" fill="#00E599" />
      {/* Mouth Line */}
      <line x1="13" y1="23" x2="23" y2="23" stroke="#00E599" strokeWidth="1.8" strokeLinecap="round" />
      {/* AI Mini Badge at Bottom */}
      <rect x="5" y="27" width="11" height="7" rx="2" fill="#0F1715" stroke="#00E599" strokeWidth="1.2" />
      <text x="7" y="32.5" fill="#00E599" fontSize="5" fontWeight="bold" fontFamily="monospace">
        AI
      </text>
      {/* Mini Circle at Bottom Right */}
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
    <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        
        {/* 1. Top Status Badge: Live on NEAR testnet */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 shadow-[0_0_18px_rgba(16,185,129,0.25)] backdrop-blur-md mb-8 transition-transform hover:scale-105">
          <span className="w-2 h-2 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599] animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-emerald-300">
            Live on NEAR testnet
          </span>
        </div>

        {/* 2. Main Headline (Two Lines) */}
        <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.12]">
          <span className="block text-white">
            Let an AI agent propose payments.
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D1FAE5] via-[#A7F3D0] to-[#E6FFFA] mt-1">
            Keep humans in charge of the money.
          </span>
        </h1>

        {/* 3. Subheadline */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mt-6 leading-relaxed">
          Automated rules check every proposal against strict spending limits, and real people give the final sign-off.
        </p>

        {/* 4. Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 sm:mt-10">
          {/* Primary CTA: Open Dashboard → */}
          <button
            type="button"
            onClick={onNavigateToApp}
            className="px-7 py-3.5 rounded-xl bg-[#00E599] hover:bg-[#00ffaa] text-[#070D0C] font-bold text-base transition-all duration-200 shadow-[0_0_30px_rgba(0,229,153,0.5)] hover:shadow-[0_0_42px_rgba(0,229,153,0.7)] flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Open Dashboard</span>
            <span className="font-extrabold text-lg leading-none">→</span>
          </button>

          {/* Secondary CTA: Verify it yourself */}
          <a
            href="/verify"
            onClick={handleVerify}
            className="px-7 py-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 text-white font-medium text-base backdrop-blur-md transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            Verify it yourself
          </a>
        </div>

        {/* 5. Interactive Horizontal Workflow Cards (Above the Fold) */}
        <div className="w-full max-w-5xl mt-14 sm:mt-18">
          <div className="flex items-center justify-center gap-3.5 overflow-x-auto py-3 px-2 scrollbar-none">
            
            {/* 5a. Left Anchor Icon: Glowing Neon Green AI Robot */}
            <div
              className="w-14 h-14 rounded-2xl bg-[#0F1715]/90 border border-slate-800 flex items-center justify-center shrink-0 shadow-lg"
              title="Autonomous Agent Pipeline"
            >
              <RobotAiIcon className="w-8 h-8 drop-shadow-[0_0_10px_rgba(0,229,153,0.5)]" />
            </div>

            {/* 5b. Card 1 (Active/Highlighted State): Agent proposes */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveStep(1)}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveStep(1); }}
              className={`p-4 rounded-2xl flex items-center gap-3.5 min-w-[230px] sm:min-w-[260px] text-left transition-all duration-200 cursor-pointer ${
                activeStep === 1
                  ? 'border-2 border-emerald-400 bg-gradient-to-r from-emerald-950/40 via-[#0F1715]/95 to-[#0F1715]/95 shadow-[0_0_25px_rgba(16,185,129,0.22)]'
                  : 'border border-slate-800 bg-[#0F1715]/90 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeStep === 1
                    ? 'bg-emerald-500/15 border border-emerald-400/40 text-[#00E599]'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-400'
                }`}
              >
                <Bot size={22} className={activeStep === 1 ? 'drop-shadow-[0_0_6px_#00E599]' : ''} />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Agent proposes
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Submits payment request
                </div>
              </div>
            </div>

            {/* 5c. Card 2 (Default Glass State): Limits check */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveStep(2)}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveStep(2); }}
              className={`p-4 rounded-2xl flex items-center gap-3.5 min-w-[230px] sm:min-w-[260px] text-left transition-all duration-200 cursor-pointer ${
                activeStep === 2
                  ? 'border-2 border-emerald-400 bg-gradient-to-r from-emerald-950/40 via-[#0F1715]/95 to-[#0F1715]/95 shadow-[0_0_25px_rgba(16,185,129,0.22)]'
                  : 'border border-slate-800 bg-[#0F1715]/90 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeStep === 2
                    ? 'bg-emerald-500/15 border border-emerald-400/40 text-[#00E599]'
                    : 'bg-slate-800/60 border border-slate-700/60 text-[#00E599]/80'
                }`}
              >
                <SlidersHorizontal
                  size={20}
                  className={activeStep === 2 ? 'drop-shadow-[0_0_6px_#00E599]' : ''}
                />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Limits check
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Rules test the payment
                </div>
              </div>
            </div>

            {/* 5d. Card 3 (Default Glass State): Two people approve */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveStep(3)}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveStep(3); }}
              className={`p-4 rounded-2xl flex items-center gap-3.5 min-w-[230px] sm:min-w-[260px] text-left transition-all duration-200 cursor-pointer ${
                activeStep === 3
                  ? 'border-2 border-emerald-400 bg-gradient-to-r from-emerald-950/40 via-[#0F1715]/95 to-[#0F1715]/95 shadow-[0_0_25px_rgba(16,185,129,0.22)]'
                  : 'border border-slate-800 bg-[#0F1715]/90 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeStep === 3
                    ? 'bg-emerald-500/15 border border-emerald-400/40 text-[#00E599]'
                    : 'bg-slate-800/60 border border-slate-700/60 text-[#00E599]/80'
                }`}
              >
                <Users
                  size={20}
                  className={activeStep === 3 ? 'drop-shadow-[0_0_6px_#00E599]' : ''}
                />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Two people approve
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Humans give final sign-off
                </div>
              </div>
            </div>

            {/* 5e. Right Anchor Icon: Subtle Checkmark */}
            <div
              className="w-14 h-14 rounded-2xl bg-[#0F1715]/90 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0 shadow-lg"
              title="Verified Settlement"
            >
              <Check size={20} />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
