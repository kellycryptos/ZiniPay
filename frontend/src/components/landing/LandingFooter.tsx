import React from 'react';
import { Github } from 'lucide-react';
import { ZiniPayLogo } from './LandingHeader';

export interface LandingFooterProps {
  onNavigateToApp: () => void;
  onNavigateDocs?: () => void;
  onNavigateVerify?: () => void;
}

export function LandingFooter({
  onNavigateToApp,
  onNavigateDocs,
  onNavigateVerify,
}: LandingFooterProps) {
  const handleDocs = () => {
    if (onNavigateDocs) {
      onNavigateDocs();
    } else {
      window.location.href = '/docs';
    }
  };

  const handleVerify = () => {
    if (onNavigateVerify) {
      onNavigateVerify();
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <footer className="relative w-full border-t border-slate-800/80 bg-[#070D0C]/80 backdrop-blur-md py-12 z-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Left: Brand, Description, Auditing notice */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <ZiniPayLogo className="w-6 h-6 drop-shadow-[0_0_8px_rgba(0,229,153,0.5)]" />
            </div>
            <span className="font-sans text-lg font-bold text-white tracking-tight">
              ZiniPay
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Safe agent payments with human approval.
          </p>
          <p className="text-xs text-slate-500">
            Testnet only, not audited.
          </p>
        </div>

        {/* Right: Navigation Links */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <button
            type="button"
            onClick={onNavigateToApp}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={handleDocs}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Docs
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Verification
          </button>
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
          >
            <Github size={15} className="group-hover:text-white transition-colors" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
