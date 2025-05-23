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
import {changePassword} from '../../store/auth';
import {makeSelectHasAccount} from '../../store/userWallet/selectors';
import {createPasswordSchema} from '../../validation/createPasswordSchema';
import {hashPassword} from '../../api/kadena/hashPassword';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {createStyles} from './styles';

const bgImage = require('../../assets/images/bgimage.png');

const Registration = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.Registration>>();
  const dispatch = useDispatch();
  const hasAccount = useSelector(makeSelectHasAccount);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({resolver: createPasswordSchema(t), mode: 'onChange'});

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressCreate = useCallback(
    (data: FieldValues) => {
      if (hasAccount) return;

      hashPassword({password: data.password || ''})
        .then(hashResponseHash => {
          if (hashResponseHash) {
            dispatch(changePassword(hashResponseHash));
            navigation.navigate({
              name: ERootStackRoutes.SecretRecoveryPhraseTerm,
            });
          } else {
            ReactNativeHapticFeedback.trigger('impactMedium');
            Alert.alert(
              t('registration.alert.failureTitle'),
              t('registration.alert.failureMessage'),
            );
          }
        })
        .catch(() => {
          ReactNativeHapticFeedback.trigger('impactMedium');
          Alert.alert(
            t('registration.alert.failureTitle'),
            t('registration.alert.failureMessage'),
          );
        });
    },
    [hasAccount, dispatch, navigation, t],
  );

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (hasAccount) {
      navigation.replace(ERootStackRoutes.SignIn);
    }
  }, [hasAccount, navigation]);

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.bgImage}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={-bottomSpace}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.contentWrapper}
          contentContainerStyle={styles.content}>
          <Logo width={50} height={50} />
          <Text style={styles.text}>{t('registration.text')}</Text>
          <Controller
            control={control}
            name="password"
            render={({field: {onChange, onBlur, value}}) => (
              <PasswordInput
                wrapperStyle={styles.password}
                autoFocus
                label={t('registration.password.label')}
                onChangeText={onChange}
                value={value}
                onBlur={onBlur}
                blurOnSubmit
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
                label={t('registration.confirmPassword.label')}
                onChangeText={onChange}
                value={value}
                onBlur={onBlur}
                blurOnSubmit
                errorMessage={errors.confirmPassword?.message as string}
                onSubmitEditing={handleSubmit(handlePressCreate)}
              />
            )}
          />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!isValid}
            style={[styles.button, !isValid && styles.disabledBtn]}
            onPress={handleSubmit(handlePressCreate)}>
            <Text style={styles.buttonText}>
              {t('registration.button.create')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.8} onPress={handlePressBack}>
            <ArrowLeftSvg fill="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Registration;
