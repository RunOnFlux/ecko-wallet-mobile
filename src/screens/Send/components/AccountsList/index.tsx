import React, {FC, useCallback, useMemo} from 'react';
import {View, Text} from 'react-native';
import {TAccountsListProps} from './types';
import AccountItem from '../AccountItem';
import {TAccount} from '../../../../store/userWallet/types';
import {useAppThemeContext} from '../../../../contexts';
import {makeStyles} from './styles';

const AccountsList: FC<TAccountsListProps> = ({
  title,
  items,
  setSelectedAccount,
}) => {
  const setAccount = useCallback(
    (account: TAccount) => () => {
      setSelectedAccount && setSelectedAccount(account);
    },
    [setSelectedAccount],
  );
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      {(items || []).length > 0 ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}
      {(items || []).map((item, idx) => (
        <AccountItem
          name={item.accountName}
          key={item.accountName}
          isFirst={!idx}
          onPress={setAccount(item as TAccount)}
        />
      ))}
    </View>
  );
};

export default AccountsList;
