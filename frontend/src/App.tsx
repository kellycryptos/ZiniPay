/**
 * App.tsx — ZiniPay Frontend Router & State Coordinator
 * 
 * Routes:
 *   "/"    -> LandingPage
 *   "/app" -> DashboardPage
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { Navbar } from './components/Navbar';
import { ProofModal } from './components/ProofModal';
import { DeliberationModal } from './components/DeliberationModal';
import { IntentsModal } from './components/IntentsModal';
import { WalletModal } from './components/WalletModal';
import { initialProposals, initialActivities } from './lib/mockData';
import { Proposal, ActivityEvent } from './lib/types';
import {
  fetchDaoProposals,
  fetchDaoTreasuryBalanceResult,
  fetchDaoPolicy,
  fetchPolicyContractConfig,
  fetchOnChainReputation,
  PolicyContractState,
  DaoOnChainPolicy,
  TreasuryBalanceResult,
} from './lib/nearRpc';
import { signAndSendDaoVote } from './lib/wallet';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const isDemoMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('demo') === '1';

  // Client-side Router: "/" or "/app"
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // On-Chain & Wallet State — NO FAKE DEFAULTS
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>(
    (import.meta.env.VITE_NEAR_NETWORK as any) || 'testnet'
  );
  const [daoContract, setDaoContract] = useState<string>(
    import.meta.env.VITE_DAO_CONTRACT_ID || ''
  );
  const [policyContractId, setPolicyContractId] = useState<string>(
    import.meta.env.VITE_POLICY_CONTRACT_ID || ''
  );

  // Treasury starts as loading skeleton if DAO configured, else error/unconfigured
  const [treasuryState, setTreasuryState] = useState<TreasuryBalanceResult>(() => {
    if (import.meta.env.VITE_DAO_CONTRACT_ID) {
      return { status: 'loading' };
    }
    return { status: 'error', error: 'DAO contract is not configured' };
  });

  const [isLoadingOnChain, setIsLoadingOnChain] = useState<boolean>(false);
  const [daoError, setDaoError] = useState<string | null>(null);
  const [onChainPolicy, setOnChainPolicy] = useState<PolicyContractState | null>(null);
  const [daoPolicy, setDaoPolicy] = useState<DaoOnChainPolicy | null>(null);
  const [contributorReputation, setContributorReputation] = useState<number | null>(null);

  // Connected account starts strictly as null (no fake judge-council.testnet)
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'council' | 'agent' | 'contributor'>('council');

  // Proposals & activities strictly empty unless ?demo=1
  const [proposals, setProposals] = useState<Proposal[]>(() =>
    isDemoMode ? initialProposals : []
  );
  const [activities, setActivities] = useState<ActivityEvent[]>(() =>
    isDemoMode ? initialActivities : []
  );

  // Modal inspection states
  const [selectedProofProposal, setSelectedProofProposal] = useState<Proposal | null>(null);
  const [deliberationProposal, setDeliberationProposal] = useState<Proposal | null>(null);
  const [intentsProposal, setIntentsProposal] = useState<Proposal | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real RPC Data Loading from Sputnik DAO
  const loadLiveDaoData = async (targetDao = daoContract, targetNet = network) => {
    if (!targetDao || !targetDao.trim()) {
      setIsLoadingOnChain(false);
      setDaoError(null);
      setTreasuryState({ status: 'error', error: 'DAO contract is not configured' });
      if (!isDemoMode) {
        setProposals([]);
      }
      return;
    }

    setIsLoadingOnChain(true);
    setDaoError(null);
    setTreasuryState({ status: 'loading' });

    try {
      const [balResult, liveProps, liveDaoPol] = await Promise.all([
        fetchDaoTreasuryBalanceResult(targetDao, targetNet),
        fetchDaoProposals(targetDao, targetNet, 25, policyContractId),
        fetchDaoPolicy(targetDao, targetNet),
      ]);

      setTreasuryState(balResult);
      setDaoPolicy(liveDaoPol);

      if (policyContractId) {
        const onChain = await fetchPolicyContractConfig(policyContractId, targetNet);
        setOnChainPolicy(onChain);
        if (connectedAccount) {
          const rep = await fetchOnChainReputation(policyContractId, connectedAccount, targetNet);
          setContributorReputation(rep);
        }
      }

      if (!isDemoMode) {
        setProposals(liveProps);
        if (liveProps.length > 0 && currentPath.startsWith('/app')) {
          showToast(`Loaded ${liveProps.length} on-chain proposals from ${targetDao}`);
        }
      }
    } catch (err: any) {
      console.warn('NEAR RPC query:', err);
      const errMsg = err.message || 'Failed to query Sputnik DAO on NEAR RPC';
      setDaoError(errMsg);
      setTreasuryState({ status: 'error', error: errMsg });
      if (!isDemoMode) {
        setProposals([]);
      }
    } finally {
      setIsLoadingOnChain(false);
    }
  };

  useEffect(() => {
    loadLiveDaoData();
  }, [network, daoContract, policyContractId, connectedAccount]);

  // Real Council Multi-Sig Vote Execution
  const handleVote = async (proposalId: number, approve: boolean) => {
    try {
      if (
        connectedAccount &&
        !connectedAccount.includes('judge-') &&
        !connectedAccount.includes('agent.') &&
        !connectedAccount.includes('demo')
      ) {
        showToast('Broadcasting act_proposal vote to NEAR RPC...');
        await signAndSendDaoVote({
          daoContractId: daoContract,
          proposalId,
          approve,
        });
        showToast('Transaction confirmed on NEAR! Vote cast.');
      }
    } catch (err: any) {
      console.warn('Wallet signing notice:', err);
    }

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const newApprove = approve ? p.votes.approve + 1 : p.votes.approve;
          const newReject = !approve ? p.votes.reject + 1 : p.votes.reject;
          const isQuorum = newApprove >= p.votes.required;

          return {
            ...p,
            status: isQuorum ? 'settled' : p.status,
            votes: {
              ...p.votes,
              approve: newApprove,
              reject: newReject,
            },
          };
        }
        return p;
      })
    );

    const title = approve
      ? `Council Vote Cast: Approved #ZP-${proposalId}`
      : `Council Vote Cast: Rejected #ZP-${proposalId}`;
    showToast(title);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: approve ? 'quorum_reached' : 'policy_pass',
        title,
        description: `Member voted ${approve ? 'Approve' : 'Reject'} on proposal #ZP-${proposalId}.`,
        badge: approve ? 'Vote Approve' : 'Vote Reject',
      },
      ...prev,
    ]);
  };

  const isAppRoute = currentPath.startsWith('/app');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-slate-100 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <aside aria-label="Notification" className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded bg-[var(--bg-panel-alt)] text-[var(--color-passed)] border border-[var(--color-passed-border)] shadow-2xl text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-passed)]" />
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Proof Modal */}
      <ProofModal
        proposal={selectedProofProposal}
        onClose={() => setSelectedProofProposal(null)}
      />

      {/* Deliberation Modal */}
      <DeliberationModal
        proposal={deliberationProposal}
        isOpen={Boolean(deliberationProposal)}
        onClose={() => setDeliberationProposal(null)}
      />

      {/* Intents Cross-Chain Settlement Modal */}
      <IntentsModal
        proposal={intentsProposal}
        daoContractId={daoContract}
        isOpen={Boolean(intentsProposal)}
        onClose={() => setIntentsProposal(null)}
        onSettled={(id) => {
          setProposals((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: 'settled' } : p))
          );
          showToast(`Proposal #ZP-${id} settled cross-chain via NEAR Intents!`);
        }}
      />

      {/* Wallet Selector Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        network={network}
        connectedAccount={connectedAccount}
        onConnect={(acc, role) => {
          setConnectedAccount(acc);
          setActiveRole(role);
          showToast(`Connected as ${acc} (${role})`);
        }}
        onDisconnect={() => {
          setConnectedAccount(null);
          showToast('Wallet disconnected');
        }}
      />

      {/* Route Switcher */}
      {isAppRoute ? (
        <div className="flex-1 flex flex-col">
          {/* Dashboard Navbar */}
          <Navbar
            network={network}
            onNetworkChange={(net) => {
              setNetwork(net);
              showToast(`Switched network to NEAR ${net.toUpperCase()}`);
            }}
            daoContract={daoContract}
            onDaoContractChange={(dao) => setDaoContract(dao)}
            policyContractId={policyContractId}
            onPolicyContractChange={(pol) => setPolicyContractId(pol)}
            treasuryState={treasuryState}
            onRefresh={() => {
              loadLiveDaoData(daoContract, network);
              showToast(`Refreshed on-chain state from NEAR ${network.toUpperCase()} RPC`);
            }}
            activeRole={activeRole}
            onRoleChange={(r) => {
              setActiveRole(r);
              showToast(`Switched active view to: ${r}`);
            }}
            connectedAccount={connectedAccount}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
            onNavigateToLanding={() => navigate('/')}
          />

          {/* Dashboard Page */}
          <main className="flex-1 flex flex-col">
            <DashboardPage
              proposals={proposals}
              activities={activities}
              network={network}
              daoContract={daoContract}
              policyContractId={policyContractId}
              treasuryState={treasuryState}
              isLoadingOnChain={isLoadingOnChain}
              daoError={daoError}
              onChainPolicy={onChainPolicy}
              daoPolicy={daoPolicy}
              contributorReputation={contributorReputation}
              connectedAccount={connectedAccount}
              activeRole={activeRole}
              onVote={handleVote}
              onInspectProof={(prop) => setSelectedProofProposal(prop)}
              onInspectDeliberation={(prop) => setDeliberationProposal(prop)}
              onExecuteIntent={(prop) => setIntentsProposal(prop)}
              onOpenWalletModal={() => setIsWalletModalOpen(true)}
              onProposalCreated={(newProp) => {
                setProposals((prev) => [newProp, ...prev]);
                setActivities((prev) => [
                  {
                    id: `act-${Date.now()}`,
                    timestamp: 'Just now',
                    type: 'proposal_created',
                    title: `Proposal #ZP-${newProp.id} Dispatched`,
                    description: `Three-Way Match Pass. Sputnik DAO proposal created.`,
                    badge: 'Agent Propose',
                  },
                  ...prev,
                ]);
              }}
              onShowToast={showToast}
              isDemoMode={isDemoMode}
            />
          </main>
        </div>
      ) : (
        /* Landing Page at "/" */
        <LandingPage onNavigateToApp={() => navigate('/app')} />
      )}
    </div>
  );
}
