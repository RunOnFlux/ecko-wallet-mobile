import React, {useCallback, useMemo} from 'react';
import {Alert, ScrollView, View} from 'react-native';
import {useForm, Controller, FieldValues} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import FooterButton from '../../components/FooterButton';
import Input from '../../components/Input';
import {createStyles} from './styles';
import {addCreateNetworkSchema} from '../../validation/addCreateNetworkSchema';
import {makeSelectSelectedNetwork} from '../../store/networks/selectors';
import {createNetwork, updateSelectedNetwork} from '../../store/networks';
import {EDefaultNetwork} from '../Networks/types';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useShallowEqualSelector} from '../../store/utils';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ERootStackRoutes,
  TNavigationProp,
  TNavigationRouteProp,
} from '../../routes/types';
import axios from 'axios';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import Header from '../../components/Header';

const AddEditNetwork = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.AddEditNetwork>>();
  const route =
    useRoute<TNavigationRouteProp<ERootStackRoutes.AddEditNetwork>>();

  const isCreate = Boolean(route.params?.isCreate);
  const dispatch = useDispatch();

  const selectedNetwork = useShallowEqualSelector(makeSelectSelectedNetwork);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const isEditable = useMemo(
    () => isCreate || !selectedNetwork?.isDefault,
    [isCreate, selectedNetwork],
  );

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: addCreateNetworkSchema,
    defaultValues: !isCreate && selectedNetwork ? selectedNetwork : undefined,
    mode: 'onChange',
  });

  const handlePressSave = useCallback(
    async (data: FieldValues) => {
      try {
        const response = await axios.get(`${data.host}/info`);
        if (response.data?.nodeApiVersion && response.data?.nodeVersion) {
          const _data = {
            ...data,
            name: data.name || t('addEditNetwork.defaultName'),
            network: EDefaultNetwork.custom,
            explorerUrl: '',
          };
          dispatch(
            isCreate ? createNetwork(_data) : updateSelectedNetwork(_data),
          );
          setTimeout(() => navigation.goBack(), 150);
        }
      } catch (e) {
        ReactNativeHapticFeedback.trigger('impactMedium', {
          enableVibrateFallback: false,
          ignoreAndroidSystemSettings: false,
        });
        Alert.alert(
          t('addEditNetwork.alert.failureTitle'),
          t('addEditNetwork.alert.failureMessage'),
        );
      }
    },
    [isCreate, navigation, t],
  );

  return (
    <View style={styles.screen}>
      <Header title={t('addEditNetwork.header.title')} />
      <ScrollView
        style={styles.contentWrapper}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Controller
          control={control}
          name="name"
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              label={t('addEditNetwork.name.label')}
              placeholder={t('addEditNetwork.name.placeholder')}
              placeholderTextColor="gray"
              wrapperStyle={styles.inputWrapper}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.name?.message as string}
            />
          )}
        />
        <Controller
          control={control}
          name="host"
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              label={t('addEditNetwork.host.label')}
              placeholder={t('addEditNetwork.host.placeholder')}
              placeholderTextColor="gray"
              autoCapitalize="none"
              wrapperStyle={styles.inputWrapper}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              errorMessage={errors.host?.message as string}
              editable={isEditable}
            />
          )}
        />
      </ScrollView>
      <View style={styles.footer}>
        <FooterButton
          title={t('addEditNetwork.saveButton')}
          onPress={handleSubmit(handlePressSave)}
          disabled={!isValid}
        />
      </View>
    </View>
  );
};

export default AddEditNetwork;
