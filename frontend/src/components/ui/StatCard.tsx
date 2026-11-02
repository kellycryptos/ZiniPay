import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'info' | 'neutral' | 'error';
  subtext?: string | React.ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  progress?: {
    current: number;
    max: number;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  unit,
  badge,
  badgeVariant = 'neutral',
  subtext,
  icon: Icon,
  action,
  footer,
  progress,
  onClick,
  className = '',
}: StatCardProps) {
  const getBadgeClasses = () => {
    switch (badgeVariant) {
      case 'success':
        return 'bg-near-green-subtle text-near-green border-near-green-border';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'error':
        return 'bg-status-blocked-subtle text-status-blocked border-status-blocked-border';
      case 'info':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'neutral':
      default:
        return 'bg-panel-alt text-text-muted border-border-subtle';
    }
  };

  const percent = progress
    ? Math.min(100, Math.max(0, Math.round((progress.current / progress.max) * 100)))
    : null;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-white/[0.15] transition-all duration-200 flex flex-col justify-between shadow-lg ${
        onClick ? 'cursor-pointer hover:bg-[var(--bg-panel-alt)]/40' : ''
      } ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {Icon && (
            <Icon size={14} className="text-[#00EC97]" />
          )}
          <span className="text-xs font-medium text-[var(--text-muted)] tracking-wide">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {action}
          {badge && (
            <span
              className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeClasses()}`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            {unit}
          </span>
        )}
      </div>

      {/* Subtext description */}
      {subtext && (
        <div className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5 truncate">
          {subtext}
        </div>
      )}

      {/* Progress Bar (if spend limit or threshold provided) */}
      {progress && percent !== null && (
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
            <span>{progress.label || `${progress.current} spent`}</span>
            <span>{percent}% volume</span>
          </div>
          <div className="w-full bg-[var(--bg-canvas)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent > 90
                  ? 'bg-status-blocked'
                  : percent > 75
                  ? 'bg-amber-400'
                  : 'bg-[#00EC97]'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Optional Custom Footer */}
      {footer && (
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
          {footer}
        </div>
      )}
    </div>
  );
}
