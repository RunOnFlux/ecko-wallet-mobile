import '@walletconnect/react-native-compat';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { ICore } from '@walletconnect/types';
import { WalletKit, IWalletKit } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { WALLETCONNECT_PROJECT_ID, WALLETCONNECT_PROJECT_RELAY } from '@env';
import { getSavedValue } from '../../utils/storageHelplers';

export const defaultWalletConnectParams = {
  name: WALLETCONNECT_PROJECT_ID,
  projectId: WALLETCONNECT_PROJECT_ID,
  relayUrl: WALLETCONNECT_PROJECT_RELAY,
  metadata: {
    name: 'eckoWALLET',
    description: 'eckoWALLET by eckoDEX',
    url: 'https://eckowallet.com/',
    icons: ['https://swap.ecko.finance/images/crypto/kaddex-crypto.svg'],
  },
};

type CreateParams = {
  projectId?: string;
  relayUrl?: string;
};

export const WalletConnectContext = createContext<{
  walletConnectCore: ICore | null | undefined;
  web3WalletClient: IWalletKit | null | undefined;
  initializeClient: (params?: CreateParams) => Promise<void> | void;
  isInitialized: boolean;
  isConnected: boolean;
  setIsConnected: (v: boolean) => void;
}>({
  walletConnectCore: null,
  web3WalletClient: null,
  initializeClient: () => {},
  setIsConnected: () => {},
  isConnected: false,
  isInitialized: false,
});

export const WalletConnectProvider = (props: any) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletConnectCore, setWalletConnectCore] = useState<ICore | null>(
    null,
  );
  const [web3WalletClient, setWeb3WalletClient] = useState<IWalletKit | null>(
    null,
  );

  const initializeClient = useCallback(async (params?: CreateParams) => {
    const initWalletConnectCore = new Core({
      name: params?.projectId || defaultWalletConnectParams.projectId,
      projectId: params?.projectId || defaultWalletConnectParams.projectId,
      relayUrl: params?.relayUrl || defaultWalletConnectParams.relayUrl,
    });
    const initWeb3WalletClient = await WalletKit.init({
      core: initWalletConnectCore,
      metadata: defaultWalletConnectParams.metadata,
    });

    try {
      const sessions = initWeb3WalletClient.getActiveSessions();
      const now = Date.now() / 1000;

      for (const topic in sessions) {
        const session = sessions[topic];
        if (session.expiry < now) {
          try {
            await initWeb3WalletClient.disconnectSession({
              topic,
              reason: {
                code: 6000,
                message: 'Session expired',
              },
            });
          } catch (e) {
            console.warn('Failed to disconnect expired session:', topic);
          }
        }
      }

      const pairings = initWalletConnectCore.pairing.getPairings();
      for (const pairing of pairings) {
        if (pairing.expiry && pairing.expiry < now) {
          try {
            await initWalletConnectCore.pairing.disconnect({
              topic: pairing.topic,
            });
          } catch (e) {
            console.warn(
              'Failed to disconnect expired pairing:',
              pairing.topic,
            );
          }
        }
      }
    } catch (e) {
      console.warn('Error cleaning up expired sessions/pairings:', e);
    }

    setWalletConnectCore(initWalletConnectCore);
    setWeb3WalletClient(initWeb3WalletClient);
  }, []);

  useEffect(() => {
    const savedParams = getSavedValue('walletConnectParams', {});
    initializeClient(savedParams)
      .then(() => setInitialized(true))
      .catch(() => setInitialized(false));
  }, []);

  return (
    <WalletConnectContext.Provider
      value={{
        isInitialized: initialized,
        isConnected,
        setIsConnected,
        walletConnectCore,
        web3WalletClient,
        initializeClient,
      }}
    >
      {props.children}
    </WalletConnectContext.Provider>
  );
};
