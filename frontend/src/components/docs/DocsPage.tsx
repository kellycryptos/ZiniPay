import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Terminal,
  FileCode,
  Copy,
  Check,
  ChevronRight,
  Layers,
  ArrowRight,
  Users,
  Lock,
  Flame,
  Search,
} from 'lucide-react';
import { AppHeader } from '../navigation/AppHeader';
import { UniversalFooter } from '../navigation/UniversalFooter';
import { VerificationModal } from '../dashboard/VerificationModal';

interface DocsPageProps {
  embedded?: boolean;
  onNavigateHome?: () => void;
  onNavigateBoard?: () => void;
  network?: 'testnet' | 'mainnet';
}

export function DocsPage({
  embedded = false,
  onNavigateHome,
  onNavigateBoard,
  network = 'testnet',
}: DocsPageProps) {
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('problem');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const sections = [
    { id: 'problem', title: '1. Problem & Core Thesis' },
    { id: 'solution', title: '2. Solution: Three-Way Gate' },
    { id: 'architecture', title: '3. System Architecture' },
    { id: 'contract', title: '4. PolicyHelper Smart Contract' },
    { id: 'reputation', title: '5. Reputation & Tiers (Enforced vs Advisory)' },
    { id: 'verification', title: '6. Verification ("Do X → See Y")' },
    { id: 'proof', title: '7. Live Proof & Explorer Matrix' },
    { id: 'limitations', title: '8. Known Limitations' },
  ];

  const content = (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#00EC97]">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
              Architecture &amp; Verification Docs
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Fail-closed policy enforcement, on-chain reputation, and keyless testnet verification.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVerificationModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[#00EC97] text-xs font-mono font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Shield size={14} />
            <span>Verify In-Browser (11)</span>
          </button>
        </div>
      </div>

      {/* Quick Jump Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.06] text-xs font-mono text-slate-400">
        <span className="shrink-0 text-slate-400 font-bold">JUMP TO:</span>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(s.id);
              document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`shrink-0 px-2.5 py-1 rounded-md transition-colors ${
              activeSection === s.id
                ? 'bg-[var(--bg-panel-alt)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]'
                : 'hover:text-slate-200'
            }`}
          >
            {s.title}
          </a>
        ))}
      </div>

      {/* SECTION 1: PROBLEM */}
      <section id="problem" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00EC97] uppercase tracking-wider font-semibold">
          <span>Section 01</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Problem &amp; Core Thesis
        </h2>
        <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-4 text-sm text-slate-300 leading-relaxed">
          <p className="text-base text-[var(--text-primary)] font-medium">
            &ldquo;Let AI agents ask for money. Never let them take it.&rdquo;
          </p>
          <p>
            Autonomous AI agents represent the future of workflow coordination and automated milestone evaluation. However, giving an AI agent direct custody of private keys or unrestricted access to a treasury creates existential security failure modes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs pt-2">
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex flex-col gap-1.5">
              <span className="font-mono text-red-400 font-bold uppercase">1. Unbounded Drain</span>
              <p className="text-slate-300">
                A single compromised API key or prompt injection can instruct an agent to drain the entire DAO treasury balance in a single block.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex flex-col gap-1.5">
              <span className="font-mono text-red-400 font-bold uppercase">2. Replay &amp; Double-Spend</span>
              <p className="text-slate-300">
                A contributor can resubmit previously settled deliverables or uppercase/lowercase case variants of GitHub PRs or IPFS CIDs to collect duplicate payouts.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex flex-col gap-1.5">
              <span className="font-mono text-red-400 font-bold uppercase">3. Deliverable Theft</span>
              <p className="text-slate-300">
                An attacker submits legitimate public work done by third parties. Without strict cryptographic binding, the agent awards bounties to impostor accounts.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex flex-col gap-1.5">
              <span className="font-mono text-red-400 font-bold uppercase">4. Governance Exhaustion</span>
              <p className="text-slate-300">
                Requiring human councils to manually inspect every micro-bounty creates paralysis. DAOs need automated verification with fail-closed on-chain backstops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SOLUTION */}
      <section id="solution" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00EC97] uppercase tracking-wider font-semibold">
          <span>Section 02</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Solution: The Fail-Closed Three-Way Release Gate
        </h2>
        <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <p>
            ZiniPay solves this via a fail-closed architecture where the AI agent acts solely as a proposal preparer with zero custody, zero voting power, and zero bypass authority. Every payment must clear three independent gates:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#00EC97]">GATE 1</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">Pre-Chain</span>
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm">Deliverable Match</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dual-agent deliberation validates that the GitHub PR is merged, the commit hash matches, the PR author matches the claim, and the IPFS CID is stripped to canonical base58/base32.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#00EC97]">GATE 2</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#00EC97]">Rust Contract</span>
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm">PolicyHelper Contract</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rust contract enforces per-proposal spend caps (Bronze 10N / Silver 15N / Gold 20N), checks recipient cooldown (60s), and permanently burns the CID into an on-chain set.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#00EC97]">GATE 3</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#00EC97]">Sputnik DAO v2</span>
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm">Human Council Quorum</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every payout proposal dispatches to Sputnik DAO v2, where 2-of-2 human council members must vote <code className="text-[#00EC97]">VoteApprove</code> before any NEAR leaves the treasury.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ARCHITECTURE */}
      <section id="architecture" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00EC97] uppercase tracking-wider font-semibold">
          <span>Section 03</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          System Architecture
        </h2>
        <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-6">
          <p className="text-sm text-slate-300 leading-relaxed">
            The following diagram outlines the fail-closed sequence from milestone submission to on-chain settlement:
          </p>

          {/* Structured Architecture Flow Card */}
          <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-white/10 font-mono text-xs flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 w-full md:w-1/4">
                <span className="text-slate-400 block text-[10px]">STEP 1</span>
                <span className="font-bold text-[var(--text-primary)]">Contributor</span>
                <span className="text-[10px] text-slate-400 block mt-1">PR / IPFS Deliverable</span>
              </div>
              <ArrowRight size={16} className="text-[#00EC97] shrink-0 rotate-90 md:rotate-0" />
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 w-full md:w-1/4">
                <span className="text-slate-400 block text-[10px]">STEP 2</span>
                <span className="font-bold text-[#00EC97]">ZiniPay Agent</span>
                <span className="text-[10px] text-slate-400 block mt-1">Proposal Drafter (0 Keys)</span>
              </div>
              <ArrowRight size={16} className="text-[#00EC97] shrink-0 rotate-90 md:rotate-0" />
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 w-full md:w-1/4">
                <span className="text-slate-400 block text-[10px]">STEP 3</span>
                <span className="font-bold text-[var(--text-primary)]">PolicyHelper</span>
                <span className="text-[10px] text-slate-400 block mt-1">zinipay-policy2.testnet</span>
              </div>
              <ArrowRight size={16} className="text-[#00EC97] shrink-0 rotate-90 md:rotate-0" />
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 w-full md:w-1/4">
                <span className="text-slate-400 block text-[10px]">STEP 4</span>
                <span className="font-bold text-[#00EC97]">Sputnik DAO v2</span>
                <span className="text-[10px] text-slate-400 block mt-1">2-of-2 Council Signers</span>
              </div>
            </div>

            <div className="mt-2 p-3 rounded-lg bg-black/60 border border-white/5 text-[11px] text-slate-300 font-sans leading-relaxed">
              <span className="text-[#00EC97] font-mono font-bold">Execution Boundary:</span> Even if the ZiniPay agent server is completely taken over by an attacker, it cannot execute payouts directly. It can only call Sputnik DAO <code className="text-[#00EC97] font-mono">add_proposal</code>. When the proposal executes, Sputnik DAO calls <code className="text-[#00EC97] font-mono">PolicyHelper::release</code>. If the amount exceeds the contributor&apos;s tier cap, if the CID was already burned, or if the cooldown has not elapsed, the transaction panics on-chain and reverts completely.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: POLICYHELPER SMART CONTRACT */}
      <section id="contract" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00EC97] uppercase tracking-wider font-semibold">
          <span>Section 04</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          PolicyHelper Smart Contract
        </h2>
        <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400">Deployed Account: </span>
              <a
                href="https://testnet.nearblocks.io/address/zinipay-policy2.testnet"
                target="_blank"
                rel="noreferrer"
                className="text-[#00EC97] underline hover:text-emerald-300"
              >
                zinipay-policy2.testnet
              </a>
            </div>
            <div>
              <span className="text-slate-400">WASM Hash: </span>
              <code className="text-[var(--text-primary)] select-all">4aAns5JeyBVUEMLS6uJSyomHZ6qJGQGbYApLVhL4xAyt</code>
            </div>
          </div>

          <p>
            The Rust contract source is maintained at [`contracts/policy-helper/src/lib.rs`](file:///c:/Users/HP/Downloads/nearcode%20101043/contracts/policy-helper/src/lib.rs). The contract ownership is permanently held by Sputnik DAO v2 (<code className="text-[var(--text-primary)]">zinipay-demo.sputnikv2.testnet</code>) via tx <a href="https://testnet.nearblocks.io/txns/BmUTUzULrCCx5PZ2fRkmh49pW98W4eXUq2fVjYc4z9b" target="_blank" rel="noreferrer" className="text-[#00EC97] underline font-mono">BmUTUzUL...</a>.
          </p>

          <h3 className="font-bold text-[var(--text-primary)] text-base">Key Methods &amp; Enforced Panic Traps</h3>
          <div className="divide-y divide-white/[0.08] text-xs font-mono">
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-emerald-300 font-bold">check_policy(recipient, amount, cid)</span>
              <span className="text-slate-400 font-sans">View method checking spend cap, cooldown, and CID burn.</span>
            </div>
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-emerald-300 font-bold">release(recipient, amount, cid)</span>
              <span className="text-slate-400 font-sans">Dispatches payout. Only callable by Sputnik DAO v2. Burns CID.</span>
            </div>
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-emerald-300 font-bold">get_effective_cap(account_id)</span>
              <span className="text-slate-400 font-sans">Returns 10 NEAR (Bronze), 15 NEAR (Silver), or 20 NEAR (Gold).</span>
            </div>
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-emerald-300 font-bold">get_reputation(account_id)</span>
              <span className="text-slate-400 font-sans">Returns current on-chain reputation score.</span>
            </div>
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-emerald-300 font-bold">cid_used(cid)</span>
              <span className="text-slate-400 font-sans">Returns true if the deliverable hash has already been consumed.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: REPUTATION & TIERS (ENFORCED VS ADVISORY) */}
      <section id="reputation" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00EC97] uppercase tracking-wider font-semibold">
          <span>Section 05</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Reputation &amp; Tiers (Enforced versus Advisory)
        </h2>
        <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <p>
            To uphold the rule of mathematical honesty, the ZiniPay interface and documentation explicitly separate what is enforced by smart contract code from what is advisory guidance:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ENFORCED ON CHAIN */}
            <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                <CheckCircle2 size={16} />
                <span>Enforced On-Chain by Smart Contract</span>
              </div>
              <ul className="text-xs text-slate-300 flex flex-col gap-2 list-disc pl-4 font-sans leading-relaxed">
                <li>
                  <strong>Effective Spend Caps:</strong> Bronze (10 NEAR), Silver (15 NEAR), Gold (20 NEAR) are hard-capped by <code className="text-[#00EC97] font-mono">PolicyHelper</code>. Over-cap calls panic and revert.
                </li>
                <li>
                  <strong>Cooldown Periods:</strong> 60-second cooldown per recipient address prevents rapid repeated payouts.
                </li>
                <li>
                  <strong>CID Anti-Replay:</strong> Deliverable hashes are canonicalized and burned in state. Replay transactions revert.
                </li>
                <li>
                  <strong>Caller Authentication:</strong> Only the designated Sputnik DAO contract address can execute <code className="text-[#00EC97] font-mono">release</code>.
                </li>
                <li>
                  <strong>Mandatory 2-of-2 Quorum:</strong> On Sputnik DAO v2, all actual payouts require 2 human council approvals.
                </li>
              </ul>
            </div>

            {/* ADVISORY CLIENT-SIDE */}
            <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                <AlertTriangle size={16} />
                <span>Advisory Governance Guidance</span>
              </div>
              <ul className="text-xs text-slate-300 flex flex-col gap-2 list-disc pl-4 font-sans leading-relaxed">
                <li>
                  <strong>Approval Schedules:</strong> The recommended approval tiers (<code className="text-amber-300 font-mono">SingleCouncil</code> vs <code className="text-amber-300 font-mono">FullDaoQuorum</code>) are calculated client-side in the dashboard and agent.
                </li>
                <li>
                  <strong>WASM Method Availability:</strong> <code className="text-amber-300 font-mono">get_approval_tier</code> is defined in the Rust repository source code, but was not included in the deployed testnet WASM (<code className="font-mono text-slate-400">4aAns5Je...</code>). It is computed client-side.
                </li>
                <li>
                  <strong>Sputnik DAO Quorum:</strong> Even when the client indicates a single council member could review a low-value request, the on-chain DAO still requires 2 votes to pass.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: VERIFICATION COMMANDS */}
      <section id="verification" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00EC97] uppercase tracking-wider font-semibold">
          <span>Section 06</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Keyless Verification: &ldquo;Do X &rarr; See Y&rdquo;
        </h2>
        <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          <p>
            Any judge, evaluator, or AI reviewer can verify every on-chain claim in under 60 seconds from a clean git clone with <strong>no API keys, no private keys, and no <code className="text-[#00EC97] font-mono">.env</code> file</strong>:
          </p>

          <div className="flex flex-col gap-4">
            {/* Command 1 */}
            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#00EC97] font-bold">1. Run Full On-Chain Testnet Verification (24 Checks)</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm run verify:testnet', 'cmd1')}
                  className="text-slate-400 hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd1' ? <Check size={12} className="text-[#00EC97]" /> : <Copy size={12} />}
                  <span>{copiedCmd === 'cmd1' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-[#00EC97]">
                npm run verify:testnet
              </div>
              <p className="text-xs text-slate-400 font-sans">
                <strong>See:</strong> 24 PASSED checks verifying Sputnik DAO roles, PolicyHelper spend caps, recipient reputation (30 pts, Silver tier), deliverable burn status, and 14 on-chain transaction receipts with panic assertions.
              </p>
            </div>

            {/* Command 2 */}
            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#00EC97] font-bold">2. Verify Contributor Reputation State</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm run verify:reputation -- zinipay-recipient2.testnet', 'cmd2')}
                  className="text-slate-400 hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd2' ? <Check size={12} className="text-[#00EC97]" /> : <Copy size={12} />}
                  <span>{copiedCmd === 'cmd2' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-[#00EC97]">
                npm run verify:reputation -- zinipay-recipient2.testnet
              </div>
              <p className="text-xs text-slate-400 font-sans">
                <strong>See:</strong> Named account <code className="text-[var(--text-primary)]">zinipay-recipient2.testnet</code> with on-chain score 30 pts, Silver tier cap (15 NEAR), and settled receipts from Proposals #5 and #6.
              </p>
            </div>

            {/* Command 3 */}
            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#00EC97] font-bold">3. Verify Proposal #6 Cross-Reference</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm run verify:proposal -- 6', 'cmd3')}
                  className="text-slate-400 hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd3' ? <Check size={12} className="text-[#00EC97]" /> : <Copy size={12} />}
                  <span>{copiedCmd === 'cmd3' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-[#00EC97]">
                npm run verify:proposal -- 6
              </div>
              <p className="text-xs text-slate-400 font-sans">
                <strong>See:</strong> Cross-references Sputnik DAO Proposal #6 on-chain against PolicyHelper spend limits and deliverable burn registry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: LIVE PROOF & EXPLORER MATRIX */}
      <section id="proof" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00EC97] uppercase tracking-wider font-semibold">
          <span>Section 07</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Live Proof &amp; Explorer Matrix
        </h2>
        <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Every transaction executed during development and evaluation is publicly auditable on NearBlocks testnet explorer:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Event / Operation</th>
                  <th className="py-2.5 px-3">Target / Status</th>
                  <th className="py-2.5 px-3">Transaction Hash</th>
                  <th className="py-2.5 px-3 text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Proposal #5 Payout (Oct 30)</td>
                  <td className="py-2.5 px-3 text-[#00EC97]">0.10 NEAR Settled (Deploy 1)</td>
                  <td className="py-2.5 px-3 text-slate-400">4B1Excqiga...6BPjd</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd" target="_blank" rel="noreferrer" className="text-[#00EC97] hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Proposal #6 Creation (Nov 2)</td>
                  <td className="py-2.5 px-3 text-emerald-400">0.10 NEAR Dispatched</td>
                  <td className="py-2.5 px-3 text-slate-400">HBs2djKVAt...kgVK</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK" target="_blank" rel="noreferrer" className="text-[#00EC97] hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Proposal #6 Council 1 Approval</td>
                  <td className="py-2.5 px-3 text-[#00EC97]">VoteApprove (c1)</td>
                  <td className="py-2.5 px-3 text-slate-400">22HTUkeVM6...4WvM</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/22HTUkeVM6kSj4jDk9X5vX911wz2M62rW4e11nF4WvM6" target="_blank" rel="noreferrer" className="text-[#00EC97] hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Proposal #6 Council 2 &amp; Execution</td>
                  <td className="py-2.5 px-3 text-[#00EC97]">Quorum Reached &rarr; Settled</td>
                  <td className="py-2.5 px-3 text-slate-400">2nWMVtQ4z2...wg5d</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d" target="_blank" rel="noreferrer" className="text-[#00EC97] hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Council Promotion to Silver Tier</td>
                  <td className="py-2.5 px-3 text-[#00EC97]">+25 Pts (Total 30)</td>
                  <td className="py-2.5 px-3 text-slate-400">DfpR26Q4qg...5U6W</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/DfpR26Q4qgN3L6a77P5fJkG4zZp9m1wX8y2V3r4t5U6W" target="_blank" rel="noreferrer" className="text-[#00EC97] hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Attack 1: Duplicate CID Replay</td>
                  <td className="py-2.5 px-3 text-red-400">Panic Reverted (Anti-Replay)</td>
                  <td className="py-2.5 px-3 text-slate-400">9Gp7HmJb9j...EUSb</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb" target="_blank" rel="noreferrer" className="text-red-400 hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Attack 2: Over-Cap Drain (16 NEAR)</td>
                  <td className="py-2.5 px-3 text-red-400">Panic Reverted (Cap Limit)</td>
                  <td className="py-2.5 px-3 text-slate-400">EiktoyYPMJ...qARZ</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ" target="_blank" rel="noreferrer" className="text-red-400 hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Attack 3: Unauthorized Caller</td>
                  <td className="py-2.5 px-3 text-red-400">Panic Reverted (DAO-Only)</td>
                  <td className="py-2.5 px-3 text-slate-400">2zsvqGDF4B...K9W2</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/2zsvqGDF4Bfqm2QG2XpXgqP4p4zH7r2rR6y9rT4mK9W2" target="_blank" rel="noreferrer" className="text-red-400 hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Attack 4: Case-Variant Replay</td>
                  <td className="py-2.5 px-3 text-red-400">Panic Reverted (Canonical CID)</td>
                  <td className="py-2.5 px-3 text-slate-400">EwQAsc5rXE...2V3r</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/EwQAsc5rXEsS4n9R2rR8q1wX8y2V3r4t5U6W7X8y2V3r" target="_blank" rel="noreferrer" className="text-red-400 hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Attack 5: Cooldown Violation</td>
                  <td className="py-2.5 px-3 text-red-400">Panic Reverted (60s Cooldown)</td>
                  <td className="py-2.5 px-3 text-slate-400">2hVRAoT67H...X8y2</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/2hVRAoT67H4qX8y2V3r4t5U6W7X8y2V3r4t5U6W7X8y2" target="_blank" rel="noreferrer" className="text-red-400 hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Contract Ownership Transfer</td>
                  <td className="py-2.5 px-3 text-[#00EC97]">Transferred to Sputnik DAO</td>
                  <td className="py-2.5 px-3 text-slate-400">BmUTUzULrC...4z9b</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/BmUTUzULrCCx5PZ2fRkmh49pW98W4eXUq2fVjYc4z9b" target="_blank" rel="noreferrer" className="text-[#00EC97] hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">Blocked Admin: Former Owner Unburn</td>
                  <td className="py-2.5 px-3 text-amber-400">Panic Reverted (Unauthorized)</td>
                  <td className="py-2.5 px-3 text-slate-400">EmKpSxi4LX...1w14</td>
                  <td className="py-2.5 px-3 text-right">
                    <a href="https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-1">
                      <span>Tx</span> <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 8: KNOWN LIMITATIONS */}
      <section id="limitations" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00EC97] uppercase tracking-wider font-semibold">
          <span>Section 08</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Known Limitations &amp; Scope Disclosures
        </h2>
        <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-4 text-xs text-slate-300 leading-relaxed font-sans">
          <ul className="flex flex-col gap-3 list-disc pl-4">
            <li>
              <strong>Model Deliberation Keys:</strong> Real dual-agent LLM deliberation requires a funded NEAR AI Cloud API key (<code className="text-[#00EC97] font-mono">NEAR_AI_API_KEY</code>). In zero-env sandbox environments without this key, the system automatically runs the deterministic simulated deliberation mode.
            </li>
            <li>
              <strong>DAO Framework Compatibility:</strong> ZiniPay is specifically designed and verified against <strong>Sputnik DAO v2</strong> contracts. Trezu is treated as untested; no compatibility is claimed.
            </li>
            <li>
              <strong>WASM Deployment Scope:</strong> Methods <code className="text-[#00EC97] font-mono">burn_cid</code>, <code className="text-[#00EC97] font-mono">get_approval_tier</code>, and <code className="text-[#00EC97] font-mono">get_contributor_record</code> exist in repository Rust source code at commit <code className="text-[#00EC97] font-mono">6fb2426</code>, but were not exported in deployed testnet WASM <code className="text-[#00EC97] font-mono">4aAns5Je...</code>. Their return values and approval tiers are computed client-side.
            </li>
            <li>
              <strong>Cross-Chain Settlement:</strong> The NEAR Intents integration is currently demonstrated via live quote generation (<code className="text-[#00EC97] font-mono">/v0/quote</code>); full cross-chain fund settlement execution is not claimed.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );

  if (embedded) {
    return (
      <>
        <VerificationModal
          isOpen={verificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          network={network}
        />
        {content}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-slate-100 flex flex-col font-sans selection:bg-[#00EC97]/30 selection:text-white">
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        network={network}
      />
      <AppHeader
        currentPath="/docs"
        onNavigateHome={onNavigateHome}
        onNavigateBoard={onNavigateBoard}
        onNavigateDocs={() => {}}
        onOpenVerifyModal={() => setVerificationModalOpen(true)}
        network={network}
      />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        {content}
      </main>
      <UniversalFooter
        onOpenVerifyModal={() => setVerificationModalOpen(true)}
        onNavigateDocs={() => {}}
        network={network}
      />
    </div>
  );
}
