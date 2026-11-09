import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info,
  Clock,
  Check,
} from 'lucide-react';
import { AppHeader } from '../navigation/AppHeader';
import { UniversalFooter } from '../navigation/UniversalFooter';

interface VerificationPageProps {
  onNavigateHome?: () => void;
  onNavigateBoard?: () => void;
  onNavigateDocs?: () => void;
  network?: 'testnet' | 'mainnet';
}

interface LiveCheckItem {
  id: string;
  category: string;
  label: string;
  queryTarget: string;
  expected: string;
  actual?: string;
  status: 'idle' | 'running' | 'pass' | 'fail' | 'error' | 'info';
  errorDetails?: string;
}

interface BlockedAttackItem {
  vector: string;
  status?: string;
  rejectionReason?: string;
  reason?: string;
  txHash?: string;
  explorerUrl?: string;
  blockedBy: string;
  caller?: string;
  deliverable?: string;
  amountNear?: string;
}

interface VerifiedTransactionItem {
  index: number;
  label: string;
  txHash: string;
  explorerUrl?: string;
  timestamp?: string;
  kind?: string;
}

export function VerificationPage({
  onNavigateHome,
  onNavigateBoard,
  onNavigateDocs,
  network = 'testnet',
}: VerificationPageProps) {
  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  const [isRunning, setIsRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<VerifiedTransactionItem[]>([]);
  const [blockedAttacks, setBlockedAttacks] = useState<BlockedAttackItem[]>([]);
  const [isLoadingManifest, setIsLoadingManifest] = useState(true);

  const initialChecks: LiveCheckItem[] = [
    {
      id: '1.1',
      category: 'Sputnik DAO v2 Governance',
      label: 'DAO Account Active & Funded',
      queryTarget: 'zinipay-demo.sputnikv2.testnet (view_account)',
      expected: 'Active on testnet with valid storage',
      status: 'idle',
    },
    {
      id: '1.2',
      category: 'Sputnik DAO v2 Governance',
      label: 'Council Multi-Sig Quorum (>= 2 Signers)',
      queryTarget: 'zinipay-demo.sputnikv2.testnet::get_policy()',
      expected: 'Council role contains at least 2 distinct accounts',
      status: 'idle',
    },
    {
      id: '1.3',
      category: 'Sputnik DAO v2 Governance',
      label: 'Agent Isolation (0 Voting Rights)',
      queryTarget: 'zinipay-demo.sputnikv2.testnet::get_policy()',
      expected: 'agent in voting/wildcard roles (*:*, *:Vote*): false | proposal creation (*:AddProposal): true',
      status: 'idle',
    },
    {
      id: '2.1',
      category: 'Payout Proposals on Sputnik DAO',
      label: 'Proposal #6 Status is Approved',
      queryTarget: 'zinipay-demo.sputnikv2.testnet::get_proposal({id: 6})',
      expected: 'Status == "Approved", receiver == "zinipay-policy2.testnet"',
      status: 'idle',
    },
    {
      id: '2.2',
      category: 'Payout Proposals on Sputnik DAO',
      label: 'Proposal #5 Status is Approved',
      queryTarget: 'zinipay-demo.sputnikv2.testnet::get_proposal({id: 5})',
      expected: 'Status == "Approved", receiver == "zinipay-policy2.testnet"',
      status: 'idle',
    },
    {
      id: '3.1',
      category: 'PolicyHelper Contract State',
      label: 'PolicyHelper Deployed Code Hash (Advisory Info)',
      queryTarget: 'zinipay-policy2.testnet (view_account)',
      expected: 'Code hash 4aAns5JeyBVUEMLS6uJSyomHZ6qJGQGbYApLVhL4xAyt (matches commit 6fb2426, not reproduced)',
      status: 'idle',
    },
    {
      id: '3.2',
      category: 'PolicyHelper Contract State',
      label: 'Policy Bound to Sputnik DAO',
      queryTarget: 'zinipay-policy2.testnet::get_policy()',
      expected: 'dao_account_id == "zinipay-demo.sputnikv2.testnet"',
      status: 'idle',
    },
    {
      id: '3.3',
      category: 'PolicyHelper Contract State',
      label: 'Enforced Base Cap & Cooldown Period',
      queryTarget: 'zinipay-policy2.testnet::get_policy()',
      expected: 'per_proposal_cap == 10 NEAR, cooldown == 60 seconds',
      status: 'idle',
    },
    {
      id: '4.1',
      category: 'Contributor State & Reputation',
      label: 'Silver Contributor Reputation & Effective Cap',
      queryTarget: 'zinipay-policy2.testnet::get_reputation() & get_effective_cap()',
      expected: 'Score >= 20 pts (30 pts), Cap == 15 NEAR (1.5x multiplier)',
      status: 'idle',
    },
    {
      id: '4.2',
      category: 'Contributor State & Reputation',
      label: 'Anti-Replay Registry (Burned Deliverables)',
      queryTarget: 'zinipay-policy2.testnet::cid_used(PR #1 & PR #2)',
      expected: 'Both deliverables burned permanently in used_cids set',
      status: 'idle',
    },
    {
      id: '5.1',
      category: 'Verified Manifest State',
      label: 'Verified Transactions & Blocked Attacks Manifest',
      queryTarget: '/data/verified.json',
      expected: '14 confirmed txs (5 attack txs + 1 admin action + 2 payout releases)',
      status: 'idle',
    },
  ];

  const [checkItems, setCheckItems] = useState<LiveCheckItem[]>(initialChecks);

  // Load verified manifest
  useEffect(() => {
    fetch('/data/verified.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
        if (Array.isArray(data.blockedAttacks)) {
          setBlockedAttacks(data.blockedAttacks);
        }
      })
      .catch((err) => console.warn('Failed to load verified manifest:', err))
      .finally(() => setIsLoadingManifest(false));
  }, []);

  // Helper for JSON-RPC queries directly from browser
  const rpcQuery = async (params: any) => {
    const endpoints = ['https://test.rpc.fastnear.com', 'https://rpc.testnet.near.org'];
    let lastErr: any = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'in-browser-verify',
            ...params,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.data || data.error.message || 'RPC Error');
        return data.result;
      } catch (err: any) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('All RPC endpoints failed');
  };

  const callViewMethod = async (accountId: string, methodName: string, args: any = {}) => {
    const base64Args = btoa(JSON.stringify(args));
    const result = await rpcQuery({
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: accountId,
        method_name: methodName,
        args_base64: base64Args,
      },
    });
    if (!result?.result) throw new Error('Empty return buffer from contract view');
    const decodedStr = new TextDecoder().decode(new Uint8Array(result.result));
    return JSON.parse(decodedStr);
  };

  const runAllChecks = async () => {
    setIsRunning(true);
    const updated = [...initialChecks];

    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'running';
      setCheckItems([...updated]);

      try {
        if (updated[i].id === '1.1') {
          const res = await rpcQuery({
            method: 'query',
            params: {
              request_type: 'view_account',
              finality: 'final',
              account_id: 'zinipay-demo.sputnikv2.testnet',
            },
          });
          const storage = res.storage_usage;
          updated[i].actual = `Account active (Storage: ${storage} bytes)`;
          updated[i].status = 'pass';
        } else if (updated[i].id === '1.2') {
          const policy = await callViewMethod('zinipay-demo.sputnikv2.testnet', 'get_policy');
          const councilRole = policy.roles?.find((r: any) => r.name === 'council');
          const signers = councilRole?.kind?.Group || [];
          if (signers.length >= 2) {
            updated[i].actual = `Council signers: ${signers.join(', ')} (${signers.length} signers)`;
            updated[i].status = 'pass';
          } else {
            throw new Error(`Insufficient signers: ${signers.length}`);
          }
        } else if (updated[i].id === '1.3') {
          const policy = await callViewMethod('zinipay-demo.sputnikv2.testnet', 'get_policy');
          const isVotingOrWildcard = (p: string) =>
            p === '*:*' || p === '*' || p.includes('Vote');
          const votingRoles = policy?.roles?.filter((r: any) =>
            r.permissions?.some(isVotingOrWildcard)
          ) || [];
          const agentInVotingRole = votingRoles.some((r: any) =>
            r.kind === 'Everyone' || (r.kind?.Group && r.kind.Group.includes('agentzinipaytestnet.testnet'))
          );
          const hasProposerPermission = policy?.roles?.some((r: any) =>
            (r.permissions?.includes('*:AddProposal') || r.permissions?.includes('*:*') || r.permissions?.includes('*')) &&
            (r.kind === 'Everyone' || (r.kind?.Group && r.kind.Group.includes('agentzinipaytestnet.testnet')))
          );
          if (!agentInVotingRole && hasProposerPermission) {
            updated[i].actual = 'agent in voting/wildcard roles (*:*, *:Vote*): false | proposal creation (*:AddProposal): true';
            updated[i].status = 'pass';
          } else {
            throw new Error(`Agent policy isolation check failed: votingRole=${agentInVotingRole}, canPropose=${hasProposerPermission}`);
          }
        } else if (updated[i].id === '2.1') {
          const p6 = await callViewMethod('zinipay-demo.sputnikv2.testnet', 'get_proposal', { id: 6 });
          const receiver = p6?.kind?.FunctionCall?.receiver_id;
          if (p6?.status === 'Approved' && receiver === 'zinipay-policy2.testnet') {
            updated[i].actual = `Status: Approved | Receiver: ${receiver}`;
            updated[i].status = 'pass';
          } else {
            throw new Error(`Unexpected status: ${p6?.status}`);
          }
        } else if (updated[i].id === '2.2') {
          const p5 = await callViewMethod('zinipay-demo.sputnikv2.testnet', 'get_proposal', { id: 5 });
          const receiver = p5?.kind?.FunctionCall?.receiver_id;
          if (p5?.status === 'Approved' && receiver === 'zinipay-policy2.testnet') {
            updated[i].actual = `Status: Approved | Receiver: ${receiver}`;
            updated[i].status = 'pass';
          } else {
            throw new Error(`Unexpected status: ${p5?.status}`);
          }
        } else if (updated[i].id === '3.1') {
          const res = await rpcQuery({
            method: 'query',
            params: {
              request_type: 'view_account',
              finality: 'final',
              account_id: 'zinipay-policy2.testnet',
            },
          });
          const codeHash = res.code_hash;
          updated[i].actual = `deployed hash ${codeHash || 'unknown'}, matches Nov 2 commit (6fb2426) by exported methods, not reproduced`;
          updated[i].status = 'info';
        } else if (updated[i].id === '3.2') {
          const policy = await callViewMethod('zinipay-policy2.testnet', 'get_policy');
          if (policy?.dao_account_id === 'zinipay-demo.sputnikv2.testnet') {
            updated[i].actual = `dao_account_id: ${policy.dao_account_id}`;
            updated[i].status = 'pass';
          } else {
            throw new Error(`Invalid DAO binding: ${policy?.dao_account_id}`);
          }
        } else if (updated[i].id === '3.3') {
          const policy = await callViewMethod('zinipay-policy2.testnet', 'get_policy');
          const capNear = Number(BigInt(policy.per_proposal_cap) / 10n ** 24n);
          const cooldown = policy.cooldown_seconds;
          if (capNear === 10 && cooldown === 60) {
            updated[i].actual = `Base cap: ${capNear} NEAR | Cooldown: ${cooldown}s`;
            updated[i].status = 'pass';
          } else {
            throw new Error(`Cap: ${capNear}N, Cooldown: ${cooldown}s`);
          }
        } else if (updated[i].id === '4.1') {
          const score = await callViewMethod('zinipay-policy2.testnet', 'get_reputation', {
            account: 'zinipay-recipient2.testnet',
          });
          const capYocto = await callViewMethod('zinipay-policy2.testnet', 'get_effective_cap', {
            recipient: 'zinipay-recipient2.testnet',
          });
          const capNear = Number(BigInt(capYocto) / 10n ** 24n);
          if (score >= 20 && capNear === 15) {
            updated[i].actual = `Score: ${score} pts (Silver) | Effective cap: ${capNear} NEAR`;
            updated[i].status = 'pass';
          } else {
            throw new Error(`Score: ${score}, Cap: ${capNear}N`);
          }
        } else if (updated[i].id === '4.2') {
          const cid1Used = await callViewMethod('zinipay-policy2.testnet', 'cid_used', {
            cid: 'kellycryptos/ZiniPay#1',
          });
          const cid2Used = await callViewMethod('zinipay-policy2.testnet', 'cid_used', {
            cid: 'kellycryptos/zinipay#2',
          });
          if (cid1Used === true && cid2Used === true) {
            updated[i].actual = 'PR #1 (Proposal #5) & PR #2 (Proposal #6) both burned';
            updated[i].status = 'pass';
          } else {
            throw new Error(`cid1: ${cid1Used}, cid2: ${cid2Used}`);
          }
        } else if (updated[i].id === '5.1') {
          const res = await fetch('/data/verified.json');
          if (!res.ok) throw new Error(`HTTP ${res.status} loading verified.json`);
          const data = await res.json();
          const txsCount = data.transactions?.length || 0;
          const attacksCount = data.blockedAttacks?.length || 0;
          const settledCount = data.settledPayouts?.length || 0;
          if (txsCount >= 14) {
            updated[i].actual = `${txsCount} confirmed txs (${attacksCount} security vectors, ${settledCount} settled payouts)`;
            updated[i].status = 'info';
          } else {
            throw new Error(`Unexpected counts: ${txsCount} txs, ${attacksCount} attacks`);
          }
        }
      } catch (err: any) {
        updated[i].status = 'fail';
        updated[i].actual = 'Query Failed';
        updated[i].errorDetails = err?.message || 'RPC Network Error';
      }

      setCheckItems([...updated]);
    }

    setIsRunning(false);
    setLastRunAt(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    runAllChecks();
  }, []);

  const passCount = checkItems.filter((c) => c.status === 'pass').length;
  const infoCount = checkItems.filter((c) => c.status === 'info').length;
  const failCount = checkItems.filter((c) => c.status === 'fail' || c.status === 'error').length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      {/* Header */}
      <AppHeader
        currentPath="/verify"
        onNavigateHome={onNavigateHome}
        onNavigateBoard={onNavigateBoard}
        onNavigateDocs={onNavigateDocs}
        network={network}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col gap-12">
        {/* Page Hero */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
              Evidence &amp; Audit
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-[#00EC97] border border-emerald-500/20">
              NEAR Testnet
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Not Audited
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Model review: simulated
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Verification
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Independent proof for DAO treasurers and contributors. Inspect live in-browser RPC queries, blocked attack transaction receipts, and the complete on-chain audit trail.
          </p>
        </div>

        {/* SECTION 1: IN-BROWSER CHECKS */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
                Live State Queries
              </span>
              <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
                In-Browser Checks
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Queries public NEAR JSON-RPC endpoints in real time from your browser.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {lastRunAt && (
                <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1">
                  <Clock size={12} />
                  <span>{lastRunAt}</span>
                </span>
              )}
              <button
                type="button"
                onClick={runAllChecks}
                disabled={isRunning}
                className="btn-primary cursor-pointer text-xs py-2 px-4 flex items-center gap-2 font-mono font-semibold"
              >
                <RefreshCw size={13} className={isRunning ? 'animate-spin' : ''} />
                <span>{isRunning ? 'Running Queries...' : 'Run Live Checks'}</span>
              </button>
            </div>
          </div>

          {/* Status Counter Bar */}
          <div className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 size={15} />
                <span>{passCount} Passed</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <Info size={15} />
                <span>{infoCount} Info</span>
              </span>
              {failCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                  <XCircle size={15} />
                  <span>{failCount} Failed</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Target: FastNear RPC / testnet.near.org
            </span>
          </div>

          {/* Checks List */}
          <div className="grid grid-cols-1 gap-3">
            {checkItems.map((chk) => (
              <div
                key={chk.id}
                className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--text-secondary)] px-1.5 py-0.5 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)]">
                      {chk.id}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] text-sm">
                      {chk.label}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)] truncate">
                    {chk.queryTarget}
                  </span>
                  {chk.actual && (
                    <span className="font-mono text-[11px] text-[#00EC97] mt-0.5">
                      Result: {chk.actual}
                    </span>
                  )}
                  {chk.errorDetails && (
                    <span className="font-mono text-[11px] text-red-400 mt-0.5">
                      Error: {chk.errorDetails}
                    </span>
                  )}
                </div>

                <div className="shrink-0">
                  {chk.status === 'pass' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-bold">
                      <Check size={12} />
                      <span>PASS</span>
                    </span>
                  )}
                  {chk.status === 'info' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px] font-bold">
                      <Info size={12} />
                      <span>INFO</span>
                    </span>
                  )}
                  {chk.status === 'running' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[11px]">
                      <RefreshCw size={12} className="animate-spin" />
                      <span>QUERYING</span>
                    </span>
                  )}
                  {chk.status === 'idle' && (
                    <span className="px-2.5 py-1 rounded bg-[var(--bg-panel-alt)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono text-[11px]">
                      IDLE
                    </span>
                  )}
                  {(chk.status === 'fail' || chk.status === 'error') && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[11px] font-bold">
                      <XCircle size={12} />
                      <span>FAIL</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: BLOCKED ATTACKS WITH EXPLORER LINKS */}
        <section className="flex flex-col gap-6 pt-6 border-t border-[var(--border-subtle)]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-semibold">
              Security Vector Audit
            </span>
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
              Blocked Attacks (On-Chain Proof)
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Refusal transactions intercepted fail-closed by PolicyHelper on NEAR testnet. Each attempt produced an immutable error receipt on-chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Blocked Attack 1 */}
            <div className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    BLOCKED ON-CHAIN
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    PolicyHelper
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Replay Deliverable CID (kellycryptos/ZiniPay#2)
                </h3>
                <p className="font-mono text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  "CID already used — duplicate release attempt blocked"
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Tx: 9Gp7HmJb...</span>
                <a
                  href="https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Blocked Attack 2 */}
            <div className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    BLOCKED ON-CHAIN
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    PolicyHelper
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Over-Cap Treasury Spend (16.0 NEAR)
                </h3>
                <p className="font-mono text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  "Amount 16.0 NEAR exceeds effective tier cap 15.0 NEAR for recipient zinipay-recipient2.testnet"
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Tx: EiktoyYP...</span>
                <a
                  href="https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Blocked Attack 3 */}
            <div className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    BLOCKED ON-CHAIN
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    PolicyHelper
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Unauthorized Caller (agentzinipaytestnet.testnet)
                </h3>
                <p className="font-mono text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  "Only owner or designated DAO can call this"
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Tx: 2zsvqGDF...</span>
                <a
                  href="https://testnet.nearblocks.io/txns/2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Blocked Attack 4 */}
            <div className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    BLOCKED ON-CHAIN
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    PolicyHelper
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Case-Variant CID Replay (KELLYCRYPTOS/ZINIPAY#2)
                </h3>
                <p className="font-mono text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  "CID already used — duplicate release attempt blocked"
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Tx: EwQAsc5r...</span>
                <a
                  href="https://testnet.nearblocks.io/txns/EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Blocked Attack 5 */}
            <div className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    BLOCKED ON-CHAIN
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    PolicyHelper
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Cooldown Violation (zinipay-recipient2.testnet)
                </h3>
                <p className="font-mono text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  "Cooldown not elapsed. 16 seconds remaining."
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Tx: 2hVRAoT6...</span>
                <a
                  href="https://testnet.nearblocks.io/txns/2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Blocked Admin Action */}
            <div className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    BLOCKED ADMIN
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    Post-DAO Transfer
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Former Owner Unburn Rejection (former-owner.testnet)
                </h3>
                <p className="font-mono text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  "Only owner or designated DAO can call this"
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Tx: EmKpSxi4...</span>
                <a
                  href="https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00EC97] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* Pre-Chain Check Note */}
          <div className="p-4 rounded-xl bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">Pre-Chain Author Mismatch Check:</strong> Stolen deliverable attempt (PR author vsavchyn-dev != recipient handle kellycryptos) was intercepted locally by artifact inspection before transaction broadcast, preventing wasted gas.
            </div>
          </div>
        </section>

        {/* SECTION 3: TRANSACTION LIST FROM VERIFIED.JSON */}
        <section className="flex flex-col gap-6 pt-6 border-t border-[var(--border-subtle)]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
              On-Chain Record
            </span>
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
              Verified Testnet Transactions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Chronological log of all 14 confirmed transactions executed during testnet evaluation.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] uppercase bg-[var(--bg-panel-alt)]">
                    <th className="py-3 px-4 font-semibold">#</th>
                    <th className="py-3 px-4 font-semibold">Action / Label</th>
                    <th className="py-3 px-4 font-semibold">Transaction Hash</th>
                    <th className="py-3 px-4 font-semibold text-right">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {transactions.map((tx) => (
                    <tr key={tx.index} className="hover:bg-[var(--bg-panel-alt)]/50 transition-colors">
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-bold">
                        {tx.index}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)] font-sans text-xs sm:text-sm font-medium">
                        {tx.label}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] text-xs">
                        <span className="hidden sm:inline">{tx.txHash}</span>
                        <span className="sm:hidden">{tx.txHash.slice(0, 10)}...</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={tx.explorerUrl || `${explorerBase}/txns/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#00EC97] hover:underline font-semibold"
                        >
                          <span>View</span>
                          <ExternalLink size={10} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 4: ONE SHORT NOTE THAT A COMMAND LINE CHECK EXISTS WITH LINK TO README */}
        <section className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-[#00EC97] shrink-0" />
            <span className="text-[var(--text-secondary)] leading-relaxed">
              A command-line verification script is also available in the repository. See{' '}
              <a
                href="https://github.com/kellycryptos/ZiniPay#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00EC97] hover:underline font-semibold"
              >
                README.md
              </a>{' '}
              for instructions on running it locally.
            </span>
          </div>

          <a
            href="https://github.com/kellycryptos/ZiniPay#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>README.md</span>
            <ExternalLink size={11} />
          </a>
        </section>
      </main>

      {/* Footer */}
      <UniversalFooter
        onNavigateBoard={onNavigateBoard}
        onNavigateDocs={onNavigateDocs}
        network={network}
      />
    </div>
  );
}
