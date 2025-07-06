import React, {FC, useCallback, useMemo} from 'react';
import {View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useAppThemeContext, usePactContext} from '../../../../contexts';
import {getDecimalPlaces, reduceBalance} from '../../../../utils/numberHelpers';
import {commonColors} from '../../../../constants/styles';
import {createStyles} from './styles';
import {TInfoProps} from './types';

const Info: FC<TInfoProps> = ({
  withMoreInfo,
  firstToken,
  secondToken,
  priceImpact,
}) => {
  const {t} = useTranslation();
  const pact = usePactContext();

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getPriceImpactColor = useCallback(() => {
    const pip = pact.priceImpactWithoutFee(priceImpact);
    if (pip != null) {
      const pct = +reduceBalance(pip * 100, 4);
      if (pct < 1) return commonColors.green;
      if (pct < 5) return commonColors.yellow;
      return commonColors.red;
    }
    return undefined;
  }, [priceImpact, pact]);

  const items = useMemo(
    () => [
      {
        id: 1,
        title: t('swap.info.gasCost'),
        value: t('swap.info.free'),
        textColor: commonColors.green,
        hide: !pact.enableGasStation,
      },
      {
        id: 2,
        title: t('swap.info.priceImpact'),
        value:
          pact.priceImpactWithoutFee(priceImpact) < 0.0001 &&
          pact.priceImpactWithoutFee(priceImpact)
            ? `< 0.01 %`
            : `${reduceBalance(
                pact.priceImpactWithoutFee(priceImpact) * 100,
                4,
              )} %`,
        textColor: getPriceImpactColor(),
      },
      {
        id: 3,
        title: t('swap.info.price'),
        value: `${reduceBalance(pact.ratio * (1 + Number(priceImpact)))} ${
          firstToken.coin
        } / ${secondToken.coin}`,
      },
      {
        id: 4,
        title: t('swap.info.maxSlippage'),
        value: `${pact.slippage * 100} %`,
      },
      {
        id: 5,
        title: t('swap.info.lpFee'),
        value: `${getDecimalPlaces(0.003 * parseFloat(firstToken.amount))} ${
          firstToken.coin
        }`,
      },
      ...(withMoreInfo
        ? [
            {
              id: 6,
              title: t('swap.info.txDeadline'),
              value: `${pact.ttl > 60 ? pact.ttl / 60 : pact.ttl} ${
                pact.ttl > 60
                  ? t('swap.info.unitMinutes')
                  : t('swap.info.unitSeconds')
              }`,
            },
            {
              id: 7,
              title: t('swap.info.gasPrice'),
              value: `${pact.gasConfiguration.gasPrice}`,
            },
            {
              id: 8,
              title: t('swap.info.gasLimit'),
              value: `${pact.gasConfiguration.gasLimit}`,
            },
          ]
        : []),
    ],
    [
      pact,
      priceImpact,
      firstToken,
      secondToken,
      withMoreInfo,
      getPriceImpactColor,
      t,
    ],
  );

  if (firstToken.amount === '') {
    return null;
  }
  return (
    <View style={styles.container}>
      {items.map(({title, textColor, value, id, hide}) =>
        !hide ? (
          <View style={styles.item} key={id}>
            <Text
              style={{...styles.title, color: textColor || theme.text.primary}}>
              {`${title}:`}
            </Text>
            <Text
              style={{...styles.text, color: textColor || theme.text.primary}}>
              {value}
            </Text>
          </View>
        ) : null,
      )}
    </View>
  );
};

export default Info;
