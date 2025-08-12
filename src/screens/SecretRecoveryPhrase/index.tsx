import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Snackbar from 'react-native-snackbar';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Logo from '../../assets/images/logo.svg';
import ArrowLeftSvg from '../../assets/images/arrow-left.svg';

import {createStyles} from './styles';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {getGeneratePasswords} from '../../store/auth/actions';
import {
  makeSelectGeneratedPhrases,
  makeSelectGeneratedPhrasesLoading,
} from '../../store/auth/selectors';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useShallowEqualSelector} from '../../store/utils';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {AppDispatch} from '../../store/store';

const bgImage = require('../../assets/images/bgimage.png');

const SecretRecoveryPhrase = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.SecretRecoveryPhrase>>();

  const dispatch = useDispatch<AppDispatch>();

  const seeds = useShallowEqualSelector(makeSelectGeneratedPhrases);
  const isLoading = useSelector(makeSelectGeneratedPhrasesLoading);

  const [isRevealed, setRevealed] = useState(false);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressContinue = useCallback(() => {
    navigation.navigate({name: ERootStackRoutes.VerifyRecoveryPhrase});
  }, [navigation]);

  const handlePressReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const copyToClipboard = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: false,
      ignoreAndroidSystemSettings: false,
    });
    Clipboard.setString(seeds);
    Snackbar.show({
      text: t('secretRecoveryPhrase.snackbar'),
      duration: Snackbar.LENGTH_SHORT,
    });
  }, [seeds, t]);

  useEffect(() => {
    dispatch(getGeneratePasswords());
  }, [dispatch]);

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.bgImage}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.contentWrapper}
        contentContainerStyle={styles.content}>
        <Logo width={50} height={50} />
        <Text style={styles.title}>{t('secretRecoveryPhrase.title')}</Text>
        {isRevealed ? (
          isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.secretWords} onPress={copyToClipboard}>
              {seeds}
            </Text>
          )
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.button}
            onPress={handlePressReveal}>
            <Text style={styles.buttonText}>
              {t('secretRecoveryPhrase.reveal')}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.infoWrapper}>
          <Text style={styles.text}>
            {t('secretRecoveryPhrase.description1')}
          </Text>
          <Text style={styles.text}>
            {t('secretRecoveryPhrase.description2')}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!isRevealed}
          style={styles.button}
          onPress={handlePressContinue}>
          <Text style={styles.buttonText}>
            {t('secretRecoveryPhrase.continue')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePressBack}>
          <ArrowLeftSvg fill="white" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default SecretRecoveryPhrase;
