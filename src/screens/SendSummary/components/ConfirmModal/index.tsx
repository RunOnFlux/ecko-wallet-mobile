import React, {FC, useMemo} from 'react';
import {View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import Modal from '../../../../components/Modal';
import {createStyles} from './styles';
import {TConfirmModal} from './types';
import Button from '../../../Wallet/components/WalletBalance/components/Button';
import AccountFromTo from '../../../../components/AccountFromTo';
import {useShallowEqualSelector} from '../../../../store/utils';
import {
  makeSelectSelectedAccount,
  makeSelectSelectedToken,
} from '../../../../store/userWallet/selectors';
import {
  makeSelectEstimatedGasFee,
  makeSelectGatheredInfo,
  makeSelectIsCrossChainTransfer,
} from '../../../../store/transfer/selectors';
import Warning from '../../../../components/Warning';
import {useSelector} from 'react-redux';
import {useSafeAreaValues} from '../../../../utils/deviceHelpers';
import {useAppThemeContext} from '../../../../contexts';

const ConfirmModal: FC<TConfirmModal> = ({isVisible, close, onConfirm}) => {
  const {t} = useTranslation();
  const sourceAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const selectedToken = useShallowEqualSelector(makeSelectSelectedToken);
  const gatheredInfo = useShallowEqualSelector(makeSelectGatheredInfo);
  const estimatedGas = useShallowEqualSelector(makeSelectEstimatedGasFee);
  const isCrossChainTransfer = useSelector(makeSelectIsCrossChainTransfer);
  const {gasLimit, gasPrice, speed} = estimatedGas;

  const {statusBarHeight} = useSafeAreaValues();
  const {theme} = useAppThemeContext();
  const styles = useMemo(
    () => createStyles(theme, {statusBarHeight}),
    [theme, statusBarHeight],
  );

  return (
    <Modal
      isVisible={isVisible}
      close={close}
      title={t('sendSummary.confirmModal.title')}
      contentStyle={styles.content}>
      <View style={styles.container}>
        <AccountFromTo
          fromAccount={sourceAccount?.accountName!}
          toAccount={gatheredInfo?.destinationAccount?.accountName!}
          fromChainId={gatheredInfo?.chainId}
          toChainId={gatheredInfo?.destinationAccount?.chainId!}
        />
        <View style={styles.detailContainer}>
          <View style={styles.item}>
            <Text style={styles.title}>
              {t('sendSummary.confirmModal.amountLabel')}
            </Text>
            <Text style={styles.text}>
              {`${gatheredInfo?.amount || 0} ${selectedToken?.tokenName || ''}`}
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.title}>
              {t('sendSummary.confirmModal.gasLimitLabel')}
            </Text>
            <Text style={styles.text}>{gasLimit}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.title}>
              {t('sendSummary.confirmModal.gasPriceLabel')}
            </Text>
            <Text style={styles.text}>{gasPrice}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.title}>
              {t('sendSummary.confirmModal.speedLabel')}
            </Text>
            <Text style={styles.text}>{speed.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          {isCrossChainTransfer && (
            <Warning
              title={t('sendSummary.warning.crossChainTitle')}
              text={t('sendSummary.warning.crossChainMessage')}
            />
          )}
          <Button
            style={styles.button}
            onPress={onConfirm}
            title={t('sendSummary.confirmModal.confirmButton')}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
