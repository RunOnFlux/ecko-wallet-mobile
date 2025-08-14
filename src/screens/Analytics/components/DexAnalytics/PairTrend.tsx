import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppThemeContext } from '../../../../contexts';
import { getAssetImageView } from '../../../../utils/getAssetImageView';
import ChangeBadge from '../../../../components/ChangeBadge';

export const PairTrend = ({
  title,
  iconUri0,
  iconUri1,
  symbol0,
  symbol1,
  value,
  isUp,
}: {
  title: string;
  iconUri0?: string;
  iconUri1?: string;
  symbol0: string;
  symbol1: string;
  value: number;
  isUp: boolean;
}) => {
  const { theme } = useAppThemeContext();
  const styles = makeStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View style={styles.iconsRow}>
          {!!iconUri0 && getAssetImageView(symbol0, 24)}
          {!!iconUri1 && (
            <View style={{ marginLeft: -8 }}>
              {getAssetImageView(symbol1, 24)}
            </View>
          )}
        </View>
        <Text style={styles.symbol}>{`${symbol0}/${symbol1}`}</Text>
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
    iconsRow: { flexDirection: 'row', alignItems: 'center' },
    symbol: {
      color: theme.text.primary,
      fontWeight: 'bold',
      flex: 1,
      marginLeft: 8,
    },
  });

export default PairTrend;
