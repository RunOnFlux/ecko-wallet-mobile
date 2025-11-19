import { DefaultQueryParams } from '../types';
import {
  isPrivateKey,
  setSignatureIfNecessary,
} from '../../utils/kadenaHelpers';
import { Pact } from '../pactLangApi';
import { getPactHost } from '../utils';
import { convertDecimal } from '../../utils/numberHelpers';
import { getAccount } from './account';
import { isRAccount, fetchGuardForRAccount } from './rAccount';
import { Platform } from 'react-native';
import { AccountType } from '../../store/userWallet/types';
import { getLedgerApi } from '../../contexts/Ledger/service';
import { getSpireKeyApi } from '../../contexts/SpireKey/service';

interface TransferSingleQueryParams extends DefaultQueryParams {
  instance: string;
  version: string;
  sender: string;
  receiver: string;
  sourceChainId: string;
  publicKey: string;
  signature: string;
  amount: number;
  token?: string;
  gasPrice?: number;
  gasLimit?: number;
  receiverPublicKey?: number;
  predicate?: number;
  customHost?: string;
  accountType?: AccountType;
}

const getNonceByPlatform = (platform?: string) => {
  switch (platform) {
    case 'macos':
      return `"XM-${new Date().toISOString()}"`;
    case 'ios':
      return `"XI-${new Date().toISOString()}"`;
    case 'android':
      return `"XA-${new Date().toISOString()}"`;
    default:
      return `"${new Date().toISOString()}"`;
  }
};

export const getTransferSingle: (
  params: TransferSingleQueryParams,
) => Promise<any> = async ({
  signature,
  publicKey,
  gasPrice,
  gasLimit,
  network,
  instance,
  version,
  sender,
  receiver,
  token,
  amount,
  sourceChainId,
  predicate,
  receiverPublicKey,
  customHost,
  accountType,
}) => {
  if (
    !network ||
    !version ||
    !instance ||
    !sender ||
    !receiver ||
    sourceChainId === undefined ||
    !amount ||
    (!publicKey && accountType !== AccountType.SPIREKEY)
  ) {
    throw new Error('Wrong Parameters: request getSingleChain');
  }

  if (accountType === AccountType.LEDGER) {
    const ledgerApi = getLedgerApi();
    if (!ledgerApi) {
      throw new Error('Ledger not connected');
    }

    const ledgerParams = {
      recipient: receiver,
      namespace: token && token !== 'coin' ? token.split('.')[0] : undefined,
      module: token && token !== 'coin' ? token.split('.')[1] : undefined,
      amount: amount.toString(),
      chainId: Number(sourceChainId),
      network: instance,
      gasPrice: (Number(gasPrice) || 0.00001).toString(),
      gasLimit: Math.max(Number(gasLimit) || 2500, 2500).toString(),
      nonce: `XM-${new Date().toISOString()}`,
    };

    const result = await ledgerApi.signTransferCreateTx({
      path: "m/44'/626'/0'/0/0",
      ...ledgerParams,
    });

    if (!result?.pact_command) {
      throw new Error('Ledger signing failed');
    }

    return result.pact_command;
  }

  if (accountType === AccountType.SPIREKEY) {
    console.log('[transferSingle] SpireKey account type detected');
    console.log('[transferSingle] Parameters:', {
      sender,
      receiver,
      amount,
      sourceChainId,
      publicKey,
      network,
      instance,
      version,
    });
    const meta = Pact.lang.mkMeta(
      sender,
      sourceChainId,
      Number(gasPrice) || 0.00001,
      Math.max(Number(gasLimit) || 2500, 2500),
      Math.round(new Date().getTime() / 1000) - 50,
      28800,
    );
    const moduleName = token || 'coin';
    let signingPubKey = publicKey;
    console.log('[transferSingle] Initial signingPubKey:', signingPubKey);

    const spire = getSpireKeyApi();
    const webAuthnKey = spire.getWebAuthnPublicKey?.();
    console.log('[transferSingle] WebAuthn key from SpireKey:', webAuthnKey);
    console.log('[transferSingle] spireKeyAccountRef:', spireKeyAccountRef);

    if (webAuthnKey) {
      signingPubKey = webAuthnKey;
      console.log(
        '[transferSingle] Using WebAuthn key as signingPubKey:',
        signingPubKey,
      );
    } else {
      console.log('[transferSingle] WARNING: No WebAuthn key found from SpireKey');
      try {
        if (!signingPubKey) {
          console.log(
            '[transferSingle] No publicKey provided, fetching from account...',
          );
          const senderInfo = await getAccount({
            network,
            instance,
            version,
            chainId: sourceChainId,
            accountName: sender,
            customHost,
          });
          signingPubKey = senderInfo?.publicKey || signingPubKey;
          console.log('[transferSingle] Fetched signingPubKey:', signingPubKey);
        }
      } catch (err) {
        console.log('[transferSingle] Error fetching sender account:', err);
      }
    }

    if (!signingPubKey || signingPubKey === '') {
      console.log('[transferSingle] ERROR: signingPubKey is still empty!');
      throw new Error('No public key available for SpireKey signing');
    }
    const keyPair: any = [
      {
        publicKey: signingPubKey,
        clist: [
          { name: 'coin.GAS', args: [] },
          {
            name: `${moduleName}.TRANSFER`,
            args: [sender, receiver, Number(amount)],
          },
        ],
      },
    ];

    let pactCode = `(${moduleName}.transfer-create ${JSON.stringify(
      sender,
    )} ${JSON.stringify(receiver)} (read-keyset "ks")  ${convertDecimal(
      amount,
    )})`;
    let envData: any = undefined;

    if (isRAccount(receiver)) {
      const { exists, keysetRefGuard } = await fetchGuardForRAccount(
        receiver,
        moduleName,
        network,
        version,
        instance,
        sourceChainId,
        customHost,
      );
      if (moduleName === 'coin' && !exists && !keysetRefGuard) {
        throw new Error('r-account-not-initialized');
      }
      pactCode = !exists
        ? `(${moduleName}.transfer-create ${JSON.stringify(
            sender,
          )} ${JSON.stringify(receiver)} (keyset-ref-guard ${JSON.stringify(
            `${keysetRefGuard!.ns}.${keysetRefGuard!.ksn}`,
          )}) ${convertDecimal(amount)})`
        : `(${moduleName}.transfer ${JSON.stringify(
            sender,
          )} ${JSON.stringify(receiver)} ${convertDecimal(amount)})`;
    } else {
      if (!receiverPublicKey) {
        try {
          const receiverInfoResponse = await getAccount({
            network,
            instance,
            version,
            chainId: sourceChainId,
            accountName: receiver,
            customHost,
          });
          if (receiverInfoResponse) {
            envData = {
              ks: {
                pred: predicate || 'keys-all',
                keys: [receiverInfoResponse.publicKey],
              },
            };
          } else if (receiver.startsWith('k:') && receiver.length === 66) {
            envData = {
              ks: {
                pred: predicate || 'keys-all',
                keys: [receiver.slice(2)],
              },
            };
          } else {
            throw new Error(
              'Receiving account does not exist. You must specify a keyset to create this account.',
            );
          }
        } catch {
          if (receiver.startsWith('k:') && receiver.length === 66) {
            envData = {
              ks: {
                pred: predicate || 'keys-all',
                keys: [receiver.slice(2)],
              },
            };
          } else {
            throw new Error(
              'Receiving account does not exist. You must specify a keyset to create this account.',
            );
          }
        }
      } else {
        envData = {
          ks: {
            pred: predicate || 'keys-all',
            keys: [receiverPublicKey || ''],
          },
        };
      }
    }

    console.log('[transferSingle] Creating command with:', {
      signingPubKey,
      pactCode,
      envData,
    });
    let createdCommand = Pact.simple.exec.createCommand(
      keyPair as any[],
      getNonceByPlatform(Platform.OS),
      pactCode,
      envData,
      meta,
      instance,
    );
    console.log(
      '[transferSingle] Created command:',
      JSON.stringify(createdCommand, null, 2),
    );
    try {
      if ((createdCommand as any).cmd) {
        const cmdObject = JSON.parse((createdCommand as any).cmd);
        console.log('[transferSingle] Original signers:', cmdObject.signers);
        cmdObject.signers = (cmdObject.signers || []).map((s: any) => {
          const updatedSigner = {
            ...s,
            scheme: 'WebAuthn',
          };
          if ((!updatedSigner.pubKey || updatedSigner.pubKey === '') && signingPubKey) {
            updatedSigner.pubKey = signingPubKey;
          }
          return updatedSigner;
        });
        console.log(
          '[transferSingle] Updated signers with WebAuthn:',
          cmdObject.signers,
        );
        (createdCommand as any).cmd = JSON.stringify(cmdObject);
      } else if (
        Array.isArray((createdCommand as any).cmds) &&
        (createdCommand as any).cmds[0]?.cmd
      ) {
        const inner = (createdCommand as any).cmds[0];
        const cmdObject = JSON.parse(inner.cmd);
        console.log(
          '[transferSingle] Original signers (cmds array):',
          cmdObject.signers,
        );
        cmdObject.signers = (cmdObject.signers || []).map((s: any) => {
          const updatedSigner = {
            ...s,
            scheme: 'WebAuthn',
          };
          if ((!updatedSigner.pubKey || updatedSigner.pubKey === '') && signingPubKey) {
            updatedSigner.pubKey = signingPubKey;
          }
          return updatedSigner;
        });
        console.log(
          '[transferSingle] Updated signers with WebAuthn (cmds array):',
          cmdObject.signers,
        );
        inner.cmd = JSON.stringify(cmdObject);
      }
    } catch (err) {
      console.log('[transferSingle] Error updating signers:', err);
    }
    console.log('[transferSingle] Sending command to SpireKey for signing...');
    const signed = await spire.sign(createdCommand);
    console.log('[transferSingle] Received signed command from SpireKey');
    return signed;
  }

  if (!signature) {
    throw new Error(
      'Wrong Parameters: signature is required for non-Ledger accounts',
    );
  }

  const meta = Pact.lang.mkMeta(
    sender,
    sourceChainId,
    Number(gasPrice) || 0.00001,
    Math.max(Number(gasLimit) || 2500, 2500),
    Math.round(new Date().getTime() / 1000) - 50,
    28800,
  );

  const privateKey =
    signature.length === 128 && isPrivateKey(signature)
      ? signature.slice(0, 64)
      : signature.length === 64
        ? signature
        : null;

  try {
    await Pact.fetch.local(
      {
        keyPairs: [],
        pactCode: `(at 'interfaces (describe-module "${token || 'coin'}"))`,
        meta: Pact.lang.mkMeta(
          'not-real',
          sourceChainId,
          0.00001,
          2500,
          Math.round(new Date().getTime() / 1000) - 50,
          600,
        ),
      },
      getPactHost(network, version, instance, sourceChainId, customHost),
    );
  } catch (e) {}

  const keyPair = [
    {
      publicKey,
      secretKey: privateKey,
      clist: [
        { name: 'coin.GAS', args: [] },
        {
          name: `${token || 'coin'}.TRANSFER`,
          args: [sender, receiver, Number(amount)],
        },
      ],
    },
  ];
  const moduleName = token || 'coin';

  if (isRAccount(receiver)) {
    const { exists, keysetRefGuard } = await fetchGuardForRAccount(
      receiver,
      moduleName,
      network,
      version,
      instance,
      sourceChainId,
      customHost,
    );
    if (moduleName === 'coin' && !exists && !keysetRefGuard) {
      throw new Error('r-account-not-initialized');
    }
    const pactCode = !exists
      ? `(${moduleName}.transfer-create ${JSON.stringify(sender)} ${JSON.stringify(
          receiver,
        )} (keyset-ref-guard ${JSON.stringify(
          `${keysetRefGuard!.ns}.${keysetRefGuard!.ksn}`,
        )}) ${convertDecimal(amount)})`
      : `(${moduleName}.transfer ${JSON.stringify(sender)} ${JSON.stringify(
          receiver,
        )} ${convertDecimal(amount)})`;
    const createdCommand = Pact.simple.exec.createCommand(
      keyPair,
      getNonceByPlatform(Platform.OS),
      pactCode,
      undefined,
      meta,
      instance,
    );
    return setSignatureIfNecessary(createdCommand, signature);
  }

  const pactCode = `(${moduleName}.transfer-create ${JSON.stringify(
    sender,
  )} ${JSON.stringify(receiver)} (read-keyset "ks")  ${convertDecimal(
    amount,
  )})`;

  if (!receiverPublicKey) {
    try {
      const receiverInfoResponse = await getAccount({
        network,
        instance,
        version,
        chainId: sourceChainId,
        accountName: receiver,
        customHost,
      });
      if (!receiverInfoResponse) {
        if (receiver.startsWith('k:') && receiver.length === 66) {
          const createdCommand = Pact.simple.exec.createCommand(
            keyPair,
            getNonceByPlatform(Platform.OS),
            pactCode,
            {
              ks: {
                pred: predicate || 'keys-all',
                keys: [receiver.slice(2)],
              },
            },
            meta,
            instance,
          );
          return setSignatureIfNecessary(createdCommand, signature);
        } else {
          throw new Error(
            'Receiving account does not exist. You must specify a keyset to create this account.',
          );
        }
      } else {
        const createdCommand = Pact.simple.exec.createCommand(
          keyPair,
          getNonceByPlatform(Platform.OS),
          pactCode,
          {
            ks: {
              pred: predicate || 'keys-all',
              keys: [receiverInfoResponse.publicKey],
            },
          },
          meta,
          instance,
        );
        return setSignatureIfNecessary(createdCommand, signature);
      }
    } catch (e) {
      if (receiver.startsWith('k:') && receiver.length === 66) {
        const createdCommand = Pact.simple.exec.createCommand(
          keyPair,
          getNonceByPlatform(Platform.OS),
          pactCode,
          {
            ks: {
              pred: predicate || 'keys-all',
              keys: [receiver.slice(2)],
            },
          },
          meta,
          instance,
        );
        return setSignatureIfNecessary(createdCommand, signature);
      } else {
        throw new Error(
          'Receiving account does not exist. You must specify a keyset to create this account.',
        );
      }
    }
  } else {
    const createdCommand = Pact.simple.exec.createCommand(
      keyPair,
      getNonceByPlatform(Platform.OS),
      pactCode,
      {
        ks: {
          pred: predicate || 'keys-all',
          keys: [receiverPublicKey || ''],
        },
      },
      meta,
      instance,
    );
    return setSignatureIfNecessary(createdCommand, signature);
  }
};
