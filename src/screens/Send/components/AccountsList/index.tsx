import React, { FC, useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import { TAccountsListProps } from './types';
import AccountItem from '../AccountItem';
import { TAccount } from '../../../../store/userWallet/types';
import { useAppThemeContext } from '../../../../contexts';
import { makeStyles } from './styles';

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
  const { theme } = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    return (items || []).filter((item) => {
      const key = 'id' in item && item.id
        ? item.id
        : item.accountName;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [items]);

  return (
    <View style={styles.wrapper}>
      {uniqueItems.length > 0 ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}
      {uniqueItems.map((item, idx) => {
        const uniqueKey = 'id' in item && item.id
          ? `${title}-${item.id}`
          : `${title}-${item.accountName}-${idx}`;
        const displayName = 'contactName' in item && item.contactName
          ? item.contactName
          : item.accountName;
        return (
          <AccountItem
            name={displayName}
            key={uniqueKey}
            isFirst={!idx}
            onPress={setAccount(item as TAccount)}
            accountType={'type' in item ? item.type : undefined}
          />
        );
      })}
    </View>
  );
};

export default AccountsList;
