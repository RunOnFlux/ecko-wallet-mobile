import type {
  BuildTransactionResult,
  SignTransactionResult,
  TransferCrossChainTxParams,
  TransferTxParams,
} from 'hw-app-kda/lib/Kadena';

export type LedgerExternalApi = {
  signHash: (hash: string) => Promise<SignTransactionResult | undefined>;
  signTransferCreateTx: (params: TransferTxParams) => Promise<BuildTransactionResult | undefined>;
  signTransferCrossChainTx: (params: TransferCrossChainTxParams) => Promise<BuildTransactionResult | undefined>;
};

let currentApi: LedgerExternalApi | null = null;

export function registerLedgerApi(api: LedgerExternalApi) {
  currentApi = api;
}

export function unregisterLedgerApi() {
  currentApi = null;
}

export function getLedgerApi(): LedgerExternalApi | null {
  return currentApi;
}


