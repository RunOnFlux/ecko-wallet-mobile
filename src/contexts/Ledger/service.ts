export type LedgerExternalApi = {
  signHash: (hash: string) => Promise<any>;
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


