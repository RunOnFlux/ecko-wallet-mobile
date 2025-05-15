import React, {useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import FooterButton from '../../components/FooterButton';
import {createStyles} from './styles';
import PasswordInput from '../../components/PasswordInput';
import {Controller, useForm} from 'react-hook-form';
import {resetAccountPassword} from '../../validation/resetAccountPassword';
import {TFields, TChangeAccountPasswordForm} from './types';
import ArrowLeftSvg from '../../assets/images/arrow-left.svg';
import {useNavigation} from '@react-navigation/native';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import Toast from 'react-native-toast-message';
import {setPassword} from '../../store/auth';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useDispatch, useSelector} from 'react-redux';
import {makeSelectHashPassword} from '../../store/auth/selectors';
import {comparePassword} from '../../api/kadena/comparePassword';
import {hashPassword} from '../../api/kadena/hashPassword';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {useTranslation} from 'react-i18next';

const ChangeAccountPassword = () => {
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Login>>();
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const hash = useSelector(makeSelectHashPassword);
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const fields: TFields[] = [
    {
      name: 'currentPassword',
      label: t('changeAccountPassword.currentPassword.label'),
    },
    {name: 'newPassword', label: t('changeAccountPassword.newPassword.label')},
    {
      name: 'confirmPassword',
      label: t('changeAccountPassword.confirmPassword.label'),
    },
  ];

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<TChangeAccountPasswordForm>({resolver: resetAccountPassword(t)});

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressChange = useCallback(
    (data: TChangeAccountPasswordForm) => {
      comparePassword({
        password: data.currentPassword || '',
        hash: hash || '',
      })
        .then(compareResponse => {
          if (compareResponse) {
            hashPassword({
              password: data.newPassword || '',
            })
              .then(hashResponseHash => {
                if (hashResponseHash) {
                  dispatch(setPassword(hashResponseHash));
                  Toast.show({
                    type: 'success',
                    position: 'top',
                    visibilityTime: 3000,
                    autoHide: true,
                    text1: t('changeAccountPassword.toast.success'),
                    topOffset: statusBarHeight + 16,
                  });
                  handlePressBack();
                } else {
                  ReactNativeHapticFeedback.trigger('impactMedium', {
                    enableVibrateFallback: false,
                    ignoreAndroidSystemSettings: false,
                  });
                  Alert.alert(
                    t('changeAccountPassword.alert.changeFailureTitle'),
                    t('changeAccountPassword.alert.changeFailureMessage'),
                  );
                }
              })
              .catch(() => {
                ReactNativeHapticFeedback.trigger('impactMedium', {
                  enableVibrateFallback: false,
                  ignoreAndroidSystemSettings: false,
                });
                Alert.alert(
                  t('changeAccountPassword.alert.changeFailureTitle'),
                  t('changeAccountPassword.alert.changeFailureMessage'),
                );
              });
          } else {
            ReactNativeHapticFeedback.trigger('impactMedium', {
              enableVibrateFallback: false,
              ignoreAndroidSystemSettings: false,
            });
            Alert.alert(
              t('changeAccountPassword.alert.verifyFailureTitle'),
              t('changeAccountPassword.alert.verifyFailureMessage'),
            );
          }
        })
        .catch(() => {
          ReactNativeHapticFeedback.trigger('impactMedium', {
            enableVibrateFallback: false,
            ignoreAndroidSystemSettings: false,
          });
          Alert.alert(
            t('changeAccountPassword.alert.verifyFailureTitle'),
            t('changeAccountPassword.alert.changeFailureMessage'),
          );
        });
    },
    [dispatch, hash, handlePressBack, statusBarHeight, t],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePressBack}
          style={styles.backBtnWrapper}>
          <ArrowLeftSvg fill="#787B8E" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {t('changeAccountPassword.header.title')}
        </Text>
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.form}>
          {fields.map(field => (
            <Controller
              key={field.name}
              control={control}
              name={field.name}
              render={({field: {onChange, onBlur, value}}) => (
                <PasswordInput
                  autoFocus={field.name === 'currentPassword'}
                  label={field.label}
                  onChangeText={onChange}
                  value={value}
                  white
                  onBlur={onBlur}
                  wrapperStyle={styles.password}
                  style={styles.input}
                  inputContainerStyle={styles.inputContainer}
                  iconStyle={styles.icon}
                  errorMessage={errors[field.name]?.message as string}
                  onSubmitEditing={handleSubmit(handlePressChange)}
                />
              )}
            />
          ))}
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.footer}>
        <FooterButton
          style={styles.footerBtn}
          title={t('changeAccountPassword.changeButton')}
          onPress={handleSubmit(handlePressChange)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChangeAccountPassword;
