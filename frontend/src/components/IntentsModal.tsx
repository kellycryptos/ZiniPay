import React, { useState } from 'react';
import { X, ArrowRightLeft, Globe, CheckCircle2, ExternalLink, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { Proposal } from '../lib/types';

interface IntentsModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  onSettled?: (proposalId: number, txHash: string) => void;
}

export function IntentsModal({ proposal, isOpen, onClose, onSettled }: IntentsModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [settledTx, setSettledTx] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !proposal) return null;

  const targetChain = proposal.settlement.targetChain.toUpperCase();
  const targetToken = proposal.settlement.targetToken;
  const quoteEstimate = proposal.settlement.quoteEstimate || `~${(Number(proposal.amountNear) * 4.6).toFixed(2)} USDC`;

  const handleExecuteIntent = async () => {
    setIsExecuting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenIn: 'near',
          amountIn: proposal.amountYocto,
          tokenOut: targetToken,
          recipientAddress: proposal.settlement.recipientAddress,
          destinationChain: proposal.settlement.targetChain,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to obtain live quote from NEAR Intents.');
        return;
      }

      if (data.data?.txHash) {
        setSettledTx(data.data.txHash);
        if (onSettled) {
          onSettled(proposal.id, data.data.txHash);
        }
      } else if (data.data?.deposit_address || data.data?.depositAddress) {
        const addr = data.data.deposit_address || data.data.depositAddress;
        setSettledTx(`Quote received. Deposit address: ${addr}`);
      } else {
        setErrorMessage('Upstream service returned a response without a transaction hash or deposit address.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reach NEAR Intents service');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E0E17] border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#12121E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">NEAR Intents 1Click Settlement</h3>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                  Defuse Solver
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Cross-Chain Treasury Release to {targetChain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-xs text-gray-300">
          
          {/* Swap route box */}
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 uppercase font-mono">From Sputnik Treasury</span>
              <span className="font-bold text-white text-base">{proposal.amountNear} NEAR</span>
              <span className="text-[11px] text-gray-500 font-mono">genesis.sputnikv2.testnet</span>
            </div>

            <div className="p-2.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ArrowRightLeft size={16} />
            </div>

            <div className="flex flex-col gap-1 text-right">
              <span className="text-[10px] text-gray-400 uppercase font-mono">To Contributor ({targetChain})</span>
              <span className="font-bold text-emerald-400 text-base">{quoteEstimate}</span>
              <span className="text-[11px] text-gray-500 font-mono truncate max-w-[140px]" title={proposal.settlement.recipientAddress}>
                {proposal.settlement.recipientAddress}
              </span>
            </div>
          </div>

          {/* How it works breakdown */}
          <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-black/40 border border-gray-800/80 font-mono text-[11px]">
            <div className="text-white font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Atomic Intent Execution Flow</span>
            </div>
            <div className="text-gray-400 leading-relaxed space-y-1">
              <p>1. The Sputnik DAO council quorum approves the proposal.</p>
              <p>2. Treasury transfer sends {proposal.amountNear} NEAR to the solver deposit address returned by 1Click.</p>
              <p>3. 1Click Defuse market solvers deliver {quoteEstimate} directly to the contributor's {targetChain} wallet.</p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex flex-col gap-1 text-red-400">
              <div className="font-bold">Intent Route Failed:</div>
              <div className="text-[11px] font-mono break-all">{errorMessage}</div>
            </div>
          )}

          {/* Settlement Status / Result */}
          {settledTx ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>Intent Route Initialized</span>
              </div>
              <div className="mt-1 p-2 bg-black/60 rounded font-mono text-[11px] text-gray-300 break-all border border-gray-800">
                <span className="text-gray-500">Details: </span>
                <span className="text-emerald-400">{settledTx}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-950/10 border border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <span className="text-gray-300 text-xs">Awaiting Solver Execution Trigger</span>
              </div>
              <span className="text-blue-400 font-mono text-xs font-bold">~45s SLA</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#12121E] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>

          {!settledTx && (
            <button
              onClick={handleExecuteIntent}
              disabled={isExecuting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl near-gradient text-black font-extrabold text-xs hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {isExecuting ? <RefreshCw size={13} className="animate-spin" /> : <ArrowRightLeft size={13} />}
              {isExecuting ? 'Routing via 1Click...' : 'Execute Intent Settlement'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
