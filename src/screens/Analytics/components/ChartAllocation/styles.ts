import { StyleSheet } from 'react-native';
import { IAppTheme } from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: { color: theme.text.secondary, fontSize: 14, marginBottom: 8 },
    chartWrapper: { alignItems: 'center', justifyContent: 'center' },
    centerLabelWrapper: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerTitle: {
      color: theme.text.primary,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    centerValue: {
      color: theme.text.primary,
      fontWeight: 'bold',
      fontSize: 18,
    },
    legendWrapper: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' },
    legendRow: {
      width: '50%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
    },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    legendToken: { color: theme.text.primary, marginRight: 8 },
    legendPct: { color: theme.text.primary, fontWeight: 'bold' },
  });
