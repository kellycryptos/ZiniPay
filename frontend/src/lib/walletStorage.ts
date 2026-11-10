/**
 * walletStorage.ts — Fast, synchronous localStorage helpers for wallet state.
 * Has zero dependencies so it never pulls in @near-wallet-selector or web3 libraries.
 */

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
