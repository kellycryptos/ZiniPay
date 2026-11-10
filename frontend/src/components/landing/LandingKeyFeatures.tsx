import React from 'react';
import { Award, Layers, LayoutDashboard, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export interface LandingKeyFeaturesProps {
  onNavigateToBoard?: () => void;
  onNavigateVerify?: () => void;
}

export function LandingKeyFeatures({
  onNavigateToBoard,
  onNavigateVerify,
}: LandingKeyFeaturesProps) {
  const features = [
    {
      icon: Award,
      title: 'Named-Account Reputation',
      tag: 'On-Chain Track Record',
      description:
        'Contributors build transparent on-chain reputations on PolicyHelper (e.g. zinipay-recipient2.testnet with 30 pts). Verified task completions earn points that scale tier spend limits automatically.',
      highlight: 'Score: 30 pts · Silver Tier Multiplier (1.5x)',
    },
    {
      icon: Layers,
      title: 'Tiered Approvals',
      tag: 'Graduated Spend Caps',
      description:
        'A mathematical policy matrix scales financial velocity: Bronze (10N cap, full DAO quorum), Silver (15N cap, fast-track single council sign-off ≤ 5N), and Gold (20N cap, auto-clearance ≤ 2N). Over-cap requests fail closed.',
      highlight: 'Bronze 10N / Silver 15N / Gold 20N',
    },
    {
      icon: LayoutDashboard,
      title: 'Public Transparency Board',
      tag: 'Zero-Wallet Evaluation',
      description:
        'Live dashboard at /board with ?demo=1 mode allows any community member or hackathon judge to view liquid treasury balances, proposals across 4 stages, contributor records, and testnet explorer receipts without an injected wallet.',
      highlight: 'Real-time Sputnik DAO v2 sync + Demo mode',
    },
    {
      icon: ShieldCheck,
      title: 'Fail-Closed Security',
      tag: '5 Attack Vectors Stopped',
      description:
        'If an agent hallucinates, re-uses a deliverable CID, exceeds tier caps, or violates cooldowns, the PolicyHelper Rust contract panics and reverts. 5 verified attack vectors and 1 unauthorized admin action were blocked on testnet.',
      highlight: 'Mathematical Rust guardrails, not prompt rules',
    },
  ];

  return (
    <section className="relative py-12 sm:py-20 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-[#00EC97] font-semibold mb-3">
            <ShieldCheck size={13} />
            <span>Social Money Track Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Core Features: Built for Social Money Governance
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Four interlocking mechanisms that turn autonomous agent proposals into safe, transparent community disbursements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 sm:p-7 rounded-2xl bg-white/95 dark:bg-[#0F1715]/95 border border-emerald-600/20 dark:border-slate-800 hover:border-emerald-500/40 transition-all duration-200 group shadow-sm dark:shadow-lg flex flex-col justify-between gap-5"
              >
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-[#00E599] group-hover:shadow-[0_0_18px_rgba(0,229,153,0.35)] transition-all">
                      <Icon size={22} className="drop-shadow-[0_0_6px_rgba(0,229,153,0.4)]" />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
                      {f.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Proof Signal:</span>
                  <span className="text-emerald-600 dark:text-[#00E599] font-semibold">{f.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Jump Banner to Board and GitHub */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-pulse" />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Explore the live Social Money governance board on NEAR Testnet
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onNavigateToBoard && (
              <button
                type="button"
                onClick={onNavigateToBoard}
                className="px-4 py-2 rounded-xl bg-[#00E599] hover:bg-[#00ffaa] text-[#070D0C] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Open Board</span>
                <ArrowRight size={13} />
              </button>
            )}
            <a
              href="https://github.com/kellycryptos/ZiniPay"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white transition-colors flex items-center gap-1.5"
            >
              <span>GitHub Repo</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
