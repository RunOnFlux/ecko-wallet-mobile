import React, {useCallback, useMemo} from 'react';
import {View, Text, ImageBackground, TouchableOpacity} from 'react-native';
import {createStyles} from './styles';
import ArrowLeftSvg from '../../assets/images/arrow-left.svg';
import SecurityUnlockSvg from '../../assets/images/security-unlock.svg';
import Numpad from '../../components/Numpad';
import {useSelector} from 'react-redux';
import {
  makeSelectNewPinCode,
  makeSelectPinCode,
} from '../../store/auth/selectors';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ERootStackRoutes,
  TNavigationProp,
  TNavigationRouteProp,
} from '../../routes/types';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {useTranslation} from 'react-i18next';

const bgImage = require('../../assets/images/bgimage.png');

const Login = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Login>>();
  const route = useRoute<TNavigationRouteProp<ERootStackRoutes.Login>>();

  const isReset = Boolean(route?.params?.isReset);
  const storedPinCode = useSelector(makeSelectPinCode);
  const newPinCode = useSelector(makeSelectNewPinCode);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const titleKey = useMemo(() => {
    if (!isReset && storedPinCode) return 'login.title.unlock';
    if (newPinCode)
      return isReset ? 'login.title.reenterNew' : 'login.title.reenter';
    return isReset ? 'login.title.enterNew' : 'login.title.enter';
  }, [isReset, storedPinCode, newPinCode]);

  const title = t(titleKey);

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.bgImage}>
      <View style={styles.contentWrapper}>
        <View style={styles.unlockWrapper}>
          <SecurityUnlockSvg fill="white" width={32} height={32} />
        </View>
        <Text style={styles.unlockText}>{title}</Text>
        <View style={styles.bodyWrapper}>
          <Numpad isReset={isReset} />
        </View>
      </View>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePressBack}>
          <ArrowLeftSvg fill="white" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Login;
