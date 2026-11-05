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
  Coins,
} from 'lucide-react';
import { ReleaseReceiptCard } from '../ReleaseReceiptCard';
import { Proposal } from '../../lib/types';

interface LandingHeroProps {
  onNavigateToApp: () => void;
  onNavigateToBoard?: () => void;
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
  status: 'approved',
  rawStatus: 'Approved',
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
    approve: 2,
    reject: 0,
    required: 2,
  },
};

export function LandingHero({ onNavigateToApp, onNavigateToBoard }: LandingHeroProps) {
  const [heroProposal, setHeroProposal] = useState<Proposal>(SAMPLE_FALLBACK_PROPOSAL);
  const [isRealRun, setIsRealRun] = useState<boolean>(false);
  const [isApprovedRun, setIsApprovedRun] = useState<boolean>(false);
  const [hoveredGate, setHoveredGate] = useState<number | null>(null);

  useEffect(() => {
    fetch('/data/verified.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          setHeroProposal(SAMPLE_FALLBACK_PROPOSAL);
          setIsRealRun(false);
          setIsApprovedRun(false);
          return;
        }

        const txs: any[] = Array.isArray(data) ? data : data?.transactions || [];

        // Select the payout entry strictly by kind === "payout" and status === "Approved"
        const payoutTx = txs.find((t: any) => t.kind === 'payout' && t.status === 'Approved');

        // Check that ALL required fields are present with NO fabricated fallbacks
        const hasAllRequiredFields = Boolean(
          payoutTx &&
          typeof payoutTx.proposalId === 'number' &&
          typeof payoutTx.recipient === 'string' &&
          payoutTx.recipient.length > 0 &&
          typeof payoutTx.amountNear === 'string' &&
          payoutTx.amountNear.length > 0 &&
          typeof payoutTx.amountYocto === 'string' &&
          payoutTx.amountYocto.length > 0 &&
          typeof payoutTx.txHash === 'string' &&
          payoutTx.txHash.length > 0 &&
          typeof payoutTx.proposer === 'string' &&
          payoutTx.proposer.length > 0 &&
          (payoutTx.prTitle || payoutTx.deliverable)
        );

        if (hasAllRequiredFields) {
          const deliverableVal = payoutTx.deliverable ? payoutTx.deliverable : payoutTx.prTitle;
          const titleVal = payoutTx.prTitle ? payoutTx.prTitle : payoutTx.deliverable;

          // Deliberation summary: strictly reflects whether deliberation was simulated or live
          const isSimulated = payoutTx.deliberationMode === 'simulated' || Boolean(payoutTx.simulated);
          const summaryText = payoutTx.summary
            ? payoutTx.summary
            : isSimulated
            ? 'Deliberation: simulated (local dry-run / no model review). Multi-sig human approval completed on Sputnik DAO.'
            : 'Deliberation: live model consensus. Multi-sig human approval completed on Sputnik DAO.';

          const realProposal: Proposal = {
            id: payoutTx.proposalId,
            title: titleVal,
            proposer: payoutTx.proposer,
            recipient: payoutTx.recipient,
            amountNear: payoutTx.amountNear,
            amountYocto: payoutTx.amountYocto,
            txHash: payoutTx.txHash,
            proofCid: deliverableVal,
            summary: summaryText,
            evidenceType: 'github_pr',
            evidenceDetails: `Deliverable: ${deliverableVal} | Recipient: ${payoutTx.recipient} | Tx: ${payoutTx.txHash}`,
            createdAt: payoutTx.timestamp ? new Date(payoutTx.timestamp).toLocaleString() : 'Recorded Testnet Run',
            status: 'approved',
            rawStatus: payoutTx.status,
            simulated: isSimulated,
            isZinipayRelease: true,
            targetContract: payoutTx.targetContract ? payoutTx.targetContract : (import.meta.env.VITE_POLICY_CONTRACT_ID || ''),
            targetMethod: 'release',
            policy: payoutTx.policy || (payoutTx.tier || typeof payoutTx.reputationScore === 'number' ? {
              tier: payoutTx.tier,
              reputationScore: payoutTx.reputationScore,
              capLimit: payoutTx.effectiveCapNear ? `${payoutTx.effectiveCapNear} NEAR` : undefined,
            } : undefined as any),
            settlement: {
              type: 'native_near',
              targetChain: 'near',
              targetToken: 'NEAR',
              recipientAddress: payoutTx.recipient,
            },
            votes: payoutTx.votes || undefined as any,
          };

          setHeroProposal(realProposal);
          setIsRealRun(true);
          setIsApprovedRun(true);
        } else {
          setHeroProposal(SAMPLE_FALLBACK_PROPOSAL);
          setIsRealRun(false);
          setIsApprovedRun(false);
        }
      })
      .catch(() => {
        setHeroProposal(SAMPLE_FALLBACK_PROPOSAL);
        setIsRealRun(false);
        setIsApprovedRun(false);
      });
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
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[var(--bg-panel-alt)] border border-white/[0.08] text-xs font-mono text-slate-300 w-fit backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-passed)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-passed)]" />
            </span>
            <span className="font-medium text-white">NEAR Protocol</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--color-passed)]">Sputnik DAO v2</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-bold tracking-tight text-white leading-[1.12] max-w-xl text-balance">
            Constrained agent payouts for community treasuries.
          </h1>

          {/* Concise mechanism statement */}
          <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-prose">
            Autonomous agents verify deliverables, smart contracts enforce spend caps on-chain, and human councils hold the multi-sig quorum.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="btn-primary cursor-pointer text-xs sm:text-sm py-2.5 px-5 shadow-lg shadow-[#00ec9720] hover:shadow-[#00ec9735] transition-all flex items-center gap-2 group font-semibold tracking-wide"
            >
              <span>Open Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            {onNavigateToBoard && (
              <button
                type="button"
                onClick={onNavigateToBoard}
                className="btn-secondary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-1.5 text-[#00EC97] hover:text-white border border-[#00EC97]/30 hover:border-[#00EC97] transition-colors cursor-pointer"
              >
                <Coins size={14} />
                <span>Public Board</span>
              </button>
            )}

            <a
              href="https://github.com/zinipay/zinipay"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-2 text-slate-200 hover:text-white border border-white/[0.08]"
            >
              <Github size={16} />
              <span>View Contracts & Code</span>
            </a>
          </div>

          {/* Three-Way Gate Preview */}
          <div className="mt-1 p-3.5 sm:p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {/* Gate 1 */}
              <div
                onMouseEnter={() => setHoveredGate(1)}
                onMouseLeave={() => setHoveredGate(null)}
                className={`p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border transition-all duration-200 flex flex-col justify-between ${
                  hoveredGate === 1
                    ? 'border-cyan-400/60 shadow-[0_4px_16px_rgba(34,211,238,0.12)] -translate-y-0.5'
                    : 'border-cyan-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">01</span>
                  <FileCheck size={14} className="text-cyan-300" />
                </div>
                <div className="text-xs font-semibold text-white tracking-tight">Deliverable Proof</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">PR & CID Hash</div>
              </div>

              {/* Gate 2 */}
              <div
                onMouseEnter={() => setHoveredGate(2)}
                onMouseLeave={() => setHoveredGate(null)}
                className={`p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border transition-all duration-200 flex flex-col justify-between ${
                  hoveredGate === 2
                    ? 'border-emerald-400/60 shadow-[0_4px_16px_rgba(0,236,151,0.12)] -translate-y-0.5'
                    : 'border-emerald-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-[var(--color-passed)] font-bold">02</span>
                  <ShieldAlert size={14} className="text-[var(--color-passed)]" />
                </div>
                <div className="text-xs font-semibold text-white tracking-tight">Spend Limits</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Tier Cap & Rules</div>
              </div>

              {/* Gate 3 */}
              <div
                onMouseEnter={() => setHoveredGate(3)}
                onMouseLeave={() => setHoveredGate(null)}
                className={`p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border transition-all duration-200 flex flex-col justify-between ${
                  hoveredGate === 3
                    ? 'border-amber-400/60 shadow-[0_4px_16px_rgba(251,191,36,0.12)] -translate-y-0.5'
                    : 'border-amber-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-amber-400 font-bold">03</span>
                  <Users size={14} className="text-amber-300" />
                </div>
                <div className="text-xs font-semibold text-white tracking-tight">Council Quorum</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">2-of-2 Multi-Sig</div>
              </div>
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
                  <span className="tag-neutral text-[10px] font-mono font-bold text-amber-300 border-amber-500/40 bg-amber-500/10 px-2 py-0.5">
                    SAMPLE RECEIPT
                  </span>
                )}
              </div>
            </div>

            {/* Embedded Release Receipt Card with Rubber Stamp */}
            <div className="rounded-xl overflow-hidden shadow-inner border border-black/[0.06]">
              <ReleaseReceiptCard
                proposal={heroProposal}
                daoContractId={daoContractId}
                policyContractId={policyContractId}
                network="testnet"
                showActions={false}
                rubberStamp={isRealRun && isApprovedRun ? 'PAID' : false}
                isSample={!isRealRun}
              />
            </div>

            {/* Telemetry Footer Strip */}
            <div className="mt-3 pt-2.5 px-1 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-medium">PolicyHelper</span>
                <span>·</span>
                <span className="truncate max-w-[130px] sm:max-w-[170px] text-slate-400">
                  {policyContractId || 'Configured on chain'}
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
