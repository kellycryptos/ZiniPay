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
    <section className="relative py-12 sm:py-16 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-6 sm:p-7 rounded-2xl bg-white/95 dark:bg-[#0F1715]/95 border border-emerald-600/20 dark:border-slate-800 hover:border-emerald-500/40 transition-colors duration-200 group shadow-sm dark:shadow-lg flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-[#00E599] group-hover:shadow-[0_0_15px_rgba(0,229,153,0.3)] transition-all">
                  <Icon size={22} className="drop-shadow-[0_0_6px_rgba(0,229,153,0.4)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
