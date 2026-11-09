import React, { useState } from 'react';
import {
  Github,
  ExternalLink,
  Terminal,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';

interface UniversalFooterProps {
  onNavigateBoard?: () => void;
  onNavigateDocs?: () => void;
  onOpenVerifyModal?: () => void;
  network?: 'testnet' | 'mainnet';
}

const VERIFICATION_MATRIX = [
  {
    sponsor: 'NEAR Protocol (Sputnik DAO v2)',
    capability: 'Treasury Governance & Multi-Sig Execution',
    methods: 'add_proposal (FunctionCall), act_proposal (VoteApprove), get_policy, get_proposal',
    sourceFile: 'agent/src/dao.ts#L71-L200',
    sourceUrl: 'https://github.com/kellycryptos/ZiniPay/blob/main/agent/src/dao.ts#L71-L200',
    proofLabel: 'Proposal #6 (Confirmed Payout)',
    proofUrl: 'https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
    txHash: '2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
    status: 'Verified on Testnet',
  },
  {
    sponsor: 'NEAR Smart Contracts (Rust SDK)',
    capability: 'PolicyHelper Spend Caps & Anti-Replay Guard',
    methods: 'release, check_policy, get_reputation, get_effective_cap, burn_cid, normalize_cid',
    sourceFile: 'contracts/policy-helper/src/lib.rs#L169-L324',
    sourceUrl: 'https://github.com/kellycryptos/ZiniPay/blob/main/contracts/policy-helper/src/lib.rs#L169-L324',
    proofLabel: 'Payout 2nWMVt... / Reverted Drain Eiktoy...',
    proofUrl: 'https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
    txHash: 'EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
    status: 'Verified on Testnet',
  },
  {
    sponsor: 'NEAR AI Cloud (LLM Deliberation)',
    capability: 'Dual-Agent Consensus (Inspector + Risk Arbiter)',
    methods: 'POST /v1/chat/completions (z-ai/glm-5.3-flash simulation)',
    sourceFile: 'agent/src/deliberation.ts#L34-L245',
    sourceUrl: 'https://github.com/kellycryptos/ZiniPay/blob/main/agent/src/deliberation.ts#L34-L245',
    proofLabel: 'Deliberation Tests 1-9 Passing (Local Simulation)',
    proofUrl: 'https://github.com/kellycryptos/ZiniPay/blob/main/agent/test/deliberation.test.ts',
    txHash: 'agent/test/deliberation.test.ts (9 Passing Tests)',
    status: 'Verified Automated CI',
  },
  {
    sponsor: 'NEAR Intents (ChainDefuser 1Click)',
    capability: 'Cross-Chain Value Routing Quote (NEAR → USDC)',
    methods: 'POST /v0/quote',
    sourceFile: 'agent/src/intents.ts#L45-L95',
    sourceUrl: 'https://github.com/kellycryptos/ZiniPay/blob/main/agent/src/intents.ts#L45-L95',
    proofLabel: '1Click Quote Resolution (Live Quote-Only)',
    proofUrl: 'https://1click.chaindefuser.com',
    txHash: 'agent/test/intents-live.test.ts (Quote Resolved)',
    status: 'Verified Live API',
  },
  {
    sponsor: 'NEAR Wallet Selector & Observer',
    capability: 'Council Signer Authentication & Read-Only Observer Mode',
    methods: 'setupWalletSelector, MyNearWallet, Meteor, HERE + Observer Preview',
    sourceFile: 'frontend/src/lib/wallet.ts#L20-L185',
    sourceUrl: 'https://github.com/kellycryptos/ZiniPay/blob/main/frontend/src/lib/wallet.ts#L20-L185',
    proofLabel: 'Council Signer Votes 22HTUkeVM... / Observer Mode',
    proofUrl: 'https://testnet.nearblocks.io/txns/22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD',
    txHash: '22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD',
    status: 'Verified on Testnet',
  },
];

export function UniversalFooter({
  onNavigateBoard,
  onNavigateDocs,
  onOpenVerifyModal,
  network = 'testnet',
}: UniversalFooterProps) {
  const [matrixExpanded, setMatrixExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npm run verify:testnet');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">
        {/* Top Section: Brand & Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-8 border-b border-[var(--border-subtle)]">
          {/* Col 1: Brand & Description */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/brand/logo-mark.svg"
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
              A constrained agent layer for community treasuries on NEAR. The agent proposes payouts, a Rust contract enforces spend caps and anti-replay guards, and human councils approve via Sputnik DAO v2 multi-sig.
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
              onClick={onOpenVerifyModal}
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
              href="https://github.com/kellycryptos/ZiniPay/blob/main/docs/SUBMISSION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors flex items-center justify-between group"
            >
              <span>Submission</span>
              <ExternalLink size={12} className="text-slate-500 group-hover:text-[#00EC97]" />
            </a>
          </div>
        </div>

        {/* Middle Section: 60-Second Judge Verification Command Box */}
        <div className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[#00EC97] shrink-0">
              <Terminal size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">60-Second Zero-Config Judge Verification</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00EC97]">
                  24 Checks
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Executes complete testnet state audit, panic text assertions, and proposal receipts keylessly via public RPC.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <code className="px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-xs text-[#00EC97] select-all flex-1 sm:flex-initial">
              npm run verify:testnet
            </code>
            <button
              type="button"
              onClick={copyCommand}
              className="p-2 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              title="Copy verification command"
            >
              {copied ? <Check size={14} className="text-[#00EC97]" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Sponsor Track & Evidence Matrix Accordion ("The Receipt Box") */}
        <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-panel)]">
          <button
            type="button"
            onClick={() => setMatrixExpanded(!matrixExpanded)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--bg-panel-alt)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Shield size={16} className="text-[#00EC97]" />
              <span className="text-xs font-bold text-white tracking-tight">
                Sponsor Track &amp; Evidence Matrix (The Receipt Box)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-[#00EC97] border border-emerald-500/20">
                5 Sponsor Capabilities Verified
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
              <span>{matrixExpanded ? 'Collapse' : 'Expand Matrix'}</span>
              {matrixExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {matrixExpanded && (
            <div className="border-t border-[var(--border-subtle)] p-4 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] uppercase">
                    <th className="pb-2 font-semibold">Sponsor &amp; Capability</th>
                    <th className="pb-2 font-semibold">Source Permalinks</th>
                    <th className="pb-2 font-semibold">On-Chain Evidence / Receipt</th>
                    <th className="pb-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {VERIFICATION_MATRIX.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-panel-alt)]">
                      <td className="py-2.5 pr-4">
                        <span className="text-[var(--text-primary)] font-semibold block">{item.sponsor}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] block">{item.capability}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] block font-mono">{item.methods}</span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00EC97] hover:underline flex items-center gap-1"
                        >
                          <FileCode size={12} />
                          <span>{item.sourceFile}</span>
                        </a>
                      </td>
                      <td className="py-2.5 pr-4">
                        {item.proofUrl.startsWith('http') ? (
                          <a
                            href={item.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 hover:underline"
                          >
                            <span>{item.proofLabel}</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-[var(--text-secondary)]">{item.proofLabel}</span>
                        )}
                        <span className="text-[10px] text-[var(--text-secondary)] block truncate max-w-xs">{item.txHash}</span>
                      </td>
                      <td className="py-2.5 text-right font-semibold">
                        <span className="inline-flex items-center gap-1 text-[#00EC97]">
                          <CheckCircle2 size={12} />
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

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)]">
          <p>
            Built at NEAR HACKATHON 2026. Testnet only, not audited.
          </p>
          <p className="text-center sm:text-right text-[11px]">
            Open source under MIT License
          </p>
        </div>
      </div>
    </footer>
  );
}
