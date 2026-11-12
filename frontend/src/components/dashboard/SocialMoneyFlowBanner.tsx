import React, { useState } from 'react';
import {
  GitPullRequest,
  ShieldCheck,
  Users,
  Coins,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';

interface SocialMoneyFlowBannerProps {
  onSimulateFlow?: () => void;
}

export function SocialMoneyFlowBanner({
  onSimulateFlow,
}: SocialMoneyFlowBannerProps) {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      tag: 'Step 1: Named Request',
      icon: GitPullRequest,
      actor: 'zinipay-recipient2.testnet',
      title: 'Submit Deliverable',
      detail: 'GitHub PR kellycryptos/ZiniPay#2 verified for commit hash, author match, and canonical CID.',
      proof: 'PR Author Verified',
      color: 'blue',
    },
    {
      num: 2,
      tag: 'Step 2: Policy Enforcement',
      icon: ShieldCheck,
      actor: 'zinipay-policy2.testnet',
      title: 'PolicyHelper Gates Spend',
      detail: 'Score 30 pts qualifies for Silver Tier (15 NEAR cap). CID burned to prevent replay attack.',
      proof: '15N Cap · CID Burned',
      color: 'emerald',
    },
    {
      num: 3,
      tag: 'Step 3: Council Quorum',
      icon: Users,
      actor: 'zinipay-demo.sputnikv2.testnet',
      title: '2-of-2 Multi-Sig Vote',
      detail: 'Council signers zinipay-c1 and zinipay-c2 vote VoteApprove on Sputnik DAO v2.',
      proof: '2/2 Quorum Reached',
      color: 'amber',
    },
    {
      num: 4,
      tag: 'Step 4: Payout & Score Up',
      icon: Coins,
      actor: 'On-Chain Execution',
      title: 'Settlement & Reputation',
      detail: '0.10 NEAR disbursed on-chain. Recipient reputation updated with completed task history.',
      proof: 'Tx: 2nWMVtQ4...',
      proofUrl: 'https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
      color: 'green',
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-white/90 dark:bg-[#0C1513]/90 border border-emerald-600/25 dark:border-emerald-500/30 p-4 sm:p-5 shadow-sm dark:shadow-[0_0_25px_rgba(0,229,153,0.06)] flex flex-col gap-4">
      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-[#00EC97] border border-emerald-400/30 shadow-[0_0_10px_rgba(0,229,153,0.2)]">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Social Money Lifecycle: One Complete Flow at a Glance
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Named Contributor Request ➔ PolicyHelper Spend Cap Check ➔ Sputnik DAO Multi-Sig Quorum ➔ Payout &amp; Reputation Update
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#070D0C] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Verified Payout Receipt</span>
            <ExternalLink size={11} className="text-[#00EC97]" />
          </a>
        </div>
      </div>

      {/* 4-Step Interactive Flow Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((st) => {
          const Icon = st.icon;
          const isCurrent = selectedStep === st.num;
          return (
            <div
              key={st.num}
              onClick={() => setSelectedStep(st.num)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isCurrent
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-[#00EC97] shadow-sm dark:shadow-[0_0_15px_rgba(0,229,153,0.15)]'
                  : 'bg-slate-50/70 dark:bg-[#070D0C]/60 border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-[#00EC97] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {st.tag}
                  </span>
                  <div className={`p-1.5 rounded-lg ${isCurrent ? 'bg-[#00EC97]/20 text-[#00EC97]' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    <Icon size={14} />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {st.title}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {st.actor}
                  </p>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {st.detail}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/70 flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-700 dark:text-[#00EC97] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>{st.proof}</span>
                </span>
                {st.proofUrl && (
                  <a
                    href={st.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline flex items-center gap-0.5 text-slate-500 hover:text-white"
                  >
                    <span>Explorer</span>
                    <ExternalLink size={9} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
