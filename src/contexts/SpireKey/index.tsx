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
          return;
        }
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
        setAccount(acc);
        setIsWaitingSpireKey(false);
      } else if (flow === 'sign') {
        if (pendingResolverRef.current) {
          pendingResolverRef.current(url);
          pendingResolverRef.current = null;
        }
      }
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    }
  }, []);

  const handleIncomingUrl = useCallback(
    (url: string) => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol.replace(':', '') !== APP_SCHEME) {
          return;
        }
        if (parsed.hostname !== CALLBACK_HOST) {
          return;
        }

        if (pendingResolverRef.current) {
          pendingResolverRef.current(url);
          pendingResolverRef.current = null;
        } else {
          processCallbackUrl(url);
        }
      } catch (err) {
        setError((err as Error)?.message ?? String(err));
      }
    },
    [processCallbackUrl],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleIncomingUrl(url);
    });

    const checkInitialURL = async () => {
      const attemptGetURL = async (attempt: number): Promise<void> => {
        try {
          const url = await Linking.getInitialURL();
          if (url) {
            handleIncomingUrl(url);
          } else if (Platform.OS === 'ios' && attempt < 3) {
            setTimeout(() => attemptGetURL(attempt + 1), attempt * 200);
          }
        } catch (err) {
          if (Platform.OS === 'ios' && attempt < 3) {
            setTimeout(() => attemptGetURL(attempt + 1), attempt * 200);
          }
        }
      };

      attemptGetURL(1);
    };

    checkInitialURL();

    return () => {
      if (typeof subscription?.remove === 'function') subscription.remove();
    };
  }, [handleIncomingUrl]);

  const waitForCallback = useCallback(async (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          pendingResolverRef.current = null;
          reject(new Error('Timeout waiting for SpireKey callback'));
        },
        5 * 60 * 1000,
      );
      pendingResolverRef.current = (url: string) => {
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
        lastNetworkIdRef.current = networkId;
        lastChainIdRef.current = chainId;
        setIsWaitingSpireKey(true);
        setError('');
        const returnUrl = buildReturnUrl('connect');
        const qs = new URLSearchParams({
          returnUrl: encodeURIComponent(returnUrl),
          networkId,
        });
        const targetUrl = `${hostUrl}/connect?${qs.toString()}`;
        await Linking.openURL(targetUrl);
        const callbackUrl = await waitForCallback();
        const parsed = new URL(callbackUrl);
        const userParam = parsed.searchParams.get('user');
        if (!userParam) {
          throw new Error('No user data received from SpireKey');
        }
        const decoded = decodeBase64Url(userParam);
        const user = JSON.parse(decoded);
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
        setAccount(acc);
        setIsWaitingSpireKey(false);
        return acc;
      } catch (err: any) {
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
        setIsWaitingSpireKey(true);
        setError('');
        const returnUrl = buildReturnUrl('sign');
        const isArray = Array.isArray(transaction);
        const encodedPayload = Buffer.from(
          JSON.stringify(transaction),
        ).toString('base64');
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
        await Linking.openURL(targetUrl);
        const callbackUrl = await waitForCallback();
        const parsed = new URL(callbackUrl);
        const txParam =
          parsed.searchParams.get('transactions') ||
          parsed.searchParams.get('transaction');
        if (!txParam) {
          throw new Error('No transaction(s) returned from SpireKey');
        }
        const decoded = decodeBase64Url(txParam);
        const signed = JSON.parse(decoded);
        setIsWaitingSpireKey(false);
        return signed;
      } catch (err: any) {
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
