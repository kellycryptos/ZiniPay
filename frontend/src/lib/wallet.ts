/**
 * wallet.ts — Real NEAR Wallet Selector Integration
 * Supports MyNearWallet, Meteor Wallet, and HERE Wallet across Mainnet & Testnet,
 * plus local session persistence and account subscription.
 */

import { setupWalletSelector, WalletSelector } from '@near-wallet-selector/core';
import { setupModal, WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';

export type NearNetworkId = 'testnet' | 'mainnet';

let selectorInstance: WalletSelector | null = null;
let modalInstance: WalletSelectorModal | null = null;

export async function initNearWallet(network: NearNetworkId = 'testnet'): Promise<{
  selector: WalletSelector;
  modal: WalletSelectorModal;
}> {
  if (selectorInstance && modalInstance) {
    return { selector: selectorInstance, modal: modalInstance };
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

  const initPromise = (async () => {
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

  return await Promise.race([initPromise, timeoutPromise]);
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

export function isStoredWalletSimulated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('zinipay_is_simulated') === 'true';
}

export function getStoredWalletAccount(): {
  accountId: string;
  role: 'council' | 'agent' | 'contributor';
  isSimulated: boolean;
} | null {
  if (typeof window === 'undefined') return null;
  const acc = localStorage.getItem('zinipay_connected_account');
  const role = (localStorage.getItem('zinipay_active_role') as any) || 'council';
  const isSimulated = localStorage.getItem('zinipay_is_simulated') === 'true';
  if (acc && acc.trim()) return { accountId: acc.trim(), role, isSimulated };
  return null;
}

export function setStoredWalletAccount(
  accountId: string | null,
  role: 'council' | 'agent' | 'contributor' = 'council',
  isSimulated: boolean = false
): void {
  if (typeof window === 'undefined') return;
  if (accountId && accountId.trim()) {
    localStorage.setItem('zinipay_connected_account', accountId.trim());
    localStorage.setItem('zinipay_active_role', role);
    localStorage.setItem('zinipay_is_simulated', isSimulated ? 'true' : 'false');
  } else {
    localStorage.removeItem('zinipay_connected_account');
    localStorage.removeItem('zinipay_active_role');
    localStorage.removeItem('zinipay_is_simulated');
  }
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
