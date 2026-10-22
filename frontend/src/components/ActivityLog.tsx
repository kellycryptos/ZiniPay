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

const TYPE_COLORS = {
  policy_pass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  proposal_created: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  quorum_reached: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  intent_settled: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  rep_updated: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          On-Chain Activity Trail
        </h3>
        <span className="text-[11px] font-mono text-gray-500">Live Audit Stream</span>
      </div>

      <div className="flex flex-col gap-3">
        {activities.map((act) => {
          const Icon = TYPE_ICONS[act.type] || ShieldCheck;
          const colorClass = TYPE_COLORS[act.type] || 'text-gray-400 bg-gray-800 border-gray-700';

          return (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-950/60 border border-gray-800/80 hover:border-gray-700 transition-colors"
            >
              <div className={`p-2 rounded-lg border ${colorClass} shrink-0 mt-0.5`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white truncate">{act.title}</h4>
                  <span className="text-[10px] font-mono text-gray-500 shrink-0">{act.timestamp}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{act.description}</p>
                {act.badge && (
                  <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-800">
                    {act.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
