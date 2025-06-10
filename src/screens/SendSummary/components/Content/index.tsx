import React, {FC, useMemo} from 'react';
import {View, Text, TouchableOpacity, Keyboard} from 'react-native';
import {useTranslation} from 'react-i18next';
import Settings from '../Settings';
import {makeStyles} from './styles';
import {makeSelectEstimatedGasFee} from '../../../../store/transfer/selectors';
import {useShallowEqualSelector} from '../../../../store/utils';
import {useAppThemeContext} from '../../../../contexts';

const Content: FC = React.memo(() => {
  const {t} = useTranslation();
  const estimatedGas = useShallowEqualSelector(makeSelectEstimatedGasFee);
  const {gasLimit, gasPrice, speed} = estimatedGas;

  const totalGas = (Number(gasLimit * gasPrice) || 0).toFixed(8);

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={Keyboard.dismiss}
      style={styles.contentWrapper}>
      <View style={styles.header}>
        <Text style={[styles.text, styles.headerTitle]}>
          {t('sendSummary.content.transactionParameters')}
        </Text>
        <Settings />
      </View>
      <View style={styles.itemWrapper}>
        <View style={styles.item}>
          <Text style={[styles.text, styles.kda]}> {totalGas} </Text>
          <Text style={[styles.text, styles.usd]}>
            {t('sendSummary.content.gasLabel')}
          </Text>
        </View>
        <Text style={[styles.text, styles.leftText]}>
          {t('sendSummary.content.speedLabel', {speed: speed.toUpperCase()})}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default Content;
