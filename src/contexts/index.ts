import { useContext } from 'react';
import { PactContext } from './Pact';
import { WalletConnectContext } from './WalletConnect';
import { AppThemeContext } from './AppTheme';
import { LedgerContext } from './Ledger';
import { SpireKeyContext } from './SpireKey';

export function usePactContext() {
  return useContext(PactContext);
}

export function useWalletConnectContext() {
  return useContext(WalletConnectContext);
}

export const useAppThemeContext = () => {
  return useContext(AppThemeContext);
};

export function useLedgerContext() {
  return useContext(LedgerContext);
}

export function useSpireKeyContext() {
  return useContext(SpireKeyContext);
}
