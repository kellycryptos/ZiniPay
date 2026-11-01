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

const FALLBACK_BLOCKED_ATTACKS: BlockedAttackItem[] = [
  {
    vector: 'Stolen Deliverable / Author Mismatch',
    status: 'BLOCKED',
    rejectionReason: 'PR author does not match recipient handle (kellycryptos, zinipay-recipient2.testnet)',
    blockedBy: 'DeliberationEngine (Artifact Verification & Recipient Binding)',
  },
  {
    vector: 'Replay Deliverable CID',
    status: 'BLOCKED',
    rejectionReason: 'CID already used — duplicate release attempt blocked',
    txHash: 'Bzet7f4ASdxJzoJ3JG3XNdgq24K5BGBoGcoeK9Tm49MZ',
    explorerUrl: 'https://testnet.nearblocks.io/txns/Bzet7f4ASdxJzoJ3JG3XNdgq24K5BGBoGcoeK9Tm49MZ',
    blockedBy: 'PolicyHelper (On-Chain)',
  },
  {
    vector: 'Over-Cap Treasury Spend',
    status: 'BLOCKED',
    rejectionReason: 'Amount 16000000000000000000000000 exceeds effective tier cap 15000000000000000000000000 for recipient zinipay-recipient2.testnet',
    txHash: 'ArgK3E9z9SaZjL1oL135NishyKRoiGR5DrDg6iahCGMB',
    explorerUrl: 'https://testnet.nearblocks.io/txns/ArgK3E9z9SaZjL1oL135NishyKRoiGR5DrDg6iahCGMB',
    blockedBy: 'PolicyHelper (On-Chain)',
  },
  {
    vector: 'Unauthorized Release Caller',
    status: 'BLOCKED',
    rejectionReason: 'Only owner or designated DAO can call this',
    txHash: '7TUXWbphreoBpwj6YbuJrHRMhsmBgcVDgHt3JxMZUC5D',
    explorerUrl: 'https://testnet.nearblocks.io/txns/7TUXWbphreoBpwj6YbuJrHRMhsmBgcVDgHt3JxMZUC5D',
    blockedBy: 'PolicyHelper (On-Chain)',
  },
];

export function LandingAttacksSection() {
  const [attacks, setAttacks] = useState<BlockedAttackItem[]>(FALLBACK_BLOCKED_ATTACKS);
  const [isTestnetVerified, setIsTestnetVerified] = useState<boolean>(false);

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
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 border-b border-[#E5E1D8] bg-[#F7F5F0] text-[#0F172A] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E1D8] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#B91C1C] uppercase tracking-wider mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
              Refused Tickets · Zero-Trust Invariants
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight">
              Attacks That Fail
            </h2>
            <p className="text-sm sm:text-base text-[#334155] mt-1.5 max-w-2xl leading-relaxed">
              Every attack vector that could drain a community treasury is intercepted fail-closed. Each refused transaction generates an immutable refusal receipt.
            </p>
          </div>
          <div className="font-mono text-xs text-[#475569] bg-white px-3 py-1.5 rounded border border-[#E2DDD5] shadow-xs self-start sm:self-auto">
            <span>AUDIT STATUS:</span>{' '}
            <span className="text-[#0D7A5F] font-bold">
              {isTestnetVerified ? 'VERIFIED ON TESTNET' : 'SAMPLE REFUSALS'}
            </span>
          </div>
        </div>

        {/* Torn Paper Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {attacks.map((att, idx) => {
            const contractMessage = att.rejectionReason || att.reason || 'Transaction rejected fail-closed';
            const explorerUrl = att.explorerUrl || (att.txHash ? `https://testnet.nearblocks.io/txns/${att.txHash}` : null);

            return (
              <div
                key={idx}
                className="bg-white border border-[#E2DDD5] rounded-t-2xl shadow-sm hover-lift relative flex flex-col justify-between overflow-hidden"
              >
                {/* Physical Rubber Stamp: DENIED */}
                <div
                  className="pointer-events-none absolute right-4 sm:right-6 top-4 sm:top-5 z-20 select-none"
                  style={{ transform: 'rotate(-9deg)' }}
                  aria-label="Stamp: DENIED"
                >
                  <div className="border-[2.5px] border-double border-[#B91C1C] text-[#B91C1C] bg-[#B91C1C]/[0.06] backdrop-blur-[0.5px] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xs shadow-xs flex flex-col items-center justify-center">
                    <span className="font-display font-black text-sm sm:text-base tracking-[0.22em] leading-none text-[#B91C1C] uppercase">
                      DENIED
                    </span>
                    <span className="text-[7.5px] sm:text-[8px] font-mono tracking-widest text-[#B91C1C] font-bold mt-0.5 uppercase border-t border-[#B91C1C]/40 pt-0.5">
                      FAIL-CLOSED
                    </span>
                  </div>
                </div>

                <div className="p-6 pb-4">
                  {/* Top Bar: Vector Label & Ticket Index */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[10px] text-[#475569] font-bold tracking-wider uppercase bg-[#F8F6F1] px-2 py-0.5 rounded border border-[#EAE5DA]">
                      TICKET #0{idx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-[#B91C1C] font-semibold tracking-wide uppercase">
                      {att.status || 'BLOCKED'}
                    </span>
                  </div>

                  {/* Real Vector Name */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight mb-2 pr-20">
                    {att.vector}
                  </h3>

                  {/* Enforcing Component */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#334155] mb-4">
                    <span className="text-[#475569]">Blocked By:</span>
                    <span className="font-semibold text-[#0F172A] bg-[#F1ECE1] px-2 py-0.5 rounded text-[11px] border border-[#E2DDD5]">
                      {att.blockedBy}
                    </span>
                  </div>

                  {/* Exact Contract Revert Message in Monospace */}
                  <div className="mt-2 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 font-mono text-xs text-[#991B1B]">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-[#B91C1C]" />
                    <div className="flex flex-col gap-1 w-full min-w-0">
                      <span className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider">
                        Exact Contract Message
                      </span>
                      <p className="font-mono text-xs break-all leading-relaxed text-[#7F1D1D] font-medium selection:bg-[#B91C1C] selection:text-white">
                        "{contractMessage}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Strip with On-Chain Link */}
                <div className="px-6 pb-4 pt-2 flex items-center justify-between border-t border-[#F1ECE1] text-xs font-mono">
                  {explorerUrl ? (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#0D7A5F] hover:text-[#064E3B] hover:underline font-semibold"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-xs font-mono text-[11px]">
                        Tx: {att.txHash ? `${att.txHash.slice(0, 10)}...${att.txHash.slice(-6)}` : 'View Explorer'}
                      </span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-[#475569] text-[11px]">
                      Agent Sandboxed · Pre-Proposal Intercept
                    </span>
                  )}
                  <span className="text-[10px] text-[#475569] uppercase font-medium">Zero Gas Drained</span>
                </div>

                {/* Torn Ticket Jagged Edge at Bottom */}
                <div className="w-full overflow-hidden leading-none -mb-px">
                  <svg
                    viewBox="0 0 120 8"
                    preserveAspectRatio="none"
                    className="w-full h-2.5 text-[#F7F5F0] fill-current"
                    aria-hidden="true"
                  >
                    <polygon points="0,0 5,7 10,0 15,7 20,0 25,7 30,0 35,7 40,0 45,7 50,0 55,7 60,0 65,7 70,0 75,7 80,0 85,7 90,0 95,7 100,0 105,7 110,0 115,7 120,0 120,8 0,8" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
