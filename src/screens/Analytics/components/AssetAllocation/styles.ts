import { StyleSheet } from 'react-native';
import { IAppTheme } from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: { color: theme.text.secondary, fontSize: 14, marginBottom: 20 },
    barWrapper: {
      flexDirection: 'row',
      width: '100%',
      height: 28,
      backgroundColor: theme.border,
      borderRadius: 10,
      overflow: 'hidden',
    },
    segment: { height: '100%' },
    legendWrapper: { marginTop: 12 },
    legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    legendToken: { color: theme.text.primary, marginRight: 6 },
    legendUsd: { color: theme.text.primary, fontWeight: 'bold' },
  });
