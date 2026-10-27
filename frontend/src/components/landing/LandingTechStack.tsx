import React from 'react';
import { Layers, Terminal, Shield, Cpu, Globe, KeyRound } from 'lucide-react';

export function LandingTechStack() {
  const stack = [
    {
      name: 'Sputnik DAO v2',
      role: 'Treasury Multi-Sig & Proposal Execution',
      details: 'Sputnik DAO v2 manages community capital with configurable council quorums, bond mechanisms, and execution of on-chain FunctionCall proposals.',
      primitive: 'near-daos/sputnik-dao-contract',
      contractId: 'sputnikv2.testnet',
      icon: Shield,
    },
    {
      name: 'PolicyHelper Smart Contract',
      role: 'Fail-Closed Constraint Guardrails',
      details: 'Custom Rust contract on NEAR SDK. Enforces spend caps by contributor tier, daily ceilings, cooldown delays, and records spent CIDs to eliminate double-spend.',
      primitive: 'near-sdk-rs v5',
      contractId: 'zinipay-policy.testnet',
      icon: Terminal,
    },
    {
      name: 'NEAR AI Cloud (TEE)',
      role: 'Multi-Agent Deliberation & Attestation',
      details: 'Runs isolated agent deliberation inside Intel TDX confidential compute environments (cloud-api.near.ai). Generates verifiable attestation reports.',
      primitive: 'NEAR AI Confidential VM',
      contractId: 'cloud.near.ai',
      icon: Cpu,
    },
    {
      name: 'NEAR Intents (1Click Relayer)',
      role: 'Cross-Chain Asset Settlement',
      details: 'Settles rewards into Ethereum (USDC), Solana (USDC), or Bitcoin directly from NEAR via Defuse intent solvers without manual cross-chain bridge risks.',
      primitive: 'NEAR Intents Solver Protocol',
      contractId: 'defuse-relayer.near',
      icon: Globe,
    },
    {
      name: 'NEAR Wallet Selector',
      role: 'Decentralized Multi-Wallet Signing',
      details: 'Provides council members and contributors with secure transaction signing through MyNearWallet, Meteor Wallet, and HERE Wallet.',
      primitive: '@near-wallet-selector/core',
      contractId: 'Universal Wallet Interface',
      icon: KeyRound,
    },
  ];

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] pb-6">
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-passed)] uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
            Infrastructure
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NEAR Primitives Actually Used
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            No synthetic wrappers or simulated blockchain layers. ZiniPay integrates deeply with the native NEAR governance and cryptographic computing stack.
          </p>
        </div>

        {/* Technical Stack Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stack.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="ledger-card p-5 flex flex-col justify-between border-[var(--border-subtle)] bg-[var(--bg-panel-alt)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--color-passed)]">
                      <Icon size={16} />
                    </div>
                    <span className="tag-neutral text-[10px] font-mono">
                      {item.primitive}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-1 tracking-tight">
                    {item.name}
                  </h3>
                  <div className="text-[11px] font-mono text-[var(--color-passed)] mb-2">
                    {item.role}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.details}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-muted)] flex items-center justify-between">
                  <span>TARGET:</span>
                  <span className="text-white font-medium truncate max-w-[170px]">{item.contractId}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
