import React, { FC, useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import { makeStyles } from './styles';
import { TWalletItemProps } from './types';
import { cutStr } from '../../utils/stringHelpers';
import { useAppThemeContext } from '../../contexts';
import { AccountType } from '../../store/userWallet/types';
import LedgerLogoSvg from '../../assets/images/ledger-logo.svg';
import SpirekeyLogo from '../../assets/images/spirekey-logo.svg';

const WalletItem: FC<TWalletItemProps> = React.memo(
  ({ name, imageUri, textStyle, accountType }) => {
    const { theme } = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    return (
      <View style={styles.wrapper}>
        {accountType === AccountType.SPIREKEY ? (
          <SpirekeyLogo width={26} height={26} />
        ) : null}
        {accountType === AccountType.LEDGER ? (
          <LedgerLogoSvg width={26} height={26} />
        ) : null}
        {accountType !== AccountType.LEDGER &&
        accountType !== AccountType.SPIREKEY ? (
          <Image
            style={styles.image}
            source={
              imageUri
                ? { uri: imageUri }
                : require('../../assets/images/walletProfile.png')
            }
          />
        ) : null}
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[styles.text, textStyle]}
        >
          {cutStr(name)}
        </Text>
      </View>
    );
  },
);

export default WalletItem;
