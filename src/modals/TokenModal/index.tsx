import React, {FC, useCallback, useMemo} from 'react';
import {View, Alert, Text, TouchableOpacity} from 'react-native';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

import Modal from '../../components/Modal';
import {
  makeSelectNonTransferableTokenList,
  makeSelectSelectedToken,
  makeSelectUsdEquivalents,
} from '../../store/userWallet/selectors';

import {TTokenModalProps} from './types';
import {styles} from './styles';
import {ERootStackRoutes} from '../../routes/types';
import {useNavigation} from '@react-navigation/native';
import {deleteSelectedToken} from '../../store/userWallet';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useShallowEqualSelector} from '../../store/utils';
import TrashEmptySvg from '../../assets/images/trash-empty.svg';
import ArrowTopBottomRightSvg from '../../assets/images/arrow-top-right.svg';
import Warning from '../../components/Warning';
import ListItem from '../../components/ListItem';
import PencilEditSvg from '../../assets/images/pencil-edit.svg';
import {defaultWallets} from '../../store/userWallet/const';

const TokenModal: FC<TTokenModalProps> = React.memo(
  ({toggle, isVisible, canDelete}) => {
    const {t} = useTranslation();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    const usdEquivalents = useShallowEqualSelector(makeSelectUsdEquivalents);
    const selectedToken = useShallowEqualSelector(makeSelectSelectedToken);
    const nonTransferableTokens = useShallowEqualSelector(
      makeSelectNonTransferableTokenList,
    );

    const selectedTokenDistributions = useMemo(() => {
      if (selectedToken?.chainBalance) {
        let distributions: any[] = [];
        Object.keys(selectedToken?.chainBalance).forEach((chainId: string) => {
          const amount = Number(selectedToken?.chainBalance[chainId]);
          if (amount > 0) {
            let usdValue: string = '-';
            if (Array.isArray(usdEquivalents)) {
              const foundUsdValue = (usdEquivalents || []).find(
                item => item.token === selectedToken.tokenAddress,
              );
              usdValue = (Number(amount) * (foundUsdValue?.usd || 0)).toFixed(
                2,
              );
            }
            distributions.push({
              chainId,
              balance: amount,
              usd: usdValue,
            });
          }
        });
        return distributions;
      }
      return [];
    }, [selectedToken, usdEquivalents]);

    const handlePressTransfer = (chainId: string) => {
      toggle();
      setTimeout(
        () =>
          navigation.navigate(ERootStackRoutes.Send, {
            sourceChainId: chainId,
          }),
        150,
      );
    };

    const handlePressRemove = useCallback(() => {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
      Alert.alert(
        t('tokenModal.removeConfirmTitle'),
        t('tokenModal.removeConfirmMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('tokenModal.remove'),
            style: 'destructive',
            onPress: () => {
              dispatch(deleteSelectedToken(selectedToken));
              toggle();
            },
          },
        ],
      );
    }, [toggle, selectedToken]);

    const isDefaultToken = defaultWallets.find(
      t => t.tokenAddress === selectedToken?.tokenAddress,
    );

    const handlePressEdit = useCallback(() => {
      toggle();
      setTimeout(() => navigation.navigate(ERootStackRoutes.AddToken), 150);
    }, [toggle, navigation]);

    const isTokenNonTransferable = useMemo(
      () =>
        selectedToken?.tokenAddress
          ? (nonTransferableTokens || []).includes(selectedToken?.tokenAddress)
          : false,
      [nonTransferableTokens, selectedToken?.tokenAddress],
    );

    if (!selectedToken) {
      return null;
    }
    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={t('tokenModal.distributionTitle', {
          token: selectedToken.tokenName,
        })}
        onPressLeftItem={
          canDelete && selectedTokenDistributions.length > 0
            ? handlePressRemove
            : undefined
        }
        leftHeaderItem={
          canDelete && selectedTokenDistributions.length > 0 ? (
            <TrashEmptySvg />
          ) : undefined
        }
        contentStyle={styles.modalStyle}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentWrapper}>
            {isTokenNonTransferable && (
              <Warning
                style={styles.warning}
                isSerious={true}
                centerText={true}
                title={t('tokenModal.notTransferable', {
                  contract: selectedToken.tokenAddress,
                })}
              />
            )}
            {selectedTokenDistributions.length === 0 ? (
              <>
                <Warning
                  style={styles.warning}
                  noIcon={true}
                  centerText={true}
                  title={t('tokenModal.zeroBalance', {
                    token: selectedToken.tokenName,
                  })}
                />
                {!isDefaultToken && (
                  <>
                    <ListItem
                      text={t('tokenModal.editToken')}
                      icon={<PencilEditSvg />}
                      style={styles.itemStyle}
                      onPress={handlePressEdit}
                    />
                    <ListItem
                      text={t('tokenModal.removeToken')}
                      icon={<TrashEmptySvg />}
                      style={styles.itemStyle}
                      onPress={handlePressRemove}
                    />
                  </>
                )}
              </>
            ) : (
              selectedTokenDistributions.map(distribution => (
                <TouchableOpacity
                  disabled={isTokenNonTransferable}
                  key={`${selectedToken.tokenName}-${distribution.chainId}`}
                  activeOpacity={0.8}
                  onPress={() => handlePressTransfer(distribution.chainId)}
                  style={styles.distributionContainer}>
                  <View style={styles.distributionTokenContainer}>
                    <Text style={styles.tokenAmount}>
                      {`${distribution.balance} ${selectedToken.tokenName}`}
                    </Text>
                    <Text style={styles.tokenCurrency}>
                      {`$ ${distribution.usd}`}
                    </Text>
                  </View>
                  <View style={styles.distributionButtonContainer}>
                    <Text style={styles.chainId}>
                      {t('tokenModal.chainLabel', {
                        chain: distribution.chainId,
                      })}
                    </Text>
                    {!isTokenNonTransferable && (
                      <View style={styles.iconWrapper}>
                        <ArrowTopBottomRightSvg
                          fill="white"
                          width={16}
                          height={16}
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>
    );
  },
);

export default TokenModal;
