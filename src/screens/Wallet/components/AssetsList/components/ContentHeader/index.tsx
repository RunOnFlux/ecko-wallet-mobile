import React, {FC, useCallback, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import OutlineSearchSvg from '../../../../../../assets/images/outline-search.svg';
import RefreshSvg from '../../../../../../assets/images/refresh.svg';
import CirclePlus from '../../../../../../assets/images/circle-plus.svg';
import {
  ERootStackRoutes,
  TNavigationProp,
} from '../../../../../../routes/types';
import {styles} from './styles';
import {useDispatch} from 'react-redux';
import {setSelectedToken} from '../../../../../../store/userWallet';
import TokendetectorModal from '../TokenDetectorModal';

const ContentHeader: FC = React.memo(() => {
  const [detectedTokensModalVisible, setDetectedModalVisible] = useState(false);
  const dispatch = useDispatch();

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

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Assets</Text>
      <View style={styles.rightIcons}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePressRefresh}
          style={styles.plusSvgWrapper}>
          <RefreshSvg width={25} height={25} />
        </TouchableOpacity>
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
      <TokendetectorModal
        // canDelete={canDelete}
        toggle={() => setDetectedModalVisible(false)}
        isVisible={detectedTokensModalVisible}
      />
    </View>
  );
});

export default ContentHeader;
