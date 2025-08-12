import React, {FC, useCallback, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import BasicSettingsSvg from '../../../../assets/images/basic-settins.svg';
import Modal from '../../../../components/Modal';
import Input from '../../../../components/Input';
import {styles} from './styles';
import Predicate from '../../../../components/Predicate';
import {predicates} from '../../consts';
import {TSettingsType} from './types';
import {useSafeAreaValues} from '../../../../utils/deviceHelpers';

const Settings: FC<TSettingsType> = ({
  predicate,
  setPredicate,
  receiverPublicKey,
  setReceiverPublicKey,
}) => {
  const {t} = useTranslation();
  const [isVisible, setVisible] = useState(false);
  const {bottomSpace} = useSafeAreaValues();

  const toggleModal = useCallback(() => {
    setVisible(!isVisible);
  }, [isVisible]);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.iconWrapper}
        onPress={toggleModal}>
        <BasicSettingsSvg fill="#787B8E" width={24} height={24} />
      </TouchableOpacity>
      <Modal
        isVisible={isVisible}
        close={toggleModal}
        title={t('send.content.advancedSettings')}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={-bottomSpace}>
          <View style={styles.contentWrapper}>
            <View style={styles.predicateContainer}>
              <Predicate
                value={predicate}
                setValue={setPredicate}
                items={predicates}
              />
            </View>
            <Input
              wrapperStyle={styles.inputWrapper}
              label={t('send.content.receiverLabel')}
              placeholder={t('send.content.receiverPlaceholder')}
              value={receiverPublicKey || ''}
              onChangeText={setReceiverPublicKey}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default Settings;
