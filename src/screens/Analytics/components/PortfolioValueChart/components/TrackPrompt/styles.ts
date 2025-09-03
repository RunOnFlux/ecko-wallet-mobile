import { StyleSheet } from 'react-native';
import { IAppTheme } from '../../../../../../themes/types';
import {
  MEDIUM_MONTSERRAT,
  MAIN_COLOR,
} from '../../../../../../constants/styles';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginTop: 20,
      height: 240,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(230,230,230,0.04)',
      marginHorizontal: 16,
      borderRadius: 8,
    },
    button: {
      backgroundColor: theme.brand,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 20,
    },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    container: {
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    title: {
      color: theme.text.secondary,
      fontSize: 12,
      textTransform: 'uppercase',
      fontWeight: 'bold',
      marginBottom: 8,
      fontFamily: MEDIUM_MONTSERRAT,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      marginTop: 20,
      fontFamily: MEDIUM_MONTSERRAT,
      textAlign: 'center',
      color: theme.text.primary,
      marginBottom: 40,
    },
    disclaimer: {
      color: theme.text.secondary,
      fontSize: 12,
      marginBottom: 16,
    },
    buttons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 40,
    },
  });
