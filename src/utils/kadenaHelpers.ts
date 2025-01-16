const {
  kadenaSign,
  kadenaGenMnemonic,
  kadenaGenKeypair,
  kadenaCheckMnemonic,
  kadenaMnemonicToRootKeypair,
} = require('@kadena/hd-wallet/lib/esm/chainweaver/index.js');
import {EncryptedString, kadenaEncrypt} from '@kadena/hd-wallet';
import {Pact} from '../api/pactLangApi';
import {Buffer} from 'buffer';

export const generateSeedPhrase = () => {
  return kadenaGenMnemonic();
};

export const checkValidSeedPhrase = (seedPhrase: string) => {
  return kadenaCheckMnemonic(seedPhrase);
};

export const initKadenaHelpers = async () => {
  const seeds = generateSeedPhrase();
  await getKeyPairsFromSeedPhrase(seeds, 0);
};

export function isPrivateKey(sig: string) {
  if (!sig) {
    return false;
  }
  if (sig.length === 64) {
    return true;
  }
  const secretKey: string = sig.slice(0, 64);
  const publicKey: string = sig.slice(64);
  const restored: any = Pact.crypto.restoreKeyPairFromSecretKey(secretKey);
  return restored.secretKey === secretKey && restored.publicKey === publicKey;
}

const getKeyPairsFromSeedPhraseHelper = async (
  seedPhrase: string,
  index: number,
) => {
  const root = await kadenaMnemonicToRootKeypair('', seedPhrase);
  const {publicKey, secretKey} = await kadenaGenKeypair('', root, index);
  return {
    publicKey,
    secretKey,
  };
};

export const getKeyPairsFromSeedPhrase = async (
  seedPhrase: string,
  index: number,
) => {
  for (let retries = 0; ; retries++) {
    try {
      return await getKeyPairsFromSeedPhraseHelper(seedPhrase, index);
    } catch (e) {
      if (retries < 2) {
        continue;
      } else {
        throw e;
      }
    }
  }
};

export const isKadenaEncryptedPrivateKey = (privateKey: string) =>
  privateKey.length > 256;

export const bufferToHex = (buffer: any) =>
  [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

export const getSignatureFromHash = async (
  hash: string,
  privateKey: string,
) => {
  let secretKey = privateKey;
  if (!isKadenaEncryptedPrivateKey(privateKey)) {
    const keyBuffer = Buffer.from(privateKey, 'hex');
    secretKey = await kadenaEncrypt('', keyBuffer);
  }
  const signature = await kadenaSign('', hash, secretKey as EncryptedString);
  const signatureHex = bufferToHex(signature);
  return signatureHex;
};

export async function setSignatureIfNecessary(cmdValue: any, sig: string) {
  if (!sig || !cmdValue) {
    throw new Error('Wrong Parameters: request getSignature');
  }
  if (sig.length === 64) {
    return cmdValue;
  }
  if (sig.length === 128 && isPrivateKey(sig)) {
    return cmdValue;
  }
  if (sig.length > 64) {
    const cmdHash = cmdValue.cmds[0].hash;
    const signature = await getSignatureFromHash(cmdHash, sig);
    return {
      cmds: [
        {
          ...cmdValue.cmds[0],
          sigs: [{sig: signature}],
        },
      ],
    };
  }
  return cmdValue;
}
