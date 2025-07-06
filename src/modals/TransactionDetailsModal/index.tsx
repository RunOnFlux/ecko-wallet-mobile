import React, {FC, useCallback, useMemo} from 'react';
import {View, Text, Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import Modal from '../../components/Modal';
import AccountFromTo from '../../components/AccountFromTo';
import {TTransactionDetailsModalProps} from './types';
import {makeSelectSelectedAccount} from '../../store/userWallet/selectors';
import Clipboard from '@react-native-clipboard/clipboard';
import Snackbar from 'react-native-snackbar';
import {useShallowEqualSelector} from '../../store/utils';
import {numberWithCommas} from '../../utils/stringHelpers';
import Button from '../../screens/Wallet/components/WalletBalance/components/Button';
import {makeSelectActiveNetworkDetails} from '../../store/networks/selectors';
import {useAppThemeContext} from '../../contexts';
import {makeStyles} from './styles';

const TransactionDetailsModal: FC<TTransactionDetailsModalProps> = React.memo(
  ({details, toggle, isVisible}) => {
    const {t} = useTranslation();
    const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
    const networkDetail = useShallowEqualSelector(
      makeSelectActiveNetworkDetails,
    );
    const networkSlug = networkDetail?.network;
    // todo: save networkId into local txs
    const isPending =
      details?.status === 'pending' ||
      (details?.continuation?.step || 0) <
        (details?.continuation?.stepCount || 0) - 1;
    const isFailed = details?.status === 'failure';

    const onPressCopy = useCallback(() => {
      if (details?.requestKey) {
        Clipboard.setString(details?.requestKey);
        Snackbar.show({
          text: 'Request key copied to clipboard!',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    }, [details?.requestKey]);

    const onPressCopySource = useCallback(() => {
      if (details?.sourceRequestKey) {
        Clipboard.setString(details?.sourceRequestKey);
        Snackbar.show({
          text: 'Request key copied to clipboard!',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    }, [details?.requestKey]);

    const amountText = useMemo(
      () =>
        `${
          details?.type === 'SWAP'
            ? ''
            : selectedAccount?.accountName === details?.sender
            ? '- '
            : selectedAccount?.accountName === details?.receiver
            ? '+ '
            : ''
        }${
          details?.amountFrom
            ? details?.amountTo
              ? `${numberWithCommas(details?.amountFrom?.toFixed(2) || '')} ${
                  details?.coinFrom || ''
                } → ${numberWithCommas(details?.amountTo?.toFixed(4) || '')} ${
                  details?.coinTo || ''
                }`
              : `${numberWithCommas(details?.amountFrom?.toFixed(4) || '')} ${
                  details?.coinFrom || ''
                }`
            : `${numberWithCommas(details?.amount || '')} ${
                details?.coinShortName || ''
              }`
        }`,
      [details, selectedAccount?.accountName],
    );

    const handlePress = async () => {
      const requestKey = details?.requestKey;
      const url = `https://explorer.chainweb.com/${
        networkSlug || 'mainnet'
      }/txdetail/${requestKey}`;
      await Linking.openURL(url);
    };

    const {theme} = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={t('transactionDetails.modalTitle')}>
        <View style={styles.content}>
          <View style={styles.textsWrapper}>
            <Text
              style={[
                styles.title,
                isFailed && styles.titleRed,
                isPending && styles.titleBlack,
              ]}>
              {amountText}
            </Text>
            <Text style={styles.text}>
              {t('transactionDetails.gas', {gas: details?.gas})}
            </Text>
          </View>
        </View>
        {details?.type !== 'SWAP' &&
        details?.sourceChainId &&
        details?.targetChainId &&
        details?.sender &&
        details?.receiver ? (
          <AccountFromTo
            fromAccount={details?.sender}
            toAccount={details?.receiver}
            fromChainId={details?.sourceChainId}
            toChainId={details?.targetChainId}
          />
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.statusLabel}>
            {t('transactionDetails.statusLabel')}
          </Text>
          <View style={styles.statusWrapper}>
            <Text style={styles.statusText}>{details?.status || ''}</Text>
            <Text style={styles.time}>{details?.time}</Text>
          </View>
          {!details?.type ? (
            <>
              <Text style={styles.contKeyTitle}>
                {t('transactionDetails.continuationTitle')}
              </Text>
              <Text style={styles.contKeyText}>
                {details?.continuation
                  ? t('transactionDetails.continuationValue', {
                      step: (details?.continuation.step || 0) + 1,
                      total: details?.continuation.stepCount || 1,
                    })
                  : t('transactionDetails.no')}
              </Text>
            </>
          ) : null}
          {details?.type ? (
            <>
              <Text style={styles.requestKeyTitle}>
                {t('transactionDetails.requestKeyTitle')}
              </Text>
              <Text onPress={onPressCopy} style={styles.requestKeyText}>
                {details?.requestKey || ''}
              </Text>
              <Text style={styles.requestKeyTitle}>
                {t('transactionDetails.transactionTypeTitle')}
              </Text>
              <Text onPress={onPressCopy} style={styles.requestKeyText}>
                {details?.type || ''}
              </Text>
            </>
          ) : details?.sourceRequestKey ? (
            <>
              <Text style={styles.requestKeyTitle}>
                {t('transactionDetails.requestKeyChainTitle', {
                  chain: details?.sourceChainId,
                })}
              </Text>
              <Text onPress={onPressCopySource} style={styles.requestKeyText}>
                {details?.sourceRequestKey || ''}
              </Text>
              <Text style={styles.requestKeyTitle}>
                {t('transactionDetails.requestKeyChainTitle', {
                  chain: details?.targetChainId,
                })}
              </Text>
              <Text onPress={onPressCopy} style={styles.requestKeyText}>
                {details?.requestKey || ''}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.requestKeyTitle}>
                {t('transactionDetails.requestKeyTitle')}
              </Text>
              <Text onPress={onPressCopy} style={styles.requestKeyText}>
                {details?.requestKey || ''}
              </Text>
            </>
          )}
          <Button
            title={t('transactionDetails.txDetailsButton')}
            onPress={handlePress}
            style={styles.button}
          />
        </View>
      </Modal>
    );
  },
);

export default TransactionDetailsModal;
