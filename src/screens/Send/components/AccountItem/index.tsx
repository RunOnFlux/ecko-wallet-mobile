import React, {FC, useMemo} from 'react';
import {TouchableOpacity} from 'react-native';
import {TAccountItemProps} from './types';
import WalletItem from '../../../../components/WalletItem';
import {useAppThemeContext} from '../../../../contexts';
import {makeStyles} from './styles';

const AccountItem: FC<TAccountItemProps> = React.memo(
  ({isFirst, onPress, ...restProps}) => {
    const {theme} = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.wrapper, isFirst && styles.noBorder]}
        onPress={onPress}>
        <WalletItem textStyle={styles.accountLabel} {...restProps} />
      </TouchableOpacity>
    );
  },
);

export default AccountItem;
