import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView, TouchableOpacity, Keyboard, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import TopHeader from '../../components/TopHeader';
import FooterButton from '../../components/FooterButton';
import AccountFromTo from '../../components/AccountFromTo';
import WalletInfo from './components/WalletInfo';
import Content from './components/Content';
import Warning from '../../components/Warning';
import ConfirmModal from './components/ConfirmModal';
import {createStyles} from './styles';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {
  makeSelectEstimatedGasFee,
  makeSelectGatheredInfo,
  makeSelectIsCrossChainTransfer,
} from '../../store/transfer/selectors';
import {makeTransfer} from '../../store/transfer/actions';
import {setTransferResult} from '../../store/transfer';
import {makeSelectActiveNetworkDetails} from '../../store/networks/selectors';
import {
  makeSelectSelectedAccount,
  makeSelectSelectedToken,
} from '../../store/userWallet/selectors';
import {useShallowEqualSelector} from '../../store/utils';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import Header from '../../components/Header';

const SendSummary = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.SendSummary>>();
  const dispatch = useDispatch();

  const isCrossChainTransfer = useSelector(makeSelectIsCrossChainTransfer);
  const networkDetail = useShallowEqualSelector(makeSelectActiveNetworkDetails);
  const gatheredInfo = useShallowEqualSelector(makeSelectGatheredInfo);
  const estimatedGasFee = useShallowEqualSelector(makeSelectEstimatedGasFee);
  const sourceAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const sourceToken = useShallowEqualSelector(makeSelectSelectedToken);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const onConfirm = useCallback(() => {
    setShowConfirmationModal(false);
    if (networkDetail && sourceAccount) {
      dispatch(
        makeTransfer({
          networkDetail,
          gatheredInfo,
          sourceAccount,
          sourceToken,
          estimatedGasFee,
        }),
      );
      dispatch(setTransferResult({}));
      setTimeout(
        () =>
          navigation.navigate({
            name: ERootStackRoutes.SendProgress,
            params: undefined,
          }),
        150,
      );
    }
  }, [
    networkDetail,
    gatheredInfo,
    sourceAccount,
    sourceToken,
    estimatedGasFee,
    navigation,
    dispatch,
  ]);

  const handlePressSend = useCallback(() => {
    setShowConfirmationModal(true);
  }, []);

  return (
    <>
      <View style={styles.container}>
        <Header title={t('sendSummary.header.title')} />
        <ScrollView
          keyboardDismissMode="on-drag"
          stickyHeaderIndices={[0]}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <TopHeader>
            <AccountFromTo
              fromAccount={sourceAccount?.accountName!}
              toAccount={gatheredInfo?.destinationAccount?.accountName!}
              fromChainId={gatheredInfo?.chainId}
              toChainId={gatheredInfo?.destinationAccount?.chainId!}
            />
            <TouchableOpacity
              activeOpacity={1}
              onPress={Keyboard.dismiss}
              style={styles.topHeaderContent}>
              <WalletInfo />
              {isCrossChainTransfer && (
                <Warning
                  title={t('sendSummary.warning.crossChainTitle')}
                  text={t('sendSummary.warning.crossChainMessage')}
                />
              )}
            </TouchableOpacity>
          </TopHeader>
          <Content />
        </ScrollView>
        <View style={styles.footer}>
          <FooterButton
            title={t('sendSummary.button.send')}
            onPress={handlePressSend}
            disabled={!gatheredInfo?.amount}
          />
        </View>
      </View>
      <ConfirmModal
        isVisible={showConfirmationModal}
        close={() => setShowConfirmationModal(false)}
        onConfirm={onConfirm}
      />
    </>
  );
};

export default SendSummary;
