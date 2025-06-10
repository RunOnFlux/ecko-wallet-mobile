import React, {FC, useMemo} from 'react';
import {View, Text, Image} from 'react-native';
import {makeStyles} from './styles';
import {TWalletItemProps} from './types';
import {cutStr} from '../../utils/stringHelpers';
import {useAppThemeContext} from '../../contexts';

const WalletItem: FC<TWalletItemProps> = React.memo(
  ({name, imageUri, textStyle}) => {
    const {theme} = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    return (
      <View style={styles.wrapper}>
        <Image
          style={styles.image}
          source={
            imageUri
              ? {uri: imageUri}
              : require('../../assets/images/walletProfile.png')
          }
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[styles.text, textStyle]}>
          {cutStr(name)}
        </Text>
      </View>
    );
  },
);

export default WalletItem;
