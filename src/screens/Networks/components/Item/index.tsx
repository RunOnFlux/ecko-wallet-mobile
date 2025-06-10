import React, {FC, useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import NetworksSvg from '../../../../assets/images/networks.svg';
import LockSvg from '../../../../assets/images/lock.svg';
import ChevronRightSvg from '../../../../assets/images/chevron-right.svg';
import {TItemProps} from './types';
import {makeStyles} from './styles';
import {useAppThemeContext} from '../../../../contexts';

const Item: FC<TItemProps> = React.memo(({item, onPress}) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.wrapper}>
      <View style={styles.iconWrapper}>
        <NetworksSvg fill="white" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.rightWrapper}>
          <LockSvg fill={styles.icon.color} />
          <ChevronRightSvg fill={styles.icon.color} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default Item;
