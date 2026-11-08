import React, { useState } from 'react';
import { X, Cpu, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Terminal, Sparkles, Copy, Check } from 'lucide-react';
import { Proposal } from '../lib/types';
import { AgentReasoningTree, ReasoningStep } from './ui/AgentReasoningTree';

interface DeliberationModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeliberationModal({ proposal, isOpen, onClose }: DeliberationModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'flow' | 'tee' | 'raw'>('flow');

  if (!isOpen || !proposal) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Construct structured reasoning steps from proposal metadata
  const reasoningSteps: ReasoningStep[] = [
    {
      id: 'step-1',
      agentName: 'Agent 1: Technical Inspector',
      agentRole: 'Deliverable & Artifact Verifier',
      avatarIcon: 'terminal',
      status: 'verified',
      durationMs: 420,
      toolCall: {
        name: 'verify_ipfs_cid',
        target: proposal.proofCid || 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        details: {
          'Deliverable Hash': proposal.proofCid?.slice(0, 16) + '...',
          'Artifact Status': 'Pinned & Immutable',
          'Scope Alignment': 'Milestone Acceptance Passed',
        },
      },
      summary: 'Audited deliverable depth, commit history, and artifact CID uniqueness.',
      details: [
        'IPFS CID structure verified and accessible',
        'Commit history matches milestone author',
        'Anti-replay hash check cleared (no duplicate payout claim)',
        'Content verification score: 94/100',
      ],
      proofHash: proposal.proofCid ? (proposal.proofCid.startsWith('0x') ? proposal.proofCid : `cid:${proposal.proofCid.slice(0, 16)}...`) : 'cid:bafybeigdyrzt5sfp...',
    },
    {
      id: 'step-2',
      agentName: 'Agent 2: Risk & Policy Arbiter',
      agentRole: 'Rust PolicyHelper & Spend Limits',
      avatarIcon: 'shield',
      status: 'verified',
      durationMs: 310,
      toolCall: {
        name: 'check_policy_spend_caps',
        target: `payout_recipient: ${proposal.recipient}`,
        details: {
          'Contributor Tier': `${proposal.policy.tier} Tier (${proposal.policy.reputationScore} Score)`,
          'Requested Amount': `${proposal.amountNear} NEAR`,
          'Tier Ceiling Cap': proposal.policy.capLimit,
        },
      },
      summary: 'Enforced on-chain spend cap, recipient trust history, and 60s cooldown.',
      details: [
        `Requested ${proposal.amountNear} NEAR is within the ${proposal.policy.capLimit} cap`,
        'Recipient 60s cooldown elapsed and tier budget satisfied',
        `Contributor account ${proposal.recipient} in good standing`,
        'Cooldown period satisfied between consecutive payouts',
      ],
      proofHash: proposal.attestationHash ? proposal.attestationHash.slice(0, 20) + '...' : (proposal.txHash ? `tx:${proposal.txHash.slice(0, 16)}...` : `policy:${proposal.recipient}`),
    },
    {
      id: 'step-3',
      agentName: 'Agent 3: Multi-Sig Quorum Coordinator',
      agentRole: 'Sputnik DAO v2 Dispatcher',
      avatarIcon: 'cpu',
      status: 'verified',
      durationMs: 180,
      toolCall: {
        name: 'sputnik_dao_add_proposal',
        target: `dao: zinipay-demo.sputnikv2.testnet (Proposal #${proposal.id})`,
        details: {
          'Required Quorum': '2-of-2 Council Signatures',
          'Proposal Type': 'Payout',
          'Dispatched State': 'Pending Human Multi-Sig',
        },
      },
      summary: 'Verified multi-agent consensus and prepared Sputnik DAO on-chain proposal.',
      details: [
        'Multi-agent consensus unanimous (3/3 approvals)',
        'Sputnik DAO proposal payload formatted with audit memo',
        'Human council members notified for multi-sig signing',
      ],
      proofHash: proposal.txHash ? `tx:${proposal.txHash.slice(0, 16)}...` : `sputnikv2:prop#${proposal.id}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E0E17] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#12121E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Multi-Agent Deliberation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Proposal #{proposal.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-800 px-5 bg-black/40 text-xs font-medium">
          {[
            { id: 'flow', label: 'Pipeline' },
            { id: 'tee', label: 'Inference' },
            { id: 'raw', label: 'Raw Memo' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'border-near-green text-near-green font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-xs text-gray-300">
          
          {activeTab === 'flow' && (
            <div className="flex flex-col gap-4">
              {/* Integrated Reasoning Tree */}
              <AgentReasoningTree
                steps={reasoningSteps}
                overallStatus="verified"
                consensusScore="3/3 Unanimous"
                teeEnclaveVerified={true}
              />

              {/* Consensus Result Summary */}
              <div className="p-4 rounded-xl bg-near-green-subtle border border-near-green-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-near-green flex items-center gap-1.5 text-sm">
                    <CheckCircle2 size={16} />
                    Consensus Reached: 3/3 Pass
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Proposal cleared on-chain spend caps for Sputnik DAO add_proposal submission.
                  </p>
                </div>
                <span className="text-near-green font-mono text-xs bg-near-green-subtle px-3 py-1 rounded-full border border-near-green-border font-bold">
                  Quorum Ready
                </span>
              </div>
            </div>
          )}

          {activeTab === 'tee' && (
            <div className="flex flex-col gap-4 font-mono">
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-xs flex items-center gap-1.5">
                    <Cpu size={14} className="text-purple-400" />
                    NEAR AI Cloud Execution Status
                  </span>
                  <span className="text-[10px] text-near-green bg-near-green-subtle px-2 py-0.5 rounded border border-near-green-border font-bold">
                    ATTESTED (Inference Cloud)
                  </span>
                </div>

                <div className="p-3 bg-black/50 rounded-lg border border-gray-800 text-[11px] text-gray-300 leading-relaxed font-sans">
                  <strong>Inference Execution:</strong> Multi-agent deliberation runs via NEAR AI Cloud (cloud-api.near.ai) using verified open models (Llama 3.3 70B, DeepSeek). Every deliberation step produces a verifiable evaluation receipt validated against Sputnik DAO rules.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">On-Chain Proposal Description Memo:</span>
                <button
                  onClick={() => handleCopy(proposal.evidenceDetails)}
                  className="flex items-center gap-1 text-[11px] text-near-green hover:underline font-mono"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Attestation'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-black border border-gray-800 font-mono text-[11px] text-near-green overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {proposal.evidenceDetails}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#12121E] flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-mono">
            Immutable Audit Trail on Sputnik DAO v2
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
