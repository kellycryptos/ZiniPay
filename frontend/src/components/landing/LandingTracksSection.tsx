import React from 'react';
import { Users, ShieldAlert, ExternalLink, ArrowRight } from 'lucide-react';

export function LandingTracksSection({ onNavigateToApp }: { onNavigateToApp?: () => void }) {
  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
              Hackathon Tracks &amp; Evidence
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
              Social Money &amp; AI Security
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              ZiniPay targets the intersection of community contributor governance and fail-closed agent security.
            </p>
          </div>
        </div>

        {/* 2 Track Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Track 1: Social Money */}
          <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[#00EC97]/30 transition-all flex flex-col justify-between shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#00EC97] font-bold">
                    Track 1 • Community Governance
                  </span>
                  <h3 className="font-display text-xl font-bold text-[var(--text-primary)] tracking-tight">
                    Social Money: Contributor Reputation &amp; Spend Caps
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Rewards sustained community contributors through transparent on-chain reputation scoring. As contributors deliver verified milestones, PolicyHelper scales their spend caps (Bronze: 10N, Silver: 15N, Gold: 20N) and unlocks advisory fast-track approval schedules, backed by Sputnik DAO v2 council multi-sig quorum.
              </p>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2 font-mono text-xs">
                <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                  Verified Testnet Receipts:
                </span>
                <a
                  href="https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center justify-between"
                >
                  <span>• Proposal #6 Payout (0.10 NEAR)</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://testnet.nearblocks.io/txns/DfpR26Q4qgoXw1oBh481vBkizypsrME6HLwjHj3gKvYf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center justify-between"
                >
                  <span>• Silver Tier Promotion Tx (25 pts)</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://testnet.nearblocks.io/txns/3xqHqNnvstR7uTFdV1cvpajw7BSPAxMXLgRLRyBZUYkw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center justify-between"
                >
                  <span>• Admin Proposal #7 Execution (30 pts)</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {onNavigateToApp && (
              <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-end">
                <button
                  type="button"
                  onClick={onNavigateToApp}
                  className="text-xs font-mono text-[#00EC97] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Contributor Board</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Track 2: AI Security */}
          <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-red-500/30 transition-all flex flex-col justify-between shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-500 font-bold">
                    Track 2 • Agent Defense
                  </span>
                  <h3 className="font-display text-xl font-bold text-[var(--text-primary)] tracking-tight">
                    AI Security: Fail-Closed Treasury Protection
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Protects community treasuries against prompt injection, unconstrained tool use, and rogue agent spend. The agent operates strictly as a keyless proposer (0 council seats, 0 voting keys). Smart contract spend caps, one-time CID burning, and recipient cooldowns revert attacks on-chain before funds can move.
              </p>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2 font-mono text-xs">
                <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                  Reverted On-Chain Attack Evidence:
                </span>
                <a
                  href="https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:underline flex items-center justify-between"
                >
                  <span>• Reverted Over-Cap Spend (16 NEAR)</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:underline flex items-center justify-between"
                >
                  <span>• Reverted Replay CID Attempt</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://testnet.nearblocks.io/txns/2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:underline flex items-center justify-between"
                >
                  <span>• Reverted Unauthorized Caller Attempt</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {onNavigateToApp && (
              <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-end">
                <button
                  type="button"
                  onClick={onNavigateToApp}
                  className="text-xs font-mono text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Security Refusals</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
