import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppThemeContext } from '../../../../contexts';
import { getAssetImageView } from '../../../../utils/getAssetImageView';
import ChangeBadge from '../../../../components/ChangeBadge';

export const TokenTrend = ({
  title,
  iconUri,
  symbol,
  value,
  isUp,
}: {
  title: string;
  iconUri?: string;
  symbol: string;
  value: number;
  isUp: boolean;
}) => {
  const { theme } = useAppThemeContext();
  const styles = makeStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        {!!iconUri && getAssetImageView(symbol, 24)}
        <Text style={styles.symbol}>{symbol}</Text>
        <ChangeBadge changePct={value} />
      </View>
    </View>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: { color: theme.text.secondary, fontSize: 12, marginBottom: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    symbol: {
      color: theme.text.primary,
      fontWeight: 'bold',
      flex: 1,
      marginLeft: 8,
    },
  });

export default TokenTrend;
