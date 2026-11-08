import React from 'react';
import { CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export function LandingRealVsSimulated() {
  const realItems = [
    {
      title: 'Rust PolicyHelper Smart Contract',
      desc: 'Active on NEAR Testnet (zinipay-policy2.testnet). Enforces spend caps (10/15/20N), cooldowns (60s), and canonical deliverable burning.',
      link: 'https://testnet.nearblocks.io/address/zinipay-policy2.testnet',
      linkLabel: 'Contract on NEARBlocks',
    },
    {
      title: 'Sputnik DAO v2 Treasury Governance',
      desc: 'Active on NEAR Testnet (zinipay-demo.sputnikv2.testnet). Requires 2-of-2 human council quorum (zinipay-c1, zinipay-c2) for every payout.',
      link: 'https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet',
      linkLabel: 'DAO on NEARBlocks',
    },
    {
      title: 'On-Chain Payout Executions (#5 and #6)',
      desc: 'Real yoctoNEAR releases disbursed on-chain to contributor zinipay-recipient2.testnet (0.10 NEAR in Proposal #5; 0.10 NEAR in Proposal #6).',
      link: 'https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
      linkLabel: 'Proposal #6 Payout Tx',
    },
    {
      title: '5 Blocked Attack Transactions',
      desc: 'Replay CID, case-variant replay, over-cap spend, unauthorized caller, and cooldown violation were all submitted and reverted with contract panics.',
      link: 'https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb',
      linkLabel: 'Reverted Attack Receipt',
    },
    {
      title: 'DAO Contract Ownership Transfer',
      desc: 'PolicyHelper ownership was transferred to Sputnik DAO in tx BmUTUzUL... All administrative actions strictly require council multi-sig.',
      link: 'https://testnet.nearblocks.io/txns/BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX',
      linkLabel: 'Ownership Transfer Tx',
    },
  ];

  const simulatedItems = [
    {
      title: 'Model Deliberation Engine',
      desc: 'Dual-agent LLM consensus (Inspector + Risk Arbiter) ran in local simulation mode for the testnet run because NEAR AI Cloud credits were unfunded. Deliberation logic is verified by 14 passing automated CI tests in agent/test/.',
      link: 'https://github.com/kellycryptos/ZiniPay/blob/main/agent/test/deliberation.test.ts',
      linkLabel: 'Deliberation CI Tests',
    },
    {
      title: 'NEAR Intents (ChainDefuser 1Click)',
      desc: 'Cross-chain value routing is tested and verified live for quote generation via POST /v0/quote (NEAR → USDC). No unproven cross-chain execution or settlement is claimed.',
      link: 'https://1click.chaindefuser.com',
      linkLabel: 'ChainDefuser 1Click API',
    },
    {
      title: 'Tiered Approval Schedule (Advisory)',
      desc: 'The fast-track single-vote schedule for micro-payouts (≤ 5 NEAR) is advisory client-side guidance computed from reputation.ts. Sputnik DAO v2 on-chain policy strictly enforces 2-of-2 council quorum for all payouts.',
      link: 'https://github.com/kellycryptos/ZiniPay/blob/main/agent/src/reputation.ts',
      linkLabel: 'Reputation Schedule Code',
    },
  ];

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
              Integrity &amp; Honesty Disclosures
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
              What Is Real vs. What Is Simulated
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              We separate verified on-chain deployments from offline simulations and advisory schedules. Zero unproven claims.
            </p>
          </div>
        </div>

        {/* 2-Column Comparison Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: What is Real (On-Chain) */}
          <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-emerald-500/20 flex flex-col gap-5 shadow-lg">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-subtle)]">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">
                  Live on NEAR Testnet (On-Chain)
                </h3>
                <p className="text-xs text-emerald-500 font-mono">
                  Verified with public RPC receipts and explorer hashes
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {realItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-[#00EC97] shrink-0" />
                      {item.title}
                    </span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00EC97] hover:underline font-mono text-[11px] flex items-center gap-1 shrink-0"
                    >
                      <span>{item.linkLabel}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed pl-5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: What is Simulated / Quoted */}
          <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-amber-500/20 flex flex-col gap-5 shadow-lg">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-subtle)]">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <AlertCircle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">
                  Simulated / Advisory / Quote-Only
                </h3>
                <p className="text-xs text-amber-500 font-mono">
                  Transparent disclosures on unmocked external boundaries
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {simulatedItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      {item.title}
                    </span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-500 hover:underline font-mono text-[11px] flex items-center gap-1 shrink-0"
                    >
                      <span>{item.linkLabel}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed pl-4">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
