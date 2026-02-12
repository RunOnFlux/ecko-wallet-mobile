import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 16,
      paddingBottom: 24,
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor: theme.surface,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    rowLabel: {
      color: theme.text.secondary,
      flex: 1,
      marginRight: 8,
    },
    rowValue: {
      color: theme.text.primary,
      flex: 1,
      textAlign: 'right',
    },
    sectionTitle: {
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 8,
    },
    paragraph: {
      color: theme.text.primary,
      fontSize: 13,
      lineHeight: 19,
    },
    linkText: {
      color: theme.brand,
      marginTop: 16,
    },
    jsonWrapper: {
      marginTop: 8,
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.surface,
    },
  });
