import React, {FC, useMemo} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {TListItemProps} from './types';
import {useAppThemeContext} from '../../contexts';
import {makeStyles} from './styles';

const ListItem: FC<TListItemProps> = React.memo(
  ({icon, text, onPress, style, textStyle, disabled}) => {
    const {theme} = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        style={[styles.wrapper, style]}>
        {icon || null}
        <Text style={[styles.text, textStyle, !icon && {marginLeft: 0}]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  },
);

export default ListItem;
