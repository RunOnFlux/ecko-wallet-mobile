import {StyleSheet} from 'react-native';
import {
  BOLD_MONTSERRAT,
  MEDIUM_MONTSERRAT,
  MAIN_COLOR,
} from '../../../../constants/styles';
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
      paddingVertical: 16,
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rightSide: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      marginRight: 12,
      padding: 8,
      backgroundColor: theme.surface,
      borderRadius: 22,
      ...theme.shadow,
    },
    center: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    title: {
      textAlign: 'left',
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 14,
      color: theme.text.primary,
    },
    time: {
      textAlign: 'left',
      marginTop: 4,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: theme.text.secondary,
    },
    amount: {
      marginTop: 6,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: '#27CA40',
    },
    outgoingAmount: {
      color: '#FF6058',
    },
    ongoingAmount: {
      color: theme.text.primary,
    },
    finishButton: {
      backgroundColor: theme.button.primary,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingVertical: 8,
      borderRadius: 16,
      marginBottom: 16,
    },
    finishButtonText: {
      color: 'white',
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 14,
    },
    walletConnectIcon: {
      width: 24,
      height: 24,
    },
  });
