import React from 'react';
import { ExternalLink, Shield } from 'lucide-react';

interface UniversalFooterProps {
  onNavigateBoard?: () => void;
  onNavigateDocs?: () => void;
  onNavigateVerify?: () => void;
  onOpenVerifyModal?: () => void;
  network?: 'testnet' | 'mainnet';
}

export function UniversalFooter({
  onNavigateBoard,
  onNavigateDocs,
  onNavigateVerify,
  onOpenVerifyModal,
  network = 'testnet',
}: UniversalFooterProps) {
  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  const handleVerifyClick = () => {
    if (onNavigateVerify) {
      onNavigateVerify();
    } else if (onOpenVerifyModal) {
      onOpenVerifyModal();
    } else {
      window.location.href = '/verify';
    }
  };

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">
        {/* Top Section: Brand & Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-8 border-b border-[var(--border-subtle)]">
          {/* Col 1: Brand & Description */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.svg"
                alt="ZiniPay Logo"
                className="w-7 h-7 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] p-1 shrink-0"
              />
              <span className="font-sans text-base font-bold text-[var(--text-primary)] tracking-tight">
                ZiniPay
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-[#00EC97] border border-emerald-500/20">
                NEAR Testnet
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              A constrained agent layer for community treasuries on NEAR. An AI agent can propose treasury payouts. A smart contract limits it. Two humans approve.
            </p>
          </div>

          {/* Col 2: Product */}
          <div className="flex flex-col gap-2.5 text-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
              Product
            </span>
            <button
              type="button"
              onClick={onNavigateBoard ? onNavigateBoard : () => { window.location.href = '/board'; }}
              className="text-left text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={handleVerifyClick}
              className="text-left text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield size={12} className="text-[#00EC97]" />
              <span>Verification</span>
            </button>
            <button
              type="button"
              onClick={onNavigateDocs ? onNavigateDocs : () => { window.location.href = '/docs'; }}
              className="text-left text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors cursor-pointer"
            >
              Docs
            </button>
          </div>

          {/* Col 3: Evidence */}
          <div className="flex flex-col gap-2.5 text-xs font-mono">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold font-sans">
              Evidence
            </span>
            <a
              href="https://github.com/kellycryptos/ZiniPay"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00EC97] transition-colors flex items-center justify-between group"
            >
              <span>GitHub</span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-[#00EC97]" />
            </a>
            <a
              href={`${explorerBase}/address/zinipay-policy2.testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00EC97] transition-colors flex items-center justify-between group"
            >
              <span>PolicyHelper contract</span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-[#00EC97]" />
            </a>
            <a
              href={`${explorerBase}/address/zinipay-demo.sputnikv2.testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00EC97] transition-colors flex items-center justify-between group"
            >
              <span>Sputnik DAO</span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-[#00EC97]" />
            </a>
            <a
              href="/data/verified.json"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00EC97] transition-colors flex items-center justify-between group"
            >
              <span>verified.json</span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-[#00EC97]" />
            </a>
          </div>

          {/* Col 4: Project */}
          <div className="flex flex-col gap-2.5 text-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
              Project
            </span>
            <a
              href="https://github.com/kellycryptos/ZiniPay/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors flex items-center justify-between group"
            >
              <span>README</span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-[#00EC97]" />
            </a>
            <a
              href="https://github.com/kellycryptos/ZiniPay/tree/main/contracts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors flex items-center justify-between group"
            >
              <span>Smart Contracts</span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-[#00EC97]" />
            </a>
            <a
              href="https://github.com/kellycryptos/ZiniPay/tree/main/agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors flex items-center justify-between group"
            >
              <span>Agent System</span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-[#00EC97]" />
            </a>
          </div>
        </div>

        {/* Bottom Bar: GitHub link */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)]">
          <span className="text-[var(--text-muted)]">ZiniPay</span>
          <a
            href="https://github.com/kellycryptos/ZiniPay"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00EC97] transition-colors flex items-center gap-1.5"
          >
            <span>GitHub</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}
