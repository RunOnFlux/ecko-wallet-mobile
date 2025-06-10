import React, {useCallback, useMemo, useState} from 'react';
import {View, TextInput, ScrollView, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import Header from './components/Header';
import BasicSearchSvg from '../../assets/images/basic-search.svg';
import Item from './components/Item';
import ContactDetailsModal from '../../modals/ContactDetailsModal';
import {useDispatch} from 'react-redux';
import {makeSelectContactsList} from '../../store/contacts/selectors';
import {TContact} from './components/Item/types';
import {setSelectedContact} from '../../store/contacts';
import {useShallowEqualSelector} from '../../store/utils';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {useAppThemeContext} from '../../contexts';
import {makeStyles} from './styles';

const Contacts = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const contactsList = useShallowEqualSelector(makeSelectContactsList);
  const [search, setSearch] = useState('');

  const filteredList = contactsList.filter((item: TContact) =>
    item.contactName.includes(search),
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = useCallback(() => {
    setModalVisible(!isModalVisible);
  }, [isModalVisible]);
  const handlePressItem = useCallback(
    (item: TContact) => () => {
      toggleModal();
      dispatch(setSelectedContact(item));
    },
    [toggleModal, dispatch],
  );
  const styles = makeStyles();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.body}>
        <View style={styles.searchSection}>
          <BasicSearchSvg />
          <TextInput
            placeholderTextColor="grey"
            style={styles.input}
            placeholder={t('contacts.searchPlaceholder')}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          style={styles.contactsWrapper}
          contentContainerStyle={styles.contactsContent}>
          {filteredList.map((item: TContact) => (
            <Item item={item} key={item.id} onPress={handlePressItem(item)} />
          ))}
          {contactsList.length === 0 && (
            <Text style={styles.emptyList}>{t('contacts.emptyList')}</Text>
          )}
        </ScrollView>
      </View>
      <ContactDetailsModal isVisible={isModalVisible} toggle={toggleModal} />
    </View>
  );
};

export default Contacts;
