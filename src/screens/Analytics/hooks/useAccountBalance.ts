import { useEffect, useState } from 'react';
import { useShallowEqualSelector } from '../../../store/utils';
import {
  makeSelectSelectedAccount,
  makeSelectSelectedAccountPublicKey,
} from '../../../store/userWallet/selectors';
import { ECKO_DEXTOOLS_API_URL } from '../../../api/constants';
import { getSignatureFromHash } from '../../../utils/kadenaHelpers';
import { Pact } from '../../../api/pactLangApi';

export type AccountBalanceChartPoint = {
  date: string;
  totalUsdValue: number;
};

export const useAccountBalance = ({
  from,
  to,
  refreshToken = 0,
  enabled = true,
}: {
  from: string;
  to: string;
  refreshToken?: number;
  enabled?: boolean;
}): { data: AccountBalanceChartPoint[]; loading: boolean } => {
  const [data, setData] = useState<AccountBalanceChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const publicKey = useShallowEqualSelector(makeSelectSelectedAccountPublicKey);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const account = selectedAccount?.accountName;

        if (!enabled || !account) {
          setData([]);
          setLoading(false);
          return;
        }

        const addMeMessage = 'please-add-me-to-ecko-balance-tracking';
        const hash = Pact.crypto.hash(addMeMessage);
        const signature = selectedAccount?.privateKey
          ? getSignatureFromHash(hash, selectedAccount.privateKey)
          : undefined;

        const response = await fetch(
          `${ECKO_DEXTOOLS_API_URL}/api/account-balance-chart?account=${account}&from=${from}&to=${to}`,
          {
            headers: signature ? { 'x-signature': signature } : undefined,
          },
        );

        const json = await response.json();
        if (!response.ok) throw new Error('Error fetching account balance');
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [selectedAccount?.accountName, from, to, refreshToken, enabled]);

  return { data, loading };
};
