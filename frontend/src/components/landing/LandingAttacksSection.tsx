import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldAlert, AlertTriangle } from 'lucide-react';

interface BlockedAttackItem {
  vector: string;
  status?: string;
  rejectionReason?: string;
  reason?: string;
  txHash?: string;
  explorerUrl?: string;
  blockedBy: string;
}

export function LandingAttacksSection() {
  const [attacks, setAttacks] = useState<BlockedAttackItem[]>([]);
  const [isTestnetVerified, setIsTestnetVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/data/verified.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.blockedAttacks) && data.blockedAttacks.length > 0) {
          setAttacks(data.blockedAttacks);
          setIsTestnetVerified(true);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-20 border-b border-[#E5E1D8] bg-[#F7F5F0] text-[#0F172A] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E1D8] pb-6">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight">
              Attacks That Fail
            </h2>
            <p className="text-sm sm:text-base text-[#334155] mt-1.5 max-w-2xl leading-relaxed">
              Attacks are intercepted fail-closed. Invariant violations produce immutable refusal receipts on NEAR.
            </p>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {isLoading ? (
            <div className="col-span-1 md:col-span-2 p-8 text-center font-mono text-sm text-[#475569] bg-white rounded-2xl border border-[#E2DDD5]">
              Loading verified attack proofs from verified.json...
            </div>
          ) : attacks.length === 0 ? (
            <div className="col-span-1 md:col-span-2 p-8 text-center font-mono text-sm text-[#475569] bg-white rounded-2xl border border-[#E2DDD5]">
              Not loaded: attack proofs manifest unavailable.
            </div>
          ) : attacks.map((att, idx) => {
            const contractMessage = att.rejectionReason || att.reason || 'Transaction rejected fail-closed';
            const explorerUrl = att.explorerUrl || (att.txHash ? `https://testnet.nearblocks.io/txns/${att.txHash}` : null);

            return (
              <div
                key={idx}
                className="bg-white border border-[#E2DDD5] rounded-2xl shadow-sm relative flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 pb-4">
                  {/* Top Bar: Vector & Interceptor */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-semibold text-[#B91C1C]">
                      BLOCKED
                    </span>
                    <span className="font-mono text-[11px] text-[#475569] bg-[#F1ECE1] px-2.5 py-0.5 rounded border border-[#E2DDD5]">
                      {att.blockedBy}
                    </span>
                  </div>

                  {/* Vector Name */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight mb-3">
                    {att.vector}
                  </h3>

                  {/* Exact Contract Revert Message in Monospace */}
                  <div className="mt-2 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 font-mono text-xs text-[#991B1B]">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-[#B91C1C]" />
                    <p className="font-mono text-xs break-all leading-relaxed text-[#7F1D1D] font-medium selection:bg-[#B91C1C] selection:text-white">
                      "{contractMessage}"
                    </p>
                  </div>
                </div>

                {/* Footer Strip with On-Chain Link */}
                <div className="px-6 pb-4 pt-3 flex items-center justify-between border-t border-[#F1ECE1] text-xs font-mono">
                  {explorerUrl ? (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#0D7A5F] hover:text-[#064E3B] hover:underline font-semibold"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-xs font-mono text-[11px]">
                        {att.txHash ? `${att.txHash.slice(0, 12)}...${att.txHash.slice(-6)}` : 'Explorer'}
                      </span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-[#475569] text-[11px]">
                      Pre-Proposal Intercept
                    </span>
                  )}
                  <span className="text-[10px] text-[#475569] uppercase font-medium">Zero Gas Drained</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
