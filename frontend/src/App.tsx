/**
 * App.tsx — ZiniPay Frontend Router & State Coordinator
 * 
 * Routes:
 *   "/"      -> LandingPage
 *   "/board" -> DashboardShell (Redesigned app shell & dark finance dashboard)
 *   "/app"   -> Redirects to "/board"
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardShell } from './components/dashboard/DashboardShell';
import { DocsPage } from './components/docs/DocsPage';
import { ProofModal } from './components/ProofModal';
import { DeliberationModal } from './components/DeliberationModal';
import { IntentsModal } from './components/IntentsModal';
import { WalletModal } from './components/WalletModal';
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
import {
  signAndSendDaoVote,
  getStoredWalletAccount,
  setStoredWalletAccount,
  disconnectWallet,
  subscribeToWalletState,
  openNearWalletModal,
} from './lib/wallet';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  
  // Client-side Router: "/" or "/board" (with "/app" redirecting to "/board")
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname || '/';
      if (p.startsWith('/app')) {
        const query = window.location.search || '';
        window.history.replaceState({}, '', `/board${query}`);
        return '/board';
      }
      return p;
    }
    return '/';
  });

  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname || '/';
      if (p.startsWith('/app')) {
        const query = window.location.search || '';
        window.history.replaceState({}, '', `/board${query}`);
        setCurrentPath('/board');
      } else {
        setCurrentPath(p);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== 'undefined') {
      const target = to.startsWith('/app') ? '/board' : to;
      window.history.pushState({}, '', target);
      setCurrentPath(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // On-Chain & Wallet State with Robust Defaults
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>(
    (import.meta.env.VITE_NEAR_NETWORK as any) || 'testnet'
  );
  const [daoContract, setDaoContract] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlDao = new URLSearchParams(window.location.search).get('dao');
      if (urlDao !== null && urlDao.trim()) return urlDao.trim();
    }
    return import.meta.env.VITE_DAO_CONTRACT_ID || 'zinipay-demo.sputnikv2.testnet';
  });
  const [policyContractId, setPolicyContractId] = useState<string>(
    import.meta.env.VITE_POLICY_CONTRACT_ID || 'zinipay-policy2.testnet'
  );

  // Treasury starts in loading state; real data queried from chain
  const [treasuryState, setTreasuryState] = useState<TreasuryBalanceResult>({
    status: 'loading',
    balance: undefined,
  });

  const [isLoadingOnChain, setIsLoadingOnChain] = useState<boolean>(false);
  const [daoError, setDaoError] = useState<string | null>(null);
  const [onChainPolicy, setOnChainPolicy] = useState<PolicyContractState | null>(null);
  const [daoPolicy, setDaoPolicy] = useState<DaoOnChainPolicy | null>(null);
  const [contributorReputation, setContributorReputation] = useState<number | null>(null);

  // Connected account restored from session or null
  const [connectedAccount, setConnectedAccount] = useState<string | null>(() => {
    const stored = getStoredWalletAccount();
    return stored ? stored.accountId : null;
  });
  const [isSimulatedSigner, setIsSimulatedSigner] = useState<boolean>(() => {
    const stored = getStoredWalletAccount();
    return stored ? Boolean(stored.isSimulated) : false;
  });
  const [activeRole, setActiveRole] = useState<'council' | 'agent' | 'contributor'>(() => {
    const stored = getStoredWalletAccount();
    return stored ? stored.role : 'contributor';
  });

  const resolveAccountRole = (
    acc: string | null,
    policy: DaoOnChainPolicy | null
  ): 'council' | 'agent' | 'contributor' => {
    if (!acc) return 'contributor';
    if (policy && policy.roles) {
      const councilRole = policy.roles.find(
        (r) => r.name.toLowerCase() === 'council'
      );
      if (councilRole && Array.isArray((councilRole.kind as any)?.Group)) {
        if ((councilRole.kind as any).Group.includes(acc)) {
          return 'council';
        }
      }
    }
    // Only exact verified council accounts on testnet before policy resolves
    if (acc === 'zinipay-c1.testnet' || acc === 'zinipay-c2.testnet') {
      return 'council';
    }
    if (acc === 'agentzinipaytestnet.testnet') {
      return 'agent';
    }
    return 'contributor';
  };

  // On-chain live proposals and activities state
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

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

  // Restore wallet session or listen to selector changes & URL redirects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlAccountId = urlParams.get('account_id');
      if (urlAccountId) {
        const verifiedRole = resolveAccountRole(urlAccountId, daoPolicy);
        setConnectedAccount(urlAccountId);
        setIsSimulatedSigner(false);
        setActiveRole(verifiedRole);
        setStoredWalletAccount(urlAccountId, verifiedRole, false);
        showToast(`Connected verified wallet: ${urlAccountId} (${verifiedRole})`);
      }
    }

    let isSubscribed = true;
    subscribeToWalletState(network, (acc) => {
      if (isSubscribed && acc) {
        const verifiedRole = resolveAccountRole(acc, daoPolicy);
        setConnectedAccount(acc);
        setIsSimulatedSigner(false);
        setActiveRole(verifiedRole);
        setStoredWalletAccount(acc, verifiedRole, false);
        showToast(`Connected verified wallet: ${acc} (${verifiedRole})`);
      }
    }).then((unsub) => {
      if (!isSubscribed) unsub();
    });

    return () => {
      isSubscribed = false;
    };
  }, [network]);

  // Real RPC Data Loading from Sputnik DAO
  const loadLiveDaoData = async (targetDao = daoContract, targetNet = network) => {
    if (!targetDao || !targetDao.trim()) {
      setIsLoadingOnChain(false);
      const errMsg =
        'DAO contract is not configured. Provide a valid DAO contract ID via ?dao=...';
      setDaoError(errMsg);
      setTreasuryState({ status: 'error', error: errMsg, balance: undefined });
      setProposals([]);
      return;
    }

    setIsLoadingOnChain(true);
    setDaoError(null);

    try {
      const [balResult, liveProps, liveDaoPol] = await Promise.all([
        fetchDaoTreasuryBalanceResult(targetDao, targetNet),
        fetchDaoProposals(targetDao, targetNet, 25, policyContractId),
        fetchDaoPolicy(targetDao, targetNet),
      ]);

      setTreasuryState(balResult);
      setDaoPolicy(liveDaoPol);

      if (connectedAccount && !isSimulatedSigner) {
        const verifiedRole = resolveAccountRole(connectedAccount, liveDaoPol);
        setActiveRole(verifiedRole);
        setStoredWalletAccount(connectedAccount, verifiedRole, false);
      }

      if (policyContractId) {
        const onChain = await fetchPolicyContractConfig(policyContractId, targetNet);
        setOnChainPolicy(onChain);
        if (connectedAccount) {
          const rep = await fetchOnChainReputation(policyContractId, connectedAccount, targetNet);
          setContributorReputation(rep);
        }
      }

      setProposals(liveProps);
      if (liveProps.length > 0 && currentPath.startsWith('/board')) {
        showToast(`Synced ${liveProps.length} on-chain proposals from ${targetDao}`);
      }
    } catch (err: any) {
      console.warn('NEAR RPC query:', err);
      const errMsg = err.message || 'Failed to query Sputnik DAO on NEAR RPC';
      setDaoError(errMsg);
      setTreasuryState({ status: 'error', error: errMsg, balance: undefined });
      setProposals([]);
    } finally {
      setIsLoadingOnChain(false);
    }
  };

  useEffect(() => {
    loadLiveDaoData();
  }, [network, daoContract, policyContractId, connectedAccount]);

  const handleOpenWalletSelector = async () => {
    try {
      showToast('Opening NEAR Wallet Selector (12s timeout)...');
      await openNearWalletModal(network);
    } catch (err: any) {
      console.error('Wallet selector error:', err);
      showToast(err.message || 'Failed to initialize NEAR Wallet Selector. Please check your connection.');
    }
  };

  // Real Council Multi-Sig Vote Execution
  const handleVote = async (proposalId: number, approve: boolean) => {
    if (!connectedAccount) {
      showToast('Please connect your NEAR wallet via the selector to vote.');
      await handleOpenWalletSelector();
      return;
    }

    if (isSimulatedSigner) {
      showToast(`Observer mode (${connectedAccount}) is read-only. Connect a verified council wallet on NEAR to sign.`);
      return;
    }

    if (activeRole !== 'council') {
      showToast(`Unauthorized: ${connectedAccount} is not an authorized Sputnik DAO council member.`);
      return;
    }

    try {
      showToast('Broadcasting signed act_proposal to NEAR testnet...');
      await signAndSendDaoVote({
        daoContractId: daoContract,
        proposalId,
        approve,
      });
      showToast('Transaction confirmed on NEAR! On-chain vote cast.');
      await loadLiveDaoData();
    } catch (err: any) {
      console.error('Wallet signing error:', err);
      showToast(`Vote failed: ${err.message || 'Transaction rejected'}`);
      return;
    }

    const title = approve
      ? `Council Vote Cast: Approved #ZP-${proposalId}`
      : `Council Vote Cast: Rejected #ZP-${proposalId}`;

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: approve ? 'quorum_reached' : 'policy_pass',
        title,
        description: `${connectedAccount} voted ${approve ? 'Approve' : 'Reject'} on proposal #ZP-${proposalId}.`,
        badge: approve ? 'Vote Approve' : 'Vote Reject',
      },
      ...prev,
    ]);
  };

  const isDashboardRoute = currentPath === '/board' || currentPath.startsWith('/app');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-slate-100 font-sans w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <aside
          aria-label="Notification"
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-lg bg-[var(--bg-panel-alt)] text-[#00EC97] border border-emerald-500/30 shadow-2xl text-xs font-mono animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00EC97]" />
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
        activeRole={activeRole}
        isSimulated={isSimulatedSigner}
        onConnectObserver={(acc) => {
          const verifiedRole = resolveAccountRole(acc, daoPolicy);
          setConnectedAccount(acc);
          setIsSimulatedSigner(true);
          setActiveRole(verifiedRole);
          setStoredWalletAccount(acc, verifiedRole, true);
          showToast(`Viewing as observer: ${acc} (${verifiedRole} · Read-Only)`);
        }}
        onLaunchSelector={handleOpenWalletSelector}
        onDisconnect={async () => {
          await disconnectWallet();
          setConnectedAccount(null);
          setIsSimulatedSigner(false);
          setActiveRole('contributor');
          showToast('Wallet disconnected');
        }}
      />

      {/* Route Switcher: "/" -> LandingPage, "/board" -> DashboardShell */}
      {isDashboardRoute ? (
        <DashboardShell
          proposals={proposals}
          activities={activities}
          network={network}
          daoContract={daoContract}
          onDaoContractChange={(dao) => {
            setDaoContract(dao);
            loadLiveDaoData(dao, network);
          }}
          policyContractId={policyContractId}
          treasuryState={treasuryState}
          isLoadingOnChain={isLoadingOnChain}
          daoError={daoError}
          onChainPolicy={onChainPolicy}
          daoPolicy={daoPolicy}
          contributorReputation={contributorReputation}
          connectedAccount={connectedAccount}
          isSimulated={isSimulatedSigner}
          activeRole={activeRole}
          onVote={handleVote}
          onInspectProof={(prop) => setSelectedProofProposal(prop)}
          onInspectDeliberation={(prop) => setDeliberationProposal(prop)}
          onExecuteIntent={(prop) => setIntentsProposal(prop)}
          onOpenWalletModal={() => {
            if (connectedAccount) {
              setIsWalletModalOpen(true);
            } else {
              handleOpenWalletSelector();
            }
          }}
          onProposalCreated={(newProp) => {
            setProposals((prev) => [newProp, ...prev]);
            setActivities((prev) => [
              {
                id: `act-${Date.now()}`,
                timestamp: 'Just now',
                type: 'proposal_created',
                title: `Proposal #ZP-${newProp.id} Dispatched`,
                description: `Three-Way Match Pass. Sputnik DAO proposal created.`,
                badge: 'Pending',
              },
              ...prev,
            ]);
          }}
          onShowToast={showToast}
          onRefresh={() => {
            loadLiveDaoData(daoContract, network);
            showToast(`Refreshed on-chain state from NEAR ${network.toUpperCase()}`);
          }}
          onNavigateToLanding={() => navigate('/')}
        />
      ) : (
        <LandingPage
          onNavigateToApp={() => navigate('/board')}
          onNavigateToBoard={() => navigate('/board')}
        />
      )}
    </div>
  );
}
