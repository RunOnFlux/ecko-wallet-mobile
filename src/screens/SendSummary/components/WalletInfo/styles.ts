import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 26,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 26,
      alignItems: 'center',
    },
    headerText: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    headerLeftText: {
      fontSize: 12,
      marginLeft: 9,
    },
    headerRightTextWrapper: {
      backgroundColor: theme.surface,
      paddingVertical: 8,
      alignItems: 'center',
      width: 59,
      borderRadius: 32,
      marginLeft: 8,
    },
    headerRightText: {
      fontSize: 12,
      color: theme.text.primary,
    },
    headerRight: {
      flexDirection: 'row',
    },
    mainText: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 45,
      color: theme.text.primary,
    },
    input: {
      paddingHorizontal: 10,
      maxWidth: '75%',
      minWidth: 20,
      borderWidth: 1,
      borderColor: theme.input.border,
      borderRadius: 8,
      color: theme.input.color,
    },
    inputWrapper: {
      marginLeft: 8,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    content: {},
    footer: {
      flexDirection: 'row',
      marginLeft: 8,
      marginRight: 10,
      justifyContent: 'space-between',
    },
    footerText: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
    },
    footerLeftText: {
      color: theme.text.secondary,
    },
    footerRightText: {
      color: theme.text.secondary,
    },
  });
