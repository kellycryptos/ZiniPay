import React from 'react';
import { Github, ExternalLink, Terminal, Shield } from 'lucide-react';

interface LandingFooterProps {
  onNavigateToApp?: () => void;
}

export function LandingFooter({ onNavigateToApp }: LandingFooterProps) {
  return (
    <footer className="py-12 bg-[var(--bg-canvas)] border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Mission */}
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <img
              src="/brand/logo-mark.svg"
              alt="ZiniPay Logo"
              className="w-5 h-5 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-strong)] p-0.5"
            />
            <span className="font-bold text-sm tracking-tight text-white font-sans">
              ZiniPay
            </span>
            <span className="tag-neutral text-[10px]">
              v1.0.0
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Constrained Agent Layer for Community Treasuries. Proof + Policy + Human Quorum.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6 text-[11px]">
          {onNavigateToApp && (
            <button
              type="button"
              onClick={onNavigateToApp}
              className="text-white hover:text-[var(--color-passed)] transition-colors cursor-pointer"
            >
              Open Dashboard (/app)
            </button>
          )}

          <a
            href="https://github.com/zinipay/zinipay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white hover:text-[var(--color-passed)] transition-colors"
          >
            <Github size={16} />
            <span>GitHub Repository</span>
          </a>

          <a
            href="https://github.com/near-daos/sputnik-dao-contract"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <span>Sputnik DAO Contracts</span>
            <ExternalLink size={14} />
          </a>

          <a
            href="https://app.trezu.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <span>Trezu Governance</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[var(--text-muted)]">
        <div>
          Zero-Fabrication Ledger · Fail-Closed Policy Invariants
        </div>
        <div>
          Testnet & Mainnet Ready
        </div>
      </div>
    </footer>
  );
}
