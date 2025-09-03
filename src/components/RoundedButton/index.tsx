import React, {FC} from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import {useAppThemeContext} from '../../contexts';
import {styles} from './styles';

interface RoundedButtonProps {
  label: string;
  icon: JSX.Element;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'brand' | 'empty';
}

const RoundedButton: FC<RoundedButtonProps> = ({
  label,
  icon,
  onPress,
  variant = 'primary',
}) => {
  const {theme} = useAppThemeContext();

  const getCircleStyle = () => {
    switch (variant) {
      case 'primary':
        return {backgroundColor: theme.button.primary};
      case 'secondary':
        return {backgroundColor: theme.button.secondary};
      case 'brand':
        return {borderWidth: 1, borderColor: theme.brand};
      case 'empty':
        return {borderWidth: 1, borderColor: theme.button.secondary};
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={[styles.circle, getCircleStyle()]}>{icon}</View>
      <Text style={[styles.label, {color: theme.text.primary}]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default RoundedButton;
