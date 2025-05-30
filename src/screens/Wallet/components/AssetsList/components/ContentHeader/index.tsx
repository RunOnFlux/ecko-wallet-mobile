import React, {FC, useCallback, useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import OutlineSearchSvg from '../../../../../../assets/images/outline-search.svg';
import RefreshSvg from '../../../../../../assets/images/refresh.svg';
import CirclePlus from '../../../../../../assets/images/circle-plus.svg';
import {
  ERootStackRoutes,
  TNavigationProp,
} from '../../../../../../routes/types';
import {makeStyles} from './styles';
import {useDispatch} from 'react-redux';
import {setSelectedToken} from '../../../../../../store/userWallet';
import TokendetectorModal from '../TokenDetectorModal';
import {useShallowEqualSelector} from '../../../../../../store/utils';
import {makeSelectActiveNetworkDetails} from '../../../../../../store/networks/selectors';
import {NETWORK_IDS} from '../../../../../../utils/walletConnect';
import {useAppThemeContext} from '../../../../../../contexts';

const ContentHeader: FC = React.memo(() => {
  const {t} = useTranslation();
  const [detectedTokensModalVisible, setDetectedModalVisible] = useState(false);
  const dispatch = useDispatch();

  const networkDetail = useShallowEqualSelector(makeSelectActiveNetworkDetails);
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();

  const handlePressSearch = useCallback(() => {
    dispatch(setSelectedToken(null));
    setTimeout(
      () =>
        navigation.navigate({
          name: ERootStackRoutes.SearchTokens,
          params: undefined,
        }),
      150,
    );
  }, [navigation]);

  const handlePressPlus = useCallback(() => {
    dispatch(setSelectedToken(null));
    setTimeout(
      () =>
        navigation.navigate({
          name: ERootStackRoutes.AddToken,
          params: {
            tokenName: undefined,
          },
        }),
      150,
    );
  }, [navigation]);

  const handlePressRefresh = () => {
    setDetectedModalVisible(true);
  };

  const isMainnet = NETWORK_IDS.mainnet === networkDetail?.instance;
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {t('wallet.assetsList.contentHeader.title')}
      </Text>
      <View style={styles.rightIcons}>
        {isMainnet && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePressRefresh}
            style={styles.plusSvgWrapper}>
            <RefreshSvg width={25} height={25} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePressSearch}
          style={styles.plusSvgWrapper}>
          <OutlineSearchSvg />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePressPlus}
          style={styles.plusSvgWrapper}>
          <CirclePlus />
        </TouchableOpacity>
      </View>
      {isMainnet && detectedTokensModalVisible && (
        <TokendetectorModal
          toggle={() => setDetectedModalVisible(false)}
          isVisible={detectedTokensModalVisible}
        />
      )}
    </View>
  );
});

export default ContentHeader;
