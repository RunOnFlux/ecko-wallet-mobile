import { useCallback } from 'react';
import { ECKO_DEXTOOLS_API_URL } from '../../../api/constants';
import { useShallowEqualSelector } from '../../../store/utils';
import {
  makeSelectSelectedAccountPublicKey,
  makeSelectSelectedAccount,
} from '../../../store/userWallet/selectors';
import { getSignatureFromHash } from '../../../utils/kadenaHelpers';
import { Pact } from '../../../api/pactLangApi';

const ADD_ME_MESSAGE = 'please-add-me-to-ecko-balance-tracking';

export const useTrackAccountBalance = () => {
  const publicKey = useShallowEqualSelector(makeSelectSelectedAccountPublicKey);
  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);

  return useCallback(
    async (accountId: string) => {
      if (!publicKey || !selectedAccount?.privateKey)
        throw new Error('Missing keys');
      const hash = Pact.crypto.hash(ADD_ME_MESSAGE);
      const signature = getSignatureFromHash(hash, selectedAccount.privateKey);

      const response = await fetch(
        `${ECKO_DEXTOOLS_API_URL}/api/account-balance-chart?account=${accountId}&from=2024-04-01&to=2024-04-30`,
        {
          headers: { 'x-signature': signature },
        },
      );
      if (!response.ok) throw new Error('Network response was not ok');
      return true;
    },
    [publicKey, selectedAccount?.privateKey],
  );
};
