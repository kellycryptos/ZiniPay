import React from 'react';
import { ArrowRight, Info, ShieldAlert } from 'lucide-react';

export interface LandingStatusStripProps {
  onNavigateVerify?: () => void;
}

export function LandingStatusStrip({ onNavigateVerify }: LandingStatusStripProps) {
  const handleVerify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateVerify) {
      onNavigateVerify();
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <section className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="p-6 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
                Test version on NEAR testnet
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-500">
                <ShieldAlert size={12} />
                Not audited yet
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                <Info size={12} />
                The AI review step is simulated for now
              </span>
            </div>

            {/* Plain one-sentence honest status */}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              All activity runs on NEAR testnet without an independent security audit, and the AI evaluation step is currently simulated.
            </p>
          </div>

          {/* Single link to /verify */}
          <div className="shrink-0">
            <a
              href="/verify"
              onClick={handleVerify}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00EC97] hover:underline cursor-pointer"
            >
              <span>See the proof</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
