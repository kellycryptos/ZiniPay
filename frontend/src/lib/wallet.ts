/**
 * wallet.ts — Real NEAR Wallet Selector Integration
 * Supports MyNearWallet, Meteor Wallet, and HERE Wallet across Mainnet & Testnet,
 * plus local session persistence and account subscription.
 *
 * Lazily loads @near-wallet-selector so the landing page does not incur
 * the ~1.8MB wallet vendor bundle on initial page load.
 */

import type { WalletSelector } from '@near-wallet-selector/core';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setStoredWalletAccount } from './walletStorage';

export * from './walletStorage';

export type NearNetworkId = 'testnet' | 'mainnet';

let selectorInstance: WalletSelector | null = null;
let modalInstance: WalletSelectorModal | null = null;
let initPromise: Promise<{ selector: WalletSelector; modal: WalletSelectorModal }> | null = null;

export async function initNearWallet(network: NearNetworkId = 'testnet'): Promise<{
  selector: WalletSelector;
  modal: WalletSelectorModal;
}> {
  if (selectorInstance && modalInstance) {
    return { selector: selectorInstance, modal: modalInstance };
  }

  if (initPromise) {
    return initPromise;
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'Wallet selector initialization timed out after 12s. Please check your network connection and retry.'
          )
        ),
      12000
    )
  );

  initPromise = (async () => {
    // Dynamic import: Only download NEAR wallet selector packages when actually requested
    const [
      { Buffer },
      { setupWalletSelector },
      { setupModal },
      { setupMyNearWallet },
      { setupMeteorWallet },
      { setupHereWallet },
    ] = await Promise.all([
      import('buffer'),
      import('@near-wallet-selector/core'),
      import('@near-wallet-selector/modal-ui'),
      import('@near-wallet-selector/my-near-wallet'),
      import('@near-wallet-selector/meteor-wallet'),
      import('@near-wallet-selector/here-wallet'),
    ]);

    if (typeof window !== 'undefined') {
      (window as any).Buffer = Buffer;
    }

    // Inject modal styles only when selector is initialized
    if (typeof document !== 'undefined' && !document.getElementById('near-wallet-modal-css')) {
      const link = document.createElement('link');
      link.id = 'near-wallet-modal-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@near-wallet-selector/modal-ui@10.1.4/styles.css';
      document.head.appendChild(link);
    }

    const selector = await setupWalletSelector({
      network,
      modules: [
        setupMyNearWallet(),
        setupMeteorWallet(),
        setupHereWallet(),
      ],
    });

    const modal = setupModal(selector, {
      contractId: network === 'mainnet' ? 'sputnik-dao.near' : 'sputnikv2.testnet',
    });

    selectorInstance = selector;
    modalInstance = modal;
    return { selector, modal };
  })();

  try {
    return await Promise.race([initPromise, timeoutPromise]);
  } catch (err) {
    initPromise = null;
    throw err;
  }
}

export async function openNearWalletModal(network: NearNetworkId = 'testnet'): Promise<void> {
  const { modal } = await initNearWallet(network);
  modal.show();
}

export async function getActiveAccountId(): Promise<string | null> {
  if (!selectorInstance) return null;
  const state = selectorInstance.store.getState();
  return state.accounts[0]?.accountId ?? null;
}

export function isRealWalletConnected(): boolean {
  if (!selectorInstance) return false;
  return selectorInstance.isSignedIn();
}

export async function disconnectWallet(): Promise<void> {
  setStoredWalletAccount(null);
  if (selectorInstance) {
    try {
      const wallet = await selectorInstance.wallet();
      await wallet.signOut();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  }
}

export async function subscribeToWalletState(
  network: NearNetworkId,
  callback: (accountId: string | null) => void
): Promise<() => void> {
  try {
    const { selector } = await initNearWallet(network);
    
    // Call immediately if an account is already signed in
    const initialAcc = selector.store.getState().accounts[0]?.accountId ?? null;
    if (initialAcc) {
      callback(initialAcc);
    }

    const subscription = selector.store.observable.subscribe((state: any) => {
      const acc = state.accounts[0]?.accountId ?? null;
      callback(acc);
    });

    return () => subscription.unsubscribe();
  } catch (err) {
    console.warn('Could not subscribe to wallet selector:', err);
    return () => {};
  }
}

export async function signAndSendDaoVote(opts: {
  daoContractId: string;
  proposalId: number;
  approve: boolean;
}): Promise<void> {
  if (!selectorInstance || !selectorInstance.isSignedIn()) {
    throw new Error('No active NEAR wallet connected. Please connect a verified council wallet via the selector to sign votes.');
  }
  const wallet = await selectorInstance.wallet();
  
  await wallet.signAndSendTransaction({
    receiverId: opts.daoContractId,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName: 'act_proposal',
          args: {
            id: opts.proposalId,
            action: opts.approve ? 'VoteApprove' : 'VoteReject',
          },
          gas: '150000000000000', // 150 TGas
          deposit: '0',
        },
      } as any,
    ],
  });
}

export async function signAndSendDaoProposal(opts: {
  daoContractId: string;
  policyContractId: string;
  recipient: string;
  amountYocto: string;
  deliverableCid: string;
  description: string;
  bondYocto?: string;
}): Promise<{ txHash?: string; result?: any }> {
  if (!selectorInstance || !selectorInstance.isSignedIn()) {
    throw new Error('No active NEAR wallet connected. Please connect your wallet via the selector to dispatch proposals.');
  }
  const wallet = await selectorInstance.wallet();
  const bond = opts.bondYocto || '1000000000000000000000000'; // 1 NEAR proposal bond

  const releaseArgs = JSON.stringify({
    recipient: opts.recipient,
    amount: opts.amountYocto,
    cid: opts.deliverableCid,
  });

  const base64Args = typeof btoa !== 'undefined'
    ? btoa(releaseArgs)
    : Buffer.from(releaseArgs).toString('base64');

  const res = await wallet.signAndSendTransaction({
    receiverId: opts.daoContractId,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName: 'add_proposal',
          args: {
            proposal: {
              description: opts.description,
              kind: {
                FunctionCall: {
                  receiver_id: opts.policyContractId,
                  actions: [
                    {
                      method_name: 'release',
                      args: base64Args,
                      deposit: opts.amountYocto,
                      gas: '150000000000000', // 150 TGas
                    },
                  ],
                },
              },
            },
          },
          gas: '200000000000000', // 200 TGas
          deposit: bond,
        },
      } as any,
    ],
  });

  return { txHash: (res as any)?.transaction?.hash, result: res };
}
