import React from 'react';
import { Github } from 'lucide-react';

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
    <footer className="w-full bg-[var(--bg-canvas)] border-t border-[var(--border-subtle)] py-12 transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Left: Brand, Description, Auditing notice */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="ZiniPay Logo"
              className="w-7 h-7 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] p-1 shrink-0"
            />
            <span className="font-sans text-base font-bold text-[var(--text-primary)]">
              ZiniPay
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Safe agent payments with human approval.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Testnet only, not audited.
          </p>
        </div>

        {/* Right: Navigation Links */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <button
            type="button"
            onClick={onNavigateToApp}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={handleDocs}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Docs
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Verification
          </button>
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <Github size={15} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
