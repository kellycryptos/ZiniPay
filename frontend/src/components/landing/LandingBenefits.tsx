import React from 'react';
import { Shield, CheckCircle2, Users } from 'lucide-react';

export function LandingBenefits() {
  const benefits = [
    {
      icon: Shield,
      title: 'Spending limits',
      description: 'An agent can never pay more than its cap.',
    },
    {
      icon: CheckCircle2,
      title: 'No double payouts',
      description: "The same work can't be paid twice.",
    },
    {
      icon: Users,
      title: 'Two people approve',
      description: 'Nothing is paid until two humans say yes.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-6 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00EC97]/10 border border-[#00EC97]/25 flex items-center justify-center text-[#00EC97]">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
