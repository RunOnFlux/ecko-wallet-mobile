import React, {useCallback} from 'react';
import {ScrollView, View} from 'react-native';
import {useForm, Controller, FieldValues} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import FooterButton from '../../components/FooterButton';
import Input from '../../components/Input';
import {createStyles} from './styles';
import {importAccountSchema} from '../../validation/importAccountSchema';
import {getImportAccount} from '../../store/userWallet/actions';
import {TAccountImportRequest} from '../../store/userWallet/types';
import {makeSelectActiveNetworkDetails} from '../../store/networks/selectors';
import {getNetworkParams} from '../../utils/networkHelpers';
import ChainId from '../../components/ChainId';
import {chainIds} from '../Send/consts';
import {useShallowEqualSelector} from '../../store/utils';
import {useNavigation} from '@react-navigation/native';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import Header from '../../components/Header';
import {AppDispatch} from '../../store/store';

const ImportAccount = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.ImportAccount>>();
  const dispatch = useDispatch<AppDispatch>();

  const networkDetail = useShallowEqualSelector(makeSelectActiveNetworkDetails);
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: importAccountSchema,
    mode: 'onChange',
  });

  const handlePressSave = useCallback(
    (formValues: FieldValues) => {
      if (networkDetail) {
        const data: TAccountImportRequest = {
          accountName: formValues.accountName as string,
          privateKey: formValues.privateKey as string,
          chainId: formValues.chainId as string,
          ...networkDetail,
          ...getNetworkParams(networkDetail),
        };
        dispatch(getImportAccount(data));
        navigation.goBack();
      }
    },
    [networkDetail, navigation, dispatch],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Header title={t('importAccount.header.title')} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          style={styles.contentWrapper}>
          <Controller
            control={control}
            name="accountName"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={t('importAccount.accountName.label')}
                autoCapitalize="none"
                placeholder={t('importAccount.accountName.placeholder')}
                placeholderTextColor="gray"
                wrapperStyle={styles.inputWrapper}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorMessage={errors.accountName?.message as string}
              />
            )}
          />
          <Controller
            control={control}
            name="chainId"
            render={({field: {onChange, value}}) => (
              <ChainId
                value={value}
                setValue={onChange}
                items={chainIds}
                wrapperStyle={styles.inputWrapper}
                errorMessage={errors.chainId?.message as string}
              />
            )}
          />
          <Controller
            control={control}
            name="privateKey"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={t('importAccount.privateKey.label')}
                placeholder={t('importAccount.privateKey.placeholder')}
                placeholderTextColor="gray"
                wrapperStyle={styles.inputWrapper}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorMessage={errors.privateKey?.message as string}
              />
            )}
          />
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <FooterButton
          disabled={!isValid}
          title={t('importAccount.importButton')}
          onPress={handleSubmit(handlePressSave)}
        />
      </View>
    </View>
  );
};

export default ImportAccount;
