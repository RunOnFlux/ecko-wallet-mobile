import React, {useCallback, useMemo} from 'react';
import {View, Alert, ScrollView} from 'react-native';
import {useForm, Controller, FieldValues} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

import Header from './components/Header';
import FooterButton from '../../components/FooterButton';
import Input from '../../components/Input';
import {createStyles} from './styles';
import {getRestoreAccount} from '../../store/userWallet/actions';
import {recoverAccountSchema} from '../../validation/recoverAccountSchema';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useNavigation} from '@react-navigation/native';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {validateSeeds} from '../../api/kadena/validateSeeds';
import {useSafeAreaValues} from '../../utils/deviceHelpers';

const RecoverAccount = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.RecoverAccount>>();

  const dispatch = useDispatch();

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: recoverAccountSchema,
    mode: 'onChange',
  });

  const handlePressSave = useCallback(
    (data: FieldValues) => {
      validateSeeds({
        seeds: data.seeds || '',
      })
        .then(responseData => {
          if (responseData) {
            dispatch(
              getRestoreAccount({
                seeds: data.seeds || '',
                accountIndex: data.accountIndex || 0,
              }),
            );
            navigation.goBack();
          } else {
            ReactNativeHapticFeedback.trigger('impactMedium', {
              enableVibrateFallback: false,
              ignoreAndroidSystemSettings: false,
            });
            Alert.alert(
              t('recoverAccount.alert.failureTitle'),
              t('recoverAccount.alert.failureMessage'),
            );
          }
        })
        .catch(() => {
          ReactNativeHapticFeedback.trigger('impactMedium', {
            enableVibrateFallback: false,
            ignoreAndroidSystemSettings: false,
          });
          Alert.alert(
            t('recoverAccount.alert.failureTitle'),
            t('recoverAccount.alert.failureMessage'),
          );
        });
    },
    [dispatch, navigation, t],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          style={styles.contentWrapper}>
          <Controller
            control={control}
            name="seeds"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={t('recoverAccount.seeds.label')}
                placeholder={t('recoverAccount.seeds.placeholder')}
                wrapperStyle={styles.inputWrapper}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                value={value}
                errorMessage={errors.seeds?.message as string}
              />
            )}
          />
          <Controller
            control={control}
            name="accountIndex"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={t('recoverAccount.accountIndex.label')}
                placeholder={t('recoverAccount.accountIndex.placeholder')}
                wrapperStyle={styles.inputWrapper}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorMessage={errors.accountIndex?.message as string}
              />
            )}
          />
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <FooterButton
          disabled={!isValid}
          title={t('recoverAccount.button.recover')}
          onPress={handleSubmit(handlePressSave)}
        />
      </View>
    </View>
  );
};

export default RecoverAccount;
