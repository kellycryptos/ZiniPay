import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, Copy, Check, Cpu, CheckCircle2, Lock } from 'lucide-react';
import { Proposal } from '../lib/types';

interface ProofModalProps {
  proposal: Proposal | null;
  onClose: () => void;
}

export function ProofModal({ proposal, onClose }: ProofModalProps) {
  const [copied, setCopied] = useState(false);

  if (!proposal) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal.proofCid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-800 bg-[#12121A] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                Deliverable Proof Inspector
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">
                  TEE Signed
                </span>
              </h3>
              <p className="text-xs text-gray-400">Verifiable artifact & agent deliberation trace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Proposal Context</span>
            <p className="text-sm font-bold text-white mt-0.5">
              #{proposal.id} · {proposal.title}
            </p>
          </div>

          {/* Proof CID Box */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span className="font-medium">Cryptographic Proof CID (IPFS)</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy CID'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-gray-800 font-mono text-xs text-cyan-300 break-all select-all">
              {proposal.proofCid}
            </div>
          </div>

          {/* Autonomous Agent Evaluation */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>NEAR AI Cloud (TEE) Verification Trace</span>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 text-xs text-gray-300 leading-relaxed font-mono">
              {proposal.evidenceDetails}
            </div>
          </div>

          {/* Three-Way Release Gate Audit Checklist */}
          <div className="p-3.5 rounded-xl border border-gray-800 bg-gray-900/40 text-xs space-y-2 font-mono">
            <div className="flex justify-between items-center text-gray-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Gate 01: Artifact Evidence
              </span>
              <span className="text-emerald-400 font-semibold">VERIFIED PASS</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Gate 02: Policy & Cooldown
              </span>
              <span className="text-emerald-400 font-semibold">{proposal.amountNear}N ≤ {proposal.policy.capLimit}</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Gate 03: Zero Replay Check
              </span>
              <span className="text-emerald-400 font-semibold">0 Prior Usages (Unique)</span>
            </div>
            <div className="flex justify-between items-center text-gray-300 border-t border-gray-800 pt-2">
              <span className="flex items-center gap-1.5 text-gray-400">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Recipient Reputation:
              </span>
              <span className="text-amber-300 font-bold">{proposal.policy.reputationScore} Pts (Tier: {proposal.policy.tier})</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-mono">Governed on Sputnik DAO v2</span>
          <div className="flex space-x-2">
            <a
              href={`https://ipfs.io/ipfs/${proposal.proofCid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition-colors font-medium"
            >
              <span>View on IPFS</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
