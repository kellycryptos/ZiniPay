/**
 * wallet.ts — Real NEAR Wallet Selector Integration
 * Supports MyNearWallet, Meteor Wallet, and HERE Wallet across Mainnet & Testnet.
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
}

export async function getActiveAccountId(): Promise<string | null> {
  if (!selectorInstance) return null;
  const state = selectorInstance.store.getState();
  return state.accounts[0]?.accountId ?? null;
}

export async function signAndSendDaoVote(opts: {
  daoContractId: string;
  proposalId: number;
  approve: boolean;
}): Promise<void> {
  if (!selectorInstance) throw new Error('NEAR Wallet Selector not initialized');
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
