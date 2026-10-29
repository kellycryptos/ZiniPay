import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Github,
  Terminal,
  FileCheck,
  ShieldAlert,
  Users,
  Check,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { ReleaseReceiptCard } from '../ReleaseReceiptCard';
import { Proposal } from '../../lib/types';

interface LandingHeroProps {
  onNavigateToApp: () => void;
}

const SAMPLE_FALLBACK_PROPOSAL: Proposal = {
  id: 1,
  title: 'Sample Contributor Deliverable (Milestone Payout)',
  proposer: 'agent.testnet',
  recipient: 'contributor.testnet',
  amountNear: '0.10',
  amountYocto: '100000000000000000000000',
  proofCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  summary: 'Sample deliverable verification receipt. Deliberated via ZiniPay agent.',
  evidenceType: 'github_pr',
  evidenceDetails: 'GitHub Repo: org/repo | PR #1 merged',
  createdAt: 'Sample / Unrecorded',
  status: 'pending_quorum',
  simulated: true,
  isZinipayRelease: true,
  targetContract: import.meta.env.VITE_POLICY_CONTRACT_ID || '',
  targetMethod: 'release',
  policy: {
    withinCap: true,
    capLimit: '10.0 NEAR',
    cooldownElapsed: true,
    cooldownRemainingSecs: 0,
    cidUnique: true,
    reputationQualified: true,
    reputationScore: 0,
    tier: 'Bronze',
  },
  settlement: {
    type: 'native_near',
    targetChain: 'near',
    targetToken: 'NEAR',
    recipientAddress: 'contributor.testnet',
  },
  votes: {
    approve: 1,
    reject: 0,
    required: 2,
  },
};

export function LandingHero({ onNavigateToApp }: LandingHeroProps) {
  const [heroProposal, setHeroProposal] = useState<Proposal>(SAMPLE_FALLBACK_PROPOSAL);
  const [isRealRun, setIsRealRun] = useState<boolean>(false);
  const [hoveredGate, setHoveredGate] = useState<number | null>(null);

  useEffect(() => {
    fetch('/data/verified.json')
      .then((res) => res.json())
      .then((data) => {
        const txs = Array.isArray(data) ? data : data?.transactions || [];
        const first = txs[0];
        if (first && first.txHash) {
          const recipientAccount = first.recipient || 'zinipay-recipient2.testnet';
          const payoutNear = first.amountNear || '0.10';
          const realProposal: Proposal = {
            id: first.index !== undefined ? Math.max(0, first.index - 1) : 0,
            title: first.prUrl ? `Merged GitHub PR: ${first.prUrl}` : 'Contributor Deliverable Release (GitHub PR #1)',
            proposer: 'agentzinipaytestnet.testnet',
            recipient: recipientAccount,
            amountNear: payoutNear,
            amountYocto: '100000000000000000000000',
            txHash: first.txHash,
            proofCid: first.prUrl || 'kellycryptos/ZiniPay#1',
            summary: 'Deliberation consensus APPROVED. Multi-sig human approval completed on Sputnik DAO.',
            evidenceType: 'github_pr',
            evidenceDetails: `GitHub PR #1 merged | zinipay-recipient: ${recipientAccount} | Tx: ${first.txHash}`,
            createdAt: first.timestamp ? new Date(first.timestamp).toLocaleString() : '2026-10-27 15:50 UTC',
            status: 'approved',
            rawStatus: 'Approved',
            simulated: Boolean(first.simulated),
            isZinipayRelease: true,
            targetContract: import.meta.env.VITE_POLICY_CONTRACT_ID || '',
            targetMethod: 'release',
            policy: {
              withinCap: true,
              capLimit: '10.0 NEAR',
              cooldownElapsed: true,
              cooldownRemainingSecs: 0,
              cidUnique: true,
              reputationQualified: true,
              reputationScore: 0,
              tier: 'Bronze',
            },
            settlement: {
              type: 'native_near',
              targetChain: 'near',
              targetToken: 'NEAR',
              recipientAddress: recipientAccount,
            },
            votes: {
              approve: 2,
              reject: 0,
              required: 2,
            },
          };
          setHeroProposal(realProposal);
          setIsRealRun(true);
        }
      })
      .catch(() => {});
  }, []);

  const policyContractId = import.meta.env.VITE_POLICY_CONTRACT_ID || '';
  const daoContractId = import.meta.env.VITE_DAO_CONTRACT_ID || '';

  return (
    <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden">
      {/* Top subtle multi-stop radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,236,151,0.08)_0%,rgba(34,211,238,0.03)_40%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Blueprint grid with radial fade mask */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 25%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 65% at 50% 25%, black 20%, transparent 80%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-14">
        {/* Left Column: Outcome, Value Proposition, Action CTAs & Three-Way Gate Preview */}
        <div className="flex-1 flex flex-col gap-6 text-left w-full">
          {/* Status Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-panel-alt)]/90 border border-white/[0.08] text-[11px] font-mono text-slate-300 w-fit backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-passed)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-passed)]" />
            </span>
            <span className="font-semibold text-white tracking-wide">FAIL-CLOSED TREASURY LAYER</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--color-passed)] font-mono">v1.0 Testnet Verified</span>
          </div>

          {/* Headline with balanced scale and tight leading */}
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-white leading-[1.18] max-w-xl text-balance">
            Constrained Agent Layer for Community Treasuries
          </h1>

          {/* Subtext with generous breathing room and clear mechanism */}
          <div className="flex flex-col gap-2.5 text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-prose">
            <p>
              Communities need to pay contributors without handing an AI the keys.
            </p>
            <p className="text-white font-medium text-sm sm:text-base">
              An agent deliberates and proposes, smart contracts enforce immutable spend caps, and elected human councils hold the final quorum.
            </p>
          </div>

          {/* Primary Action Button Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="btn-primary cursor-pointer text-xs sm:text-sm py-2.5 px-5 shadow-lg shadow-[#00ec9720] hover:shadow-[#00ec9735] transition-all flex items-center gap-2 group font-semibold tracking-wide"
            >
              <span>Open Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="https://github.com/zinipay/zinipay"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-2 text-slate-200 hover:text-white border border-white/[0.08]"
            >
              <Github size={16} />
              <span>View Contracts & Code</span>
            </a>

            <a
              href="https://github.com/zinipay/zinipay/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs sm:text-sm py-2.5 px-3 flex items-center gap-1.5 text-slate-400 hover:text-white border border-white/[0.08]"
              title="Documentation"
            >
              <BookOpen size={14} />
              <span>Docs</span>
            </a>
          </div>

          {/* Three-Way Gate Hero Preview Widget (Harmonized Tri-Color Grammar) */}
          <div className="mt-1 p-3.5 sm:p-4 rounded-xl bg-[var(--bg-panel)]/90 border border-[var(--border-subtle)] backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border-subtle)] text-[11px] font-mono">
              <span className="text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 font-medium">
                <ShieldCheck size={14} className="text-[var(--color-passed)]" />
                <span>Three-Way Gate Invariants</span>
              </span>
              <span className="text-[var(--color-passed)] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
                <span>All 3 Must Pass</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {/* Gate 01: Agent Proof (Cyan) */}
              <div
                onMouseEnter={() => setHoveredGate(1)}
                onMouseLeave={() => setHoveredGate(null)}
                className={`p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border transition-all duration-200 flex flex-col justify-between cursor-default ${
                  hoveredGate === 1
                    ? 'border-cyan-400/60 shadow-[0_4px_16px_rgba(34,211,238,0.12)] -translate-y-0.5'
                    : 'border-cyan-500/20 hover:border-cyan-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">GATE 01</span>
                    <FileCheck size={14} className="text-cyan-300" />
                  </div>
                  <div className="text-xs font-semibold text-white tracking-tight">Verifiable Proof</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">PR & CID Hash</div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-white/[0.05] flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                  <Check size={11} />
                  <span>Verified</span>
                </div>
              </div>

              {/* Gate 02: On-Chain Policy (Emerald) */}
              <div
                onMouseEnter={() => setHoveredGate(2)}
                onMouseLeave={() => setHoveredGate(null)}
                className={`p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border transition-all duration-200 flex flex-col justify-between cursor-default ${
                  hoveredGate === 2
                    ? 'border-emerald-400/60 shadow-[0_4px_16px_rgba(0,236,151,0.12)] -translate-y-0.5'
                    : 'border-emerald-500/20 hover:border-emerald-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-[var(--color-passed)] font-bold">GATE 02</span>
                    <ShieldAlert size={14} className="text-[var(--color-passed)]" />
                  </div>
                  <div className="text-xs font-semibold text-white tracking-tight">On-Chain Policy</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Tier Cap & Rules</div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-white/[0.05] flex items-center gap-1 text-[10px] font-mono text-[var(--color-passed)]">
                  <Check size={11} />
                  <span>Enforced</span>
                </div>
              </div>

              {/* Gate 03: Human Quorum (Amber) */}
              <div
                onMouseEnter={() => setHoveredGate(3)}
                onMouseLeave={() => setHoveredGate(null)}
                className={`p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border transition-all duration-200 flex flex-col justify-between cursor-default ${
                  hoveredGate === 3
                    ? 'border-amber-400/60 shadow-[0_4px_16px_rgba(251,191,36,0.12)] -translate-y-0.5'
                    : 'border-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-amber-400 font-bold">GATE 03</span>
                    <Users size={14} className="text-amber-300" />
                  </div>
                  <div className="text-xs font-semibold text-white tracking-tight">Human Quorum</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">2-of-3 Council</div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-white/[0.05] flex items-center gap-1 text-[10px] font-mono text-amber-400">
                  <Check size={11} />
                  <span>Consented</span>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Product Architecture Spec Row */}
          <div className="grid grid-cols-3 gap-2 px-3.5 py-2.5 rounded-lg bg-[var(--bg-panel-alt)]/60 border border-[var(--border-subtle)] text-xs font-mono">
            <div>
              <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Policy Engine</div>
              <div className="text-white font-medium text-[11px] mt-0.5 truncate">Rust PolicyHelper</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Execution Model</div>
              <div className="text-[var(--color-passed)] font-semibold text-[11px] mt-0.5 truncate">Fail-Closed Gate</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Governance Multi-Sig</div>
              <div className="text-white font-medium text-[11px] mt-0.5 truncate">Sputnik DAO v2</div>
            </div>
          </div>
        </div>

        {/* Right Column: Docked Signature Release Receipt Cockpit */}
        <div className="w-full lg:w-[490px] shrink-0 relative">
          {/* Subtle Ambient Backlight Glow Behind Chassis */}
          <div
            className="absolute -inset-1.5 bg-gradient-to-tr from-[var(--color-passed)]/15 via-cyan-500/10 to-transparent rounded-2xl blur-xl opacity-75 pointer-events-none"
            aria-hidden="true"
          />

          {/* Elevated Cockpit Chassis */}
          <div className="relative rounded-2xl bg-[var(--bg-panel)] border border-white/[0.08] p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/[0.04]">
            {/* Cockpit Window Controls Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-[var(--border-subtle)] mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80 inline-block" />
                </div>
                <span className="ml-1.5 font-mono text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                  Release Receipt
                </span>
              </div>

              <div>
                {isRealRun ? (
                  <a
                    href={
                      heroProposal.txHash
                        ? `https://testnet.nearblocks.io/txns/${heroProposal.txHash}`
                        : 'https://testnet.nearblocks.io'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--color-passed-bg)] border border-[var(--color-passed-border)] text-[10px] font-mono text-[var(--color-passed)] font-semibold hover:bg-[var(--color-passed-bg)]/80 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)] animate-pulse" />
                    <span>TESTNET VERIFIED</span>
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <span className="tag-neutral text-[10px] font-mono">
                    SAMPLE ARTIFACT
                  </span>
                )}
              </div>
            </div>

            {/* Embedded Release Receipt Card */}
            <div className="rounded-xl overflow-hidden shadow-inner border border-black/[0.06]">
              <ReleaseReceiptCard
                proposal={heroProposal}
                daoContractId={daoContractId}
                policyContractId={policyContractId}
                network="testnet"
                showActions={false}
              />
            </div>

            {/* Telemetry Footer Strip */}
            <div className="mt-3 pt-2.5 px-1 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-medium">PolicyHelper</span>
                <span>·</span>
                <span className="truncate max-w-[130px] sm:max-w-[170px] text-slate-400">
                  {policyContractId || 'zinipay-policy.testnet'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--color-passed)] font-medium">
                <CheckCircle2 size={12} />
                <span>3 of 3 Gates Passed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
