import {useEffect, useState} from 'react';
import {useShallowEqualSelector} from '../../../store/utils';
import {makeSelectSelectedAccount} from '../../../store/userWallet/selectors';
import {ECKO_DEXTOOLS_API_URL} from '../../../api/constants';

export type AccountBalanceChartPoint = {
  date: string;
  totalUsdValue: number;
};

export const useAccountBalance = ({
  from,
  to,
}: {
  from: string;
  to: string;
}): {data: AccountBalanceChartPoint[]; loading: boolean} => {
  const [data, setData] = useState<AccountBalanceChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const account = selectedAccount?.accountName;

        const response = await fetch(
          `${ECKO_DEXTOOLS_API_URL}/api/account-balance-chart?account=${account}&from=${from}&to=${to}`,
        );

        if (!response.ok) throw new Error('Errore fetch account balance');

        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [selectedAccount?.accountName, from, to]);

  return {data, loading};
};
