import React, {useCallback, useEffect} from 'react';
import {Alert, ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useForm, Controller, FieldValues} from 'react-hook-form';
import FooterButton from '../../components/FooterButton';
import Input from '../../components/Input';
import {createStyles} from './styles';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {getSavedValue, saveValue} from '../../utils/storageHelplers';
import {walletConnectSchema} from '../../validation/walletConnectSchema';
import {useNavigation} from '@react-navigation/native';
import {useWalletConnectContext} from '../../contexts';
import {defaultWalletConnectParams} from '../../contexts/WalletConnect';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import Header from '../../components/Header';

const WalletConnectSettings = () => {
  const {t} = useTranslation();
  const {initializeClient} = useWalletConnectContext();
  const navigation = useNavigation();

  const {
    setValue,
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: walletConnectSchema,
    mode: 'onChange',
  });

  useEffect(() => {
    const params = getSavedValue('walletConnectParams');
    setValue(
      'projectId',
      params?.projectId || defaultWalletConnectParams?.projectId,
    );
    setValue(
      'relayUrl',
      params?.relayUrl || defaultWalletConnectParams?.relayUrl,
    );
  }, []);

  const handlePressSave = useCallback(
    async (data: FieldValues) => {
      try {
        await initializeClient(data);
        await saveValue('walletConnectParams', data);
        setTimeout(() => navigation.goBack(), 150);
      } catch {
        ReactNativeHapticFeedback.trigger('impactMedium', {
          enableVibrateFallback: false,
          ignoreAndroidSystemSettings: false,
        });
        Alert.alert(
          t('walletConnectSettings.errorTitle'),
          t('walletConnectSettings.errorMessage'),
        );
      }
    },
    [initializeClient, navigation, t],
  );

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  return (
    <View style={styles.screen}>
      <Header title="WalletConnect" />
      <ScrollView
        style={styles.contentWrapper}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Controller
          control={control}
          name="projectId"
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              label={t('walletConnectSettings.projectIdLabel')}
              placeholder={t('walletConnectSettings.projectIdPlaceholder')}
              wrapperStyle={styles.inputWrapper}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.projectId?.message as string}
            />
          )}
        />
        <Controller
          control={control}
          name="relayUrl"
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              label={t('walletConnectSettings.relayUrlLabel')}
              placeholder={t('walletConnectSettings.relayUrlPlaceholder')}
              autoCapitalize="none"
              wrapperStyle={styles.inputWrapper}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.relayUrl?.message as string}
            />
          )}
        />
      </ScrollView>
      <View style={styles.footer}>
        <FooterButton
          title={t('common.saveButton')}
          onPress={handleSubmit(handlePressSave)}
          disabled={!isValid}
        />
      </View>
    </View>
  );
};

export default WalletConnectSettings;
