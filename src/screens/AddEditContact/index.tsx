import React, {useCallback} from 'react';
import {Platform, ScrollView, View, KeyboardAvoidingView} from 'react-native';
import {useForm, Controller, FieldValues} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import FooterButton from '../../components/FooterButton';
import Input from '../../components/Input';
import {addCreateContactSchema} from '../../validation/addCreateContactSchema';
import {createContact, updateSelectedContact} from '../../store/contacts';
import {makeSelectSelectedContact} from '../../store/contacts/selectors';
import {createStyles} from './styles';
import ChainId from '../../components/ChainId';
import {chainIds} from '../Send/consts';
import {useShallowEqualSelector} from '../../store/utils';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ERootStackRoutes,
  TNavigationProp,
  TNavigationRouteProp,
} from '../../routes/types';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import Header from '../../components/Header';

const AddEditContact = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.AddEditContact>>();
  const route =
    useRoute<TNavigationRouteProp<ERootStackRoutes.AddEditContact>>();

  const isCreate = Boolean(route.params?.isCreate);

  const dispatch = useDispatch();

  const selectedContact = useShallowEqualSelector(makeSelectSelectedContact);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: addCreateContactSchema,
    defaultValues: !isCreate && selectedContact ? selectedContact : undefined,
    mode: 'onChange',
  });

  const handlePressSave = useCallback(
    (data: FieldValues) => {
      dispatch(isCreate ? createContact(data) : updateSelectedContact(data));
      navigation.goBack();
    },
    [navigation, isCreate],
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-bottomSpace}>
      <View style={styles.screen}>
        <Header title={t('addEditContact.header.title')} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          style={styles.contentWrapper}>
          <Controller
            control={control}
            name="contactName"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={t('addEditContact.contactName.label')}
                placeholder={t('addEditContact.contactName.placeholder')}
                placeholderTextColor="gray"
                wrapperStyle={styles.inputWrapper}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                errorMessage={errors.contactName?.message as string}
              />
            )}
          />
          <Controller
            control={control}
            name="accountName"
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                label={t('addEditContact.accountName.label')}
                placeholder={t('addEditContact.accountName.placeholder')}
                placeholderTextColor="gray"
                multiline
                numberOfLines={5}
                wrapperStyle={styles.inputWrapper}
                style={styles.accountNameInput}
                textAlignVertical="top"
                autoCapitalize="none"
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
                errorMessage={errors.chainId?.message as string}
              />
            )}
          />
        </ScrollView>
        <View style={styles.footer}>
          <FooterButton
            title={t('addEditContact.saveButton')}
            onPress={handleSubmit(handlePressSave)}
            disabled={!isValid}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddEditContact;
