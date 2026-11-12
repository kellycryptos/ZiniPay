/**
 * App.tsx — ZiniPay Frontend Router & State Coordinator
 * 
 * Routes:
 *   "/"      -> LandingPage (Eagerly rendered for maximum speed & sub-second LCP)
 *   "/board" -> DashboardShell (Lazily loaded)
 *   "/app"   -> Redirects to "/board"
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/landing/LandingPage';
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
  getStoredWalletAccount,
  setStoredWalletAccount,
} from './lib/walletStorage';
import { CheckCircle2 } from 'lucide-react';

// Lazy-load dashboard, docs, and heavy modals to keep landing page bundle ultralight
const DashboardShell = React.lazy(() =>
  import('./components/dashboard/DashboardShell').then((m) => ({ default: m.DashboardShell }))
);
const DocsPage = React.lazy(() =>
  import('./components/docs/DocsPage').then((m) => ({ default: m.DocsPage }))
);
const VerificationPage = React.lazy(() =>
  import('./components/verification/VerificationPage').then((m) => ({ default: m.VerificationPage }))
);
const AppHeader = React.lazy(() =>
  import('./components/navigation/AppHeader').then((m) => ({ default: m.AppHeader }))
);
const UniversalFooter = React.lazy(() =>
  import('./components/navigation/UniversalFooter').then((m) => ({ default: m.UniversalFooter }))
);
const ProofModal = React.lazy(() =>
  import('./components/ProofModal').then((m) => ({ default: m.ProofModal }))
);
const DeliberationModal = React.lazy(() =>
  import('./components/DeliberationModal').then((m) => ({ default: m.DeliberationModal }))
);
const IntentsModal = React.lazy(() =>
  import('./components/IntentsModal').then((m) => ({ default: m.IntentsModal }))
);
const WalletModal = React.lazy(() =>
  import('./components/WalletModal').then((m) => ({ default: m.WalletModal }))
);

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

  const isDashboardRoute = currentPath === '/board' || currentPath.startsWith('/app');
  const isVerifyRoute = currentPath === '/verify' || currentPath.startsWith('/verify');
  const isDocsRoute = currentPath === '/docs' || currentPath.startsWith('/docs');

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

  // On-Chain & Wallet State Defaults
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

  // Connected account restored from session

  const [connectedAccount, setConnectedAccount] = useState<string | null>(() => {
    const stored = getStoredWalletAccount();
    if (stored) return stored.accountId;
    return null;
  });
  const [isSimulatedSigner, setIsSimulatedSigner] = useState<boolean>(() => {
    const stored = getStoredWalletAccount();
    if (stored) return Boolean(stored.isSimulated);
    return false;
  });
  const [activeRole, setActiveRole] = useState<'council' | 'agent' | 'contributor'>(() => {
    const stored = getStoredWalletAccount();
    if (stored) return stored.role;
    return 'contributor';
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
    return 'contributor';
  };

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

  // Restore wallet session or listen to selector changes & URL redirects (ONLY on dashboard)
  useEffect(() => {
    if (!isDashboardRoute) return;

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
    let unsubFn: (() => void) | null = null;

    // The wallet library is about 1.8 MB. Only load it when this visitor can
    // actually have a wallet session: a saved real account, a wallet redirect
    // back to the site, or selector data left in storage. Everyone else loads
    // it later, when they press Connect.
    const hasWalletSession = (() => {
      try {
        const stored = getStoredWalletAccount();
        if (stored && !stored.isSimulated) return true;
        const q = new URLSearchParams(window.location.search);
        if (q.get('account_id') || q.get('transactionHashes') || q.get('errorCode')) return true;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || '';
          if (k.startsWith('near-wallet-selector') || k.startsWith('near_app_wallet')) return true;
        }
      } catch {
        /* storage blocked */
      }
      return false;
    })();

    (hasWalletSession
      ? import('./lib/wallet')
      : Promise.reject(new Error('no-wallet-session'))
    ).then(({ subscribeToWalletState }) => {
      if (!isSubscribed) return;
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
        if (!isSubscribed) {
          unsub();
        } else {
          unsubFn = unsub;
        }
      });
    }).catch(() => {
      /* no wallet session, nothing to subscribe to */
    });

    return () => {
      isSubscribed = false;
      if (unsubFn) unsubFn();
    };
  }, [network, isDashboardRoute]);

  // Real RPC Data Loading from Sputnik DAO (ONLY on dashboard)
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

      // Show treasury and proposals right away, then load policy details
      setProposals(liveProps);
      setIsLoadingOnChain(false);

      if (policyContractId) {
        const [onChain, rep] = await Promise.all([
          fetchPolicyContractConfig(policyContractId, targetNet),
          connectedAccount
            ? fetchOnChainReputation(policyContractId, connectedAccount, targetNet)
            : Promise.resolve(null),
        ]);
        setOnChainPolicy(onChain);
        if (connectedAccount) setContributorReputation(rep as number | null);
      }

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
    if (!isDashboardRoute) return;
    loadLiveDaoData();
  }, [network, daoContract, policyContractId, connectedAccount, isDashboardRoute]);

  const handleOpenWalletSelector = async () => {
    try {
      showToast('Opening NEAR Wallet Selector (12s timeout)...');
      const { openNearWalletModal } = await import('./lib/wallet');
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
      showToast('Observer mode is read-only. Connect a real council wallet to vote.');
      return;
    }

    if (activeRole !== 'council') {
      showToast(`Unauthorized: ${connectedAccount} is not an authorized Sputnik DAO council member.`);
      return;
    }

    try {
      showToast('Broadcasting signed act_proposal to NEAR testnet...');
      const { signAndSendDaoVote } = await import('./lib/wallet');
      await signAndSendDaoVote({
        daoContractId: daoContract,
        proposalId,
        approve,
      });
      showToast('Transaction confirmed on NEAR! On-chain vote cast.');
      await loadLiveDaoData();
    } catch (err: any) {
      console.error('Vote failed:', err);
      showToast(err.message || 'Vote broadcast failed on NEAR RPC.');
    }
  };

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
      {selectedProofProposal && (
        <React.Suspense fallback={null}>
          <ProofModal
            proposal={selectedProofProposal}
            onClose={() => setSelectedProofProposal(null)}
          />
        </React.Suspense>
      )}

      {/* Deliberation Modal */}
      {deliberationProposal && (
        <React.Suspense fallback={null}>
          <DeliberationModal
            proposal={deliberationProposal}
            isOpen={true}
            onClose={() => setDeliberationProposal(null)}
          />
        </React.Suspense>
      )}

      {/* Intents Cross-Chain Settlement Modal */}
      {intentsProposal && (
        <React.Suspense fallback={null}>
          <IntentsModal
            proposal={intentsProposal}
            daoContractId={daoContract}
            isOpen={true}
            onClose={() => setIntentsProposal(null)}
            onSettled={(id) => {
              setProposals((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: 'settled' } : p))
              );
              showToast(`Proposal #ZP-${id} settled cross-chain via NEAR Intents!`);
            }}
          />
        </React.Suspense>
      )}

      {/* Wallet Selector Modal */}
      {isWalletModalOpen && (
        <React.Suspense fallback={null}>
          <WalletModal
            isOpen={true}
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
              const { disconnectWallet } = await import('./lib/wallet');
              await disconnectWallet();
              setConnectedAccount(null);
              setIsSimulatedSigner(false);
              setActiveRole('contributor');
              showToast('Wallet disconnected');
            }}
          />
        </React.Suspense>
      )}

      {/* Route Switcher: "/" -> LandingPage, "/board" -> DashboardShell */}
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#070D0C] text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        }
      >
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
            onNavigateVerify={() => navigate('/verify')}
            onNavigateDocs={() => navigate('/docs')}
          />
        ) : isVerifyRoute ? (
          <VerificationPage
            onNavigateHome={() => navigate('/')}
            onNavigateBoard={() => navigate('/board')}
            onNavigateDocs={() => navigate('/docs')}
            network={network}
          />
        ) : isDocsRoute ? (
          <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans w-full max-w-full overflow-x-hidden">
            <AppHeader
              currentPath="/docs"
              onNavigateHome={() => navigate('/')}
              onNavigateBoard={() => navigate('/board')}
              onNavigateDocs={() => navigate('/docs')}
              onNavigateVerify={() => navigate('/verify')}
              network={network}
            />
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
              <DocsPage embedded={false} network={network} />
            </main>
            <UniversalFooter
              onNavigateBoard={() => navigate('/board')}
              onNavigateDocs={() => navigate('/docs')}
              onNavigateVerify={() => navigate('/verify')}
              network={network}
            />
          </div>
        ) : (
          <LandingPage
            onNavigateToApp={() => navigate('/board')}
            onNavigateToBoard={() => navigate('/board')}
            onNavigateDocs={() => navigate('/docs')}
            onNavigateVerify={() => navigate('/verify')}
            network={network}
          />
        )}
      </React.Suspense>
    </div>
  );
}
