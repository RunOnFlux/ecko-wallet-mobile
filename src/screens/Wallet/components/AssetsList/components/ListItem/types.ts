import {TWallet} from '../../../../../../store/userWallet/types';

export type TListItemProps = {
  walletItem: TWallet;
  isFirst?: boolean;
  rightLabel?: string;
  onPress?: () => void;
};
