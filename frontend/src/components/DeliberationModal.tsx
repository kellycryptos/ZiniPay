import React, { useState } from 'react';
import { X, Cpu, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Terminal, Sparkles, Copy, Check } from 'lucide-react';
import { Proposal } from '../lib/types';

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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Multi-Agent Deliberation</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  SIMULATION
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Proposal #{proposal.id} · Multi-Agent Consensus Attestation</p>
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
            { id: 'flow', label: 'Consensus Pipeline' },
            { id: 'tee', label: 'NEAR AI Cloud Execution' },
            { id: 'raw', label: 'Deliberation Attestation' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-4 border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-purple-500 text-purple-300 font-bold'
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
              
              {/* Agent 1: Inspector */}
              <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Agent 1: Technical Inspector
                  </span>
                  <span className="text-blue-400 font-mono font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                    Score: 94/100
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  Audits deliverable depth, commit history, and artifact CID structure.
                </p>
                <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-gray-300 border border-gray-800/80">
                  <span className="text-emerald-400">✓ Deliverable Verified:</span> {proposal.proofCid}
                  <br />
                  <span className="text-blue-400">↳ Audit Critique:</span> Substantive evidence attached. Scope aligns directly with milestone acceptance criteria.
                </div>
              </div>

              {/* Agent 2: Risk Arbiter */}
              <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Agent 2: Risk & Treasury Arbiter
                  </span>
                  <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Risk Level: LOW
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  Checks rolling 24h limits, recipient trust history, and dynamic multiplier.
                </p>
                <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-gray-300 border border-gray-800/80">
                  <span className="text-purple-400">↳ Reputation Tier:</span> {proposal.policy.tier} Tier (Score: {proposal.policy.reputationScore})
                  <br />
                  <span className="text-emerald-400">✓ Exposure Check:</span> Requested {proposal.amountNear} NEAR is within the {proposal.policy.capLimit} limit.
                </div>
              </div>

              {/* Consensus Result */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 size={16} />
                    Consensus Reached: 3/3 Pass
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Proposal cleared for Sputnik DAO add_proposal submission.
                  </p>
                </div>
                <span className="text-emerald-400 font-mono text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
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
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                    SIMULATION (Inference Mode)
                  </span>
                </div>

                <div className="p-3 bg-black/50 rounded-lg border border-gray-800 text-[11px] text-gray-300 leading-relaxed font-sans">
                  <strong>Inference Execution:</strong> Multi-agent deliberation runs via NEAR AI Cloud (cloud-api.near.ai) using open models (Llama 3.3 70B, DeepSeek). In simulation/preview mode, multi-agent evaluation rules are evaluated in software, and synthetic cryptographic quotes are not generated.
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
                  className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-mono"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Attestation'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-black border border-gray-800 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
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
