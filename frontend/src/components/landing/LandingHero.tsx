import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldAlert,
  Users,
  FileCheck,
} from 'lucide-react';
import { ReleaseReceiptCard } from '../ReleaseReceiptCard';

import { Proposal } from '../../lib/types';

export interface LandingHeroProps {
  onNavigateToApp: () => void;
  onNavigateToBoard?: () => void;
  onNavigateVerify?: () => void;
  onOpenVerifyModal?: () => void;
}

export function LandingHero({
  onNavigateToApp,
  onNavigateVerify,
}: LandingHeroProps) {
  const [hoveredGate, setHoveredGate] = useState<number | null>(null);

  // Proposal #6 receipt card fixture from verified testnet run
  const proposal6: Proposal = {
    id: 6,
    title: 'kellycryptos/ZiniPay#2',
    proposer: 'agentzinipaytestnet.testnet',
    recipient: 'zinipay-recipient2.testnet',
    amountNear: '0.10',
    amountYocto: '100000000000000000000000',
    txHash: '2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
    proofCid: 'kellycryptos/ZiniPay#2',
    summary: 'Deliberation: simulated (local dry-run / no model review). Multi-sig human approval completed on Sputnik DAO.',
    evidenceType: 'github_pr',
    evidenceDetails: 'Deliverable: kellycryptos/ZiniPay#2 | Recipient: zinipay-recipient2.testnet | Tx: 2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
    createdAt: '2026-11-02 14:47:44',
    status: 'settled',
    rawStatus: 'Approved',
    simulated: true,
    isZinipayRelease: true,
    targetContract: 'zinipay-policy2.testnet',
    targetMethod: 'release',
    policy: {
      withinCap: true,
      cooldownElapsed: true,
      cooldownRemainingSecs: 0,
      cidUnique: true,
      reputationQualified: true,
      tier: 'Bronze',
      reputationScore: 25,
      capLimit: '15.0 NEAR',
    },
    settlement: {
      type: 'native_near',
      targetChain: 'near',
      targetToken: 'NEAR',
      recipientAddress: 'zinipay-recipient2.testnet',
    },
    votes: {
      approve: 2,
      reject: 0,
      required: 2,
    },
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      {/* Background radial atmosphere */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[var(--color-passed)]/[0.04] blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Column: Hero Narrative */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          {/* Live on NEAR testnet badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] w-fit backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-passed)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-passed)]" />
            </span>
            <span className="text-[var(--color-passed)] font-medium">Live on NEAR testnet</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-bold tracking-tight text-[var(--text-primary)] leading-[1.15] max-w-xl text-balance">
            Let an AI agent propose payments. Keep humans in charge of the money.
          </h1>

          {/* Subline */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-prose">
            ZiniPay lets a DAO use an AI agent for payouts without giving it the keys. A smart contract caps every payment and blocks repeats, and two people approve each one.
          </p>

          {/* Action Row — Open Dashboard (primary), Verify it yourself (secondary) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="btn-primary cursor-pointer text-sm py-3 px-6 shadow-lg shadow-[#00ec9720] hover:shadow-[#00ec9735] transition-all flex items-center gap-2 group font-semibold tracking-wide"
            >
              <span>Open Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="/verify"
              onClick={(e) => {
                if (onNavigateVerify) {
                  e.preventDefault();
                  onNavigateVerify();
                }
              }}
              className="px-5 py-3 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[var(--bg-panel)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>Verify it yourself</span>
            </a>
          </div>

          {/* Three short points under the buttons */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-[var(--text-secondary)] font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
              Spending caps
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
              No duplicate payouts
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
              Two humans approve
            </span>
          </div>

          {/* Three-Way Gate Preview */}
          <div className="mt-2 p-3.5 sm:p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
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
                <div className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">Deliverable CID</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5" title="Deliverable CID or PR is burned in used_cids on-chain to stop replay attacks">One-time CID check</div>
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
                <div className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">Spend Limits</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">Tier caps &amp; cooldown</div>
              </div>

              {/* Gate 3 */}
              <div
                onMouseEnter={() => setHoveredGate(3)}
                onMouseLeave={() => setHoveredGate(null)}
                className={`p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border transition-all duration-200 flex flex-col justify-between ${
                  hoveredGate === 3
                    ? 'border-indigo-400/60 shadow-[0_4px_16px_rgba(99,102,241,0.12)] -translate-y-0.5'
                    : 'border-indigo-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold">03</span>
                  <Users size={14} className="text-indigo-300" />
                </div>
                <div className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">Council Quorum</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">2-of-2 human multi-sig</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Signature ReleaseReceiptCard */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md">
            <ReleaseReceiptCard
              proposal={proposal6}
              policyContractId="zinipay-policy2.testnet"
              daoContractId="zinipay-demo.sputnikv2.testnet"
              network="testnet"
              showActions={false}
              rubberStamp="PAID"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
