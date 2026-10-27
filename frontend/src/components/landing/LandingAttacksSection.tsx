import React from 'react';
import { ShieldAlert, AlertTriangle, Check, X, ShieldBan, Lock } from 'lucide-react';

export function LandingAttacksSection() {
  const attacks = [
    {
      title: 'Replayed Deliverable / CID Attack',
      vector: 'DUPLICATE BOUNTY DRAIN',
      description: 'Attacker resubmits a previously paid GitHub PR or IPFS CID to claim multiple payouts for the same work.',
      defense: 'PolicyHelper smart contract stores an immutable on-chain ledger of spent CID hashes to prevent double-spend.',
      rejectionCode: 'CID already used — duplicate release attempt blocked',
      status: 'ENFORCED BY CONTRACT',
    },
    {
      title: 'Over-Cap Treasury Drain',
      vector: 'EXCESSIVE WITHDRAWAL',
      description: 'Rogue agent or compromised caller requests 50 NEAR for a Bronze contributor with a 5 NEAR limit.',
      defense: 'Contract enforces strict per-proposal caps based on contributor tier (Bronze: 5N, Silver: 15N, Gold: 50N) plus daily volume ceilings.',
      rejectionCode: 'Amount exceeds effective tier cap for recipient',
      status: 'ENFORCED BY CONTRACT',
    },
    {
      title: 'Unauthorized Direct Caller Bypass',
      vector: 'DIRECT CALL BYPASS',
      description: 'Attacker directly invokes the release() method on the PolicyHelper contract without Sputnik DAO multi-sig approval.',
      defense: 'Contract asserts predecessor_account_id == dao_account_id. Funds cannot move without council multi-sig consensus.',
      rejectionCode: 'Only owner or designated DAO can call this',
      status: 'ENFORCED BY CONTRACT',
    },
    {
      title: 'Hallucinated or Stolen Deliverable',
      vector: 'FABRICATED EVIDENCE',
      description: 'Contributor submits a third-party GitHub PR authored by someone else or a non-existent repo artifact.',
      defense: 'Multi-agent deliberation via NEAR AI Cloud cross-references PR committer identity, merge status, and CI test output before constructing any proposal.',
      rejectionCode: 'Committer identity mismatch: recipient does not match PR author',
      status: 'ENFORCED BY AGENT',
    },
  ];

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-blocked)] uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-blocked)]" />
              Adversarial Invariants
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Attacks That Fail
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              ZiniPay is designed under a zero-trust model. Every attack vector that could drain a community treasury is prevented by fail-closed contract invariants and agent verification rules.
            </p>
          </div>
          <div className="font-mono text-xs text-[var(--color-blocked)] bg-[var(--color-blocked-bg)] border border-[var(--color-blocked-border)] px-3 py-1.5 rounded">
            FAIL-CLOSED INVARIANTS: ENFORCED ON-CHAIN
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {attacks.map((att, idx) => (
            <div
              key={idx}
              className="ledger-card p-6 flex flex-col justify-between border-[var(--border-subtle)] hover:border-[var(--color-blocked-border)] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="tag-blocked text-[10px] font-bold">
                    {att.status}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
                    {att.vector}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight mb-2">
                  {att.title}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  {att.description}
                </p>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2 font-mono text-[11px]">
                  <div className="text-[var(--text-muted)]">DEFENSE MECHANISM:</div>
                  <div className="text-slate-300 leading-snug">
                    {att.defense}
                  </div>
                </div>
              </div>

              {/* Exact Rejection String */}
              <div className="mt-5 p-3 rounded bg-[#0A0B0E] border border-[var(--color-blocked-border)] flex items-start gap-2.5 font-mono text-[11px] text-[var(--color-blocked)]">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <div className="break-all leading-snug">
                  <span className="text-[var(--text-muted)] text-[10px] block mb-0.5 uppercase tracking-wider">Exact Contract Revert</span>
                  "{att.rejectionCode}"
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
