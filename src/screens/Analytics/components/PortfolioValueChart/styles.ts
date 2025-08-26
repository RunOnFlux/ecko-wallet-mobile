import { StyleSheet } from 'react-native';
import { IAppTheme } from '../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      height: 420,
      marginTop: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 4,
    },
    titleText: {
      color: theme.text.secondary,
      fontSize: 14,
      marginBottom: 8,
      paddingHorizontal: 20,
      textTransform: 'uppercase',
    },
    valueText: { color: theme.text.primary, fontSize: 16, fontWeight: 800 },
    rangeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
      paddingHorizontal: 20,
    },
    rangeText: {
      color: 'gray',
      fontSize: 14,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    rangeTextActive: {
      color: 'white',
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 8,
    },
    emptyWrapper: { padding: 16, height: 260, justifyContent: 'center' },
    emptyText: { color: theme.text.secondary, textAlign: 'center' },
  });
