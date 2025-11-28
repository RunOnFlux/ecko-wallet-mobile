import { DefaultQueryParams } from '../types';
import {
  isPrivateKey,
  setSignatureIfNecessary,
} from '../../utils/kadenaHelpers';
import { Pact } from '../pactLangApi';
import { Platform } from 'react-native';
import { getAccount } from './account';
import { isRAccount, fetchGuardForRAccount } from './rAccount';
import { convertDecimal } from '../../utils/numberHelpers';
import { getPactHost } from '../utils';
import { AccountType } from '../../store/userWallet/types';
import { getLedgerApi } from '../../contexts/Ledger/service';
import { getSpireKeyApi } from '../../contexts/SpireKey/service';
import { createTransactionBuilder, ChainId } from '@kadena/client';

interface TransferCrossQueryParams extends DefaultQueryParams {
  instance: string;
  version: string;
  sender: string;
  receiver: string;
  sourceChainId: string;
  targetChainId: string;
  publicKey: string;
  signature: string;
  amount: number;
  gasPrice?: number;
  gasLimit?: number;
  token?: number;
  customHost?: string;
  receiverPublicKey?: number;
  predicate?: number;
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

export const getTransferCross: (
  params: TransferCrossQueryParams,
) => Promise<any> = async ({
  customHost,
  signature,
  publicKey,
  network,
  instance,
  version,
  gasPrice,
  gasLimit,
  token,
  sender,
  receiver,
  amount,
  sourceChainId,
  targetChainId,
  predicate,
  receiverPublicKey,
  accountType,
}) => {
  if (
    !network ||
    !version ||
    !instance ||
    !sender ||
    !receiver ||
    sourceChainId === undefined ||
    targetChainId === undefined ||
    !amount ||
    (!publicKey && accountType !== AccountType.SPIREKEY)
  ) {
    throw new Error('Wrong Parameters: request getCrossChain');
  }

  if (accountType === AccountType.LEDGER) {
    const ledgerApi = getLedgerApi();
    if (!ledgerApi) {
      throw new Error('Ledger not connected');
    }

    const ledgerParams = {
      recipient: receiver,
      recipient_chainId: Number(targetChainId),
      namespace:
        token && token !== 'coin'
          ? (token as unknown as string).split('.')[0]
          : undefined,
      module:
        token && token !== 'coin'
          ? (token as unknown as string).split('.')[1]
          : undefined,
      amount: amount.toString(),
      chainId: Number(sourceChainId),
      network: instance,
      gasPrice: (Number(gasPrice) || 0.00001).toString(),
      gasLimit: Math.max(Number(gasLimit) || 2500, 2500).toString(),
      nonce: `XM-${new Date().toISOString()}`,
    };

    const result = await ledgerApi.signTransferCrossChainTx({
      path: "m/44'/626'/0'/0/0",
      ...ledgerParams,
    });

    if (!result?.pact_command) {
      throw new Error('Ledger signing failed');
    }

    return result.pact_command;
  }

  if (accountType === AccountType.SPIREKEY) {
    const meta = Pact.lang.mkMeta(
      sender,
      sourceChainId,
      Number(gasPrice) || 0.00001,
      Math.max(Number(gasLimit) || 2500, 2500),
      Math.round(new Date().getTime() / 1000) - 50,
      28800,
    );
    let hasXChainCapability = false;
    try {
      const interfaces = await Pact.fetch.local(
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
      if (interfaces?.result?.data && Array.isArray(interfaces?.result?.data)) {
        if (
          interfaces?.result?.data?.some(
            (moduleInterface: string) =>
              moduleInterface === 'fungible-xchain-v1',
          )
        ) {
          hasXChainCapability = true;
        }
      }
    } catch {}
    if ((token || 'coin') !== 'coin' && !hasXChainCapability) {
      throw new Error('token-no-xchain');
    }
    const moduleName = token || 'coin';
    let signingPubKey = publicKey;

    const webAuthnKey = getSpireKeyApi().getWebAuthnPublicKey?.();
    if (webAuthnKey) {
      signingPubKey = webAuthnKey;
    } else {
      try {
        if (!signingPubKey) {
          const senderInfo = await getAccount({
            network,
            instance,
            version,
            chainId: sourceChainId,
            accountName: sender,
            customHost,
          });
          signingPubKey = senderInfo?.publicKey || signingPubKey;
        }
      } catch {}
    }
    const keyPair: any = [
      {
        publicKey: signingPubKey,
        clist: [],
      },
    ];
    if (hasXChainCapability) {
      keyPair[0].clist.push({ name: 'coin.GAS', args: [] });
      keyPair[0].clist.push({
        name: `${moduleName}.TRANSFER_XCHAIN`,
        args: [sender, receiver, Number(amount), targetChainId],
      });
    }
    let pactCode = '';
    let envData: any = undefined;
    if (isRAccount(receiver)) {
      const { keysetRefGuard } = await fetchGuardForRAccount(
        receiver,
        moduleName?.toString(),
        network,
        version,
        instance,
        sourceChainId,
        customHost,
      );
      pactCode = `(${moduleName}.transfer-crosschain ${JSON.stringify(
        sender,
      )} ${JSON.stringify(receiver)} (keyset-ref-guard ${JSON.stringify(
        `${keysetRefGuard!.ns}.${keysetRefGuard!.ksn}`,
      )}) ${JSON.stringify(targetChainId)} ${convertDecimal(amount)})`;
    } else {
      pactCode = `(${moduleName}.transfer-crosschain ${JSON.stringify(
        sender,
      )} ${JSON.stringify(receiver)} (read-keyset "ks") ${JSON.stringify(
        targetChainId,
      )} ${convertDecimal(amount)})`;
      
      if (receiver.startsWith('k:') && receiver.length === 66) {
        envData = {
          ks: {
            pred: predicate || 'keys-all',
            keys: [receiver.slice(2)],
          },
        };
      } else {
        // For non-k: accounts, try to get receiver info
        try {
          const receiverInfoResponse = await getAccount({
            network,
            instance,
            version,
            chainId: targetChainId,
            accountName: receiver,
            customHost,
          });
          if (receiverInfoResponse && receiverInfoResponse.publicKey) {
            envData = {
              ks: {
                pred: predicate || 'keys-all',
                keys: [receiverInfoResponse.publicKey],
              },
              };
            } else {
              throw new Error(
                'Receiving account does not exist. You must specify a keyset to create this account.',
              );
            }
          } catch (e) {
            throw new Error(
              'Failed to retrieve receiver account information. Cannot proceed with crosschain transfer.',
            );
          }
      }
    }
    
    let tx = createTransactionBuilder()
      .execution(pactCode)
      .setMeta({
        senderAccount: sender,
        chainId: sourceChainId as ChainId,
        gasLimit: meta.gasLimit,
        gasPrice: meta.gasPrice,
        ttl: meta.ttl,
        creationTime: meta.creationTime,
      })
      .setNetworkId(instance);

    if (envData) {
      Object.entries(envData).forEach(([key, value]) => {
        tx = tx.addData(key, value as any);
      });
    }

    const capabilities = hasXChainCapability
      ? [
          (withCap: any) => withCap('coin.GAS'),
          (withCap: any) =>
            withCap(`${moduleName}.TRANSFER_XCHAIN`, sender, receiver, Number(amount), targetChainId),
        ]
      : [
          (withCap: any) => withCap('coin.GAS'),
          (withCap: any) =>
            withCap(`${moduleName}.TRANSFER_XCHAIN`, sender, receiver, Number(amount), targetChainId),
        ];

    tx = tx.addSigner(
      {
        pubKey: signingPubKey,
        scheme: 'WebAuthn',
      },
      (withCap: any) => capabilities.map((cap) => cap(withCap)),
    );

    const rawTransaction = tx.createTransaction();
    const createdCommand = { cmds: [rawTransaction] };

    const spire = getSpireKeyApi();
    const signed = await spire.sign(createdCommand);
    
    if (Array.isArray(signed) && signed.length > 0) {
      return signed[0];
    }
    
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
  let hasXChainCapability = false;
  try {
    const interfaces = await Pact.fetch.local(
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
    if (interfaces?.result?.data && Array.isArray(interfaces?.result?.data)) {
      if (
        interfaces?.result?.data?.some(
          (moduleInterface: string) => moduleInterface === 'fungible-xchain-v1',
        )
      ) {
        hasXChainCapability = true;
      }
    }
  } catch (e) {}
  if ((token || 'coin') !== 'coin' && !hasXChainCapability) {
    throw new Error('token-no-xchain');
  }

  const keyPair: any = [
    {
      publicKey,
      secretKey: privateKey,
      clist: [],
    },
  ];
  if (hasXChainCapability) {
    keyPair[0].clist.push({
      name: 'coin.GAS',
      args: [],
    });
    keyPair[0].clist.push({
      name: `${token || 'coin'}.TRANSFER_XCHAIN`,
      args: [sender, receiver, Number(amount), targetChainId],
    });
  }
  const moduleName = token || 'coin';
  let pactCode: string = '';
  if (isRAccount(receiver)) {
    const { keysetRefGuard } = await fetchGuardForRAccount(
      receiver,
      moduleName?.toString(),
      network,
      version,
      instance,
      sourceChainId,
      customHost,
    );
    pactCode = `(${moduleName}.transfer-crosschain ${JSON.stringify(
      sender,
    )} ${JSON.stringify(receiver)} (keyset-ref-guard ${JSON.stringify(
      `${keysetRefGuard!.ns}.${keysetRefGuard!.ksn}`,
    )}) ${JSON.stringify(targetChainId)} ${convertDecimal(amount)})`;
    const createdCommand = Pact.simple.exec.createCommand(
      keyPair as any[],
      getNonceByPlatform(Platform.OS),
      pactCode,
      undefined,
      meta,
      instance,
    );
    return setSignatureIfNecessary(createdCommand, signature);
  } else {
    pactCode = `(${moduleName}.transfer-crosschain ${JSON.stringify(
      sender,
    )} ${JSON.stringify(receiver)} (read-keyset "ks") ${JSON.stringify(
      targetChainId,
    )} ${convertDecimal(amount)})`;
  }

  if (!receiverPublicKey) {
    try {
      const receiverInfoResponse = await getAccount({
        network,
        instance,
        version,
        chainId: targetChainId,
        accountName: receiver,
        customHost,
      });

      if (!receiverInfoResponse) {
        if (receiver.startsWith('k:') && receiver.length === 66) {
          const createdCommand = Pact.simple.exec.createCommand(
            keyPair as any[],
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
          keyPair as any[],
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
          keyPair as any[],
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
      keyPair as any[],
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
