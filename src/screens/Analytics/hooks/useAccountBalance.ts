import { useEffect, useState } from 'react';
import { useShallowEqualSelector } from '../../../store/utils';
import { makeSelectSelectedAccount } from '../../../store/userWallet/selectors';
import { ECKO_DEXTOOLS_API_URL } from '../../../api/constants';

export type AccountBalanceChartPoint = {
  date: string;
  totalUsdValue: number;
};

export const useAccountBalance = ({
  from,
  to,
  refreshToken = 0,
}: {
  from: string;
  to: string;
  refreshToken?: number;
}): { data: AccountBalanceChartPoint[]; loading: boolean } => {
  const [data, setData] = useState<AccountBalanceChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const account = selectedAccount?.accountName;

        const response = await fetch(
          `${ECKO_DEXTOOLS_API_URL}/api/account-balance-chart?account=${account}&from=${from}&to=${to}`,
        );

        if (!response.ok) throw new Error('Error fetching account balance');

        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [selectedAccount?.accountName, from, to, refreshToken]);

  return { data, loading };
};
