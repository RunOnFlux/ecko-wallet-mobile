import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';
import {MAIN_COLOR, MEDIUM_MONTSERRAT} from '../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    content: {
      paddingVertical: 32,
      paddingHorizontal: 20,
      alignItems: 'flex-start',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    textsWrapper: {
      width: '100%',
      alignItems: 'flex-start',
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 45,
      color: '#27CA40',
    },
    titleRed: {
      color: '#FF6058',
    },
    titleBlack: {
      color: theme.text.primary,
    },
    text: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '600',
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: 8,
    },
    footer: {
      paddingTop: 32,
      marginBottom: 20,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    statusLabel: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    statusWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    statusText: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    time: {
      textAlign: 'right',
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '600',
      fontSize: 12,
      color: theme.text.secondary,
    },
    requestKeyTitle: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 12,
      marginTop: 32,
    },
    requestKeyText: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    contKeyTitle: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 12,
      marginTop: 32,
    },
    contKeyText: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    button: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 20,
      height: 50,
      backgroundColor: theme.button.primary,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
