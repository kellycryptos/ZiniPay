import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Lock,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';

export interface ReasoningStep {
  id: string;
  agentName: string;
  agentRole: string;
  avatarIcon?: 'cpu' | 'shield' | 'lock' | 'terminal';
  status: 'verified' | 'running' | 'failed' | 'queued';
  durationMs?: number;
  toolCall?: {
    name: string;
    target: string;
    details?: Record<string, any>;
  };
  summary: string;
  details?: string[];
  proofHash?: string;
  explorerUrl?: string;
}

interface AgentReasoningTreeProps {
  steps: ReasoningStep[];
  overallStatus?: 'verified' | 'running' | 'failed';
  consensusScore?: string;
  teeEnclaveVerified?: boolean;
  onInspectProof?: (step: ReasoningStep) => void;
}

export function AgentReasoningTree({
  steps,
  overallStatus = 'verified',
  consensusScore = '3/3 Unanimous',
  teeEnclaveVerified = true,
  onInspectProof,
}: AgentReasoningTreeProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    'step-1': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderIcon = (type?: string) => {
    switch (type) {
      case 'shield':
        return <ShieldCheck size={16} className="text-near-green" />;
      case 'lock':
        return <Lock size={16} className="text-amber-400" />;
      case 'terminal':
        return <Terminal size={16} className="text-blue-400" />;
      case 'cpu':
      default:
        return <Cpu size={16} className="text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* Top Attestation Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-panel-alt border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {overallStatus === 'running' ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
            ) : overallStatus === 'verified' ? (
              <div className="w-2.5 h-2.5 rounded-full bg-near-green" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-status-blocked" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary text-sm">
                Multi-Agent Evaluation Layer
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-panel border border-border-subtle text-near-green font-medium">
                {consensusScore}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Decentralized deliberation & Rust policy verification pipeline
            </p>
          </div>
        </div>

        {teeEnclaveVerified && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-panel border border-border-subtle text-[11px] font-mono text-text-secondary">
            <Lock size={12} className="text-near-green" />
            <span>TEE Enclave Attested</span>
          </div>
        )}
      </div>

      {/* Step Tree */}
      <div className="flex flex-col gap-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[1px] before:bg-border-subtle">
        {steps.map((step, idx) => {
          const isExpanded = !!expandedSteps[step.id];

          return (
            <div
              key={step.id}
              className="relative pl-12 transition-all duration-200"
            >
              {/* Timeline Node Point */}
              <div className="absolute left-4 top-4 -translate-x-1/2 z-10">
                {step.status === 'verified' && (
                  <div className="w-5 h-5 rounded-full bg-panel border-2 border-near-green flex items-center justify-center text-near-green shadow-[0_0_8px_rgba(0,236,151,0.25)]">
                    <CheckCircle2 size={12} />
                  </div>
                )}
                {step.status === 'running' && (
                  <div className="w-5 h-5 rounded-full bg-panel border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-spin">
                    <Activity size={12} />
                  </div>
                )}
                {step.status === 'failed' && (
                  <div className="w-5 h-5 rounded-full bg-panel border-2 border-status-blocked flex items-center justify-center text-status-blocked">
                    <AlertCircle size={12} />
                  </div>
                )}
                {step.status === 'queued' && (
                  <div className="w-5 h-5 rounded-full bg-panel border border-border-subtle flex items-center justify-center text-text-muted">
                    <Clock size={10} />
                  </div>
                )}
              </div>

              {/* Step Card */}
              <div className="rounded-xl bg-panel border border-border-subtle hover:border-border-strong transition-all duration-150 overflow-hidden shadow-sm">
                {/* Header */}
                <div
                  onClick={() => toggleExpand(step.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none bg-panel hover:bg-panel-alt/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-panel-alt border border-border-subtle">
                      {renderIcon(step.avatarIcon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary text-sm">
                          {step.agentName}
                        </span>
                        <span className="text-[11px] font-mono text-text-muted">
                          {step.agentRole}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                        {step.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {step.durationMs !== undefined && (
                      <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-text-muted">
                        <Clock size={12} />
                        {step.durationMs}ms
                      </span>
                    )}

                    {step.status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-near-green-subtle text-near-green border border-near-green-border">
                        <CheckCircle2 size={11} /> VERIFIED
                      </span>
                    )}
                    {step.status === 'running' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Activity size={11} className="animate-spin" /> EVALUATING
                      </span>
                    )}
                    {step.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-status-blocked-subtle text-status-blocked border border-status-blocked-border">
                        <AlertCircle size={11} /> REJECTED
                      </span>
                    )}

                    <div className="text-text-muted pl-1">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-border-subtle bg-panel-alt/40 flex flex-col gap-3">
                    {/* Tool Call Terminal */}
                    {step.toolCall && (
                      <div className="rounded-lg bg-[#0A0D14] border border-border-subtle p-2.5 font-mono text-[11px] flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-text-muted">
                          <span className="flex items-center gap-1.5 text-text-secondary">
                            <Terminal size={12} className="text-near-green" /> Tool Execution
                          </span>
                          <span className="text-[10px] text-near-green">{step.toolCall.name}()</span>
                        </div>
                        <div className="text-text-primary bg-panel/60 p-2 rounded border border-border-subtle break-all">
                          <span className="text-text-muted mr-1.5">&gt;</span>
                          {step.toolCall.target}
                        </div>
                        {step.toolCall.details && (
                          <div className="grid grid-cols-2 gap-1.5 mt-1 pt-1 border-t border-border-subtle text-[10px]">
                            {Object.entries(step.toolCall.details).map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between text-text-muted">
                                <span>{k}:</span>
                                <span className="font-mono text-text-primary">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Checklist */}
                    {step.details && step.details.length > 0 && (
                      <div className="flex flex-col gap-1.5 pl-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                          Policy Validation Checks
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {step.details.map((detail, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-center gap-2 p-1.5 rounded-md bg-panel border border-border-subtle text-text-secondary"
                            >
                              <CheckCircle2 size={13} className="text-near-green shrink-0" />
                              <span className="truncate">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proof Hash & External Link */}
                    {step.proofHash && (
                      <div className="flex items-center justify-between pt-1 border-t border-border-subtle text-[11px] font-mono text-text-muted">
                        <span className="truncate mr-2">
                          Attestation: <span className="text-text-secondary">{step.proofHash}</span>
                        </span>
                        {step.explorerUrl && (
                          <a
                            href={step.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-near-green hover:underline shrink-0"
                          >
                            <span>Explorer</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
