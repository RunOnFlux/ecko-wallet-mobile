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
let modalCallbacks: {
  setVisible: (visible: boolean) => void;
} | null = null;

export function registerLedgerApi(api: LedgerExternalApi) {
  currentApi = api;
}

export function unregisterLedgerApi() {
  currentApi = null;
}

export function registerModalCallbacks(callbacks: {
  setVisible: (visible: boolean) => void;
}) {
  modalCallbacks = callbacks;
}

export function getLedgerApi(): LedgerExternalApi | null {
  if (!currentApi) return null;

  return {
    signHash: async (hash: string) => {
      try {
        modalCallbacks?.setVisible(true);
        return await currentApi!.signHash(hash);
      } finally {
        modalCallbacks?.setVisible(false);
      }
    },
    signTransferCreateTx: async (params: TransferTxParams) => {
      try {
        modalCallbacks?.setVisible(true);
        return await currentApi!.signTransferCreateTx(params);
      } finally {
        modalCallbacks?.setVisible(false);
      }
    },
    signTransferCrossChainTx: async (params: TransferCrossChainTxParams) => {
      try {
        modalCallbacks?.setVisible(true);
        return await currentApi!.signTransferCrossChainTx(params);
      } finally {
        modalCallbacks?.setVisible(false);
      }
    },
  };
}


