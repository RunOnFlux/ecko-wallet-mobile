import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {TextInput, View, Text, TouchableOpacity, Alert} from 'react-native';
import {useTranslation} from 'react-i18next';
import {TMainnet} from '../../../../constants/tokensTypes';
import BasicSearchSvg from '../../../../assets/images/basic-search.svg';

import Modal from '../../../../components/Modal';
import {TWallet} from '../../../../store/userWallet/types';
import {getAssetImageView} from '../../../../utils/getAssetImageView';
import {setSelectedToken as setSelectedTokenAction} from '../../../../store/userWallet';
import {tokens} from '../../../../constants/tokens.json';
import {createStyles} from './styles';
import {TSelectTokenModal} from './types';
import {swapTokens} from '../../contants';
import {defaultBalances} from '../../../../store/userWallet/const';
import {ERootStackRoutes} from '../../../../routes/types';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {useAppThemeContext} from '../../../../contexts';

const SelectTokenModal: FC<TSelectTokenModal> = React.memo(
  ({
    close,
    isVisible,
    walletList,
    setSelectedToken,
    selectedToken,
    anotherToken,
    title,
  }) => {
    const {t} = useTranslation();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    const [searchText, setSearchText] = useState('');
    const [filteredWallets, setFilteredWallets] = useState<
      (TWallet & {notInWallet?: boolean})[]
    >([]);

    const {theme} = useAppThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
      setSearchText('');
    }, [isVisible]);

    useEffect(() => {
      const walletTokens = walletList.filter(walletItem =>
        swapTokens.some(
          swapToken => swapToken?.tokenAddress === walletItem?.tokenAddress,
        ),
      );
      swapTokens.forEach(swapToken => {
        if (
          !walletTokens.some(
            item => item.tokenAddress === swapToken.tokenAddress,
          )
        ) {
          walletTokens.push({
            ...swapToken,
            chainBalance: defaultBalances,
            totalAmount: 0,
            notInWallet: true,
          });
        }
      });
      setFilteredWallets(
        walletTokens.filter(item =>
          item.tokenName.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }, [searchText, walletList]);

    const createConfirmModal = useCallback(
      (token: TWallet) =>
        Alert.alert(
          t('swap.selectTokenModal.warningTitle'),
          t('swap.selectTokenModal.warningMessage', {
            pair:
              title === 'RECEIVE'
                ? `${anotherToken.coin} / ${token.tokenName}`
                : `${token.tokenName} / ${anotherToken.coin}`,
          }),
          [{text: t('common.ok')}],
        ),
      [anotherToken, title, t],
    );

    const handleTokenPress = useCallback(
      (token: TWallet & {notInWallet?: boolean}) => () => {
        if (token.notInWallet) {
          Alert.alert(
            t('swap.selectTokenModal.addTokenTitle'),
            t('swap.selectTokenModal.addTokenMessage'),
            [
              {text: t('common.cancel'), style: 'cancel'},
              {
                text: t('swap.selectTokenModal.addTokenConfirm'),
                onPress: () => {
                  close();
                  setTimeout(() => {
                    dispatch(setSelectedTokenAction(null));
                    navigation.navigate(ERootStackRoutes.AddToken, {
                      tokenName: token.tokenAddress,
                      onTokenAdd: (tokenName: string, tokenAddress: string) => {
                        if (
                          token.tokenAddress !== 'coin' &&
                          anotherToken.address !== 'coin'
                        ) {
                          createConfirmModal(token);
                        } else {
                          setSelectedToken(prev => ({
                            ...prev,
                            balance: 0,
                            coin: tokenName,
                            address: tokenAddress,
                            precision:
                              tokens.mainnet[tokenName as keyof TMainnet]
                                ?.precision || 12,
                          }));
                        }
                      },
                    } as any);
                  }, 300);
                },
              },
            ],
          );
        } else {
          if (
            token.tokenAddress !== 'coin' &&
            anotherToken.address !== 'coin'
          ) {
            return createConfirmModal(token);
          }
          setSelectedToken(prev => ({
            ...prev,
            balance: token.totalAmount,
            coin: token.tokenName,
            address: token.tokenAddress,
            precision:
              tokens.mainnet[token.tokenName as keyof TMainnet]?.precision ||
              12,
          }));
          close();
        }
      },
      [
        anotherToken,
        close,
        createConfirmModal,
        dispatch,
        navigation,
        setSelectedToken,
        t,
      ],
    );

    return (
      <Modal
        isVisible={isVisible}
        close={close}
        title={t('swap.selectTokenModal.title')}>
        <View style={styles.modalContainer}>
          <View style={styles.searchSection}>
            <BasicSearchSvg />
            <TextInput
              placeholderTextColor="grey"
              style={styles.input}
              placeholder={t('swap.selectTokenModal.placeholder')}
              value={searchText}
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={setSearchText}
            />
          </View>
          <Text style={styles.title}>
            {t('swap.selectTokenModal.tokensLabel')}
          </Text>
          {filteredWallets.length ? (
            filteredWallets.map((walletItem, idx) => (
              <TouchableOpacity
                disabled={
                  selectedToken.coin === walletItem.tokenName ||
                  anotherToken.coin === walletItem.tokenName
                }
                key={idx}
                onPress={handleTokenPress(walletItem)}
                style={[
                  styles.token,
                  {
                    opacity:
                      selectedToken.coin === walletItem.tokenName ||
                      anotherToken.coin === walletItem.tokenName
                        ? 0.5
                        : 1,
                  },
                ]}>
                {getAssetImageView(walletItem.tokenAddress)}
                <Text style={styles.tokenName}>{walletItem.tokenName}</Text>
                {selectedToken.coin === walletItem.tokenName && (
                  <Text style={styles.selected}>
                    {t('swap.selectTokenModal.selectedSuffix')}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {t('swap.selectTokenModal.empty')}
            </Text>
          )}
        </View>
      </Modal>
    );
  },
);

export default SelectTokenModal;
