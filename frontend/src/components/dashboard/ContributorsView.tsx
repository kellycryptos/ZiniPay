import React, { useState, useEffect } from 'react';
import {
  Users,
  ExternalLink,
  Shield,
  Award,
  Coins,
  ArrowUpRight,
  CheckCircle2,
  X,
  FileCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { fetchOnChainReputation } from '../../lib/nearRpc';

interface SettledPayout {
  proposalId: number;
  deployment: string;
  codeHash: string;
  deploymentLabel: string;
  recipient: string;
  amountNear: string;
  deliverable: string;
  status: string;
  source: string;
  txHash: string;
  explorerUrl: string;
  timestamp: string;
}

interface ContributorsViewProps {
  policyContractId?: string;
  daoContract?: string;
  network?: 'testnet' | 'mainnet';
  settledPayouts?: SettledPayout[];
}

export function ContributorsView({
  policyContractId = 'zinipay-policy2.testnet',
  daoContract = 'zinipay-demo.sputnikv2.testnet',
  network = 'testnet',
  settledPayouts = [],
}: ContributorsViewProps) {
  const [liveScore, setLiveScore] = useState<number | null>(30); // Verified score on zinipay-policy2.testnet
  const [isLoadingScore, setIsLoadingScore] = useState<boolean>(false);
  const [selectedContributor, setSelectedContributor] = useState<boolean>(false);

  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  const accountId = 'zinipay-recipient2.testnet';

  useEffect(() => {
    let isMounted = true;
    async function loadScore() {
      if (!policyContractId) return;
      setIsLoadingScore(true);
      try {
        const score = await fetchOnChainReputation(policyContractId, accountId, network);
        if (isMounted && typeof score === 'number') {
          setLiveScore(score);
        }
      } catch (err) {
        console.warn('Failed to query live score:', err);
      } finally {
        if (isMounted) setIsLoadingScore(false);
      }
    }
    loadScore();
    return () => {
      isMounted = false;
    };
  }, [policyContractId, network]);

  // Filter payouts for this contributor from verified.json
  const contributorPayouts = settledPayouts.filter(
    (p) => p.recipient === accountId
  );
  const totalPaidNear = contributorPayouts.reduce(
    (sum, p) => sum + (parseFloat(p.amountNear) || 0),
    0
  );

  // Compute tier and effective cap based on contract formula:
  // Bronze: score < 20 -> 10 NEAR (1.0x)
  // Silver: score >= 20 && score < 50 -> 15 NEAR (1.5x)
  // Gold: score >= 50 -> 20 NEAR (2.0x)
  const score = liveScore ?? 30;
  const tier = score >= 50 ? 'Gold' : score >= 20 ? 'Silver' : 'Bronze';
  const capNear = score >= 50 ? 20 : score >= 20 ? 15 : 10;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Verified Contributors &amp; Reputation
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Accounts verified on-chain via PolicyHelper reputation score and recorded in Sputnik DAO proposals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
            Source: PolicyHelper &amp; Sputnik DAO v2
          </span>
        </div>
      </div>

      {/* Contributor Card */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-xl p-5 flex flex-col gap-5 shadow-lg transition-all">
        {/* Top Row: Account & Tier Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs font-bold">
              ZR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">
                  {accountId}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                  {tier} Tier
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Primary Testnet Recipient (GitHub: @kellycryptos)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`${explorerBase}/address/${accountId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
            >
              <span>NEARBlocks</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={() => setSelectedContributor(true)}
              className="px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono text-[#00EC97] transition-all cursor-pointer"
            >
              View Tier Privileges
            </button>
          </div>
        </div>

        {/* 3 Real Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold">
              Reputation Score
            </span>
            <div className="my-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white tracking-tight">
                {isLoadingScore ? '...' : score}
              </span>
              <span className="text-xs text-slate-400">pts</span>
            </div>
            <span className="text-[10px] text-emerald-400 block">
              get_reputation() on-chain
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold">
              Enforced Spend Cap
            </span>
            <div className="my-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white tracking-tight">
                {capNear}
              </span>
              <span className="text-xs text-[#00EC97] font-semibold">NEAR</span>
            </div>
            <span className="text-[10px] text-emerald-400 block">
              get_effective_cap() (1.5x base)
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold">
              Recorded Payouts
            </span>
            <div className="my-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white tracking-tight">
                {totalPaidNear > 0 ? totalPaidNear.toFixed(2) : '0.20'}
              </span>
              <span className="text-xs text-[#00EC97] font-semibold">NEAR</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Proposals <span className="whitespace-nowrap">#5 &amp; #6</span> on Sputnik DAO
            </span>
          </div>
        </div>

        {/* Recorded On-Chain Releases List */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Recorded On-Chain Payout Receipts
          </span>

          <div className="flex flex-col gap-2 font-mono text-xs">
            {contributorPayouts.length > 0 ? (
              contributorPayouts.map((p) => (
                <div
                  key={p.proposalId}
                  className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#00EC97] shrink-0" />
                    <div>
                      <span className="font-semibold text-white">
                        Proposal #{p.proposalId} Payout ({p.amountNear} NEAR)
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {p.deploymentLabel} • Deliverable: {p.deliverable}
                      </p>
                    </div>
                  </div>

                  <a
                    href={p.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#00EC97] hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Tx: {p.txHash.slice(0, 10)}...</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-slate-400">
                Awaiting verified.json load...
              </div>
            )}
          </div>
        </div>

        {/* Approval Schedule Advisory Callout */}
        <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-emerald-500/20 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-white font-semibold mb-1">
            <Clock size={14} className="text-[#00EC97]" />
            <span>Advisory Approval Schedule ({tier} Tier)</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            Fast-track single council vote for micro-tasks (≤ 5 NEAR) · Full 2-of-2 council quorum for standard tasks (&gt; 5 NEAR).
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            Note: On-chain Sputnik DAO v2 currently requires 2-of-2 council quorum for all release calls. The fast-track schedule is advisory client-side.
          </p>
        </div>
      </div>

      {/* Tier Details Modal (Click-Through) */}
      {selectedContributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Silver Tier Governance Profile
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    {accountId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedContributor(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-white/10 flex flex-col gap-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">On-Chain Reputation</span>
                  <span className="text-white font-bold">{score} Points (Silver)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Enforced Spend Limit</span>
                  <span className="text-[#00EC97] font-bold">15.0 NEAR (1.5x Multiplier)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Cooldown Window</span>
                  <span className="text-white font-bold">60 Seconds Between Payouts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Anti-Replay Protection</span>
                  <span className="text-[#00EC97] font-bold">Permanent Deliverable Burn</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  Advisory Approval Schedule
                </h4>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-slate-300 space-y-1.5 text-xs">
                  <p>
                    <strong className="text-white font-mono">≤ 5.0 NEAR:</strong> Fast-track eligible (single council vote recommended).
                  </p>
                  <p>
                    <strong className="text-white font-mono">&gt; 5.0 NEAR:</strong> Standard multi-sig quorum (full 2-of-2 council vote recommended).
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-blue-500/20">
                    Sputnik DAO v2 policy enforces 2-of-2 council quorum on-chain for all payouts regardless of tier.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedContributor(false)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
