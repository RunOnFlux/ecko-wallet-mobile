import { StyleSheet } from 'react-native';
import { IAppTheme } from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    content: {
      paddingTop: 20,
    },
    modal: {
      zIndex: 999999,
      elevation: 999999,
    },
    instructionsWrapper: {
      gap: 10,
      paddingHorizontal: 16,
      marginTop: 30,
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
