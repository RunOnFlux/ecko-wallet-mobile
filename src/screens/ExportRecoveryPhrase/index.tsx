import React, {useCallback, useMemo} from 'react';
import {View, Text, ScrollView, Image} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Snackbar from 'react-native-snackbar';
import {useTranslation} from 'react-i18next';
import Header from './components/Header';
import Warning from '../../components/Warning';
import ListItem from '../../components/ListItem';
import BasicCopySvg from '../../assets/images/basic-copy.svg';
import {createStyles} from './styles';
import {makeSelectGeneratedPhrases} from '../../store/auth/selectors';
import {getSecretList} from '../../utils/stringHelpers';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useShallowEqualSelector} from '../../store/utils';
import {useSafeAreaValues} from '../../utils/deviceHelpers';

const ExportRecoveryPhrase = () => {
  const {t} = useTranslation();
  const seeds = useShallowEqualSelector(makeSelectGeneratedPhrases);

  const secretWords = useMemo(() => getSecretList(seeds), [seeds]);
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const copyToClipboard = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: false,
      ignoreAndroidSystemSettings: false,
    });
    Clipboard.setString(seeds);
    Snackbar.show({
      text: t('exportRecoveryPhrase.snackbar'),
      duration: Snackbar.LENGTH_SHORT,
    });
  }, [seeds, t]);

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.contentWrapper}>
        <View style={styles.cardContainer}>
          <View style={styles.secretKeysWrapper}>
            {secretWords.map((word, j) => (
              <View key={word + j} style={styles.secretKeysText}>
                {word.split(' ').map((item, index) => (
                  <Text key={index + j} style={styles.secretKeys}>
                    {item}
                  </Text>
                ))}
              </View>
            ))}
          </View>
          <Text style={styles.text}>
            {t('exportRecoveryPhrase.description')}
          </Text>
          <Warning text={t('exportRecoveryPhrase.warning')} isSerious />
        </View>
        <View style={styles.footerWrapper}>
          <ListItem
            onPress={copyToClipboard}
            textStyle={styles.itemText}
            style={styles.itemStyle}
            text={t('exportRecoveryPhrase.copyButton')}
            icon={<BasicCopySvg />}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ExportRecoveryPhrase;
