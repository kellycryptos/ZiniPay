import React from 'react';
import { Github, ExternalLink, ShieldCheck } from 'lucide-react';
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
    <footer className="relative w-full border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#070D0C]/90 backdrop-blur-md py-12 z-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Left: Brand, Description, Auditing notice */}
        <div className="flex flex-col gap-2.5 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <ZiniPayLogo className="w-6 h-6 drop-shadow-[0_0_8px_rgba(0,229,153,0.5)]" />
            </div>
            <span className="font-sans text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              ZiniPay
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-[#00EC97] border border-emerald-500/20 font-semibold">
              NEAR Testnet
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            A constrained agent governance layer for community treasuries on NEAR. An AI agent proposes; a Rust contract limits; human council members approve.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Testnet only. Not audited.</span>
          </div>
        </div>

        {/* Right: Navigation Links */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <button
            type="button"
            onClick={onNavigateToApp}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            Public Board
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            Verification Suite
          </button>
          <button
            type="button"
            onClick={handleDocs}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            Documentation
          </button>
          <a
            href="https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Sputnik DAO</span>
            <ExternalLink size={12} />
          </a>
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 group font-medium"
          >
            <Github size={15} className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
