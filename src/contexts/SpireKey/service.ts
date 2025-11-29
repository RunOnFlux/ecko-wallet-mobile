import { Linking } from 'react-native';
import { Buffer } from 'buffer';

let spireKeyAccountRef: any = undefined;

export const setSpireKeyAccountRef = (account: any) => {
  spireKeyAccountRef = account;
};

const DEFAULT_HOST_URL = 'https://spirekey.eckowallet.com';
const APP_SCHEME = 'com.kaddex.xwallet';
const CALLBACK_HOST = 'spirekey';

const buildReturnUrl = (flow: 'connect' | 'sign') =>
  `${APP_SCHEME}://${CALLBACK_HOST}?flow=${flow}`;

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString('utf-8');
};

const waitForCallback = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    const handler = ({ url }: { url: string }) => {
      try {
        const parsed = new URL(url);
        if (
          parsed.protocol.replace(':', '') === APP_SCHEME &&
          parsed.hostname === CALLBACK_HOST
        ) {
          Linking.removeAllListeners('url');
          resolve(url);
        }
      } catch {}
    };
    const to = setTimeout(
      () => {
        Linking.removeAllListeners('url');
        reject(new Error('Timeout waiting for SpireKey callback'));
      },
      5 * 60 * 1000,
    );
    Linking.addEventListener('url', (e: any) => {
      clearTimeout(to);
      handler(e);
    });
  });

async function signInternal(unsigned: any | any[]) {
  const hostUrl = DEFAULT_HOST_URL;
  const returnUrl = buildReturnUrl('sign');
  const isArray = Array.isArray(unsigned);
  const encoded = Buffer.from(JSON.stringify(unsigned)).toString('base64');
  const params = new URLSearchParams(
    isArray
      ? { transactions: encoded, returnUrl: encodeURIComponent(returnUrl) }
      : { transaction: encoded, returnUrl: encodeURIComponent(returnUrl) },
  );
  const targetUrl = `${hostUrl}/sign#${params.toString()}`;
  await Linking.openURL(targetUrl);
  const callbackUrl = await waitForCallback();
  const parsed = new URL(callbackUrl);
  const txParam =
    parsed.searchParams.get('transactions') ||
    parsed.searchParams.get('transaction');
  if (!txParam) throw new Error('No transaction(s) returned from SpireKey');
  const decoded = decodeBase64Url(txParam);
  return JSON.parse(decoded);
}

export const getSpireKeyWebAuthnPublicKey = (): string | undefined => {
  if (typeof spireKeyAccountRef === 'undefined') {
    return undefined;
  }
  const devices = spireKeyAccountRef?.devices;
  if (!devices || devices.length === 0) {
    return undefined;
  }
  const keys = devices[0]?.guard?.keys;
  if (!keys || keys.length === 0) {
    return undefined;
  }
  return keys[0];
};

export const getSpireKeyApi = () => ({
  sign: signInternal,
  getWebAuthnPublicKey: getSpireKeyWebAuthnPublicKey,
});
