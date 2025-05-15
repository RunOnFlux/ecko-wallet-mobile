import React, {useCallback, useEffect, useState} from 'react';
import {View, Keyboard, ScrollView, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {Controller, FieldValues, useForm} from 'react-hook-form';

import BasicSettingsSvg from '../../../../assets/images/basic-settins.svg';
import Modal from '../../../../components/Modal';
import RadioTab from '../../../../components/RadioTab';
import Input from '../../../../components/Input';
import FooterButton from '../../../../components/FooterButton';
import {transactionSpeedOptions} from './consts';
import {estimatedGasFeeSchema} from '../../../../validation/estimatedGasFeeSchema';
import {makeSelectEstimatedGasFee} from '../../../../store/transfer/selectors';
import {setEstimatedGasFee} from '../../../../store/transfer';
import {EGAsSpeed} from '../../../../store/transfer/types';
import {
  FAST_GAS_PRICE,
  GAS_PRICE,
  ECONOMY_GAS_PRICE,
} from '../../../../constants';
import {useShallowEqualSelector} from '../../../../store/utils';
import {styles} from './styles';

const Settings = React.memo(() => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [isVisible, setVisible] = useState(false);
  const estimatedGasFee = useShallowEqualSelector(makeSelectEstimatedGasFee);

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    resolver: estimatedGasFeeSchema,
    defaultValues: {
      speed: estimatedGasFee.speed,
      gasLimit: estimatedGasFee.gasLimit.toString(),
      gasPrice: estimatedGasFee.gasPrice.toString(),
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isVisible) {
      setValue('speed', estimatedGasFee.speed);
      setValue('gasLimit', estimatedGasFee.gasLimit.toString());
      setValue('gasPrice', estimatedGasFee.gasPrice.toString());
    }
  }, [isVisible, setValue, estimatedGasFee]);

  const toggleModal = useCallback(() => {
    setVisible(v => !v);
  }, []);

  const handlePressSave = useCallback(
    (data: FieldValues) => {
      dispatch(setEstimatedGasFee(data));
      toggleModal();
    },
    [dispatch, toggleModal],
  );

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.iconWrapper}
        onPress={toggleModal}>
        <BasicSettingsSvg fill="#787B8E" />
      </TouchableOpacity>
      <Modal
        isVisible={isVisible}
        close={toggleModal}
        title={t('sendSummary.content.transactionParameters')}>
        <View style={styles.contentWrapper}>
          <Controller
            control={control}
            name="speed"
            render={({field: {onChange, value}}) => (
              <RadioTab
                label={t('sendSummary.content.transactionSpeed')}
                options={transactionSpeedOptions}
                value={value}
                onChange={v => {
                  onChange(v);
                  if (v === EGAsSpeed.FAST) {
                    setValue('gasPrice', `${FAST_GAS_PRICE}`);
                  } else if (v === EGAsSpeed.ECONOMY) {
                    setValue('gasPrice', `${ECONOMY_GAS_PRICE}`);
                  } else {
                    setValue('gasPrice', `${GAS_PRICE}`);
                  }
                }}
                labelStyle={styles.radioLabel}
                buttonStyle={styles.radioButton}
                buttonsWrapperStyle={styles.radioButtonWrapper}
              />
            )}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.inputsWrapper}>
            <Controller
              control={control}
              name="gasLimit"
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  label={t('sendSummary.content.gasLimitLabel')}
                  placeholder={t('sendSummary.content.gasLimitPlaceholder')}
                  keyboardType="decimal-pad"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  errorMessage={errors.gasLimit?.message as string}
                />
              )}
            />
            <Controller
              control={control}
              name="gasPrice"
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  label={t('sendSummary.content.gasPriceLabel')}
                  placeholder={t('sendSummary.content.gasPricePlaceholder')}
                  keyboardType="decimal-pad"
                  wrapperStyle={styles.priceWrapper}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  errorMessage={errors.gasPrice?.message as string}
                />
              )}
            />
          </ScrollView>
        </View>
        <FooterButton
          title={t('common.saveButton')}
          onPress={handleSubmit(handlePressSave)}
        />
      </Modal>
    </>
  );
});

export default Settings;
