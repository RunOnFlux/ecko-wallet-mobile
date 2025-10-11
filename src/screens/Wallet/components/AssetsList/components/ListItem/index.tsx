import React, { FC, useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getAssetImageView } from '../../../../../../utils/getAssetImageView';
import { makeStyles } from './styles';
import { TListItemProps } from './types';
import TokenModal from '../../../../../../modals/TokenModal';
import { useDispatch } from 'react-redux';
import { setSelectedToken } from '../../../../../../store/userWallet';
import { makeSelectUsdEquivalents } from '../../../../../../store/userWallet/selectors';
import { useShallowEqualSelector } from '../../../../../../store/utils';
import {
  decimalIfNeeded,
  numberWithCommas,
} from '../../../../../../utils/stringHelpers';
import { useAppThemeContext } from '../../../../../../contexts';

const ListItem: FC<TListItemProps> = React.memo(
  ({ walletItem, isFirst, rightLabel, onPress }) => {
    const dispatch = useDispatch();
    const [modalVisible, setModalVisible] = useState(false);

    const { theme } = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    const toggleModal = useCallback(() => {
      if (!modalVisible) {
        dispatch(setSelectedToken(walletItem));
      }
      setTimeout(() => setModalVisible(!modalVisible), 150);
    }, [modalVisible, walletItem]);

    const usdEquivalents = useShallowEqualSelector(makeSelectUsdEquivalents);

    const amount = useMemo(() => {
      return decimalIfNeeded(walletItem.totalAmount || 0);
    }, [walletItem]);

    const currency = useMemo(() => {
      if (Array.isArray(usdEquivalents)) {
        const foundUsdValue = (usdEquivalents || []).find(
          item => item.token === walletItem.tokenAddress,
        );
        const usdAmount = Number(amount) * (foundUsdValue?.usd || 0);
        if (usdAmount) {
          const usdAmountString = usdAmount.toFixed(2);
          if (usdAmountString === '0.00' || usdAmountString === '0,00') {
            return `< $ ${0.001}`;
          }
          return `$ ${usdAmount.toFixed(2)}`;
        }
      }
      return '';
    }, [walletItem, amount, usdEquivalents]);

    const canDelete = useMemo(
      () =>
        walletItem.tokenAddress !== 'coin' &&
        walletItem.tokenAddress !== 'runonflux.flux',
      [walletItem],
    );

    const assetImageView = useMemo(
      () => getAssetImageView(walletItem.tokenAddress),
      [walletItem],
    );

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress ? onPress : toggleModal}
          style={[styles.wrapper, isFirst && { borderTopWidth: 0 }]}
        >
          <View style={styles.leftSide}>
            {assetImageView}
            <Text style={styles.title}>{`${
              walletItem.totalAmount !== undefined
                ? numberWithCommas(amount)
                : ''
            } ${walletItem.tokenName}`}</Text>
          </View>
          <Text style={styles.currency}>
            {rightLabel || numberWithCommas(currency || '')}
          </Text>
        </TouchableOpacity>
        <TokenModal
          canDelete={canDelete}
          toggle={toggleModal}
          isVisible={modalVisible}
        />
      </>
    );
  },
);

export default ListItem;
