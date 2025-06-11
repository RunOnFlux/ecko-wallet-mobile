import React, {useMemo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {createStyles} from './styles';
import {useAppThemeContext} from '../../../../../contexts';

export type TRadioButtonsProps<T> = {
  options: T[];
  setValue: (value: T) => void;
  value: T;
  prefix?: '%';
};

const RadioButtons = <T extends string>({
  options,
  setValue,
  value,
  prefix,
}: TRadioButtonsProps<T>) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePress = (item: T) => () => {
    setValue(item);
  };
  return (
    <View style={styles.container}>
      {options.map(item => (
        <TouchableOpacity
          onPress={handlePress(item)}
          style={[styles.button, value === item && styles.activeButton]}
          key={item}>
          <Text style={[styles.text, value === item && styles.activeText]}>
            {item.toUpperCase()}
            {prefix}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RadioButtons;
