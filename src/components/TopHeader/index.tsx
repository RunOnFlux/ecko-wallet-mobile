import React, {FC, useMemo} from 'react';
import {View} from 'react-native';
import {makeStyles} from './styles';
import {TTopHeaderProps} from './types';
import {useAppThemeContext} from '../../contexts';

const TopHeader: FC<TTopHeaderProps> = ({children}) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return <View style={styles.wrapper}>{children}</View>;
};

export default TopHeader;
