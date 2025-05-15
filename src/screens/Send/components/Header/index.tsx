import React, {FC, useCallback, useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import ArrowLeftSvg from '../../../../assets/images/arrow-left.svg';
import {createStyles} from './styles';
import {makeSelectSelectedToken} from '../../../../store/userWallet/selectors';
import {useShallowEqualSelector} from '../../../../store/utils';
import {ERootStackRoutes, TNavigationProp} from '../../../../routes/types';
import {useSafeAreaValues} from '../../../../utils/deviceHelpers';

const Header: FC = React.memo(() => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Send>>();
  const selectedToken = useShallowEqualSelector(makeSelectSelectedToken);
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const title = useMemo(() => {
    const token = selectedToken?.tokenName;
    return t('send.header.title', {token});
  }, [selectedToken, t]);

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
});

export default Header;
