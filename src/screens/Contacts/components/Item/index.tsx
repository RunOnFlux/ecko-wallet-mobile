import React, {FC, useMemo} from 'react';
import {Image, View, Text, TouchableOpacity} from 'react-native';

import {createStyles} from './styles';
import {TItemProps} from './types';
import {useAppThemeContext} from '../../../../contexts';

const Item: FC<TItemProps> = React.memo(({item, onPress}) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.wrapper}>
      <Image
        style={styles.image}
        source={require('../../../../assets/images/walletProfile.png')}
      />
      <View style={styles.body}>
        <Text style={styles.contactName}>{item.contactName}</Text>
        <View style={styles.footerWrapper}>
          <Text style={styles.text}>{item.accountName}</Text>
          <Text style={styles.text}>Chain {item.chainId}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default Item;
