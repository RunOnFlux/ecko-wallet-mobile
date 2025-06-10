import React, {FC, useCallback, useMemo} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Snackbar from 'react-native-snackbar';
import {useDispatch} from 'react-redux';

import PencilEditSvg from '../../assets/images/pencil-edit.svg';
import TrashEmptySvg from '../../assets/images/trash-empty.svg';
import BasicCopySvg from '../../assets/images/basic-copy.svg';
import Modal from '../../components/Modal';
import ListItem from '../../components/ListItem';
import {TContactDetailsModalProps} from './types';
import {createStyles} from './styles';
import {ERootStackRoutes} from '../../routes/types';
import {makeSelectSelectedContact} from '../../store/contacts/selectors';
import {deleteSelectedContact} from '../../store/contacts';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useShallowEqualSelector} from '../../store/utils';
import {useTranslation} from 'react-i18next';
import {useAppThemeContext} from '../../contexts';

const ContactDetailsModal: FC<TContactDetailsModalProps> = React.memo(
  ({toggle, isVisible}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();

    const contact = useShallowEqualSelector(makeSelectSelectedContact);

    const {theme} = useAppThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handlePressRemove = useCallback(() => {
      dispatch(deleteSelectedContact());
      toggle();
    }, [toggle]);

    const handlePressEdit = useCallback(() => {
      toggle();
      navigation.navigate(ERootStackRoutes.AddEditContact);
    }, [toggle, navigation]);

    const copyToClipboard = useCallback(() => {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
      Clipboard.setString(contact?.accountName || '');
      Snackbar.show({
        text: t('contactDetails.copied'),
        duration: Snackbar.LENGTH_SHORT,
      });
    }, [contact, t]);

    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={contact?.contactName}
        logo={
          <Image
            style={styles.image}
            source={require('../../assets/images/walletProfile.png')}
          />
        }>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentWrapper}>
            <View style={styles.accountNameSection}>
              <View style={styles.accountNameSectionHeader}>
                <Text style={styles.title}>
                  {t('contactDetails.accountName')}
                </Text>
                <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.8}>
                  <BasicCopySvg />
                </TouchableOpacity>
              </View>
              <Text
                onPress={copyToClipboard}
                style={[styles.text, styles.accountName]}>
                {contact?.accountName}
              </Text>
            </View>
            <View style={styles.chainIdSection}>
              <Text style={styles.title}>{t('contactDetails.chainId')}</Text>
              <Text style={[styles.text, styles.chainIdText]}>
                {contact?.chainId}
              </Text>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <ListItem
              text={t('contactDetails.edit')}
              icon={<PencilEditSvg />}
              style={styles.itemStyle}
              onPress={handlePressEdit}
            />
            <ListItem
              text={t('common.delete')}
              icon={<TrashEmptySvg />}
              onPress={handlePressRemove}
            />
          </View>
        </View>
      </Modal>
    );
  },
);

export default ContactDetailsModal;
