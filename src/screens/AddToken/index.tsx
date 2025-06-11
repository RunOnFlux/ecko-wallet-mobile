import React, {useCallback, useRef, useState} from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import {useForm, Controller, FieldValues} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import FooterButton from '../../components/FooterButton';
import Input from '../../components/Input';
import {addTokenSchema} from '../../validation/addTokenSchema';
import {createStyles} from './styles';
import {
  makeSelectSelectedAccount,
  makeSelectSelectedToken,
} from '../../store/userWallet/selectors';
import {useScrollBottomOnKeyboard} from '../../utils/keyboardHelpers';
import {makeSelectActiveNetworkDetails} from '../../store/networks/selectors';
import {getNetworkParams} from '../../utils/networkHelpers';
import {addNewToken} from '../../store/userWallet';
import {defaultBalances} from '../../store/userWallet/const';
import {getBalances} from '../../store/userWallet/actions';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useShallowEqualSelector} from '../../store/utils';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ERootStackRoutes,
  TNavigationProp,
  TNavigationRouteProp,
} from '../../routes/types';
import {getToken} from '../../api/kadena/token';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import Header from '../../components/Header';
import {useAppThemeContext} from '../../contexts';

const AddToken = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.AddToken>>();
  const route = useRoute<TNavigationRouteProp<ERootStackRoutes.AddToken>>();

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialTokenName = route?.params?.tokenName || '';
  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const selectedToken = useShallowEqualSelector(makeSelectSelectedToken);
  const networkDetail = useShallowEqualSelector(makeSelectActiveNetworkDetails);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const {theme} = useAppThemeContext();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: addTokenSchema,
    mode: 'onChange',
    defaultValues: {
      ...(selectedToken || {}),
      tokenAddress: selectedToken?.tokenAddress || initialTokenName || '',
    },
  });

  const handlePressSave = useCallback(
    (formValues: FieldValues) => {
      if (networkDetail && selectedAccount?.accountName) {
        setIsLoading(true);
        getToken({
          accountName: selectedAccount.accountName,
          token: formValues.tokenAddress,
          ...networkDetail,
          ...getNetworkParams(networkDetail),
        })
          .then(responseData => {
            if (responseData) {
              dispatch(
                addNewToken({
                  tokenAddress: formValues.tokenAddress,
                  tokenName: formValues.tokenName,
                  totalAmount: 0,
                  chainBalance: defaultBalances,
                }),
              );
              setIsLoading(false);
              navigation.goBack();
              route.params?.onTokenAdd?.(
                formValues.tokenName,
                formValues.tokenAddress,
              );
              setTimeout(() => {
                dispatch(
                  getBalances({
                    instance: networkDetail.instance,
                    version: `${networkDetail.version}`,
                    chainIds: networkDetail.chainIds,
                    ...getNetworkParams(networkDetail),
                  }),
                );
              }, 600);
            } else {
              ReactNativeHapticFeedback.trigger('impactMedium', {
                enableVibrateFallback: false,
                ignoreAndroidSystemSettings: false,
              });
              Alert.alert(
                t('addToken.alert.failureTitle'),
                t('addToken.alert.failureMessage'),
              );
              setIsLoading(false);
            }
          })
          .catch(() => {
            setIsLoading(false);
            ReactNativeHapticFeedback.trigger('impactMedium', {
              enableVibrateFallback: false,
              ignoreAndroidSystemSettings: false,
            });
            Alert.alert(
              t('addToken.alert.failureTitle'),
              t('addToken.alert.failureMessage'),
            );
          });
      }
    },
    [networkDetail, selectedAccount, navigation, route.params, dispatch, t],
  );

  const scrollRef = useRef<ScrollView | null>(null);
  useScrollBottomOnKeyboard(scrollRef);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={-bottomSpace}>
      <View style={styles.container}>
        <Header title={t('addToken.header.titleImport')} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          style={styles.contentWrapper}>
          <Controller
            control={control}
            name="tokenAddress"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={t('addToken.tokenAddress.label')}
                placeholder={t('addToken.tokenAddress.placeholder')}
                placeholderTextColor={theme.text.secondary}
                autoCapitalize="none"
                wrapperStyle={styles.inputWrapper}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorMessage={errors.tokenAddress?.message as string}
              />
            )}
          />
          <Controller
            control={control}
            name="tokenName"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={t('addToken.tokenName.label')}
                placeholder={t('addToken.tokenName.placeholder')}
                placeholderTextColor={theme.text.secondary}
                autoCapitalize="characters"
                wrapperStyle={styles.inputWrapper}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorMessage={errors.tokenName?.message as string}
              />
            )}
          />
        </ScrollView>
        <View style={styles.footer}>
          <FooterButton
            title={t('addToken.saveButton')}
            onPress={handleSubmit(handlePressSave)}
            disabled={!isValid || isLoading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddToken;
