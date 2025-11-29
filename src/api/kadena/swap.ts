import { Pact } from '../pactLangApi';
import { KADDEX_NAMESPACE } from '../constants';
import { getPactHost } from '../utils';
import { getSignatureFromHash, isPrivateKey } from '../../utils/kadenaHelpers';
import { Platform } from 'react-native';
import { DefaultQueryParams } from '../types';
import { AccountType } from '../../store/userWallet/types';
import { getLedgerApi } from '../../contexts/Ledger/service';
import { bufferToHex } from '../../contexts/Ledger';
import { getSpireKeyApi } from '../../contexts/SpireKey/service';
import { createTransactionBuilder, ChainId } from '@kadena/client';

interface SendQueryParams extends DefaultQueryParams {
  instance: string;
  version: string;
  chainId: string;
  customHost?: string | null;
  publicKey: string;
  signature: string;
  token0Amount: number;
  token1Amount: number;
  token0Address: string;
  token1Address: string;
  token0AmountWithSlippage: number;
  token1AmountWithSlippage: number;
  gasStationEnabled?: boolean;
  gasPrice?: number;
  gasLimit?: number;
  ttl?: number;
  accountName: string;
  isSwapIn: boolean;
  accountType?: AccountType;
}

const getNonceByPlatform = (platform?: string) => {
  switch (platform) {
    case 'macos':
      return `"XMS-${new Date().toISOString()}"`;
    case 'ios':
      return `"XIS-${new Date().toISOString()}"`;
    case 'android':
      return `"XAS-${new Date().toISOString()}"`;
    default:
      return `"${new Date().toISOString()}"`;
  }
};
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;
const getPairAccount = async (token0: string, token1: string, host: string) => {
  const data = await Pact.fetch.local(
    {
      pactCode: `(${KADDEX_NAMESPACE}.exchange.get-pair ${token0} ${token1})`,
      keyPairs: Pact.crypto.genKeyPair(),
      meta: Pact.lang.mkMeta('', '2', 0.0000001, 150000, creationTime(), 600),
    },
    host,
  );
  if (data.result.status === 'success') {
    return data.result.data;
  }
  return null;
};
const getTokenBalanceAccount = async (
  tokenAddress: string,
  account: string,
  host: string,
) => {
  if (account) {
    return Pact.fetch.local(
      {
        pactCode: `(${tokenAddress}.details ${JSON.stringify(account)})`,
        meta: Pact.lang.mkMeta('', '2', 0.0000001, 150000, creationTime(), 600),
      },
      host,
    );
  }
  return { result: { status: 'failure' } };
};

export const getSwap: (params: SendQueryParams) => Promise<any> = async ({
  customHost,
  network,
  instance,
  chainId,
  version,
  publicKey,
  signature,
  token0Address,
  token1Address,
  token0Amount,
  token1Amount,
  token0AmountWithSlippage,
  token1AmountWithSlippage,
  gasStationEnabled,
  gasLimit,
  gasPrice,
  ttl,
  accountName,
  isSwapIn,
  accountType,
}) => {
  if (
    !instance ||
    !network ||
    !version ||
    !publicKey ||
    (!signature &&
      accountType !== AccountType.LEDGER &&
      accountType !== AccountType.SPIREKEY) ||
    chainId === undefined ||
    !token0Amount ||
    !token1Amount ||
    !token0Address ||
    !token1Address ||
    !accountName
  ) {
    throw new Error('Wrong Parameters: request getSwap');
  }
  const accountDetails = await getTokenBalanceAccount(
    token0Address,
    accountName,
    getPactHost(network, version, instance, '2', customHost),
  );
  if (accountDetails.result.status === 'success') {
    const pair = await getPairAccount(
      token0Address,
      token1Address,
      getPactHost(network, version, instance, '2', customHost),
    );

    const accountData = accountDetails.result.data;
    const guard = accountData.guard;
    const isKeysetRef = guard?.keysetref || (!guard?.keys && !guard?.pred);
    const keysetRefString = guard?.keysetref
      ? typeof guard.keysetref === 'string'
        ? guard.keysetref
        : `${guard.keysetref.ns}.${guard.keysetref.ksn}`
      : null;

    const userKsGuardCode =
      isKeysetRef && keysetRefString
        ? `(keyset-ref-guard "${keysetRefString}")`
        : `(read-keyset 'user-ks)`;

    const inPactCode = `(${KADDEX_NAMESPACE}.exchange.swap-exact-in
              (read-decimal 'token0Amount)
              (read-decimal 'token1AmountWithSlippage)
              [${token0Address} ${token1Address}]
              ${JSON.stringify(accountName)}
              ${JSON.stringify(accountName)}
              ${userKsGuardCode}
            )`;
    const outPactCode = `(${KADDEX_NAMESPACE}.exchange.swap-exact-out
              (read-decimal 'token1Amount)
              (read-decimal 'token0AmountWithSlippage)
              [${token0Address} ${token1Address}]
              ${JSON.stringify(accountName)}
              ${JSON.stringify(accountName)}
              ${userKsGuardCode}
            )`;

    let cmd: any;
    try {
      const gasCap = gasStationEnabled
        ? Pact.lang.mkCap(
            'Gas Station',
            'free gas',
            `${KADDEX_NAMESPACE}.gas-station.GAS_PAYER`,
            ['kaddex-free-gas', { int: 1 }, 1.0],
          )
        : Pact.lang.mkCap('gas', 'pay gas', 'coin.GAS');

      const transferCap = Pact.lang.mkCap(
        'transfer capability',
        'transfer token in',
        `${token0Address}.TRANSFER`,
        [
          accountName,
          pair.account,
          isSwapIn ? +token0Amount : +token0AmountWithSlippage,
        ],
      );

      if (!accountDetails.result?.data) {
        throw new Error('Account details data not found');
      }

      if (!guard) {
        throw new Error('Guard not found in account details');
      }

      const signingPubKeyFromGuard = guard.keys?.[0];
      if (!signingPubKeyFromGuard && accountType !== AccountType.SPIREKEY) {
        console.error('[swap] No keys found in guard');
        throw new Error('No keys found in guard');
      }

      const finalSigningPubKey =
        accountType === AccountType.SPIREKEY
          ? publicKey
          : signingPubKeyFromGuard;

      let userKsGuard: any;
      let envData: any = {
        token0Amount: +token0Amount,
        token1Amount: +token1Amount,
        token0AmountWithSlippage: +token0AmountWithSlippage,
        token1AmountWithSlippage: +token1AmountWithSlippage,
      };

      if (!isKeysetRef || !keysetRefString) {
        if (
          accountType === AccountType.SPIREKEY &&
          (!guard.keys || !guard.pred)
        ) {
          const spire = getSpireKeyApi();
          const webAuthnKey =
            spire.getWebAuthnPublicKey?.() || finalSigningPubKey;
          userKsGuard = {
            pred: 'keys-any',
            keys: [webAuthnKey],
          };
        } else {
          userKsGuard = guard;
        }
        envData['user-ks'] = userKsGuard;
      }

      cmd = {
        pactCode: isSwapIn ? inPactCode : outPactCode,
        caps: [gasCap, transferCap],
        sender: gasStationEnabled ? 'kaddex-free-gas' : accountName,
        gasLimit: Number(gasLimit) || 10000,
        gasPrice: Number(gasPrice) || 0.000001,
        ttl: Number(ttl) || 600,
        chainId,
        envData,
        signingPubKey: finalSigningPubKey,
        networkId: instance,
        networkVersion: version,
      };
    } catch (error) {
      throw error;
    }

    const meta = Pact.lang.mkMeta(
      cmd.sender,
      cmd.chainId.toString(),
      cmd.gasPrice,
      cmd.gasLimit,
      Math.round(new Date().getTime() / 1000) - 50,
      cmd.ttl,
    );
    const clist = cmd.caps ? cmd.caps.map((c: any) => c.cap) : [];

    let signedCmd: any;

    if (accountType === AccountType.LEDGER) {
      const ledgerApi = getLedgerApi();
      if (!ledgerApi) {
        throw new Error('Ledger not connected');
      }

      const keyPairs: any = {
        publicKey,
        clist: clist.length > 0 ? clist : undefined,
      };

      signedCmd = Pact.api.prepareExecCmd(
        keyPairs,
        getNonceByPlatform(Platform.OS),
        cmd.pactCode,
        cmd.envData,
        meta,
        cmd.networkId,
      );

      const signHashResult = await ledgerApi.signHash(signedCmd.hash);

      if (!signHashResult?.signature) {
        throw new Error('Ledger signing failed');
      }

      signedCmd.sigs = [{ sig: bufferToHex(signHashResult.signature as any) }];
    } else if (accountType === AccountType.SPIREKEY) {
      let tx = createTransactionBuilder()
        .execution(cmd.pactCode)
        .setMeta({
          senderAccount: cmd.sender,
          chainId: chainId as ChainId,
          gasLimit: meta.gasLimit,
          gasPrice: meta.gasPrice,
          ttl: meta.ttl,
          creationTime: meta.creationTime,
        })
        .setNetworkId(cmd.networkId);

      if (cmd.envData) {
        Object.entries(cmd.envData).forEach(([key, value]) => {
          tx = tx.addData(key, value as any);
        });
      }

      tx = tx.addSigner(
        {
          pubKey: publicKey,
          scheme: 'WebAuthn',
        },
        (withCap: any) => {
          if (clist.length > 0) {
            return clist.map((cap: any) => {
              if (cap.args && cap.args.length > 0) {
                return (withCap as any)(cap.name, ...cap.args);
              }
              return (withCap as any)(cap.name);
            });
          }
          return [];
        },
      );

      const rawTransaction = tx.createTransaction();
      const unsignedCmd = [rawTransaction];

      try {
        const spire = getSpireKeyApi();
        const signed = await spire.sign(unsignedCmd);

        if (Array.isArray(signed) && signed.length > 0) {
          signedCmd = signed[0];
        } else if (signed) {
          signedCmd = signed;
        } else {
          throw new Error('No signed transaction received from SpireKey');
        }
      } catch (error) {
        throw error;
      }
    } else {
      const privateKey =
        signature.length === 128 && isPrivateKey(signature)
          ? signature.slice(0, 64)
          : signature.length === 64
            ? signature
            : null;
      const keyPairs: any = {
        publicKey,
        secretKey: privateKey,
      };
      if (clist.length > 0) {
        keyPairs.clist = clist;
      }
      signedCmd = Pact.api.prepareExecCmd(
        keyPairs,
        getNonceByPlatform(Platform.OS),
        cmd.pactCode,
        cmd.envData,
        meta,
        cmd.networkId,
      );
      if (signature.length > 64) {
        const sig = getSignatureFromHash(signedCmd.hash, signature);
        signedCmd.sigs = [{ sig }];
      }
    }

    const sendBody = JSON.stringify({
      cmds: [signedCmd],
    });

    const resultResponse = await fetch(
      `${getPactHost(
        network,
        version,
        instance,
        chainId,
        customHost,
      )}/api/v1/send`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: sendBody,
      },
    );

    if (resultResponse.status >= 400) {
      const errorText = await resultResponse.text();
      throw new Error(errorText);
    }

    const result = await resultResponse.json();
    return result;
  } else {
    throw new Error('Wrong Parameters: request getSwap');
  }
};
