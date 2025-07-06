import React, {useMemo} from 'react';
import {View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {createStyles} from './styles';
import {useSafeAreaValues} from '../../../../utils/deviceHelpers';
import {useAppThemeContext} from '../../../../contexts';

const Header = React.memo(() => {
  const {t} = useTranslation();
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const {theme} = useAppThemeContext();
  const styles = useMemo(
    () => createStyles(theme, {bottomSpace, statusBarHeight}),
    [theme, bottomSpace, statusBarHeight],
  );

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{t('sendProgress.header.title')}</Text>
    </View>
  );
});

export default Header;
