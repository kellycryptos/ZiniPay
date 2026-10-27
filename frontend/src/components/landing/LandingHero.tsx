import React from 'react';
import { ShieldCheck, ArrowRight, Github, Terminal } from 'lucide-react';
import { ReleaseReceiptCard } from '../ReleaseReceiptCard';
import { Proposal } from '../../lib/types';

interface LandingHeroProps {
  onNavigateToApp: () => void;
}

const SHOWCASE_PROPOSAL: Proposal = {
  id: 104,
  title: 'Cross-chain Intent Router Implementation (Milestone 2)',
  proposer: 'zinipay-agent.testnet',
  recipient: 'alice.testnet',
  amountNear: '4.50',
  amountYocto: '4500000000000000000000000',
  proofCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  summary: 'Verified GitHub PR #88 with passing test suite on NEAR Intent solver execution. Deliberated via NEAR AI Cloud.',
  evidenceType: 'github_pr',
  evidenceDetails: 'GitHub Repo: near-intents-router | PR #88 merged | AI confidence 96/100',
  createdAt: 'Just now',
  status: 'pending_quorum',
  simulated: false,
  isZinipayRelease: true,
  targetContract: import.meta.env.VITE_POLICY_CONTRACT_ID || 'zinipay-policy.testnet',
  targetMethod: 'release',
  policy: {
    withinCap: true,
    capLimit: '10.0 NEAR',
    cooldownElapsed: true,
    cooldownRemainingSecs: 0,
    cidUnique: true,
    reputationQualified: true,
    reputationScore: 85,
    tier: 'Gold',
  },
  settlement: {
    type: 'native_near',
    targetChain: 'near',
    targetToken: 'NEAR',
    recipientAddress: 'alice.testnet',
  },
  votes: {
    approve: 2,
    reject: 0,
    required: 3,
  },
};

export function LandingHero({ onNavigateToApp }: LandingHeroProps) {
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

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Constrained Agent Layer for Community Treasuries
          </h1>

          <div className="flex flex-col gap-3 text-base text-[var(--text-secondary)] leading-relaxed">
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
              <ArrowRight size={15} />
            </button>

            <a
              href="https://github.com/zinipay/zinipay"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-3 px-6 flex items-center gap-2"
            >
              <Github size={15} />
              <span>View on GitHub</span>
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
            <span>Cryptographic Release Receipt</span>
          </div>
          <ReleaseReceiptCard
            proposal={SHOWCASE_PROPOSAL}
            daoContractId={import.meta.env.VITE_DAO_CONTRACT_ID || ''}
            policyContractId={import.meta.env.VITE_POLICY_CONTRACT_ID || 'zinipay-policy.testnet'}
            network="testnet"
            showActions={false}
          />
        </div>
      </div>
    </section>
  );
}
