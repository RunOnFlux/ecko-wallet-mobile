import {StyleSheet} from 'react-native';
import {BOLD_MONTSERRAT, MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
    },
    container: {
      paddingVertical: 12,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    rightSide: {
      flex: 1,
      flexDirection: 'row',
    },
    iconWrapper: {
      marginTop: 2,
      width: 40,
      height: 40,
      backgroundColor: theme.surface,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      marginRight: 12,
    },
    center: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    logo: {
      width: 32,
      height: 32,
    },
    title: {
      textAlign: 'left',
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 14,
      color: theme.text.primary,
    },
    link: {
      marginTop: 4,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      textAlign: 'left',
      color: theme.text.secondary,
    },
    dateTitle: {
      marginTop: 12,
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.primary,
    },
    date: {
      marginTop: 4,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: theme.text.primary,
    },
    delete: {
      marginLeft: 12,
    },
  });
