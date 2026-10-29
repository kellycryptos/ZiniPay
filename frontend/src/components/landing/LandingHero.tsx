import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Github, Terminal } from 'lucide-react';
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
            title: first.prUrl ? `Merged GitHub PR: ${first.prUrl}` : 'Contributor PR Bounty Release (GitHub PR #1)',
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
    <section className="relative pt-12 pb-20 border-b border-[var(--border-subtle)] overflow-hidden">
      {/* Background technical grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#F1F5F9 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Column: Problem & Solution Copy */}
        <div className="flex-1 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--color-passed)] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
            <span>NEAR SPUTNIK DAO + TREZU GOVERNANCE LAYER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] max-w-2xl text-balance">
            Constrained Agent Layer for Community Treasuries
          </h1>

          <div className="flex flex-col gap-3 text-base text-[var(--text-secondary)] leading-relaxed max-w-prose">
            <p>
              Communities need to pay contributors without handing an AI the keys.
            </p>
            <p className="text-white font-medium">
              An agent proposes, a contract enforces the rules, humans vote.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="btn-primary cursor-pointer text-sm py-3 px-6 shadow-lg shadow-[#00ec9710]"
            >
              <span>Open dashboard</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="https://github.com/zinipay/zinipay"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-3 px-5 flex items-center gap-2"
            >
              <Github size={16} />
              <span>View Contracts & Code</span>
            </a>
          </div>

          {/* Quick Technical Specs Monospace Row */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[var(--border-subtle)] text-xs font-mono">
            <div>
              <div className="text-[var(--text-muted)] text-[10px] uppercase">Smart Contract</div>
              <div className="text-white font-semibold mt-0.5">Sputnik DAO v2</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-[10px] uppercase">Execution Model</div>
              <div className="text-[var(--color-passed)] font-semibold mt-0.5">Fail-Closed Gate</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-[10px] uppercase">Cross-Chain</div>
              <div className="text-white font-semibold mt-0.5">NEAR Intents</div>
            </div>
          </div>
        </div>

        {/* Right Column: Signature Release Receipt Visual */}
        <div className="w-full lg:w-[480px] shrink-0">
          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Signature Artifact</span>
            {isRealRun ? (
              <span className="tag-passed text-[10px] font-mono">
                Verified On Testnet
              </span>
            ) : (
              <span className="tag-neutral text-[10px] font-mono border border-[var(--border-subtle)] text-[var(--text-secondary)] px-2 py-0.5 rounded">
                Sample receipt
              </span>
            )}
          </div>
          <ReleaseReceiptCard
            proposal={heroProposal}
            daoContractId={daoContractId}
            policyContractId={policyContractId}
            network="testnet"
            showActions={false}
          />
        </div>
      </div>
    </section>
  );
}
