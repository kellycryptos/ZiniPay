import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

function StampIllustration() {
  return (
    <svg viewBox="0 0 200 135" fill="none" className="w-full h-32 select-none" xmlns="http://www.w3.org/2000/svg">
      {/* Background receipt parchment snippet */}
      <rect x="25" y="55" width="150" height="70" rx="4" fill="#FFFDF8" stroke="#E2DDD5" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="35" y1="70" x2="165" y2="70" stroke="#F1ECE1" strokeWidth="1" />
      <line x1="35" y1="80" x2="110" y2="80" stroke="#E8E2D5" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="90" x2="80" y2="90" stroke="#E8E2D5" strokeWidth="2" strokeLinecap="round" />

      {/* Rubber Stamp Impression on Paper */}
      <g transform="translate(100, 92) rotate(-7)">
        <rect x="-38" y="-17" width="76" height="34" rx="3" fill="#0D7A5F" fillOpacity="0.08" stroke="#0D7A5F" strokeWidth="1.75" strokeDasharray="4 2" />
        <text x="0" y="-3" textAnchor="middle" fill="#0D7A5F" fontFamily="'IBM Plex Mono', monospace" fontSize="8" fontWeight="bold" letterSpacing="1.5">VERIFIED</text>
        <path d="M-10 6 L-3 11 L10 1" stroke="#0D7A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* The Physical Rubber Stamp Object */}
      <g transform="translate(100, 36)">
        {/* Turned Wooden / Brass Handle */}
        <circle cx="0" cy="-22" r="9" fill="#D97706" />
        <ellipse cx="0" cy="-22" rx="6" ry="3.5" fill="#F59E0B" />
        <path d="M-4.5 -20 C-4.5 -10, -7.5 0, -9.5 10 L9.5 10 C7.5 0, 4.5 -10, 4.5 -20 Z" fill="#D97706" />
        <path d="M-2 -20 C-2 -10, -3.5 0, -4.5 10 L0 10 C0 0, 1 -10, 1 -20 Z" fill="#F59E0B" opacity="0.6" />
        {/* Metal Brass Collar */}
        <rect x="-11" y="10" width="22" height="4" rx="1" fill="#334155" />
        <rect x="-13" y="14" width="26" height="3" rx="0.5" fill="#B45309" />
        {/* Rectangular Mount Base */}
        <path d="M-34 26 L-20 17 L20 17 L34 26 Z" fill="#1E293B" />
        {/* Rubber Cushion Layer (Spruce Green) */}
        <rect x="-34" y="26" width="68" height="5" rx="1" fill="#0D7A5F" />
      </g>
    </svg>
  );
}

function CoinSlotIllustration() {
  return (
    <svg viewBox="0 0 200 135" fill="none" className="w-full h-32 select-none" xmlns="http://www.w3.org/2000/svg">
      {/* Safe faceplate backing */}
      <rect x="25" y="15" width="150" height="105" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <circle cx="35" cy="25" r="2.5" fill="#475569" />
      <circle cx="165" cy="25" r="2.5" fill="#475569" />
      <circle cx="35" cy="110" r="2.5" fill="#475569" />
      <circle cx="165" cy="110" r="2.5" fill="#475569" />

      {/* Calibrated Limit Gauge / Tick-Marks */}
      <g transform="translate(100, 36)">
        <line x1="-50" y1="0" x2="50" y2="0" stroke="#475569" strokeWidth="1.5" />
        {/* Tick 1: Bronze 10N */}
        <line x1="-30" y1="-5" x2="-30" y2="5" stroke="#94A3B8" strokeWidth="1.5" />
        <text x="-30" y="-8" textAnchor="middle" fill="#94A3B8" fontFamily="'IBM Plex Mono', monospace" fontSize="7" fontWeight="bold">10N</text>
        {/* Tick 2: Silver 15N (Active Limit Cap Tick in Spruce Green) */}
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#00EC97" strokeWidth="2.5" />
        <polygon points="0,9 -3,14 3,14" fill="#00EC97" />
        <text x="0" y="-11" textAnchor="middle" fill="#00EC97" fontFamily="'IBM Plex Mono', monospace" fontSize="8" fontWeight="bold">CAP 15N</text>
        {/* Tick 3: Over-Cap 20N (Blocked Carmine) */}
        <line x1="30" y1="-5" x2="30" y2="5" stroke="#EF4444" strokeWidth="1.5" />
        <text x="30" y="-8" textAnchor="middle" fill="#EF4444" fontFamily="'IBM Plex Mono', monospace" fontSize="7" fontWeight="bold">20N</text>
      </g>

      {/* Precision Mechanical Coin Slot Opening */}
      <g transform="translate(100, 76)">
        {/* Brass Beveled Slot Outer Ring */}
        <rect x="-42" y="-12" width="84" height="24" rx="4" fill="#0F172A" stroke="#D97706" strokeWidth="2" />
        {/* Narrow Coin Throat */}
        <rect x="-32" y="-3" width="64" height="6" rx="2" fill="#020617" />

        {/* NEAR Coin sliding toward slot */}
        <g transform="translate(-10, -18)">
          <circle cx="8" cy="8" r="13" fill="#0D7A5F" stroke="#00EC97" strokeWidth="1.5" />
          <path d="M4 13 L4 3 L12 13 L12 3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* Physical Mechanical Stop Pin on Right */}
        <rect x="23" y="-7" width="5" height="14" rx="1" fill="#DC2626" />
      </g>
    </svg>
  );
}

function TwoKeysIllustration() {
  return (
    <svg viewBox="0 0 200 135" fill="none" className="w-full h-32 select-none" xmlns="http://www.w3.org/2000/svg">
      {/* Heavy Escutcheon Plate (Lock face) */}
      <rect x="25" y="15" width="150" height="105" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <line x1="100" y1="20" x2="100" y2="115" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

      {/* Key Cylinder 1 (Left Council Key) */}
      <g transform="translate(68, 62)">
        <circle cx="0" cy="0" r="21" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <circle cx="0" cy="-2" r="3.5" fill="#020617" />
        <polygon points="-2.5,-1 2.5,-1 1.5,7 -1.5,7" fill="#020617" />

        {/* Brass Key 1 Inserted & Turned 35deg */}
        <g transform="rotate(35)">
          <path d="M0 -3 L26 -3 L26 -1 L32 -1 L32 2 L26 2 L26 5 L22 5 L22 3 L0 3 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.75" />
          <circle cx="36" cy="0" r="6.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <circle cx="36" cy="0" r="2.5" fill="#1E293B" />
        </g>
        <path d="M-11 11 A 15 15 0 0 1 -13 -7" stroke="#00EC97" strokeWidth="1.75" strokeLinecap="round" fill="none" />
        <polygon points="-11,-7 -16,-4 -14,-9" fill="#00EC97" />
      </g>

      {/* Key Cylinder 2 (Right Council Key) */}
      <g transform="translate(132, 62)">
        <circle cx="0" cy="0" r="21" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <circle cx="0" cy="-2" r="3.5" fill="#020617" />
        <polygon points="-2.5,-1 2.5,-1 1.5,7 -1.5,7" fill="#020617" />

        {/* Brass Key 2 Inserted & Turned -35deg */}
        <g transform="rotate(-35)">
          <path d="M0 -3 L-26 -3 L-26 -1 L-32 -1 L-32 2 L-26 2 L-26 5 L-22 5 L-22 3 L0 3 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.75" />
          <circle cx="-36" cy="0" r="6.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <circle cx="-36" cy="0" r="2.5" fill="#1E293B" />
        </g>
        <path d="M11 11 A 15 15 0 0 0 13 -7" stroke="#00EC97" strokeWidth="1.75" strokeLinecap="round" fill="none" />
        <polygon points="11,-7 16,-4 14,-9" fill="#00EC97" />
      </g>

      {/* Center 2-of-2 Quorum Stamp Indicator */}
      <rect x="74" y="104" width="52" height="15" rx="3" fill="#0D7A5F" fillOpacity="0.15" stroke="#0D7A5F" strokeWidth="1" />
      <text x="100" y="115" textAnchor="middle" fill="#00EC97" fontFamily="'IBM Plex Mono', monospace" fontSize="7.5" fontWeight="bold" letterSpacing="0.8">2-OF-2 QUORUM</text>
    </svg>
  );
}

export function LandingReleaseGate() {
  const [gate1HasAgentRun, setGate1HasAgentRun] = useState<boolean>(false);
  const [gate2HasPolicyRelease, setGate2HasPolicyRelease] = useState<boolean>(false);
  const [gate3HasCouncilQuorum, setGate3HasCouncilQuorum] = useState<boolean>(false);

  useEffect(() => {
    fetch('/data/verified.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;

        // Gate 1: Deliverable check runs in agent; requires explicit recorded agent run
        const agentRunRecorded = Boolean((data as any)?.agentRunRecorded || (data as any)?.recordedAgentRun);
        setGate1HasAgentRun(agentRunRecorded);

        // Gate 2: Requires matching policy contract release in verified.json
        const hasPolicyRelease = Boolean(
          data?.viaPolicyContract === true ||
          (Array.isArray(data?.transactions) && data.transactions.some((t: any) => t.viaPolicyContract === true))
        );
        setGate2HasPolicyRelease(hasPolicyRelease);

        // Gate 3: Requires two council member votes recorded in verified.json
        const txs = Array.isArray(data?.transactions) ? data.transactions : [];
        const hasCouncil1 = txs.some((t: any) => t.label?.toLowerCase().includes('council 1'));
        const hasCouncil2 = txs.some((t: any) => t.label?.toLowerCase().includes('council 2'));
        setGate3HasCouncilQuorum(hasCouncil1 && hasCouncil2);
      })
      .catch(() => {});
  }, []);

  const gates = [
    {
      step: '01',
      name: 'Gate 01 · Deliverable Proof',
      tag: 'PROOF OF WORK',
      caption: 'Verifies merged GitHub PR commit hash and IPFS CID before any proposal can be created.',
      illustration: StampIllustration,
      status: gate1HasAgentRun ? 'Run on testnet' : 'Implemented and unit tested',
      isTestnetRun: gate1HasAgentRun,
    },
    {
      step: '02',
      name: 'Gate 02 · Spend Limits',
      tag: 'ON-CHAIN CAPS',
      caption: 'Rust smart contract enforces tier caps, cooldown delays, and CID anti-replay on-chain.',
      illustration: CoinSlotIllustration,
      status: gate2HasPolicyRelease ? 'Run on testnet' : 'Implemented and unit tested',
      isTestnetRun: gate2HasPolicyRelease,
    },
    {
      step: '03',
      name: 'Gate 03 · Council Quorum',
      tag: 'HUMAN MULTI-SIG',
      caption: 'Requires 2-of-2 human council signatures on Sputnik DAO to release funds.',
      illustration: TwoKeysIllustration,
      status: gate3HasCouncilQuorum ? 'Run on testnet' : 'Implemented and unit tested',
      isTestnetRun: gate3HasCouncilQuorum,
    },
  ];

  return (
    <section className="py-20 border-b border-[#E5E1D8] bg-[#F7F5F0] text-[#0F172A]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Section Header on Paper Desk */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E1D8] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#0D7A5F] uppercase tracking-wider mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A5F]" />
              Fail-Closed Architecture
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight">
              The Three-Way Release Gate
            </h2>
            <p className="text-sm sm:text-base text-[#334155] mt-1.5 max-w-2xl leading-relaxed">
              Every payout requires all three independent gates to clear in sequence. If any layer fails, the transaction is rejected fail-closed.
            </p>
          </div>
          <div className="font-mono text-xs text-[#475569] flex items-center gap-2 self-start sm:self-auto">
            <span>RULE:</span>
            <span className="text-[#0F172A] font-bold bg-white px-2.5 py-1 rounded border border-[#E2DDD5] shadow-xs">
              ALL 3 GATES MUST PASS
            </span>
          </div>
        </div>

        {/* Three Illustrated Objects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {gates.map((g) => {
            const Illustration = g.illustration;
            return (
              <div
                key={g.step}
                className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-sm hover-lift flex flex-col justify-between"
              >
                <div>
                  {/* Gate Number & Tag */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#F1ECE1]">
                    <span className="font-mono font-bold text-xs text-[#0D7A5F]">
                      LOCK {g.step}
                    </span>
                    <span className="font-mono text-[10px] text-[#475569] tracking-wider uppercase font-semibold">
                      {g.tag}
                    </span>
                  </div>

                  {/* SVG Object Illustration */}
                  <div className="py-2 flex items-center justify-center">
                    <Illustration />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-bold text-[#0F172A] tracking-tight mt-2 mb-1.5">
                    {g.name}
                  </h3>

                  {/* One-Line Caption */}
                  <p className="text-xs text-[#334155] leading-relaxed">
                    {g.caption}
                  </p>
                </div>

                {/* Truthful Status Badge */}
                <div className="mt-6 pt-3.5 border-t border-[#F1ECE1] flex items-center justify-between text-xs font-mono text-[#475569]">
                  <span className="font-medium text-[11px]">STATUS:</span>
                  <span
                    className={
                      g.isTestnetRun
                        ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EDF7F4] border border-[#A3DACB] text-[#0D7A5F]'
                        : 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569]'
                    }
                  >
                    <CheckCircle2 size={12} className={g.isTestnetRun ? 'text-[#0D7A5F]' : 'text-[#475569]'} />
                    <span>{g.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
