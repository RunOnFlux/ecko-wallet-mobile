import React, {FC} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {makeStyles} from './styles';
import {TFooterButtonProps} from './types';
import {useAppThemeContext} from '../../contexts';

const FooterButton: FC<TFooterButtonProps> = React.memo(
  ({title, style, onPress, disabled}) => {
    const {theme} = useAppThemeContext();
    const styles = makeStyles(theme);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.btn, disabled && styles.disabledBtn, style]}
        disabled={disabled}>
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    );
  },
);

export default FooterButton;
