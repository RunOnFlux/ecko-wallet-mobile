import {StyleSheet} from 'react-native';
import {isIos} from '../../../../constants';
import {BOLD_MONTSERRAT, MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    modalContainer: {
      paddingHorizontal: 16,
    },
    input: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      color: theme.brand,
      paddingHorizontal: 10,
      width: '100%',
    },
    searchSection: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isIos ? 13 : 3,
      paddingLeft: 16,
      paddingRight: 40,
      backgroundColor: theme.input.background,
      borderRadius: 10,
    },
    title: {
      marginTop: 20,
      marginBottom: 10,
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    token: {
      marginVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenName: {
      fontFamily: MEDIUM_MONTSERRAT,
      marginLeft: 8,
      fontWeight: 'bold',
      color: theme.text.primary,
    },
    selected: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: 'bold',
      color: theme.text.primary,
    },
    emptyText: {
      marginTop: 16,
      fontFamily: MEDIUM_MONTSERRAT,
      textAlign: 'center',
      color: theme.text.primary,
    },
  });
