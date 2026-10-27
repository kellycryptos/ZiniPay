import React from 'react';
import { ActivityEvent } from '../lib/types';
import { ShieldCheck, Send, CheckCircle2, ArrowRightLeft, Award } from 'lucide-react';

interface ActivityLogProps {
  activities: ActivityEvent[];
}

const TYPE_ICONS = {
  policy_pass: ShieldCheck,
  proposal_created: Send,
  quorum_reached: CheckCircle2,
  intent_settled: ArrowRightLeft,
  rep_updated: Award,
};

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="ledger-card p-5 flex flex-col gap-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <h3 className="font-bold text-sm text-white font-sans flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
          <span>On-Chain Activity Trail</span>
        </h3>
        <span className="text-[10px] text-[var(--text-muted)]">Live Audit Stream</span>
      </div>

      {activities.length === 0 ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded">
          No live activity events recorded. Payout releases and quorum votes will stream here.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {activities.map((act) => {
            const Icon = TYPE_ICONS[act.type] || ShieldCheck;
            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)]"
              >
                <div className="p-1.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--color-passed)] shrink-0 mt-0.5">
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-white truncate font-sans">{act.title}</h4>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">{act.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{act.description}</p>
                  {act.badge && (
                    <span className="tag-neutral text-[9px] mt-1.5 inline-block">
                      {act.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
