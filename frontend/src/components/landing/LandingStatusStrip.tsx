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
    <section className="relative py-10 sm:py-14 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Sleek, Full-Width Glassmorphic Notice Bar */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#0F1715]/90 border border-slate-800 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-3.5">
            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-medium text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-[#00E599] shadow-[0_0_6px_#00E599] animate-pulse" />
                Test version on NEAR testnet
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-400">
                <ShieldAlert size={13} />
                Not audited yet
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-medium text-teal-300">
                <Info size={13} />
                The AI review step is simulated for now
              </span>
            </div>

            {/* Testnet Disclaimer Text */}
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              All activity runs on NEAR testnet without an independent security audit, and the AI evaluation step is currently simulated.
            </p>
          </div>

          {/* Action Link to Verification */}
          <div className="shrink-0">
            <a
              href="/verify"
              onClick={handleVerify}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-[#00E599] hover:text-[#00ffaa] text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md group"
            >
              <span>See the proof</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
