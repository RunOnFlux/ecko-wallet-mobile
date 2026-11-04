import {MutableRefObject} from 'react';
import {StyleProp, TextInput, TextInputProps, ViewStyle} from 'react-native';

export type TPasswordInputProps = {
  inputRef?: MutableRefObject<TextInput | null>;
  label?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  errorMessage?: string;
  white?: boolean;
} & TextInputProps;
