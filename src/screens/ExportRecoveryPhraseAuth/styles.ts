import {Dimensions, StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (
  theme: IAppTheme,
  {
    bottomSpace,
    statusBarHeight,
  }: {
    bottomSpace: number;
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    screen: {
      marginTop: statusBarHeight,
      flex: 1,
    },
    container: {
      flex: 1,
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
    },
    content: {
      minHeight: Dimensions.get('window').height - 76 - statusBarHeight,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingTop: 96,
      paddingBottom: bottomSpace,
      width: '100%',
    },
    text: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 24,
      marginBottom: 52,
    },
    passwordWrapper: {
      paddingVertical: 32,
      backgroundColor: theme.surface,
      ...theme.shadow,
    },
    input: {
      color: theme.input.color,
    },
    footer: {
      width: '100%',
    },
    button: {
      backgroundColor: theme.button.primary,
      width: '100%',
      paddingVertical: 17,
    },
    buttonText: {
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
      color: theme.text.primary,
    },
  });
