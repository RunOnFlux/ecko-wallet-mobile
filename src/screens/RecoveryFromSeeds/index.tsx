import React, {useCallback, useRef, useEffect} from 'react';
import {
  Alert,
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import {useForm, Controller, FieldValues} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import ArrowLeftSvg from '../../assets/images/arrow-left.svg';
import Logo from '../../assets/images/logo.svg';
import PasswordInput from '../../components/PasswordInput';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {setPassword, setPhrases} from '../../store/auth';
import {getRestoreAccount} from '../../store/userWallet/actions';
import {makeSelectHasAccount} from '../../store/userWallet/selectors';
import {recoverySchema} from '../../validation/recoverySchema';
import {validateSeeds} from '../../api/kadena/validateSeeds';
import {hashPassword} from '../../api/kadena/hashPassword';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {createStyles} from './styles';
import {AppDispatch} from '../../store/store';

const bgImage = require('../../assets/images/bgimage.png');

const RecoveryFromSeeds = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.RecoveryFromSeeds>>();
  const dispatch = useDispatch<AppDispatch>();
  const hasAccount = useSelector(makeSelectHasAccount);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: recoverySchema(t),
    mode: 'onChange',
  });

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressRecover = useCallback(
    ({seeds, password}: FieldValues) => {
      if (hasAccount) return;
      const trimmed = seeds.trim();
      validateSeeds({seeds: trimmed || ''})
        .then(async valid => {
          if (valid) {
            hashPassword({password: password || ''})
              .then(hashResponse => {
                if (hashResponse) {
                  dispatch(setPassword(hashResponse));
                  dispatch(setPhrases(trimmed.split(' ')));
                  dispatch(
                    getRestoreAccount({seeds: trimmed, accountIndex: 0}),
                  );
                  navigation.navigate({
                    name: ERootStackRoutes.SignIn,
                    params: undefined,
                  });
                } else {
                  ReactNativeHapticFeedback.trigger('impactMedium');
                  Alert.alert(
                    t('recoveryFromSeeds.alert.failureTitle'),
                    t('recoveryFromSeeds.alert.failureMessage'),
                  );
                }
              })
              .catch(() => {
                ReactNativeHapticFeedback.trigger('impactMedium');
                Alert.alert(
                  t('recoveryFromSeeds.alert.failureTitle'),
                  t('recoveryFromSeeds.alert.failureMessage'),
                );
              });
          } else {
            ReactNativeHapticFeedback.trigger('impactMedium');
            Alert.alert(
              t('recoveryFromSeeds.alert.failureTitle'),
              t('recoveryFromSeeds.alert.invalidSeeds'),
            );
          }
        })
        .catch(() => {
          ReactNativeHapticFeedback.trigger('impactMedium');
          Alert.alert(
            t('recoveryFromSeeds.alert.failureTitle'),
            t('recoveryFromSeeds.alert.invalidSeeds'),
          );
        });
    },
    [dispatch, hasAccount, navigation, t],
  );

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (hasAccount) {
      navigation.replace(ERootStackRoutes.SignIn);
    }
  }, [hasAccount, navigation]);

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.bgImage}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePressBack} activeOpacity={0.8}>
          <ArrowLeftSvg fill="white" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -bottomSpace : 0}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          style={styles.contentWrapper}>
          <Logo width={50} height={50} />
          <Text style={styles.text}>{t('recoveryFromSeeds.text')}</Text>
          <View style={styles.inputsContainer}>
            <Controller
              control={control}
              name="seeds"
              render={({field: {onChange, onBlur, value}}) => (
                <PasswordInput
                  wrapperStyle={styles.seeds}
                  autoFocus
                  label={t('recoveryFromSeeds.seeds.label')}
                  placeholder={t('recoveryFromSeeds.seeds.placeholder')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  errorMessage={errors.seeds?.message as string}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({field: {onChange, onBlur, value}}) => (
                <PasswordInput
                  wrapperStyle={styles.password}
                  label={t('recoveryFromSeeds.password.label')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  errorMessage={errors.password?.message as string}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({field: {onChange, onBlur, value}}) => (
                <PasswordInput
                  wrapperStyle={styles.confirmPassword}
                  label={t('recoveryFromSeeds.confirmPassword.label')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  errorMessage={errors.confirmPassword?.message as string}
                  onSubmitEditing={handleSubmit(handlePressRecover)}
                />
              )}
            />
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={!isValid}
            style={[styles.button, !isValid && styles.disabledBtn]}
            onPress={handleSubmit(handlePressRecover)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {t('recoveryFromSeeds.button.restore')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default RecoveryFromSeeds;
