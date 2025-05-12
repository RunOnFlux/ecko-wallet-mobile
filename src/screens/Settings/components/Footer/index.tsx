import React, {FC} from 'react';
import {Linking, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import packageJson from '../../../../../package.json';
import GlobeSvg from '../../../../assets/images/globe.svg';
import DiscordSvg from '../../../../assets/images/discord.svg';
import {styles} from './styles';

const Footer: FC = React.memo(() => {
  const {t} = useTranslation();
  const version = packageJson.version;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{t('settings.footer.version', {version})}</Text>
      <Text style={styles.text}>{t('settings.footer.tagline')}</Text>
      <View style={styles.tipsWrapper}>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://dex.ecko.finance/')}
          activeOpacity={0.8}
          style={styles.tip}>
          <GlobeSvg width="24" height="24" />
          <Text style={styles.tipTitle}>
            {t('settings.footer.visitWebsite')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://discord.gg/runonflux')}
          activeOpacity={0.8}
          style={styles.tip}>
          <DiscordSvg width="24" height="24" />
          <Text style={styles.tipTitle}>
            {t('settings.footer.joinDiscord')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://wallet.ecko.finance/terms-of-use')
          }
          activeOpacity={0.8}
          style={styles.tip}>
          <Text style={styles.tipTitleNoIcon}>
            {t('settings.footer.termsOfUse')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://wallet.ecko.finance/privacy-policy')
          }
          activeOpacity={0.8}
          style={styles.tip}>
          <Text style={styles.tipTitleNoIcon}>
            {t('settings.footer.privacyPolicy')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default Footer;
