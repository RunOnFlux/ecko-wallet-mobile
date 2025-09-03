import React, {useCallback, useMemo, useState} from 'react';
import {Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import ArrowTopRightSvg from '../../../../assets/images/arrow-top-right.svg';
import HistorySvg from '../../../../assets/images/time-history.svg';
import ArrowBottomRightSvg from '../../../../assets/images/arrow-bottom-right.svg';
import BuySvg from '../../../../assets/images/icon-buy.svg';
import Button from './components/Button';
import {makeStyles} from './styles';
import {ERootStackRoutes, TNavigationProp} from '../../../../routes/types';
import {
  makeSelectAccounts,
  makeSelectSelectedAccount,
  makeSelectUsdEquivalents,
} from '../../../../store/userWallet/selectors';
import ReceiveKDAModal from '../../../../modals/ReceiveKDAModal';
import {useNavigation} from '@react-navigation/native';
import {setSelectedToken} from '../../../../store/userWallet';
import {useShallowEqualSelector} from '../../../../store/utils';
import {TAccount, TWallet} from '../../../../store/userWallet/types';
import {numberWithCommas} from '../../../../utils/stringHelpers';
import {useAppThemeContext} from '../../../../contexts';
import RoundedButton from '../../../../components/RoundedButton';

const WalletBalance = React.memo(() => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
  const dispatch = useDispatch();

  const accounts = useShallowEqualSelector(makeSelectAccounts);
  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const usdEquivalents = useShallowEqualSelector(makeSelectUsdEquivalents);

  const kdaWallet = useMemo(
    () =>
      selectedAccount?.wallets?.find(
        (item: TWallet) => item.tokenAddress === 'coin',
      ),
    [selectedAccount],
  );

  const balanceUsd = useMemo(() => {
    const totalBalanceForAccount = (selectedAccount?.wallets || []).reduce(
      (accumAcc: number, walletItem: TWallet) => {
        const usdEquivalent = Array.isArray(usdEquivalents)
          ? usdEquivalents?.find(item => item.token === walletItem.tokenAddress)
              ?.usd || 0
          : 0;
        accumAcc += Number(walletItem.totalAmount) * Number(usdEquivalent);
        return accumAcc;
      },
      0,
    );
    return totalBalanceForAccount || 0;
  }, [selectedAccount, usdEquivalents]);

  const balanceUsdTotal = useMemo(() => {
    const totalBalanceForAccounts = (accounts || []).reduce(
      (accum: number, account: TAccount) => {
        const totalBalanceForAccountItem = (account.wallets || []).reduce(
          (accumAcc: number, walletItem: TWallet) => {
            const usdEquivalent = Array.isArray(usdEquivalents)
              ? usdEquivalents?.find(
                  item => item.token === walletItem.tokenAddress,
                )?.usd || 0
              : 0;
            accumAcc += Number(walletItem.totalAmount) * Number(usdEquivalent);
            return accumAcc;
          },
          0,
        );
        accum += totalBalanceForAccountItem;
        return accum;
      },
      0,
    );
    return totalBalanceForAccounts || 0;
  }, [accounts, usdEquivalents]);

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [isKdaModalVisible, setKdaModalVisible] = useState(false);

  const handlePressSend = useCallback(() => {
    dispatch(setSelectedToken(kdaWallet));
    setTimeout(
      () =>
        navigation.navigate({
          name: ERootStackRoutes.Send,
          params: {sourceChainId: '0'},
        }),
      300,
    );
  }, [kdaWallet, navigation, dispatch]);

  const handlePressReceive = useCallback(() => {
    setKdaModalVisible(true);
  }, []);

  const handlePressBuy = useCallback(() => {
    navigation?.navigate({
      name: ERootStackRoutes.Buy,
    });
  }, []);

  const handlePressHistory = useCallback(() => {
    navigation.navigate(ERootStackRoutes.History);
  }, [navigation]);

  const closeKdaModal = useCallback(() => {
    setKdaModalVisible(false);
  }, []);

  const totalBalanceUsd = useMemo(() => {
    return Number(balanceUsdTotal || 0).toFixed(2);
  }, [balanceUsdTotal]);

  const accountBalanceUsd = useMemo(() => {
    return Number(balanceUsd || 0).toFixed(2);
  }, [balanceUsd]);

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.netWorthContainer}>
          <Text style={styles.netWorthHeader}>
            {t('wallet.walletBalance.netWorth')}
          </Text>
          <Text style={styles.netWorth}>
            {`$ ${numberWithCommas(totalBalanceUsd)}`}
          </Text>
        </View>
        <Text style={styles.balanceHeader}>
          {t('wallet.walletBalance.accountBalance')}
        </Text>
        <Text style={styles.balance}>
          {`$ ${numberWithCommas(accountBalanceUsd)}`}
        </Text>
        <View style={styles.buttonsWrapper}>
          <RoundedButton
            onPress={handlePressSend}
            label={t('wallet.walletBalance.send')}
            icon={<ArrowTopRightSvg fill="#FFA900" />}
            variant="primary"
          />
          <RoundedButton
            onPress={handlePressReceive}
            label={t('wallet.walletBalance.receive')}
            icon={<ArrowBottomRightSvg fill="#FFA900" />}
            variant="secondary"
          />
          <RoundedButton
            onPress={handlePressBuy}
            label={t('wallet.walletBalance.buy')}
            icon={<BuySvg fill="#C30AE3" />}
            variant="brand"
          />
          <RoundedButton
            onPress={handlePressHistory}
            label={t('tabs.History')}
            icon={<HistorySvg fill="#787B8E" />}
            variant="empty"
          />
        </View>
      </View>
      <ReceiveKDAModal isVisible={isKdaModalVisible} close={closeKdaModal} />
    </>
  );
});

export default WalletBalance;
