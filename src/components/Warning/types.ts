import {StyleProp, ViewStyle} from 'react-native';

export type TWarningProps = {
  title?: string;
  text?: string;
  noIcon?: boolean;
  centerText?: boolean;
  isSerious?: boolean;
  isInfo?: boolean;
  style?: StyleProp<ViewStyle>;
};
