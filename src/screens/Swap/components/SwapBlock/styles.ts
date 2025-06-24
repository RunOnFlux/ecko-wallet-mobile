import {StyleSheet} from 'react-native';
import {
  MEDIUM_MONTSERRAT,
  REGULAR_MONTSERRAT,
} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      width: '100%',
    },
    swap: {
      padding: 10,
      alignItems: 'center',
    },
    swapLine: {
      marginTop: 20,
      marginBottom: 35,
      borderBottomWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    swapIcon: {
      padding: 1,
      borderWidth: 1,
      borderColor: theme.text.secondary,
      marginBottom: -15,
      borderRadius: 40,
      backgroundColor: theme.surface,
    },
    button: {
      width: '100%',
      marginTop: 20,
      backgroundColor: theme.button.primary,
    },
    loadingWrapper: {
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loading: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontFamily: REGULAR_MONTSERRAT,
      marginBottom: 16,
      fontSize: 12,
      color: theme.text.secondary,
    },
    poweredBy: {
      fontFamily: MEDIUM_MONTSERRAT,
      marginTop: 16,
      textAlign: 'center',
      fontSize: 12,
      justifyContent: 'center',
      color: theme.text.secondary,
    },
    warningContainer: {
      width: '100%',
      marginBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
