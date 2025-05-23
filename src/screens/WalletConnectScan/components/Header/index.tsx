import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

import {styles} from './styles';
import ArrowLeftSvg from '../../../../assets/images/arrow-left.svg';

const Header = React.memo(() => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePressBack}
        style={styles.backBtnWrapper}>
        <ArrowLeftSvg fill="#787B8E" />
      </TouchableOpacity>
      <Text style={styles.title}>{t('walletConnectScan.header.title')}</Text>
    </View>
  );
});

export default Header;
