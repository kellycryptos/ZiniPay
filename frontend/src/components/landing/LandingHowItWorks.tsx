import React from 'react';

export function LandingHowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'An agent proposes a payment',
      description: 'When work is finished, the AI agent submits a payment request with proof.',
    },
    {
      num: '02',
      title: 'Rules check it automatically',
      description: 'The system confirms the amount is within limits and ensures the work was not already paid.',
    },
    {
      num: '03',
      title: 'Two people approve it',
      description: 'Funds only move after two authorized people review and approve the request.',
    },
  ];

  return (
    <section className="relative py-12 sm:py-16 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 sm:p-7 rounded-2xl bg-white/85 dark:bg-[#0F1715]/90 border border-emerald-600/20 dark:border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col gap-4 shadow-sm dark:shadow-lg backdrop-blur-md group"
            >
              <div className="font-mono text-xs font-bold text-[#00E599] px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 w-fit shadow-[0_0_12px_rgba(0,229,153,0.15)]">
                Step {s.num}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
