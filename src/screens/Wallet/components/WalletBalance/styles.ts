import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';
import {BOLD_MONTSERRAT, MEDIUM_MONTSERRAT} from '../../../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      paddingTop: 20,
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      backgroundColor: theme.surface,
    },
    balance: {
      marginTop: 8,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 48,
      color: theme.text.primary,
    },
    balanceHeader: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    netWorthContainer: {
      marginBottom: 32,
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    netWorth: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.primary,
    },
    netWorthHeader: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    buttonsWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 32,
      paddingHorizontal: 8,
      width: '100%',
      marginBottom: 24,
    },
    button: {
      marginHorizontal: 8,
      width: 110,
      backgroundColor: theme.button.primary,
    },
  });
