import {DropDownPickerProps} from 'react-native-dropdown-picker';
import {ReactNode} from 'react';

export type TDropdownProps = {
  leftContent?: ReactNode;
} & DropDownPickerProps<string>;
