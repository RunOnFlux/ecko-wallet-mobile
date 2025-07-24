import React, {useCallback, useRef} from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useForm, Controller, FieldValues} from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Logo from '../../assets/images/logo.svg';
import ArrowLeftSvg from '../../assets/images/arrow-left.svg';
import {createStyles} from './styles';
import PasswordInput from '../../components/PasswordInput';
import {signInPasswordSchema} from '../../validation/signInPasswordSchema';
import {login} from '../../store/auth';
import {makeSelectHashPassword} from '../../store/auth/selectors';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useNavigation} from '@react-navigation/native';
import {comparePassword} from '../../api/kadena/comparePassword';
import {useSafeAreaValues} from '../../utils/deviceHelpers';

const bgImage = require('../../assets/images/bgimage.png');

const SignIn = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.SignIn>>();
  const dispatch = useDispatch();
  const hash = useSelector(makeSelectHashPassword);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({resolver: signInPasswordSchema(t)});

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const showSuccessAlert = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactMedium');
    Alert.alert(
      t('signIn.alert.usePasscodeTitle'),
      t('signIn.alert.usePasscodeMessage'),
      [
        {
          text: t('common.cancel'),
          onPress: () => dispatch(login()),
          style: 'cancel',
        },
        {
          text: t('common.ok'),
          onPress: () =>
            navigation.navigate(ERootStackRoutes.Login, {isReset: false}),
        },
      ],
    );
  }, [dispatch, navigation, t]);

  const handlePressSignIn = useCallback(
    (data: FieldValues) => {
      comparePassword({password: data.password || '', hash: hash || ''})
        .then(valid => {
          if (valid) {
            showSuccessAlert();
          } else {
            ReactNativeHapticFeedback.trigger('impactMedium');
            Alert.alert(
              t('signIn.alert.loginFailedTitle'),
              t('signIn.alert.loginFailedMessage'),
            );
          }
        })
        .catch(() => {
          ReactNativeHapticFeedback.trigger('impactMedium');
          Alert.alert(
            t('signIn.alert.errorTitle'),
            t('signIn.alert.errorMessage'),
          );
        });
    },
    [hash, showSuccessAlert, t],
  );

  const scrollRef = useRef<ScrollView>(null);
  const {bottomSpace} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight: 0});

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.bgImage}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={-bottomSpace}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.contentWrapper}
          contentContainerStyle={styles.content}>
          <Logo width={50} height={50} />
          <Text style={styles.text}>{t('signIn.welcome')}</Text>
          <Controller
            control={control}
            name="password"
            render={({field: {onChange, onBlur, value}}) => (
              <PasswordInput
                autoFocus
                label={t('signIn.label.password')}
                onChangeText={onChange}
                value={value}
                onBlur={onBlur}
                wrapperStyle={styles.password}
                errorMessage={errors.password?.message as string}
                onSubmitEditing={handleSubmit(handlePressSignIn)}
              />
            )}
          />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.button}
            onPress={handleSubmit(handlePressSignIn)}>
            <Text style={styles.buttonText}>{t('signIn.button.signIn')}</Text>
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

export default SignIn;
