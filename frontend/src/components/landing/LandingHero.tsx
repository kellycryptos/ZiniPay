import React from 'react';
import { ArrowRight, Bot, ShieldCheck, Users, ChevronDown } from 'lucide-react';

export interface LandingHeroProps {
  onNavigateToApp: () => void;
  onNavigateVerify?: () => void;
}

export function LandingHero({
  onNavigateToApp,
  onNavigateVerify,
}: LandingHeroProps) {
  const handleVerify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateVerify) {
      onNavigateVerify();
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <section className="py-16 sm:py-24 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline, Subheadline, Buttons */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          {/* Badge: Live on NEAR testnet */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] w-fit">
            <span className="w-2 h-2 rounded-full bg-[#00EC97] animate-pulse" />
            <span>Live on NEAR testnet</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.15]">
            Let an AI agent propose payments. Keep humans in charge of the money.
          </h1>

          {/* Subline: Exactly one sentence */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Automated rules check every proposal against strict spending limits, and real people give the final sign-off.
          </p>

          {/* Buttons: Open Dashboard & Verify it yourself */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="px-6 py-3 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center gap-2 group"
            >
              <span>Open Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="/verify"
              onClick={handleVerify}
              className="px-6 py-3 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[var(--bg-panel)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm font-medium transition-colors cursor-pointer"
            >
              Verify it yourself
            </a>
          </div>
        </div>

        {/* Right Column: Simple Three-Step Illustration */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-6 shadow-sm flex flex-col gap-4">
            {/* Step 1 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-lg bg-[#00EC97]/10 border border-[#00EC97]/25 flex items-center justify-center text-[#00EC97] shrink-0">
                <Bot size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Agent proposes
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Submits payment request
                </div>
              </div>
            </div>

            {/* Connecting chevron */}
            <div className="flex justify-center -my-2 text-[var(--text-muted)]">
              <ChevronDown size={18} />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-lg bg-[#00EC97]/10 border border-[#00EC97]/25 flex items-center justify-center text-[#00EC97] shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Limits check
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Rules test the payment
                </div>
              </div>
            </div>

            {/* Connecting chevron */}
            <div className="flex justify-center -my-2 text-[var(--text-muted)]">
              <ChevronDown size={18} />
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-lg bg-[#00EC97]/10 border border-[#00EC97]/25 flex items-center justify-center text-[#00EC97] shrink-0">
                <Users size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Two people approve
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Humans give final sign-off
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
