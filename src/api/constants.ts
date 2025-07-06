export const DEV_NETWORK_API_URL = 'https://devnet.eckowallet.com';
export const TEST_NETWORK_API_URL = 'https://api.testnet.chainweb.com';
export const MAIN_NETWORK_API_URL = 'https://chainweb.eckowallet.com';
export const KADDEX_NAMESPACE = 'kaddex';
export const ECKO_API_URL = 'https://api.eckowallet.com';
export const ECKO_DEXTOOLS_API_URL = 'https://api-dexscan.eckowallet.com';

export const defaultHeader = {
  Accept: '*/*',
};

export const blockJsonHeader = {
  Accept: 'application/json;blockheader-encoding=object',
};

export const jsonHeader = {
  Accept: 'application/json',
};

export const contentHeader = {
  'Content-Type': 'application/json',
};

export const defaultChainIds = Array.from({length: 20}, (_, i) => `${i}`);

export const nonTransferableTokens = ['kaddex.skdx'];
