import React, {FC, useMemo, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {MAIN_COLOR} from '../../constants/styles';

import {makeStyles} from './styles';
import {TPasswordInputProps} from './types';

import EyeShowIcon from '../../assets/images/eye-password-show.svg';
import EyeHideIcon from '../../assets/images/eye-password-hide.svg';
import {useAppThemeContext} from '../../contexts';

const PasswordInput: FC<TPasswordInputProps> = ({
  label,
  wrapperStyle,
  iconStyle,
  inputContainerStyle,
  errorMessage,
  style,
  white,
  ...restProps
}) => {
  const {t} = useTranslation();
  const [secureEntry, setSecureEntry] = useState<boolean>(true);

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <Text style={styles.label}>
        {label || t('components.passwordInput.label')}
      </Text>
      <View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          placeholderTextColor="gray"
          placeholder={t('components.passwordInput.placeholder')}
          {...restProps}
          style={[styles.input, style]}
          secureTextEntry={secureEntry}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={{
            top: 16,
            bottom: 16,
            right: 16,
            left: 16,
          }}
          onPress={() => setSecureEntry(!secureEntry)}
          style={[styles.secureIcon, iconStyle]}>
          {!secureEntry ? (
            <EyeShowIcon stroke={white ? theme.text.primary : 'white'} />
          ) : (
            <EyeHideIcon stroke={white ? theme.text.primary : 'white'} />
          )}
        </TouchableOpacity>
      </View>
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  );
};

export default PasswordInput;
