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
    <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="mb-10 text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-4 shadow-sm"
            >
              <div className="font-mono text-xs font-bold text-[#00EC97] px-2.5 py-1 rounded bg-[#00EC97]/10 w-fit">
                Step {s.num}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
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
