import React, {FC, useEffect} from 'react';
import {View, Text, ImageBackground} from 'react-native';
import {useTranslation} from 'react-i18next';

import {createStyles} from './styles';
import {TLoginProps} from './types';
import {useNetInfo} from '@react-native-community/netinfo';
import {useSafeAreaValues} from '../../utils/deviceHelpers';

const bgImage = require('../../assets/images/bgimage.png');

const NoConnection: FC<TLoginProps> = ({navigation}) => {
  const {t} = useTranslation();
  const netInfo = useNetInfo();

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  useEffect(() => {
    if (netInfo?.isInternetReachable && netInfo?.isConnected) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [netInfo, navigation]);

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.bgImage}>
      <View style={styles.contentWrapper}>
        <Text style={styles.unlockText}>{t('noConnection.message')}</Text>
      </View>
    </ImageBackground>
  );
};

export default NoConnection;
