import React, {FC, useMemo} from 'react';
import {View, Text} from 'react-native';
import WalletItem from '../../components/WalletItem';
import CircleArrowRightSvg from '../../assets/images/circle-arrow-right.svg';
import {TAccountFromToProps} from './types';
import {useAppThemeContext} from '../../contexts';
import {makeStyles} from './styles';

const AccountFromTo: FC<TAccountFromToProps> = React.memo(
  ({fromAccount, toAccount, fromChainId, toChainId}) => {
    if (fromAccount === undefined || toAccount === undefined) {
      return null;
    }

    const {theme} = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    return (
      <View style={styles.wrapper}>
        <View style={styles.fromWrapper}>
          <WalletItem name={fromAccount} textStyle={styles.text} />
          {fromChainId !== undefined ? (
            <Text style={styles.chainId}>{`Chain ${fromChainId}`}</Text>
          ) : null}
        </View>
        <View style={styles.centerWrapper}>
          <View style={styles.iconWrapper}>
            <CircleArrowRightSvg />
          </View>
        </View>
        <View style={styles.toWrapper}>
          <WalletItem name={toAccount} textStyle={styles.text} />
          {toChainId !== undefined ? (
            <Text style={styles.chainId}>{`Chain ${toChainId}`}</Text>
          ) : null}
        </View>
      </View>
    );
  },
);

export default AccountFromTo;
