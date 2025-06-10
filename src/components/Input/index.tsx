import React, {FC, useMemo} from 'react';
import {View, Text, TextInput} from 'react-native';
import {makeStyles} from './styles';
import {TInputProps} from './types';
import {useAppThemeContext} from '../../contexts';

const Input: FC<TInputProps> = ({
  label,
  wrapperStyle,
  errorMessage,
  style,
  inputRef,
  ...restProps
}) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.inputStyle, style]}
        {...restProps}
        ref={inputRef}
      />
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  );
};

export default Input;
