import React, { FC, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ArrowLeftSvg from '../../assets/images/arrow-left.svg';
import { makeStyles } from './styles';
import { useSafeAreaValues } from '../../utils/deviceHelpers';
import { useAppThemeContext } from '../../contexts';

type HeaderProps = {
  title: string;
  onBack?: () => void;
};

const Header: FC<HeaderProps> = ({ title, onBack }) => {
  const navigation = useNavigation();
  const { theme } = useAppThemeContext();
  const { statusBarHeight } = useSafeAreaValues();
  const styles = useMemo(
    () => makeStyles(theme, statusBarHeight),
    [theme, statusBarHeight],
  );

  const handlePressBack = useCallback(() => {
    if (onBack) onBack();
    else navigation.goBack();
  }, [navigation, onBack]);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePressBack}
        style={styles.backBtnWrapper}
      >
        <ArrowLeftSvg fill="#787B8E" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Header;
