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
    title: { color: theme.text.secondary, fontSize: 14, marginBottom: 15 },
    loadingWrapper: { padding: 16, height: 260, justifyContent: 'center' },
    emptyWrapper: { padding: 16, height: 260, justifyContent: 'center' },
    emptyText: { color: theme.text.secondary, textAlign: 'center' },
  });
