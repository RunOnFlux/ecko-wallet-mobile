import React, {useCallback, useMemo} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import ArrowLeftSvg from '../../assets/images/arrow-left.svg';
import ShieldLockSvg from '../../assets/images/shield-lock.svg';
import Card from '../Settings/components/Card';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {createStyles} from './styles';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {useAppThemeContext} from '../../contexts';

const SettingsSubPage = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const {theme} = useAppThemeContext();
  const styles = useMemo(
    () => createStyles(theme, {bottomSpace, statusBarHeight}),
    [theme, bottomSpace, statusBarHeight],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePressBack}
          style={styles.backBtnWrapper}>
          <ArrowLeftSvg fill="#787B8E" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settingsSubPage.header.title')}</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}>
        <Card
          isFirstItem
          title={t('settingsSubPage.cards.resetPasscode.title')}
          text={t('settingsSubPage.cards.resetPasscode.text')}
          icon={<ShieldLockSvg width={24} height={24} fill="white" />}
          onPress={() =>
            navigation.navigate({
              name: ERootStackRoutes.ResetPasscode,
              params: {isReset: true},
            })
          }
        />
        <Card
          title={t('settingsSubPage.cards.exportPhrase.title')}
          text={t('settingsSubPage.cards.exportPhrase.text')}
          icon={<ShieldLockSvg width={24} height={24} fill="white" />}
          onPress={() =>
            navigation.navigate({
              name: ERootStackRoutes.ExportRecoveryPhraseAuth,
              params: undefined,
            })
          }
        />
        <Card
          title={t('settingsSubPage.cards.changePassword.title')}
          text={t('settingsSubPage.cards.changePassword.text')}
          icon={<ShieldLockSvg width={24} height={24} fill="white" />}
          onPress={() =>
            navigation.navigate({
              name: ERootStackRoutes.ChangeAccountPassword,
              params: undefined,
            })
          }
        />
      </ScrollView>
    </View>
  );
};

export default SettingsSubPage;
