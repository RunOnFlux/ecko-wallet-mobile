import {StyleProp, TextStyle} from 'react-native';
import {AccountType} from '../../store/userWallet/types';

export type TWalletItemProps = {
  name: string;
  imageUri?: string;
  textStyle?: StyleProp<TextStyle>;
  accountType?: AccountType;
};
