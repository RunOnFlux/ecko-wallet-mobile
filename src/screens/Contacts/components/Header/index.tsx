import React, {useCallback, useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import ArrowLeftSvg from '../../../../assets/images/arrow-left.svg';
import CirclePlusSvg from '../../../../assets/images/circle-plus.svg';
import {ERootStackRoutes, TNavigationProp} from '../../../../routes/types';
import {makeStyles} from './styles';
import {useAppThemeContext} from '../../../../contexts';

const Header = React.memo(() => {
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.Contacts>>();
  const {t} = useTranslation();

  const handlePressCreate = useCallback(() => {
    navigation.navigate({
      name: ERootStackRoutes.AddEditContact,
      params: {isCreate: true},
    });
  }, [navigation]);

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
      <Text style={styles.title}>{t('contacts.header.title')}</Text>
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
