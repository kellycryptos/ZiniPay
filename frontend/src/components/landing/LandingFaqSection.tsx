import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight, Github, Terminal } from 'lucide-react';

export function LandingFaqSection({
  onNavigateToApp,
  onOpenVerifyModal,
}: {
  onNavigateToApp?: () => void;
  onOpenVerifyModal?: () => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can the AI agent withdraw funds directly from the treasury?',
      a: 'No. The agent operates strictly with a Requestor role on Sputnik DAO v2 with 0 council seats and 0 voting keys. It can draft proposals, but has zero signature authority to move funds. Every actual payout strictly requires 2-of-2 human council approval.',
    },
    {
      q: 'What happens if an attacker attempts to replay a previously approved deliverable?',
      a: 'PolicyHelper stores canonical lowercased deliverable CIDs and PR identifiers in an on-chain used_cids set. Any attempt to reuse a settled milestone—including uppercase or whitespace variants—is intercepted with a contract panic ("CID already used") before proposal creation or release.',
    },
    {
      q: 'How does reputation affect payout limits?',
      a: 'PolicyHelper stores an on-chain reputation score per account. This score scales the spend cap: Bronze (< 20 pts) is capped at 10 NEAR, Silver (20–49 pts) at 15 NEAR (1.5x multiplier), and Gold (≥ 50 pts) at 20 NEAR (2.0x multiplier). Payouts exceeding effective tier limits panic on-chain.',
    },
    {
      q: 'Is ZiniPay integrated with Trezu?',
      a: 'No. ZiniPay is deployed, verified, and audited with Sputnik DAO v2 on NEAR Testnet. Trezu compatibility is untested and not claimed.',
    },
    {
      q: 'How can a reviewer independently verify the on-chain results?',
      a: 'You can execute `npm run verify:testnet` in a clean terminal without any private keys or .env configuration. It queries public NEAR RPCs to audit all 24 on-chain checks in under 15 seconds. You can also run the in-browser verification suite directly in the dashboard.',
    },
  ];

  return (
    <section className="py-20 border-b border-white/[0.08] bg-[#0E1015] text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
            <HelpCircle size={20} />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Concrete answers on agent boundaries, council authority, and fail-closed security.
          </p>
        </div>

        {/* 5 Questions Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-white/10 rounded-xl overflow-hidden bg-[#141720] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-white text-sm sm:text-base pr-4">
                    {faq.q}
                  </span>
                  <div className="text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.06]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Call to Action Block */}
        <div className="mt-6 p-8 rounded-2xl bg-gradient-to-b from-[#161922] to-[#111318] border border-white/10 flex flex-col items-center text-center gap-5 shadow-2xl">
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to verify ZiniPay on-chain?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Audit live testnet proposals, test keyless in-browser verification, or inspect the open-source contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onNavigateToApp && (
              <button
                type="button"
                onClick={onNavigateToApp}
                className="px-5 py-2.5 rounded-lg bg-[#00EC97] hover:bg-[#00c980] text-black font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <span>Launch App (/board)</span>
                <ArrowRight size={16} />
              </button>
            )}
            {onOpenVerifyModal && (
              <button
                type="button"
                onClick={onOpenVerifyModal}
                className="px-5 py-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-white font-mono text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <Terminal size={15} className="text-[#00EC97]" />
                <span>Verify In-Browser</span>
              </button>
            )}
            <a
              href="https://github.com/kellycryptos/ZiniPay"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white font-medium text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
