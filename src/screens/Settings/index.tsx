import React, {useCallback, useMemo, useState} from 'react';
import {View, Alert, Image, ScrollView, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useNavigation} from '@react-navigation/native';
import Card from './components/Card';
import Footer from './components/Footer';
import ContactsSvg from '../../assets/images/contacts.svg';
import NetworksSvg from '../../assets/images/networks.svg';
import WalletConnectSvg from '../../assets/images/WalletConnect-icon.svg';
import FlagSVG from '../../assets/images/white-flag.svg';
import ShieldLockSvg from '../../assets/images/shield-lock.svg';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {makeStyles} from './styles';
import {deleteAccount, logout} from '../../store/auth/actions';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import ThemeSelectorModal from '../../components/ThemeSelectorModal';
import {useAppThemeContext} from '../../contexts';
import {AppDispatch} from '../../store/store';

const Settings = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
  const dispatch = useDispatch<AppDispatch>();
  const {theme} = useAppThemeContext();

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const toggleLangModal = useCallback(() => setLangModalVisible(v => !v), []);
  const toggleThemeModal = useCallback(() => setThemeModalVisible(v => !v), []);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = useMemo(
    () => makeStyles(theme, {bottomSpace, statusBarHeight}),
    [theme],
  );

  const handlePressContacts = useCallback(() => {
    navigation.navigate({
      name: ERootStackRoutes.Contacts,
      params: undefined,
    });
  }, [navigation]);

  const handlePressNetworks = useCallback(() => {
    navigation.navigate({
      name: ERootStackRoutes.Networks,
      params: undefined,
    });
  }, [navigation]);

  const handlePressWalletConnect = useCallback(() => {
    navigation.navigate({
      name: ERootStackRoutes.WalletConnectSettings,
      params: undefined,
    });
  }, [navigation]);

  const handlePressSignOut = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactMedium');
    Alert.alert(
      t('settings.alert.lockTitle'),
      t('settings.alert.lockMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('settings.alert.lockConfirm'),
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ],
    );
  }, [dispatch, t]);

  const handlePressDelete = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactMedium');
    Alert.alert(
      t('settings.alert.deleteTitle'),
      t('settings.alert.deleteMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('settings.alert.deleteConfirm'),
          style: 'destructive',
          onPress: () => dispatch(deleteAccount()),
        },
      ],
    );
  }, [dispatch, t]);

  const handlePressAccountSecurity = useCallback(() => {
    navigation.navigate({
      name: ERootStackRoutes.SettingsSubPage,
      params: undefined,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.contentWrapper}>
        <Card
          title={t('settings.cards.contacts.title')}
          text={t('settings.cards.contacts.text')}
          icon={<ContactsSvg width={24} height={24} fill="white" />}
          isFirstItem
          onPress={handlePressContacts}
        />

        <Card
          title={t('settings.cards.networks.title')}
          text={t('settings.cards.networks.text')}
          icon={<NetworksSvg width={24} height={24} fill="white" />}
          onPress={handlePressNetworks}
        />
        <Card
          title={t('common.selectLanguage')}
          text={t('common.selectLanguageLongDescription')}
          icon={<FlagSVG width={24} height={24} fill="white" />}
          onPress={toggleLangModal}
        />

        <Card
          title={`${t('common.selectTheme')}`}
          text={t('common.selectThemeLongDescription')}
          icon={<ShieldLockSvg width={24} height={24} fill="white" />}
          onPress={toggleThemeModal}
        />

        <Card
          title={t('settings.cards.walletConnect.title')}
          text={t('settings.cards.walletConnect.text')}
          icon={<WalletConnectSvg width={24} height={24} fill="white" />}
          onPress={handlePressWalletConnect}
        />

        <Card
          title={t('settings.cards.accountSecurity.title')}
          text={t('settings.cards.accountSecurity.text')}
          icon={<ShieldLockSvg width={24} height={24} fill="white" />}
          onPress={handlePressAccountSecurity}
        />

        <Card
          title={t('settings.cards.lockWallet.title')}
          text={t('settings.cards.lockWallet.text')}
          onPress={handlePressSignOut}
        />
        <Footer />

        <Card
          title={t('settings.cards.deleteAccount.title')}
          titleStyle={{color: 'red'}}
          text={t('settings.cards.deleteAccount.text')}
          onPress={handlePressDelete}
        />
        <LanguageSelectorModal
          isVisible={langModalVisible}
          toggle={toggleLangModal}
        />
        <ThemeSelectorModal
          isVisible={themeModalVisible}
          toggle={toggleThemeModal}
        />
      </ScrollView>
    </View>
  );
};

export default Settings;
