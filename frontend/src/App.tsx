/**
 * App.tsx — ZiniPay Dashboard
 *
 * 100% NEAR-Aligned Constrained Agent Layer for Community Treasuries
 * Powered by NEAR AI Cloud, NEAR Intents, Chain Signatures, and Sputnik DAO / Trezu.
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { ThreeWayGate } from './components/ThreeWayGate.tsx';
import { ProposalCard } from './components/ProposalCard.tsx';
import { PolicyPanel } from './components/PolicyPanel.tsx';
import { ActivityLog } from './components/ActivityLog.tsx';
import { ProofModal } from './components/ProofModal.tsx';
import { initialProposals, mockPolicyMetrics, initialActivities } from './lib/mockData.ts';
import { Proposal, ActivityEvent } from './lib/types.ts';
import { ShieldCheck, Send, CheckCircle2, Globe, Sparkles } from 'lucide-react';

const NETWORK = import.meta.env.VITE_NEAR_NETWORK ?? 'testnet';
const DAO_CONTRACT = import.meta.env.VITE_DAO_CONTRACT_ID ?? 'zinipay.sputnik-dao.testnet';

const PRESETS = [
  {
    label: 'DevHub Tutorial',
    task: 'Write comprehensive tutorial on Sputnik DAO & Trezu integration',
    deliverable: 'https://github.com/near-devhub/tutorials/pull/88',
    recipient: 'alice.testnet',
    amount: '4.5',
    destination: 'near',
  },
  {
    label: 'Solana USDC Payout',
    task: 'Verify latency benchmarks on Solana-NEAR intent relayer',
    deliverable: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    recipient: 'solana-auditor.testnet',
    amount: '8.0',
    destination: 'solana',
  },
  {
    label: 'Ethereum Smart Contract Audit',
    task: 'Complete security audit on cross-chain intent settlement contract',
    deliverable: 'https://github.com/zinipay/audit/blob/main/report-v1.pdf',
    recipient: '0x71C8364735391aB32e9',
    amount: '12.0',
    destination: 'ethereum',
  },
];

export default function App() {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [activities, setActivities] = useState<ActivityEvent[]>(initialActivities);
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled' | 'intents'>('all');
  const [tab, setTab] = useState<'proposals' | 'propose'>('proposals');
  const [activeRole, setActiveRole] = useState<'council' | 'agent' | 'contributor'>('council');
  const [selectedProofProposal, setSelectedProofProposal] = useState<Proposal | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Proposal builder form state
  const [task, setTask] = useState('Build Sputnik DAO Three-Way Match Integration');
  const [deliverable, setDeliverable] = useState('https://github.com/zinipay/core/pull/1');
  const [recipient, setRecipient] = useState('alice.testnet');
  const [amount, setAmount] = useState('4.5');
  const [destinationChain, setDestinationChain] = useState<'near' | 'ethereum' | 'solana' | 'bitcoin'>('near');
  const [crossChainAddress, setCrossChainAddress] = useState('0x71C...b48');
  const [cliCmd, setCliCmd] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleVote = (proposalId: number, approve: boolean) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const newApprove = approve ? p.votes.approve + 1 : p.votes.approve;
          const newReject = !approve ? p.votes.reject + 1 : p.votes.reject;
          const isQuorum = newApprove >= p.votes.required;

          return {
            ...p,
            status: isQuorum ? 'settled' : p.status,
            votes: {
              ...p.votes,
              approve: newApprove,
              reject: newReject,
            },
          };
        }
        return p;
      })
    );

    const title = approve ? `Council Vote Cast: Approved #${proposalId}` : `Council Vote Cast: Rejected #${proposalId}`;
    showToast(title);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: approve ? 'quorum_reached' : 'policy_pass',
        title,
        description: `Member voted ${approve ? 'Approve' : 'Reject'} on proposal #${proposalId} from Trezu council seat.`,
        badge: approve ? 'Vote Approve' : 'Vote Reject',
      },
      ...prev,
    ]);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTask(preset.task);
    setDeliverable(preset.deliverable);
    setRecipient(preset.recipient);
    setAmount(preset.amount);
    setDestinationChain(preset.destination as any);
    showToast(`Loaded preset: ${preset.label}`);
  };

  const buildCliCommand = () => {
    let cmd = `npx tsx agent/src/index.ts propose \\\n  --task "${task}" \\\n  --deliverable "${deliverable}" \\\n  --recipient "${recipient}" \\\n  --amount ${amount}`;
    if (destinationChain !== 'near') {
      cmd += ` \\\n  --cross-chain "${destinationChain}" \\\n  --cross-chain-address "${crossChainAddress}"`;
    }
    setCliCmd(cmd);

    // Optimistically queue simulated proposal in frontend
    const newId = proposals.length > 0 ? Math.max(...proposals.map((p) => p.id)) + 1 : 105;
    const newProposal: Proposal = {
      id: newId,
      title: task,
      proposer: 'zinipay-agent.testnet',
      recipient,
      amountNear: amount,
      amountYocto: (BigInt(Math.floor(Number(amount) * 1e4)) * 10n ** 20n).toString(),
      proofCid: `bafybei${Math.random().toString(36).substring(2, 15)}pass77`,
      summary: `Verified via NEAR AI Cloud (TEE). Three-Way Match clearance confirmed.`,
      evidenceType: 'github_pr',
      evidenceDetails: `Task: ${task} | Deliverable: ${deliverable} | Attestation: [Three-Way Match 3/3 PASS] | Inspector Score: 95/100 | Risk: LOW`,
      createdAt: 'Just now',
      status: 'pending_quorum',
      policy: {
        withinCap: true,
        capLimit: '10.0 NEAR',
        cooldownElapsed: true,
        cooldownRemainingSecs: 0,
        cidUnique: true,
        reputationQualified: true,
        reputationScore: 30,
        tier: 'Silver',
      },
      settlement: {
        type: destinationChain === 'near' ? 'native_near' : 'cross_chain_intent',
        targetChain: destinationChain,
        targetToken: destinationChain === 'near' ? 'NEAR' : 'USDC',
        recipientAddress: destinationChain === 'near' ? recipient : crossChainAddress,
        quoteEstimate: destinationChain !== 'near' ? `~${(Number(amount) * 4.6).toFixed(2)} USDC` : undefined,
      },
      votes: {
        approve: 1,
        reject: 0,
        required: 3,
      },
    };

    setProposals([newProposal, ...proposals]);
    setActivities([
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'proposal_created',
        title: `Proposal #${newId} Dispatched`,
        description: `Three-Way Match verified. Sputnik DAO add_proposal called with 1 NEAR bond.`,
        badge: 'New Proposal',
      },
      ...activities,
    ]);

    showToast(`Proposal #${newId} queued with Three-Way Match!`);
  };

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'pending') return p.status === 'pending_quorum';
    if (filter === 'settled') return p.status === 'settled' || p.status === 'approved';
    if (filter === 'intents') return p.settlement.type === 'cross_chain_intent';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-2xl text-xs font-mono border border-emerald-400/40">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Proof Modal */}
      <ProofModal
        proposal={selectedProofProposal}
        onClose={() => setSelectedProofProposal(null)}
      />

      {/* ── Top Navigation ──────────────────────────────────────────────── */}
      <Navbar
        network={NETWORK}
        daoContract={DAO_CONTRACT}
        treasuryBalance={mockPolicyMetrics.treasuryBalanceNear}
        loading={false}
        onRefresh={() => showToast('Refreshed state from Sputnik DAO RPC')}
        activeRole={activeRole}
        onRoleChange={(r) => {
          setActiveRole(r);
          showToast(`Switched active view to: ${r}`);
        }}
      />

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Three-Way Release Gate Visualizer Banner */}
        <ThreeWayGate />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Proposals & Payout Dispatcher */}
          <div className="flex-1 w-full flex flex-col gap-5">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-3 gap-3">
              <div className="flex gap-2">
                {[
                  { key: 'proposals', label: `Treasury Proposals (${proposals.length})` },
                  { key: 'propose', label: '⚡ Three-Way Match Dispatcher' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key as any)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      tab === t.key
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === 'proposals' && (
                <div className="flex items-center gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800 text-xs font-mono">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending Quorum' },
                    { id: 'settled', label: 'Settled' },
                    { id: 'intents', label: 'NEAR Intents' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        filter === f.id
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tab 1: Proposals Feed */}
            {tab === 'proposals' && (
              <div className="flex flex-col gap-4">
                {filteredProposals.map((p) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    daoContractId={DAO_CONTRACT}
                    network={NETWORK}
                    onVote={handleVote}
                    onInspectProof={(prop) => setSelectedProofProposal(prop)}
                  />
                ))}

                {filteredProposals.length === 0 && (
                  <div className="text-center text-gray-500 py-16 text-sm border border-dashed border-gray-800 rounded-2xl font-mono">
                    No proposals matching this filter. Dispatch a new proposal to see the Three-Way Gate in action.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Payout Dispatcher */}
            {tab === 'propose' && (
              <div className="card p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-base flex items-center gap-2 text-white">
                      <ShieldCheck size={18} className="text-emerald-400" />
                      ZiniPay Three-Way Match Dispatcher
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      The agent deliberates via NEAR AI Cloud (TEE), verifies anti-double-spend, scales by reputation tier, and attaches proof.
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Policy Enforced
                  </span>
                </div>

                {/* Quick Presets Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>One-Click Testing Presets:</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {PRESETS.map((pr) => (
                      <button
                        key={pr.label}
                        type="button"
                        onClick={() => applyPreset(pr)}
                        className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-xs font-medium text-gray-300 hover:text-white border border-gray-800 transition-colors"
                      >
                        {pr.label} ({pr.amount}N)
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs text-gray-300 font-medium">Task Scope & Specification</label>
                    <input
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="e.g. Build Sputnik DAO Three-Way Match Agent"
                      className="bg-gray-900 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs text-gray-300 font-medium">Deliverable Evidence Artifact (URL, IPFS CID, or Git PR)</label>
                    <input
                      value={deliverable}
                      onChange={(e) => setDeliverable(e.target.value)}
                      placeholder="https://github.com/... or ipfs://..."
                      className="bg-gray-900 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-300 font-medium">Recipient Contributor</label>
                    <input
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="alice.testnet"
                      className="bg-gray-900 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-300 font-medium">Reward Amount (NEAR)</label>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="5"
                      className="bg-gray-900 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  {/* Settlement Network Selection */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                      <Globe size={14} className="text-blue-400" />
                      Settlement Destination Rail
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'near', label: 'NEAR Native' },
                        { id: 'ethereum', label: 'Ethereum (Intents)' },
                        { id: 'solana', label: 'Solana (Intents)' },
                        { id: 'bitcoin', label: 'Bitcoin (Intents)' },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setDestinationChain(c.id as any)}
                          className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                            destinationChain === c.id
                              ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-sm'
                              : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {destinationChain !== 'near' && (
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs text-blue-300 font-medium font-mono">
                        Destination Address on {destinationChain.toUpperCase()} (USDC Settlement)
                      </label>
                      <input
                        value={crossChainAddress}
                        onChange={(e) => setCrossChainAddress(e.target.value)}
                        placeholder="e.g. 0x..."
                        className="bg-gray-900 border border-blue-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={buildCliCommand}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl near-gradient text-black font-extrabold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-emerald-500/10 mt-2"
                >
                  <Send size={15} />
                  Dispatch Payout with Three-Way Match
                </button>

                {cliCmd && (
                  <div className="flex flex-col gap-2 bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Equivalent CLI Execution:</span>
                      <span className="text-purple-400 font-mono">Simulate with --dry-run</span>
                    </div>
                    <pre className="bg-black/80 rounded-lg p-3 text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap font-mono border border-emerald-950">
                      {cliCmd}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Policy Gauges & Activity Stream */}
          <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
            <PolicyPanel
              policy={{
                maxSpendPerProposalNear: mockPolicyMetrics.perProposalCapNear,
                maxSpendPerDayNear: mockPolicyMetrics.dailyCapNear,
                cooldownHours: mockPolicyMetrics.cooldownHours,
                minReputationScore: mockPolicyMetrics.minReputation,
              }}
              daily={{
                count: 3,
                totalNear: mockPolicyMetrics.dailySpentNear,
              }}
            />

            {/* Live Activity Log */}
            <ActivityLog activities={activities} />

            {/* Ecosystem Links */}
            <div className="card p-4 flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ecosystem Surfaces</h4>
              {[
                { label: 'Trezu Treasury Dashboard', url: 'https://app.trezu.org' },
                { label: 'Sputnik DAO Contracts', url: 'https://github.com/near-daos/sputnik-dao-contract' },
                { label: 'NEAR Intents 1Click API', url: 'https://near-intents.org' },
                { label: 'NEAR AI Cloud (TEE)', url: 'https://cloud.near.ai' },
              ].map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-between"
                >
                  <span>{label}</span>
                  <span>↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
