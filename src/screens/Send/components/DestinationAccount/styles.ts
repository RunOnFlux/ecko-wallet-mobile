import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    label: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    input: {
      flex: 1,
      backgroundColor: theme.input.background,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 16,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.input.color,
      height: 50,
    },
    selectedAccountWrapper: {
      flexDirection: 'row',
      backgroundColor: theme.input.background,
      borderRadius: 10,
      paddingVertical: 12,
      paddingLeft: 14,
      paddingRight: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedAccountText: {
      color: theme.input.color,
      fontSize: 16,
    },
    scan: {
      width: 24,
      height: 24,
      marginLeft: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
