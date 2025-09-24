import { Pact } from '../pactLangApi';
import { getPactHost } from '../utils';

export const isRAccount = (account: string): boolean => {
  return typeof account === 'string' && account.startsWith('r:');
};

export const getKeysetRefGuardFromDetails = (
  detailsRes: any,
): { ns: string; ksn: string } | undefined => {
  const guard = detailsRes?.result?.data?.guard;
  if (!guard) return undefined;
  const keysetRef = (guard as any).keysetref;
  if (!keysetRef) return undefined;
  if (typeof keysetRef === 'string') {
    const [ns, ksn] = keysetRef.split('.');
    if (ns && ksn) return { ns, ksn };
    return undefined;
  }
  if (typeof keysetRef === 'object' && keysetRef.ns && keysetRef.ksn) {
    return { ns: keysetRef.ns, ksn: keysetRef.ksn };
  }
  return undefined;
};

export const fetchGuardForRAccount = async (
  receiver: string,
  moduleName: string,
  network: string,
  version: string,
  instance: string,
  chainId: string,
  customHost?: string | null,
): Promise<{
  exists: boolean;
  keysetRefGuard?: { ns: string; ksn: string };
}> => {
  const apiHost = getPactHost(network, version, instance, chainId, customHost);
  const createTime = () => Math.round(Date.now() / 1000) - 60;

  try {
    const modDetails = await Pact.fetch.local(
      {
        keyPairs: [],
        pactCode: `(${moduleName}.details ${JSON.stringify(receiver)})`,
        meta: Pact.lang.mkMeta(
          'not-real',
          chainId,
          0.00001,
          2500,
          createTime(),
          600,
        ),
      },
      apiHost,
    );
    if (modDetails?.result?.status === 'success') {
      const keysetRefGuard = getKeysetRefGuardFromDetails(modDetails);
      if (keysetRefGuard) return { exists: true, keysetRefGuard };
    }
  } catch {}

  if (moduleName !== 'coin') {
    try {
      const coinDetails = await Pact.fetch.local(
        {
          keyPairs: [],
          pactCode: `(coin.details ${JSON.stringify(receiver)})`,
          meta: Pact.lang.mkMeta(
            'not-real',
            chainId,
            0.00001,
            2500,
            createTime(),
            600,
          ),
        },
        apiHost,
      );
      if (coinDetails?.result?.status === 'success') {
        const keysetRefGuard = getKeysetRefGuardFromDetails(coinDetails);
        if (keysetRefGuard) return { exists: false, keysetRefGuard };
      }
    } catch {}
  }

  return { exists: false };
};
