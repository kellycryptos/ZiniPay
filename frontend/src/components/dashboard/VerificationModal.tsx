import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Shield,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  network?: 'testnet' | 'mainnet';
}

export function VerificationModal({
  isOpen,
  onClose,
  network = 'testnet',
}: VerificationModalProps) {
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const copyCommand = () => {
    navigator.clipboard.writeText('npm run verify:testnet');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const checks = [
    {
      category: 'Sputnik DAO v2 Governance',
      items: [
        { label: 'DAO Active Account', val: 'zinipay-demo.sputnikv2.testnet', status: 'PASS' },
        { label: 'Council Multi-Sig Signers', val: 'zinipay-c1.testnet, zinipay-c2.testnet (>= 2 signers)', status: 'PASS' },
        { label: 'Agent Isolation (0 Vote Weight)', val: 'agentzinipaytestnet.testnet has proposal-only rights', status: 'PASS' },
      ],
    },
    {
      category: 'PolicyHelper Rust Contract',
      items: [
        { label: 'Contract Address', val: 'zinipay-policy2.testnet', status: 'PASS' },
        { label: 'Contract Ownership', val: 'Transferred on-chain to zinipay-demo.sputnikv2.testnet', status: 'PASS' },
        { label: 'Base Spend Cap', val: '10.0 NEAR (Enforced)', status: 'PASS' },
        { label: 'Tier Scale', val: '1.5x (Silver: 15N) / 2.0x (Gold: 20N) (Enforced)', status: 'PASS' },
        { label: 'Cooldown Period', val: '60 seconds (Enforced)', status: 'PASS' },
        { label: 'Anti-Replay Mechanism', val: 'cid_used(CID) burns deliverable upon release (Enforced)', status: 'PASS' },
        { label: 'Approval Schedule', val: 'get_approval_tier schedule is Advisory (DAO 2/2 executes)', status: 'PASS' },
      ],
    },
    {
      category: 'On-Chain Proofs & Blocked Attacks',
      items: [
        {
          label: 'Proposal #6 Multi-Sig Execution (0.10 NEAR)',
          tx: '2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
          status: 'PASS',
        },
        {
          label: 'Blocked Attack 1: Replay CID (kellycryptos/ZiniPay#2)',
          tx: '9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb',
          status: 'PASS',
        },
        {
          label: 'Blocked Attack 2: Over-Cap Spend (16.0 NEAR)',
          tx: 'EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
          status: 'PASS',
        },
        {
          label: 'Blocked Attack 3: Unauthorized Caller (agent release)',
          tx: '2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B',
          status: 'PASS',
        },
        {
          label: 'Blocked Attack 4: Case-Variant Replay',
          tx: 'EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y',
          status: 'PASS',
        },
        {
          label: 'Blocked Attack 5: Cooldown Violation',
          tx: '2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD',
          status: 'PASS',
        },
        {
          label: 'Blocked Admin: Former Owner Unburn Attempt',
          tx: 'EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14',
          status: 'PASS',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-panel)] p-6 shadow-2xl flex flex-col gap-5 text-xs text-slate-200">
        {/* ── Modal Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
              <Terminal size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Keyless On-Chain Verification Suite
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                25 automated tests against NEAR Testnet RPC.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 60-Second CLI Command Card ──────────────────────── */}
        <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">
              Run Keyless Test In Terminal (No Private Keys Required)
            </span>
            <button
              type="button"
              onClick={copyCommand}
              className="text-[11px] font-mono text-[#00EC97] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedCmd ? 'Copied' : 'Copy command'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-lg bg-black/70 border border-white/10 font-mono text-xs text-[#00EC97] flex items-center justify-between select-all">
            <span>npm run verify:testnet</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-mono">
            Directly queries public NEAR FastNear RPC for Sputnik DAO contract code, policy storage, 14 transactions, and 5 blocked attack failures.
          </p>
        </div>

        {/* ── Checklist Groups ─────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {checks.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-2">
              <span className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider">
                {group.category}
              </span>
              <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-1 font-mono text-xs">
                {group.items.map((item: any, iIdx: number) => (
                  <div
                    key={iIdx}
                    className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#00EC97] shrink-0" />
                      <span className="text-slate-300">{item.label}</span>
                    </div>

                    {item.tx ? (
                      <a
                        href={`https://testnet.nearblocks.io/txns/${item.tx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00EC97] hover:underline flex items-center gap-1 text-[11px] truncate max-w-[200px]"
                        title={`Inspect transaction on NEARBlocks: ${item.tx}`}
                      >
                        <span>{item.tx.slice(0, 10)}...</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px] truncate max-w-[280px]">
                        {item.val}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            Network: NEAR Testnet · DAO: zinipay-demo.sputnikv2.testnet
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
