import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  TextInput,
  ViewProps,
  Text,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Snackbar from 'react-native-snackbar';

import {styles} from './styles';
import {setGatheredTransferInfo} from '../../../../store/transfer';
import {
  makeSelectSelectedToken,
  makeSelectUsdEquivalents,
} from '../../../../store/userWallet/selectors';
import {
  makeSelectEstimatedGasFee,
  makeSelectGatheredInfo,
} from '../../../../store/transfer/selectors';
import {useInputBlurOnKeyboard} from '../../../../utils/keyboardHelpers';
import {toFixed} from '../../../../utils/numberHelpers';
import {decimalIfNeeded} from '../../../../utils/stringHelpers';

const WalletInfo: React.FC = React.memo(() => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const gatheredInfo = useSelector(makeSelectGatheredInfo);
  const selectedToken = useSelector(makeSelectSelectedToken);
  const usdEquivalents = useSelector(makeSelectUsdEquivalents);
  const estimatedGasFee = useSelector(makeSelectEstimatedGasFee);

  const inputAmount = useMemo(
    () => gatheredInfo.amount || 0,
    [gatheredInfo.amount],
  );
  const [inputText, setInputText] = useState<string>('');

  const balance = useMemo(() => {
    if (selectedToken?.chainBalance && gatheredInfo.chainId) {
      return selectedToken.chainBalance[gatheredInfo.chainId];
    }
    return 0;
  }, [selectedToken, gatheredInfo.chainId]);

  const usdEquivalent = useMemo(() => {
    let usdValue: string = '-';
    const amount = isNaN(Number(inputAmount)) ? 0 : Number(inputAmount);
    if (Array.isArray(usdEquivalents)) {
      const found = usdEquivalents.find(
        item => item.token === selectedToken?.tokenAddress,
      );
      usdValue = (amount * (found?.usd || 0)).toFixed(2);
    }
    return usdValue;
  }, [inputAmount, usdEquivalents, selectedToken]);

  const gasFee = useMemo(
    () => (estimatedGasFee.gasPrice || 0) * (estimatedGasFee.gasLimit || 0),
    [estimatedGasFee],
  );

  const handleChangeText = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const onInputBlur = useCallback(() => {
    let amount: number;
    try {
      if (inputText) {
        amount = Number(toFixed(inputText.replace(',', '.'), 6));
        if (isNaN(amount)) {
          amount = 0;
        }
        if (amount > balance) amount = balance;
      } else {
        amount = 0;
      }
    } catch {
      amount = balance;
    }
    setInputText(`${amount}`);
    dispatch(setGatheredTransferInfo({amount}));
  }, [balance, inputText, dispatch]);

  useEffect(() => {
    dispatch(setGatheredTransferInfo({amount: 0}));
  }, [dispatch]);

  const inputRef = useRef<TextInput>(null);
  useInputBlurOnKeyboard(inputRef);

  const onHalf = useCallback(() => {
    let val = balance / 2;
    if (selectedToken?.tokenAddress === 'coin') val -= gasFee;
    val = Number(decimalIfNeeded(toFixed(`${val}`, 6), 6));
    setInputText(`${val}`);
    dispatch(setGatheredTransferInfo({amount: val}));
  }, [balance, gasFee, selectedToken, dispatch]);

  const onMax = useCallback(() => {
    let val = balance;
    if (selectedToken?.tokenAddress === 'coin') val -= gasFee;
    val = Number(decimalIfNeeded(toFixed(`${val}`, 6), 6));
    setInputText(`${val}`);
    dispatch(setGatheredTransferInfo({amount: val}));
    Snackbar.show({
      text: t('sendSummary.walletInfo.maxSnackbar'),
      duration: Snackbar.LENGTH_LONG,
    });
  }, [balance, gasFee, selectedToken, dispatch, t]);

  const formattedBalance = useMemo(
    () => (Number(balance) || 0).toFixed(3),
    [balance],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.headerText, styles.headerLeftText]}>
          {t('sendSummary.walletInfo.amountLabel')}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onHalf}
            style={styles.headerRightTextWrapper}>
            <Text style={[styles.headerText, styles.headerRightText]}>
              {t('sendSummary.walletInfo.half')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onMax}
            style={styles.headerRightTextWrapper}>
            <Text style={[styles.headerText, styles.headerRightText]}>
              {t('sendSummary.walletInfo.max')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          keyboardType="numeric"
          placeholder="0"
          style={[styles.mainText, styles.input]}
          value={inputText}
          blurOnSubmit
          onEndEditing={onInputBlur}
          onSubmitEditing={onInputBlur}
          onBlur={onInputBlur}
          onChangeText={handleChangeText}
        />
        <Text style={styles.mainText}>{selectedToken?.tokenName || ''}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.footerText, styles.footerLeftText]}>
          {t('sendSummary.walletInfo.usdValue', {value: usdEquivalent})}
        </Text>
        <Text style={[styles.footerText, styles.footerRightText]}>
          {t('sendSummary.walletInfo.balance', {
            value: formattedBalance,
            token: selectedToken?.tokenName || '',
          })}
        </Text>
      </View>
    </View>
  );
});

export default WalletInfo;
