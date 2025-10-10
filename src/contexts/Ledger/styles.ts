import { StyleSheet } from 'react-native';
import { IAppTheme } from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    content: {
      paddingTop: 20,
    },
    instructionsWrapper: {
      gap: 10,
      paddingHorizontal: 16,
    },
    instructionsTitleWrapper: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      color: theme.text.primary,
      marginBottom: 20,
    },
    instructionsTitle: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.text.secondary,
      lineHeight: 20,
    },
  });
