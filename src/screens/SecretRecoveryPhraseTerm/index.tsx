import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';

import Logo from '../../assets/images/logo.svg';
import ArrowLeftSvg from '../../assets/images/arrow-left.svg';
import {createStyles} from './styles';
import Checkbox from '../../components/Checkbox';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaValues} from '../../utils/deviceHelpers';

const bgImage = require('../../assets/images/bgimage.png');

const SecretRecoveryPhraseTerm = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.SecretRecoveryPhraseTerm>>();

  const [isChecked, setChecked] = useState(false);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressContinue = useCallback(() => {
    navigation.navigate({
      name: ERootStackRoutes.SecretRecoveryPhrase,
      params: undefined,
    });
  }, [navigation]);

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.bgImage}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.contentWrapper}
        contentContainerStyle={styles.content}>
        <Logo width={50} height={50} />
        <Text style={styles.title}>{t('secretRecoveryPhraseTerm.title')}</Text>
        <View style={styles.infoWrapper}>
          <Text style={styles.text}>{t('secretRecoveryPhraseTerm.line1')}</Text>
          <Text style={styles.text}>{t('secretRecoveryPhraseTerm.line2')}</Text>
          <Text style={styles.text}>{t('secretRecoveryPhraseTerm.line3')}</Text>
          <Text style={styles.text}>{t('secretRecoveryPhraseTerm.line4')}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.checkBoxWrapper}>
          <Checkbox
            isChecked={isChecked}
            onPress={setChecked}
            textStyle={styles.checkBoxText}
            iconStyle={styles.checkBoxIcon}
            style={styles.checkBox}
            text={t('secretRecoveryPhraseTerm.checkbox')}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!isChecked}
          style={[styles.button, !isChecked && styles.disabledBtn]}
          onPress={handlePressContinue}>
          <Text style={styles.buttonText}>{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePressBack}>
          <ArrowLeftSvg fill="white" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default SecretRecoveryPhraseTerm;
