import React, {useCallback, useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ArrowLeftSvg from '../../../../assets/images/arrow-left.svg';
import CirclePlusSvg from '../../../../assets/images/circle-plus.svg';
import {ERootStackRoutes, TNavigationProp} from '../../../../routes/types';
import {setSelectedToken} from '../../../../store/userWallet';
import {useAppThemeContext} from '../../../../contexts';
import {makeStyles} from './styles';

const Header = React.memo(() => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.SearchTokens>>();

  const handlePressCreate = useCallback(() => {
    dispatch(setSelectedToken(null));
    setTimeout(
      () =>
        navigation.navigate({
          name: ERootStackRoutes.AddToken,
          params: {tokenName: undefined},
        }),
      150,
    );
  }, [navigation, dispatch]);

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePressBack}
        style={styles.backBtnWrapper}>
        <ArrowLeftSvg fill="#787B8E" />
      </TouchableOpacity>
      <Text style={styles.title}>{t('searchTokens.header.title')}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.rightItemWrapper}
        onPress={handlePressCreate}>
        <CirclePlusSvg />
      </TouchableOpacity>
    </View>
  );
});

export default Header;
