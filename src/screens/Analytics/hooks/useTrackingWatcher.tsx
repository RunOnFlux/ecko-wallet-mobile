import { useEffect } from 'react';
import { useShallowEqualSelector } from '../../../store/utils';
import {
  makeSelectAccounts,
  makeSelectSelectedAccount,
} from '../../../store/userWallet/selectors';
import { makeSelectCanTrackPortfolio } from '../../../store/analytics';
import { useTrackAccountBalance } from './useTrackAccountBalance';

export const useTrackingWatcher = () => {
  const accounts = useShallowEqualSelector(makeSelectAccounts);
  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const canTrack = useShallowEqualSelector(makeSelectCanTrackPortfolio);
  const trackAccount = useTrackAccountBalance();

  useEffect(() => {
    if (!canTrack || !selectedAccount) return;
    trackAccount(selectedAccount.account).catch(() => {});
  }, [selectedAccount?.account, canTrack, trackAccount]);

  useEffect(() => {
    if (!canTrack) return;
    (accounts || []).forEach((acc: any) => {
      trackAccount(acc.account).catch(() => {});
    });
  }, [accounts?.length, canTrack, trackAccount]);
};
