import React, {useCallback, useEffect, useState} from 'react';
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import emojiFlags from 'emoji-flags';
import Card from './components/Card';
import ArrowDownSvg from '../../assets/images/arrow-down.svg';
import Logo from '../../assets/images/logo.svg';
import UserSvg from '../../assets/images/user.svg';
import CircleArrowRightSvg from '../../assets/images/circle-arrow-right.svg';
import CircleArrowRightGreenSvg from '../../assets/images/circle-arrow-right-green.svg';
import {styles} from './styles';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {
  makeSelectHasBackedUpPhrase,
  makeSelectHashPassword,
  makeSelectPinCode,
} from '../../store/auth/selectors';
import {makeSelectHasAccount} from '../../store/userWallet/selectors';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import LanguageSelectorModal, {
  LANGUAGES,
} from '../../components/LanguageSelectorModal';
import i18n from '../../locales/i18n';

const bgImage = require('../../assets/images/bgimage.png');

const Welcome = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Welcome>>();

  const hasAccount = useSelector(makeSelectHasAccount);
  const storedPinCode = useSelector(makeSelectPinCode);
  const storedPasswordHash = useSelector(makeSelectHashPassword);
  const hasBackedUpPhrase = useSelector(makeSelectHasBackedUpPhrase);

  const [langModalVisible, setLangModalVisible] = useState(false);

  const toggleLangModal = useCallback(() => setLangModalVisible(v => !v), []);

  const navigateTo = useCallback(
    (route: any) => () => {
      navigation.navigate(route);
    },
    [navigation],
  );

  useEffect(() => {
    if (storedPinCode) {
      navigation.navigate({
        name: ERootStackRoutes.Login,
        params: {
          isReset: false,
        },
      });
    } else if (storedPasswordHash) {
      navigation.navigate({
        name: ERootStackRoutes.SignIn,
        params: undefined,
      });
    }
  }, []);

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
  const flag = emojiFlags.countryCode(current.countryCode)?.emoji || '';

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.bgImage}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.main}>
          <Logo width={50} height={50} />
          <Text style={styles.welcome}>{t('welcome.title')}</Text>
          <Text style={styles.smText}>{t('welcome.subtitle')}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.langButton}
            onPress={toggleLangModal}>
            <Text style={styles.langButtonText}>
              {flag} {current.name}
            </Text>
            <ArrowDownSvg />
          </TouchableOpacity>
          <View style={styles.cards}>
            {storedPasswordHash && hasBackedUpPhrase ? (
              <Card
                title={t('welcome.loginCard.title')}
                description={t('welcome.loginCard.description')}
                icon={<CircleArrowRightGreenSvg />}
                onPress={navigateTo(ERootStackRoutes.SignIn)}
              />
            ) : null}
            {!hasAccount ? (
              <>
                <Card
                  title={t('welcome.newUserCard.title')}
                  description={t('welcome.newUserCard.description')}
                  icon={<UserSvg />}
                  onPress={navigateTo(ERootStackRoutes.Registration)}
                />
                <Card
                  title={t('welcome.recoverCard.title')}
                  description={t('welcome.recoverCard.description')}
                  icon={<CircleArrowRightSvg />}
                  onPress={navigateTo(ERootStackRoutes.RecoveryFromSeeds)}
                />
              </>
            ) : (
              <>
                <Text style={styles.smText}>
                  {t('welcome.instructions.intro')}
                </Text>
                <Text style={styles.smText}>
                  {t('welcome.instructions.step1')}
                </Text>
                <Text style={styles.smText}>
                  {t('welcome.instructions.step2')}
                </Text>
                <Text style={styles.smText}>
                  {t('welcome.instructions.step3')}
                </Text>
              </>
            )}
          </View>
          <LanguageSelectorModal
            isVisible={langModalVisible}
            toggle={toggleLangModal}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Welcome;
