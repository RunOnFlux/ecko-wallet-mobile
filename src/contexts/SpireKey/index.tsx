import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Linking, Platform } from 'react-native';
import { Buffer } from 'buffer';
import { setSpireKeyAccountRef } from './service';

type SpireKeyAccountLike = {
  accountName: string;
  networkId: string;
  chainIds?: string[];
  devices?: Array<{
    guard: {
      keys: string[];
    };
  }>;
  isReady: () => Promise<void>;
};

type SpireKeyContextData = {
  error: string;
  account?: SpireKeyAccountLike;
  isWaitingSpireKey: boolean;
  connectAccount: (
    networkId: string,
    chainId: string,
  ) => Promise<SpireKeyAccountLike | undefined>;
  signTransactions: (transaction: any) => Promise<any | undefined>;
  ensureAccountReady: (
    networkId: string,
    chainId: string,
  ) => Promise<SpireKeyAccountLike | undefined>;
  disconnect: () => void;
};

const DEFAULT_HOST_URL = 'https://spirekey.eckowallet.com';
const APP_SCHEME = 'com.kaddex.xwallet';
const CALLBACK_HOST = 'spirekey';

const buildReturnUrl = (flow: 'connect' | 'sign') => {
  return `${APP_SCHEME}://${CALLBACK_HOST}?flow=${flow}`;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString('utf-8');
};

export const SpireKeyContext = createContext<SpireKeyContextData>({
  error: '',
  account: undefined,
  isWaitingSpireKey: false,
  connectAccount: async () => undefined,
  signTransactions: async () => undefined,
  ensureAccountReady: async () => undefined,
  disconnect: () => {},
});

export const SpireKeyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [account, setAccount] = useState<SpireKeyAccountLike | undefined>();
  const [isWaitingSpireKey, setIsWaitingSpireKey] = useState(false);
  const [error, setError] = useState<string>('');
  const lastNetworkIdRef = useRef<string | undefined>(undefined);
  const lastChainIdRef = useRef<string | undefined>(undefined);
  const hostUrl = useMemo(() => DEFAULT_HOST_URL, []);
  const pendingResolverRef = useRef<((url: string) => void) | null>(null);

  useEffect(() => {
    setSpireKeyAccountRef(account);
  }, [account]);

  const processCallbackUrl = useCallback((url: string) => {
    try {
      const parsed = new URL(url);
      const flow = parsed.searchParams.get('flow');

      if (flow === 'connect') {
        const userParam = parsed.searchParams.get('user');
        if (!userParam) {
          console.log(
            '[SpireKey] processCallbackUrl - No user data in connect flow',
          );
          return;
        }
        console.log(
          '[SpireKey] processCallbackUrl - Processing connect callback',
        );
        const decoded = decodeBase64Url(userParam);
        const user = JSON.parse(decoded);
        const networkId = lastNetworkIdRef.current || 'mainnet01';
        const chainId = lastChainIdRef.current || '0';

        const acc: SpireKeyAccountLike = {
          accountName: user?.accountName,
          networkId,
          chainIds: [chainId],
          isReady: async () => {},
          devices: user?.credentials
            ? [
                {
                  guard: {
                    keys:
                      user?.credentials?.map((c: any) =>
                        c?.publicKey ? String(c.publicKey) : '',
                      ) ?? [],
                  },
                },
              ]
            : undefined,
        };
        console.log(
          '[SpireKey] processCallbackUrl - Setting account from callback',
        );
        setAccount(acc);
        setIsWaitingSpireKey(false);
      } else if (flow === 'sign') {
        if (pendingResolverRef.current) {
          pendingResolverRef.current(url);
          pendingResolverRef.current = null;
        }
      }
    } catch (err) {
      console.log('[SpireKey] processCallbackUrl ERROR:', err);
    }
  }, []);

  const handleIncomingUrl = useCallback(
    (url: string) => {
      try {
        console.log('[SpireKey] handleIncomingUrl - Received URL:', url);
        const parsed = new URL(url);
        console.log(
          '[SpireKey] Parsed URL - protocol:',
          parsed.protocol,
          'hostname:',
          parsed.hostname,
        );
        console.log(
          '[SpireKey] Expected scheme:',
          APP_SCHEME,
          'Expected host:',
          CALLBACK_HOST,
        );
        if (parsed.protocol.replace(':', '') !== APP_SCHEME) {
          console.log('[SpireKey] URL protocol mismatch, ignoring');
          return;
        }
        if (parsed.hostname !== CALLBACK_HOST) {
          console.log('[SpireKey] URL hostname mismatch, ignoring');
          return;
        }

        console.log('[SpireKey] URL matches callback pattern');
        console.log(
          '[SpireKey] URL search params:',
          parsed.searchParams.toString(),
        );
        if (pendingResolverRef.current) {
          console.log('[SpireKey] Calling pending resolver with URL');
          pendingResolverRef.current(url);
          pendingResolverRef.current = null;
        } else {
          console.log(
            '[SpireKey] No pending resolver, processing callback directly',
          );
          processCallbackUrl(url);
        }
      } catch (err) {
        console.log('[SpireKey] handleIncomingUrl ERROR:', err);
      }
    },
    [processCallbackUrl],
  );

  useEffect(() => {
    console.log('[SpireKey] Setting up Linking event listeners');
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[SpireKey] Linking event - URL received:', url);
      handleIncomingUrl(url);
    });
    Linking.getInitialURL().then(u => {
      if (u) {
        console.log('[SpireKey] Initial URL (cold start):', u);
        handleIncomingUrl(u);
      } else {
        console.log('[SpireKey] No initial URL found');
      }
    });
    return () => {
      console.log('[SpireKey] Cleaning up Linking event listeners');
      // @ts-ignore - compatibility with older RN
      if (typeof subscription?.remove === 'function') subscription.remove();
    };
  }, [handleIncomingUrl]);

  const waitForCallback = useCallback(async (): Promise<string> => {
    console.log('[SpireKey] waitForCallback - Setting up promise');
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          console.log('[SpireKey] waitForCallback - Timeout reached');
          pendingResolverRef.current = null;
          reject(new Error('Timeout waiting for SpireKey callback'));
        },
        5 * 60 * 1000,
      );
      pendingResolverRef.current = (url: string) => {
        console.log('[SpireKey] waitForCallback - Resolving with URL:', url);
        clearTimeout(timeout);
        resolve(url);
      };
    });
  }, []);

  const connectAccount = useCallback(
    async (
      networkId: string,
      chainId: string,
    ): Promise<SpireKeyAccountLike | undefined> => {
      try {
        console.log('[SpireKey] connectAccount - Starting connection');
        console.log(
          '[SpireKey] connectAccount - networkId:',
          networkId,
          'chainId:',
          chainId,
        );
        lastNetworkIdRef.current = networkId;
        lastChainIdRef.current = chainId;
        setIsWaitingSpireKey(true);
        setError('');
        const returnUrl = buildReturnUrl('connect');
        console.log('[SpireKey] connectAccount - returnUrl:', returnUrl);
        const qs = new URLSearchParams({
          returnUrl: encodeURIComponent(returnUrl),
          networkId,
        });
        const targetUrl = `${hostUrl}/connect?${qs.toString()}`;
        console.log('[SpireKey] connectAccount - Opening URL:', targetUrl);
        await Linking.openURL(targetUrl);
        console.log('[SpireKey] connectAccount - Waiting for callback...');
        const callbackUrl = await waitForCallback();
        console.log(
          '[SpireKey] connectAccount - Received callback URL:',
          callbackUrl,
        );
        const parsed = new URL(callbackUrl);
        console.log('[SpireKey] connectAccount - Parsed callback URL');
        console.log(
          '[SpireKey] connectAccount - All search params:',
          Array.from(parsed.searchParams.entries()),
        );
        const userParam = parsed.searchParams.get('user');
        console.log(
          '[SpireKey] connectAccount - userParam exists:',
          !!userParam,
        );
        console.log(
          '[SpireKey] connectAccount - userParam length:',
          userParam?.length,
        );
        if (!userParam) {
          console.log(
            '[SpireKey] connectAccount - ERROR: No user data received',
          );
          throw new Error('No user data received from SpireKey');
        }
        console.log('[SpireKey] connectAccount - Decoding user param...');
        const decoded = decodeBase64Url(userParam);
        console.log('[SpireKey] connectAccount - Decoded user data:', decoded);
        const user = JSON.parse(decoded);
        console.log(
          '[SpireKey] connectAccount - Parsed user object:',
          JSON.stringify(user, null, 2),
        );
        console.log(
          '[SpireKey] connectAccount - user.accountName:',
          user?.accountName,
        );
        console.log(
          '[SpireKey] connectAccount - user.credentials:',
          user?.credentials,
        );
        const acc: SpireKeyAccountLike = {
          accountName: user?.accountName,
          networkId,
          chainIds: [chainId],
          isReady: async () => {},
          devices: user?.credentials
            ? [
                {
                  guard: {
                    keys:
                      user?.credentials?.map((c: any) =>
                        c?.publicKey ? String(c.publicKey) : '',
                      ) ?? [],
                  },
                },
              ]
            : undefined,
        };
        console.log(
          '[SpireKey] connectAccount - Created account object:',
          JSON.stringify(acc, null, 2),
        );
        setAccount(acc);
        console.log('[SpireKey] connectAccount - Account set in state');
        setIsWaitingSpireKey(false);
        console.log('[SpireKey] connectAccount - Returning account:', acc);
        return acc;
      } catch (err: any) {
        console.log('[SpireKey] connectAccount - ERROR:', err);
        console.log('[SpireKey] connectAccount - Error message:', err?.message);
        console.log('[SpireKey] connectAccount - Error stack:', err?.stack);
        setIsWaitingSpireKey(false);
        setError(err?.message ?? String(err));
        return undefined;
      }
    },
    [hostUrl, waitForCallback],
  );

  const ensureAccountReady = useCallback(
    async (networkId: string, chainId: string) => {
      if (account?.accountName) return account;
      const nid = networkId ?? lastNetworkIdRef.current ?? '';
      const cid = chainId ?? lastChainIdRef.current ?? '0';
      if (!nid) return undefined;
      return connectAccount(nid, cid);
    },
    [account, connectAccount],
  );

  const signTransactions = useCallback(
    async (transaction: any | any[]) => {
      try {
        console.log('[SpireKey] signTransactions - Starting');
        console.log(
          '[SpireKey] signTransactions - Transaction:',
          JSON.stringify(transaction, null, 2),
        );
        setIsWaitingSpireKey(true);
        setError('');
        const returnUrl = buildReturnUrl('sign');
        console.log('[SpireKey] signTransactions - returnUrl:', returnUrl);
        const isArray = Array.isArray(transaction);
        console.log('[SpireKey] signTransactions - isArray:', isArray);
        const encodedPayload = Buffer.from(
          JSON.stringify(transaction),
        ).toString('base64');
        console.log(
          '[SpireKey] signTransactions - encodedPayload length:',
          encodedPayload.length,
        );
        const fragment = new URLSearchParams(
          isArray
            ? {
                transactions: encodedPayload,
                returnUrl: encodeURIComponent(returnUrl),
              }
            : {
                transaction: encodedPayload,
                returnUrl: encodeURIComponent(returnUrl),
              },
        );
        const targetUrl = `${hostUrl}/sign#${fragment.toString()}`;
        console.log('[SpireKey] signTransactions - Opening URL:', targetUrl);
        await Linking.openURL(targetUrl);
        console.log('[SpireKey] signTransactions - Waiting for callback...');
        const callbackUrl = await waitForCallback();
        console.log(
          '[SpireKey] signTransactions - Received callback URL:',
          callbackUrl,
        );
        const parsed = new URL(callbackUrl);
        const txParam =
          parsed.searchParams.get('transactions') ||
          parsed.searchParams.get('transaction');
        console.log('[SpireKey] signTransactions - txParam exists:', !!txParam);
        console.log(
          '[SpireKey] signTransactions - txParam length:',
          txParam?.length,
        );
        if (!txParam) {
          console.log(
            '[SpireKey] signTransactions - ERROR: No transaction returned',
          );
          throw new Error('No transaction(s) returned from SpireKey');
        }
        console.log('[SpireKey] signTransactions - Decoding transaction...');
        const decoded = decodeBase64Url(txParam);
        console.log(
          '[SpireKey] signTransactions - Decoded transaction:',
          decoded,
        );
        const signed = JSON.parse(decoded);
        console.log(
          '[SpireKey] signTransactions - Parsed signed transaction:',
          JSON.stringify(signed, null, 2),
        );
        setIsWaitingSpireKey(false);
        console.log('[SpireKey] signTransactions - Successfully signed');
        return signed;
      } catch (err: any) {
        console.log('[SpireKey] signTransactions - ERROR:', err);
        console.log(
          '[SpireKey] signTransactions - Error message:',
          err?.message,
        );
        console.log('[SpireKey] signTransactions - Error stack:', err?.stack);
        setIsWaitingSpireKey(false);
        setError(err?.message ?? String(err));
        return undefined;
      }
    },
    [hostUrl, waitForCallback],
  );

  const disconnect = useCallback(() => {
    setAccount(undefined);
    lastNetworkIdRef.current = undefined;
    lastChainIdRef.current = undefined;
    setError('');
  }, []);

  const value = useMemo(
    () => ({
      error,
      account,
      isWaitingSpireKey,
      connectAccount,
      signTransactions,
      ensureAccountReady,
      disconnect,
    }),
    [
      error,
      account,
      isWaitingSpireKey,
      connectAccount,
      signTransactions,
      ensureAccountReady,
      disconnect,
    ],
  );

  return (
    <SpireKeyContext.Provider value={value}>
      {children}
    </SpireKeyContext.Provider>
  );
};

export const useSpireKeyContext = () => useContext(SpireKeyContext);
