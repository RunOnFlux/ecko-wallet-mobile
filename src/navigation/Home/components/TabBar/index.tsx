import React, {FC, useMemo} from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Text, TouchableOpacity, View} from 'react-native';
import {makeStyles} from './styles';
import {useSafeAreaValues} from '../../../../utils/deviceHelpers';
import {useAppThemeContext} from '../../../../contexts';

const TabBar: FC<BottomTabBarProps> = ({state, descriptors, navigation}) => {
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const {theme} = useAppThemeContext();
  const styles = useMemo(
    () => makeStyles(theme, {bottomSpace, statusBarHeight}),
    [theme, bottomSpace, statusBarHeight],
  );
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const {options: itemOptions} = descriptors[route.key];

        const label =
          itemOptions.tabBarLabel !== undefined
            ? itemOptions.tabBarLabel
            : itemOptions.title !== undefined
            ? itemOptions.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as any);
          }
        };

        const {tabBarIcon} = itemOptions;
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            key={route.name}
            onPress={onPress}
            style={[styles.tabBarItem, isFocused && styles.activeTab]}>
            {tabBarIcon && tabBarIcon({focused: isFocused, size: 0, color: ''})}
            <Text
              style={[
                styles.label,
                isFocused &&
                  (route.name === 'Wallet'
                    ? styles.brandLabel
                    : styles.activeLabel),
              ]}>
              {`${label}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;
