import React from 'react';
import { Wallet, ListFilter, Gauge, Vote } from 'lucide-react';

export function LandingWhatYouCanDo({ onNavigateToApp }: { onNavigateToApp?: () => void }) {
  const actions = [
    {
      icon: Wallet,
      title: 'Connect a wallet',
      desc: 'Connect your NEAR testnet wallet via the NEAR Wallet Selector, or enter read-only observer mode with one click.',
    },
    {
      icon: ListFilter,
      title: 'View proposals',
      desc: 'Inspect active, pending, approved, and settled proposals synced in real time from Sputnik DAO v2 on NEAR testnet.',
    },
    {
      icon: Gauge,
      title: 'See limits',
      desc: 'Audit recipient spend caps, remaining cooldown timers, on-chain reputation scores, and burned deliverable CIDs.',
    },
    {
      icon: Vote,
      title: 'Vote if you are a council member',
      desc: 'Authorized Sputnik DAO council members (zinipay-c1.testnet, zinipay-c2.testnet) can cast real VoteApprove or VoteReject transactions.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
              Live Capabilities
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-1.5">
              What you can do today
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 leading-relaxed">
              Explore the live testnet application without sign-up or complex setup.
            </p>
          </div>

          {onNavigateToApp && (
            <button
              type="button"
              onClick={onNavigateToApp}
              className="text-xs font-mono text-[#00EC97] hover:underline self-start sm:self-auto cursor-pointer"
            >
              Open Dashboard &rarr;
            </button>
          )}
        </div>

        {/* 4 Capability Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-3 shadow-sm hover:border-[#00EC97]/30 transition-all"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97] w-fit">
                  <Icon size={18} />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
                  {act.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {act.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
