import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function LandingVerifyCallout({ onNavigateVerify }: { onNavigateVerify: () => void }) {
  return (
    <section className="py-16 sm:py-20 bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97] shrink-0 mt-1">
              <ShieldCheck size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Verify it yourself
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
                View all 14 testnet transactions, 5 blocked attack attempts, and live in-browser RPC check results on our dedicated Verification page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateVerify}
            className="btn-primary cursor-pointer text-xs sm:text-sm py-2.5 px-5 shadow-lg shadow-[#00ec9720] hover:shadow-[#00ec9735] transition-all flex items-center gap-2 group font-semibold shrink-0"
          >
            <span>Verification Page</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
