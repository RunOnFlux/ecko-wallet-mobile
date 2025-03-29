import React, {FC, useCallback} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ArrowLeftSvg from '../../assets/images/arrow-left.svg';
import {createStyles} from './styles';
import {useSafeAreaValues} from '../../utils/deviceHelpers';

type HeaderProps = {
  title: string;
};

const Header: FC<HeaderProps> = ({title}) => {
  const navigation = useNavigation();
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

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
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Header;
