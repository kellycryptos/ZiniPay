import React from 'react';
import { AlertTriangle, Shield, Cpu } from 'lucide-react';

export function LandingSafetyLimits() {
  const items = [
    {
      icon: Shield,
      title: 'Runs on NEAR testnet',
      status: 'Testnet Only',
      desc: 'All smart contracts, proposals, and execution logs run exclusively on NEAR testnet (zinipay-demo.sputnikv2.testnet and zinipay-policy2.testnet). There is no mainnet deployment.',
    },
    {
      icon: AlertTriangle,
      title: 'Not audited',
      status: 'Experimental',
      desc: 'The Rust PolicyHelper smart contract and frontend governance interface have not undergone a formal third-party security audit. Do not use for real treasury funds.',
    },
    {
      icon: Cpu,
      title: 'Model review: simulated',
      status: 'Local Deterministic',
      desc: 'The dual-agent deliverable evaluation is currently simulated locally using deterministic validation. No live ungrounded LLM inference is connected to financial settlement decisions.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-semibold">
            Status &amp; Transparency
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-1.5">
            Safety limits and honest status
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 leading-relaxed">
            We are transparent about exactly what is running today and what is not.
          </p>
        </div>

        {/* 3 Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4 shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
