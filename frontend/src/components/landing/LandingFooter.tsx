import React, { useState } from 'react';
import { Github, ExternalLink, Terminal, Shield, CheckCircle2, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

interface LandingFooterProps {
  onNavigateToApp?: () => void;
}

const VERIFICATION_MATRIX = [
  {
    sponsor: 'NEAR Protocol (Sputnik DAO v2)',
    capability: 'Treasury Governance & Multi-Sig Execution',
    methods: 'add_proposal (FunctionCall), act_proposal (VoteApprove), get_policy, get_proposals',
    sourceFile: 'agent/src/dao.ts#L71-L200',
    sourceUrl: 'https://github.com/zinipay/zinipay/blob/main/agent/src/dao.ts#L71-L200',
    proofLabel: 'Proposal #6 (Confirmed)',
    proofUrl: 'https://testnet.nearblocks.io/txns/HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK',
    txHash: 'HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK',
    status: 'Verified on Testnet',
  },
  {
    sponsor: 'NEAR Smart Contracts (Rust SDK)',
    capability: 'PolicyHelper Spend Caps & Anti-Replay Guard',
    methods: 'release, check_policy, get_reputation, get_effective_cap, burn_cid',
    sourceFile: 'contracts/policy-helper/src/lib.rs#L169-L324',
    sourceUrl: 'https://github.com/zinipay/zinipay/blob/main/contracts/policy-helper/src/lib.rs#L169-L324',
    proofLabel: 'Payout 2nWMVt... / Blocked Drain Eiktoy...',
    proofUrl: 'https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
    txHash: '2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
    status: 'Verified on Testnet',
  },
  {
    sponsor: 'NEAR AI Cloud (LLM Deliberation)',
    capability: 'Dual-Agent Consensus (Inspector + Risk Arbiter)',
    methods: 'POST /v1/chat/completions (z-ai/glm-5.3-flash)',
    sourceFile: 'agent/src/deliberation.ts#L34-L245',
    sourceUrl: 'https://github.com/zinipay/zinipay/blob/main/agent/src/deliberation.ts#L34-L245',
    proofLabel: 'Deliberation Tests 1-9 Passing (Hardware TEE not claimed)',
    proofUrl: 'https://github.com/zinipay/zinipay/blob/main/agent/test/deliberation.test.ts',
    txHash: 'agent/test/deliberation.test.ts (9 Passing Tests)',
    status: 'Verified Automated CI',
  },
  {
    sponsor: 'NEAR Intents (ChainDefuser 1Click)',
    capability: 'Cross-Chain Value Routing Quote (NEAR → USDC)',
    methods: 'POST /v0/quote',
    sourceFile: 'agent/src/intents.ts#L45-L95',
    sourceUrl: 'https://github.com/zinipay/zinipay/blob/main/agent/src/intents.ts#L45-L95',
    proofLabel: '1Click Quote Resolution (Quote-only / no unproven settlement)',
    proofUrl: 'https://1click.chaindefuser.com',
    txHash: 'agent/test/intents-live.test.ts (Quote Resolved)',
    status: 'Verified Live API',
  },
  {
    sponsor: 'NEAR Wallet Selector & Observer',
    capability: 'Council Signer Authentication & Read-Only Observer Mode',
    methods: 'setupWalletSelector, MyNearWallet, Meteor, HERE + Observer Preview',
    sourceFile: 'frontend/src/lib/wallet.ts#L20-L185',
    sourceUrl: 'https://github.com/zinipay/zinipay/blob/main/frontend/src/lib/wallet.ts#L20-L185',
    proofLabel: 'Council Signer Votes 22HTUkeVM... / Observer Read-Only',
    proofUrl: 'https://testnet.nearblocks.io/txns/22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD',
    txHash: '22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD',
    status: 'Verified on Testnet',
  },
];

export function LandingFooter({ onNavigateToApp }: LandingFooterProps) {
  const [matrixOpen, setMatrixOpen] = useState(true);

  return (
    <footer className="py-12 bg-[var(--bg-canvas)] border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)]">
      {/* ── Sponsor Track Verification Matrix ("The Receipt Box") ── */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="rounded-2xl bg-[var(--bg-panel)] border border-white/[0.08] shadow-2xl overflow-hidden">
          <div
            onClick={() => setMatrixOpen(!matrixOpen)}
            className="flex items-center justify-between p-4 bg-[var(--bg-panel-alt)] border-b border-[var(--border-subtle)] cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-[#00EC97] border border-emerald-500/20">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-sans flex items-center gap-2">
                  <span>Track Verification Matrix ("The Receipt Box")</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-[#00EC97] border border-emerald-500/30">
                    5 of 5 Verified
                  </span>
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
                  Direct code permalinks, method signatures, testnet transaction hashes, and live attestation receipts
                </p>
              </div>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle Verification Matrix"
            >
              {matrixOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {matrixOpen && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[11px] text-[var(--text-muted)] font-mono">
                    <th className="py-3 px-4">Capability / Sponsor Track</th>
                    <th className="py-3 px-4">Specific Endpoint / Method</th>
                    <th className="py-3 px-4">Source Code Permalink</th>
                    <th className="py-3 px-4">Verified Testnet Tx / Evidence</th>
                    <th className="py-3 px-4">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {VERIFICATION_MATRIX.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white font-sans text-xs">{item.sponsor}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-sans">{item.capability}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">
                        <code className="px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.06] text-amber-300">
                          {item.methods}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#00EC97] hover:underline text-[11px]"
                        >
                          <FileCode size={13} />
                          <span>{item.sourceFile}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={item.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-200 hover:text-white text-[11px] hover:underline"
                        >
                          <span className="truncate max-w-[200px]">{item.proofLabel}</span>
                          <ExternalLink size={11} className="text-[var(--text-muted)] shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 text-[#00EC97] border border-emerald-500/30">
                          <CheckCircle2 size={10} />
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Mission */}
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <img
              src="/brand/logo-mark.svg"
              alt="ZiniPay Logo"
              className="w-5 h-5 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-strong)] p-0.5"
            />
            <span className="font-display font-bold text-base tracking-tight text-white font-sans">
              ZiniPay
            </span>
            <span className="tag-neutral text-[10px]">
              v1.0.0
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-sans">
            Constrained Agent Layer for Community Treasuries. Proof + Policy + Human Quorum.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6 text-[11px]">
          {onNavigateToApp && (
            <button
              type="button"
              onClick={onNavigateToApp}
              className="text-white hover:text-[var(--color-passed)] transition-colors cursor-pointer font-sans font-medium"
            >
              Open Dashboard (/app)
            </button>
          )}

          <a
            href="https://github.com/zinipay/zinipay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white hover:text-[var(--color-passed)] transition-colors font-sans font-medium"
          >
            <Github size={16} />
            <span>GitHub Repository</span>
          </a>

          <a
            href="https://github.com/zinipay/zinipay/tree/main/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-white transition-colors font-sans"
          >
            <span>Documentation</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[var(--text-muted)]">
        <div>
          Sputnik DAO v2 · PolicyHelper Guardrails · NEAR Protocol
        </div>
        <div className="flex items-center gap-3">
          <span>Zero-Config Sandbox Ready</span>
          <span>·</span>
          <span>90-Second Human Evaluator Ready</span>
        </div>
      </div>
    </footer>
  );
}
