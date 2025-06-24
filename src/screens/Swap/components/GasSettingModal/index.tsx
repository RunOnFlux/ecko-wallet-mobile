import React, {FC, useEffect, useMemo, useState} from 'react';
import {View, Text, Switch} from 'react-native';
import {useTranslation} from 'react-i18next';
import Modal from '../../../../components/Modal';
import Input from '../../../../components/Input';
import RadioButtons from './RadioButtons';
import {useAppThemeContext, usePactContext} from '../../../../contexts';
import {GAS_OPTIONS} from '../../../../constants';
import {getDecimalPlaces} from '../../../../utils/numberHelpers';
import {commonColors, MAIN_COLOR} from '../../../../constants/styles';
import {TGasSettingModalProps, TSpeed} from './types';
import {createStyles} from './styles';

const speedValues: TSpeed[] = ['low', 'normal', 'fast'];

const GasSettingModal: FC<TGasSettingModalProps> = ({isVisible, toggle}) => {
  const {t} = useTranslation();
  const pact = usePactContext();
  const [speed, setSpeed] = useState<TSpeed>('low');

  useEffect(() => {
    if (!pact.enableGasStation) {
      pact.setGasConfiguration(GAS_OPTIONS.low.SWAP);
      setSpeed('low');
    }
  }, [pact.enableGasStation, pact]);

  useEffect(() => {
    if (!pact.enableGasStation && pact.networkGasData.networkCongested) {
      const networkGas =
        speed === 'low'
          ? pact.networkGasData.lowestGasPrice
          : speed === 'normal'
          ? pact.networkGasData.suggestedGasPrice
          : pact.networkGasData.highestGasPrice;

      if (
        pact.networkGasData.networkCongested &&
        networkGas > GAS_OPTIONS[speed].SWAP.gasPrice
      ) {
        pact.handleGasConfiguration('gasPrice', networkGas.toString());
      } else {
        pact.setGasConfiguration(GAS_OPTIONS[speed].SWAP);
      }
    }
  }, [speed, pact]);

  const toggleSwitch = () => pact.setEnableGasStation(prev => !prev);

  const gasConfig = pact.gasConfiguration;
  const gasFee = gasConfig.gasPrice * gasConfig.gasLimit;
  const color =
    gasFee > 0.5
      ? commonColors.error
      : gasFee <= 0.5 && gasFee > 0.01
      ? commonColors.orange
      : commonColors.green;

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      isVisible={isVisible}
      close={toggle}
      title={t('swap.gasSettings.title')}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.gasStation}>
            {t('swap.gasSettings.gasStation')}
          </Text>
          <Switch
            value={pact.enableGasStation}
            onValueChange={toggleSwitch}
            trackColor={{false: '#767577', true: theme.button.primary}}
            thumbColor={
              pact.enableGasStation ? theme.button.primary : '#f4f3f4'
            }
          />
        </View>

        {!pact.enableGasStation ? (
          <>
            <Input
              keyboardType="numeric"
              maxLength={10}
              label={t('swap.gasSettings.gasLimitLabel')}
              placeholder={t('swap.gasSettings.gasLimitPlaceholder')}
              wrapperStyle={styles.inputWrapper}
              onChangeText={value =>
                pact.handleGasConfiguration('gasLimit', value)
              }
              value={gasConfig.gasLimit.toString()}
            />
            <Input
              keyboardType="numeric"
              maxLength={10}
              label={t('swap.gasSettings.gasPriceLabel')}
              placeholder={t('swap.gasSettings.gasPricePlaceholder')}
              wrapperStyle={styles.inputWrapper}
              onChangeText={value =>
                pact.handleGasConfiguration('gasPrice', value)
              }
              value={gasConfig.gasPrice.toString()}
            />
            <RadioButtons<TSpeed>
              options={speedValues}
              value={speed}
              setValue={setSpeed}
            />
            <View style={styles.info}>
              <Text style={styles.title}>
                {t('swap.gasSettings.failureCost')}
              </Text>
              <Text style={[styles.value, {color}]}>
                {getDecimalPlaces(gasFee)} KDA
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.title}>{t('swap.gasSettings.noGasCost')}</Text>
        )}
      </View>
    </Modal>
  );
};

export default React.memo(GasSettingModal);
