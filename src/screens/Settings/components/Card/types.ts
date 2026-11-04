import {StyleProp, ViewStyle} from 'react-native';

export type TCardProps = {
  isFirstItem?: boolean;
  title: string;
  titleStyle?: any;
  text: string;
  icon?: JSX.Element;
  iconWrapperStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
};
