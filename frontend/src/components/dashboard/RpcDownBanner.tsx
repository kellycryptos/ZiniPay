import React from 'react';
import { AlertTriangle, RefreshCw, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

interface RpcDownBannerProps {
  error: string;
  onRetry: () => void;
  isLoading: boolean;
  onLaunchDemo?: () => void;
  onOpenVerification?: () => void;
}

export function RpcDownBanner({
  error,
  onRetry,
  isLoading,
  onLaunchDemo,
  onOpenVerification,
}: RpcDownBannerProps) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 to-[var(--bg-panel)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl font-sans">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white text-xs">
              NEAR Testnet RPC Unreachable
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Offline Resilience Active
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {error || 'Unable to query Sputnik DAO at test.rpc.fastnear.com / rpc.testnet.near.org.'}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Static verified receipts and proof cards remain fully verifiable below. You can retry the live RPC query or switch to local simulation.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
        <button
          type="button"
          onClick={onRetry}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? 'Connecting...' : 'Retry RPC'}</span>
        </button>

        <a
          href="/board?demo=1"
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Sparkles size={13} />
          <span>Simulation Mode</span>
        </a>

        {onOpenVerification && (
          <button
            type="button"
            onClick={onOpenVerification}
            className="px-3 py-1.5 rounded-lg bg-[#00EC97]/10 hover:bg-[#00EC97]/20 border border-[#00EC97]/30 text-xs font-mono text-[#00EC97] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Terminal size={13} />
            <span>Verify Proofs</span>
          </button>
        )}
      </div>
    </div>
  );
}
