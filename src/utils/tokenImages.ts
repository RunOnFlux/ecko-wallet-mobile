import { ECKO_DEXTOOLS_API_URL } from '../api/constants';

export const getTokenImageUrl = (contractOrSymbol: string) =>
  `${ECKO_DEXTOOLS_API_URL}/api/token-icon?token=${encodeURIComponent(
    contractOrSymbol,
  )}`;
