import {useContext} from 'react';
import {PactContext} from './Pact';
import {WalletConnectContext} from './WalletConnect';
import {AppThemeContext} from './AppTheme';

export function usePactContext() {
  return useContext(PactContext);
}

export function useWalletConnectContext() {
  return useContext(WalletConnectContext);
}

export const useAppThemeContext = () => {
  return useContext(AppThemeContext);
};
